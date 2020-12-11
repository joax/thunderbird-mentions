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
            .then(addContactToAddressLine)
            .then((contact) => {
                return Promise.resolve({ contact });
            })
            .catch((e) => {
                return Promise.reject(e);
            })
    } else {
        // Listen to the Popup with the final anwser   
        console.log('Another Message received:', request);
    }
}

async function addContactToAddressLine(contact) {
    // Check the contact is on To, CC or Bcc.
    // If not, add to CC (we can tweak this as an option)
    // If yes, then move from where it is to CC (or the defined option..)

    // Find the Composer Window Details

    // Check for the contact

    // Change if needed.

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

