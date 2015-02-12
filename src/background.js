chrome.extension.onMessage.addListener(function (request) {
    if (request.url) {
        chrome.tabs.create({
            url: request.url,
            active: false
        }, function (tab) {
        });
    }
});

chrome.runtime.onInstalled.addListener(function (details) {
    chrome.notifications.create('aaa', {
        iconUrl: 'icons/readly-64.png',
        type: 'basic',
        title: 'You now have the latest version of Readly, yay!',
        message: 'Please reload Feedly page to enable all new great features'
    }, function () {
    });
});
