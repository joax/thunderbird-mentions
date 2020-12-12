
// Composer sends message to Background: Open Popup
// Background Opens Popup
// Popup Closes and sends Message Close Popup.
// Background hears this Close Popup
// Background sends Message to Composer with Contact.


// Init Plugin
(() => {
    // compose script
    browser.composeScripts.register({
        js: [
           {file: "/compose/compose.js"},
        ]
    });

    // Listen for the order to open the popup!
    browser.runtime.onMessage.addListener(handleMessage);
})();

// Handle the Popup Message
async function handleMessage(request, sender) {
    if (request.openPopup === true) {
        // Send back the contact from the search...
        return blockingPopup()
            .then((contact) => {
                return Promise.resolve({ contact });
            })
            .catch((e) => {
                return Promise.reject(e);
            })
    } else if(request.addContactToCC ) {
        // Add the Contact to BCC now.
        return addContactToAddressLine(request.addContactToCC)
    } else {
        // Listen to the Popup with the final anwser   
        console.log('Another Message received from Popup.');
    }
}

async function addContactToAddressLine(contact) {
    // Check the contact is on To, CC or Bcc.
    // If not, add to CC (we can tweak this as an option)
    // If yes, then move from where it is to CC (or the defined option..)
    let tabs = await messenger.tabs.query({
        active: true
    });

    // Go through the tabs, and search for the contact.
    for(var tab in tabs) {
        // Only the non mailTab
        if(!tabs[tab].mailTab) {
            let details = await messenger.compose.getComposeDetails(tabs[tab].id);
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
                    let changed = await messenger.compose.setComposeDetails(tabs[tab].id, {
                        to, cc, bcc
                    });
                }
            }
        }
    }

    // Return the contact for next thing.
    return Promise.resolve(contact);
}

// Function to open a popup and await user feedback
async function blockingPopup() {
	async function popupClosePromise(popupId, defaultPopupCloseResponse) {
		try {
            // Wait for the window to be ready.
			await messenger.windows.get(popupId);
		} catch (e) {
			//window does not exist, assume closed
			return defaultPopupCloseResponse;
        }
        
        // Promise to the Popup.
		return new Promise(resolve => {
            let popupCloseResponse = defaultPopupCloseResponse;
            
            // Window is closed. We can resolve the promise.
			function windowRemoveListener(closedId) {
				if (popupId == closedId) {
					messenger.windows.onRemoved.removeListener(windowRemoveListener);
					messenger.runtime.onMessage.removeListener(messageListener);
                    
                    // Here is the response.
                    resolve(popupCloseResponse);
				}
            }
            
            // Message Received from the Window with the response.
			function messageListener(request, sender, sendResponse) {
                // Receive response from Popup.
				if (sender.tab.windowId == popupId && request && request.popupCloseMode) {
					popupCloseResponse = request.popupCloseMode;
				}
            }
            
            // Listen to the message.
            messenger.runtime.onMessage.addListener(messageListener);
            
            // Listen to the Closure.
			messenger.windows.onRemoved.addListener(windowRemoveListener);
		});
	}

	let window = await messenger.windows.create({
		 url: "popup.html",
		 type: "popup",
		 height: 380,
         width: 280 });
         
	// await the created popup to be closed and define a default
	// return value if the window is closed without clicking a button
    return popupClosePromise(window.id, "cancel");
 }

