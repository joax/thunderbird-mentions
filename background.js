
// Composer sends message to Background: Open Popup
// Background Opens Popup
// Popup Closes and sends Message Close Popup.
// Background hears this Close Popup
// Background sends Message to Composer with Contact.


// Init Plugin
(() => {
    // compose script
    browser.composeScripts.register({
        css: [
            {file: '/compose/compose.css'},
        ],
        js: [
            {file: "/jquery.min.js"}, 
            {file: "/compose/compose.js"},
        ]
    });

    // Get all the contacts up.
    compactBooks();

    // Listen for the order to open the popup!
    browser.runtime.onMessage.addListener(handleMessage);
})();

// Agregation
let contacts = [];
let mailinglists = [];

// Flatten the Contact Books for purpose of search.
async function compactBooks() {
    let books = await browser.addressBooks.list(true)
    for(var b in books) {
        let c = books[b].contacts;
        contacts = contacts.concat(c);
        let m = books[b].mailingLists;
        mailinglists = mailinglists.concat(m);
    }     
    console.log('Contacts Compacted.')
    return true;
}

// Handle the Popup Message
async function handleMessage(request, sender) {
    if(request.searchContact ){
        let val = request.searchContact;
        let results = searchResults(val);
        return Promise.resolve(results);
    } else if(request.addContactToCC ) {
        // Add the Contact to BCC now.
        return addContactToAddressLine(sender.tab.id, request.addContactToCC)
    } else {
        // Listen to the Popup with the final anwser   
        console.log('Another Message received from Popup.');
    }
}

// TODO: Contacts API has search function that might
//       be natively implemented. Faster than this rough
//       search for sure :).
function searchResults(v) {
    let results = contacts.filter((x) => { 
       if(x.properties && x.properties.DisplayName) {
          return ( x.properties.DisplayName.toLowerCase().indexOf(v) >= 0 || 
                      (x.properties.PrimaryEmail && x.properties.PrimaryEmail.toLowerCase().indexOf(v) >= 0))
       } else {
          return false;
       }
    })
 
    return results;
 }

async function addContactToAddressLine(tabId, contact) {
    // Check the contact is on To, CC or Bcc.
    // If not, add to CC (we can tweak this as an option)
    // If yes, then move from where it is to CC (or the defined option..)
    let details = await messenger.compose.getComposeDetails(tabId);
    if(details) {
        // Search for the specific contact.
        let body = details.body;

        // TODO: Refactor.
        if(body && body.indexOf(contact.id) > 0) {
            let email = contact.email;
            let name = contact.name;

            let to = details.to;
            let cc = details.cc;
            let bcc = details.bcc;

            let foundTo = false;
            let foundCC = false;
            let foundBCC = false;

            // first find it on the To.
            if(to.filter((n) => { return (n.indexOf(email) > 0); }).length) {
                foundTo = true;
            }

            // first find it on the CC.
            if(cc.filter((n) => { return (n.indexOf(email) > 0); }).length) {
                foundCC = true;
            }

            // first find it on the BCC.
            if(bcc.filter((n) => { return (n.indexOf(email) > 0); }).lenght) {
                foundBCC = false;
            }

            if(!foundCC && !foundTo && !foundBCC ) {
                cc.push(name + ' <' + email + '>');    
            }

            // Set the Details back again.
            await messenger.compose.setComposeDetails(tabs[tab].id, {
                to, cc, bcc
            });
            console.log('CC changed.');
            return Promise.resolve(contact);
        }
    }

    // Return the contact for next thing.
    return Promise.resolve(contact);
}
