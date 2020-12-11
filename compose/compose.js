console.log('Mention JS loaded.');

(() => {
    document.body.addEventListener('keydown', onKeyDown);
})();

// Keep track of the last key pressed.
let lastChar = '';

// Track keystrokes.
function onKeyDown(event) {
    if((lastChar === ' ' || lastChar === 'Enter' || lastChar ==='Tab' || lastChar === '') && event.key === '@') {
        
        // Open Popup
        openPopup();

        // Don't print the @
        event.stopPropagation();
        event.preventDefault();
    }

    // Forget other key presses that don't affect the content.
    if(event.key != 'Control' && event.key != 'Shift' && event.key != 'OS' && event.key != 'Alt' ) {
        lastChar = event.key;
    }

    return false;
}

// Open Popup for search
function openPopup() {
    // Ask background to open Popup.
    return browser.runtime.sendMessage({ openPopup: true })
        .then((message) => {
            contact = message.contact;
            if(contact === "cancel") {
                // Do nothing.
                return false;
            } else {
                insertFullComponent(contact);
            }    
        })
        .catch((e) => {
            // Debug.
            console.log('Error: ', e);
        });
}

function insertFullComponent(contact) {

    // Properties brought from the Popup.
    let url = contact.url;
    let name = contact.name;

    // Build component to be added to the body.
    let str = document.createElement('a');
    str.setAttribute('href', url);
    str.setAttribute('style', 'font-weight: bold; text-decoration: none;')
    str.innerText = '@' + name;

    // Insert the HTML on the Composer
    let strHTML = str.outerHTML;
    document.execCommand("insertHTML", false, strHTML);
}

