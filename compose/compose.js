console.log('Mention JS loaded.');

let books = [];

(() => {
    document.body.addEventListener('keydown', onKeyDown);
})();

// Keep track of the last key pressed.
let lastChar = '';
let selection = '';

// Search control
let results = [];
let resultsIndex = 1;

// Track keystrokes.
async function onKeyDown(event) {
    
    let searchBoxExist = document.getElementById('searchBox');
    
    if(searchBoxExist) {
        let key = event.key;
        let input = document.getElementById('searchContact');

        // Don't print the key on the body.
        event.stopPropagation();
        event.preventDefault();
        
        if(key === 'Escape' || key === 'Tab' || key === 'Delete') {
            removeSearchBox();
        } else if(key === 'ArrowDown' && results.length) {
            // Move down on the list.
            resultsIndex = (resultsIndex < results.length) ? resultsIndex + 1 : resultsIndex;
            markResult();
        } else if(key === 'ArrowUp' && results.length) {
            // Move up on the list.
            resultsIndex = (resultsIndex > 1) ? resultsIndex - 1 : resultsIndex;
            markResult();
        } else if(key === 'Shift' || key === 'OS' || key === 'F1' || key === 'F2' || key === 'F3' || key === 'F4' || key === 'F5' || key === 'F6' || key === 'F7' || key === 'F8' || key === 'F9' || key === 'F10' || key === 'F11' || key === 'F12') {
            // Do Nothing.
        } else if(key === 'Enter') {
            $('#' + results[resultsIndex - 1].id).trigger('click');
        } else {
            // Take care of Space and backspace first.
            if(key === 'Backspace') {
                input.setAttribute('value', input.value.slice(0,input.value.length - 1));
            } else if(key === 'Space') {
                input.setAttribute('value', input.value + ' ');
            } else {
                // Print the key on the box.
                input.setAttribute('value', input.value + key);
            }
            let val = input.value;
            if(val.length >= 3) {
                // Search when the box is over 3 characters
                cleanResults();
                results = await searchResults(val);
                await listResults(results);
                markResult();
            }
        }

    } else {
        if((lastChar === ' ' || lastChar === 'Enter' || lastChar ==='Tab' || lastChar === '') && event.key === '@') {
            
            // Insert Search Box (save selection)
            selection = document.getSelection().focusNode;

            // If no selection, then come up a node.
            if(selection.nodeName === '#text' || selection.nodeName === 'TEXT') {
                selection = selection.parentNode;
            }

            insertSearchBox(selection);
            
            // Don't print the @
            event.stopPropagation();
            event.preventDefault();
        }

        // Forget other key presses that don't affect the content.
        if(event.key != 'Control' && event.key != 'Shift' && event.key != 'OS' && event.key != 'Alt' ) {
            lastChar = event.key;
        }
    }
    return false;
}

// Send Message to add contact.
function addContactToCC(contact) {
    return browser.runtime.sendMessage({ addContactToCC: contact });
}

// Ask background for matches.
async function searchResults(v) {
    let resultContacts = await browser.runtime.sendMessage({ searchContact: v });
    return resultContacts;
 }

// Remove the Search Box.
function removeSearchBox() {
    // Remove Box.
    let box = document.getElementById('searchBox');
    
    // Remove the box.
    box.remove();
}

// Clean Results from Search
function cleanResults() {
    results = [];
    resultsIndex = 1;
    let list = document.getElementById('results');
    list.innerHTML = '';
 }
 
 // List results on the box.
 async function listResults(r) {
    // Mark the Box...
    let list = document.getElementById('results');
    for(var i in r) {
       let result = await buildContact(r[i]);
       $(list).append(result);
    }
 }
 
 // Clear any marked results.
 async function clearMarkedResults() {
    let li = document.getElementsByClassName('contact');
    for(var i in li) {
        $(li).removeClass('selected');
    }
 }
 
 // Mark a result from the list.
 async function markResult() {
    clearMarkedResults();
 
    // If there are results, then mark.
    if(results.length) {
        let l = document.getElementById(results[resultsIndex - 1].id);   
        $(l).addClass('selected');
    }
 }

// Builds a contact.
async function buildContact(contact) {
    let c = document.createElement('li');
    c.id = contact.id;
    c.className = 'contact';
    c.innerHTML = contact.properties.DisplayName + ' (' + contact.properties.PrimaryEmail + ')';
    c.setAttribute('data-name', contact.properties.DisplayName);
    c.setAttribute('data-url', 'mailto:' + contact.properties.PrimaryEmail);
    c.setAttribute('data-email', contact.properties.PrimaryEmail);
 
    $(c).on('click', function(event) {
        let timestamp = (new Date()).getTime();
        let name = $(this).attr('data-name');
        let url = $(this).attr('data-url');
        let email = $(this).attr('data-email');
        let id = $(this).attr('id') + '-' + timestamp;
        let contact = {
            email,
            name,
            url,
            id
        }
    
        removeSearchBox();
    
        insertFullComponent(contact)
            .then(addContactToCC)
            .then(addFinalSpace);
    })
    return c;
 }

function insertSearchBox(obj) {

    let wrapper = document.createElement('span');
    wrapper.id = 'searchBox';
    wrapper.style = 'border: 0px;';
    
    let at = document.createElement('label');
    at.innerHTML = '@';
    at.style = 'border: 0px;';

    let input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.id = 'searchContact';
    input.setAttribute('style', 'border: 0px solid white; width: auto;');

    let box = document.createElement('div');
    box.id = 'resultsWrapper';
    $(box).html('<ul id="results" class="results"><li class="contact">Search for contact...</li></ul>');

    wrapper.append(box);
    wrapper.append(at);
    wrapper.append(input);

    // Append to Focus Node.
    $(obj.lastElementChild).before(wrapper);

    return true;
}

// Inserts a final space.
function addFinalSpace() {
    // And the space afterwards
    const inject = new Promise((resolve, reject) => {

        // This?
        document.getSelection().collapseToEnd();

        $(document.body).trigger('focus');

        console.log('Space Added: ', document.hasFocus());
        resolve();
    })

    return inject;
}

// Inserts Mention on the body
function insertFullComponent(contact) {

    const inject = new Promise((resolve, reject) => {

        // Properties brought from the Popup.
        let url = contact.url;
        let name = contact.name;
        let id = contact.id;

        let span = document.createElement('span');

        // Build component to be added to the body.
        let str = document.createElement('a');
        str.setAttribute('href', url);
        str.id = id;
        str.innerText = '@' + name;

        span.append(str);

        // What if...
        document.execCommand("insertHTML", false, span.outerHTML);

        // Final Space.
        document.execCommand("insertText", false, ' ');

        // Return control to Script
        resolve(contact);
    });

    return inject;    
}

