chrome.extension.onMessage.addListener(function (request) {
  if (request.url) {
    chrome.tabs.create({
      url: request.url,
      active: false,
    });
  }
});
