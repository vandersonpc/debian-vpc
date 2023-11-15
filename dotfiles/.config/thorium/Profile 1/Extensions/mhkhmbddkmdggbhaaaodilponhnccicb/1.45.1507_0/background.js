//-firefox background events
if (typeof browser !== "undefined") {

    //console.log('FIREFOX Background');
    browser.runtime.onMessage.addListener((messageRequest, sender, sendResponse) => {

        if (sender.id === browser.runtime.id) {
            return tubeBuddyMessageReceived(messageRequest, sendResponse);
        }
    });

    // Welcome new user on install
    browser.runtime.onInstalled.addListener((details) => {
        if (details.reason === 'install') {
            createTab(browser, { url: 'https://www.tubebuddy.com/welcome?from-ext=true' });
        } else if (details.reason === 'update') {
            clearReportedExtensionDOMIssues();      
        }
    });
}
//-firefox background events end

//-chrome background events
else if (typeof chrome !== "undefined") {

    //console.log('CHROME Background');
    chrome.runtime.onMessage.addListener(function (messageRequest, sender, sendResponse) {

        if (sender.id === chrome.runtime.id) {
            return tubeBuddyMessageReceived(messageRequest, sendResponse);
        }
    });

    // Welcome new user on install
    chrome.runtime.onInstalled.addListener((details) => {
        if (details.reason === 'install') {
            createTab(chrome, { url: 'https://www.tubebuddy.com/welcome?from-ext=true' });
        } else if (details.reason === 'update') {
            clearReportedExtensionDOMIssues();            
        }
    });
}
//-chrome background events end

//receive a message from content scripts
function tubeBuddyMessageReceived(messageRequest, callback) {

    //return true so the extension knows it's an async call
    var isAsyn = true;

    switch (messageRequest.type) {
        //record url for corb url check
        case "tb-corb-record": {

            isAsyn = false;
            break;
        }
        //ajax requests
        case "tb-xhr": {

            try {
                FetchUtilities.MakeFetchRequest(messageRequest, callback);
            }
            catch (ex) {
                console.log('tb-xhr exception', ex);
                callback({
                    success: false,
                    response: '',
                    error: ex
                });
            }
        }
    }

    return isAsyn;
}

// Create a new tab
function createTab(browser, options, callback = null) {

    if (options.url == undefined) {
        throw new Error('url is not defined');
    }

    // For FireFox
    if (callback == null) {
        return browser.tabs.create(options);
    }

    browser.tabs.create(options, callback);
}

function clearReportedExtensionDOMIssues() {
    chrome.storage.sync.remove('tbReportedExtensionDOMIssues', function () {
        console.log('Removed DOM issues');
    });
}