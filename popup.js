// Window Listeners
window.addEventListener("load", onLoad);
window.addEventListener("blur", onClose);
window.addEventListener("keydown", onKeyDown);

// Contact Books
let books = [];

// Init all
(() => {
   browser.addressBooks.list(true)
      .then((b) => {
         books = b;
         compactBooks();
         document.getElementById('searchContact').focus();
      })
})();

let contacts = [];
let mailinglists = [];

// Flatten the Contact Books for purpose of search.
function compactBooks() {
   for(var b in books) {
      let c = books[b].contacts;
      contacts = contacts.concat(c);
      let m = books[b].mailingLists;
      mailinglists = mailinglists.concat(m);
   }
   return true;
}

let resutls = [];
let resultsIndex = 0;

// Track keypresses for search purposes.
async function onKeyDown(e) {
   let val = $('#searchContact').val();
   if(e.key === 'Escape' || e.key === 'Tab') {
      onClose();
   } else if(e.key === 'ArrowDown' && results.length) {
      // Move down on the list.
      resultsIndex = (resultsIndex < results.length) ? resultsIndex + 1 : resultsIndex;
      markResult();
   } else if(e.key === 'ArrowUp' && results.length) {
      // Move up on the list.
      resultsIndex = (resultsIndex > 1) ? resultsIndex - 1 : resultsIndex;
      markResult();
   } else if(e.key === 'Enter'){
      $('#' + results[resultsIndex - 1].id).trigger('click');
   } else if(val.length >= 3) {
      // Search when the box is over 3 characters
      cleanResults();
      results = searchResults(val);
      await listResults(results);
      markResult();
   } else {
      // Else, clean results.
      cleanResults();
   }
}

// TODO: Contacts API has search function that might
//       be natively implemented. Faster than this rough
//       search for sure :).
function searchResults(v) {
   let results = contacts.filter((x) => { 
      if(x.properties && x.properties.DisplayName) {
         return (x.properties.DisplayName.toLowerCase().indexOf(v) >= 0)
      } else {
         return false;
      }
   })

   return results;
}

function cleanResults() {
   results = [];
   resultsIndex = 0;
   $('ul.results').html('');
}

async function listResults(r) {
   for(var i in r) {
      let result = await buildContact(r[i]);
      $('ul.results').append(result);
   }
}

async function clearMarkedResults() {
   $('li.contact').removeClass('selected');
}

async function markResult() {
   clearMarkedResults();
   $('#' + results[resultsIndex - 1].id).addClass('selected');
}

async function buildContact(contact) {
   let c = document.createElement('li');
   c.id = contact.id;
   c.className = 'contact';
   c.innerHTML = contact.properties.DisplayName + ' (' + contact.properties.PrimaryEmail + ')';
   c.setAttribute('data-name', contact.properties.DisplayName);
   c.setAttribute('data-url', 'mailto:' + contact.properties.PrimaryEmail);

   $(c).on('click', function(event) {
      let name = $(this).attr('data-name');
      let url = $(this).attr('data-url');
      let contact = {
         name,
         url
      }

      // Send and Close.
      close(contact);
   })
   return c;
}


async function close(whatToSend) {
   await messenger.runtime.sendMessage({ popupCloseMode: whatToSend }); 
    
   // Close window on this situation.
   let win = await messenger.windows.getCurrent();
   messenger.windows.remove(win.id);
}

async function onClose() {
   await messenger.runtime.sendMessage({ popupCloseMode: null }); 
    
   // Close window on this situation.
   let win = await messenger.windows.getCurrent();
   messenger.windows.remove(win.id);
}

// Onload, get the focus on the Form.
async function onLoad() {
   $('contactSearch').trigger("focus");
}