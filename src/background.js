chrome.extension.onMessage.addListener(function(request, sender) {
	if (request.url) {
		chrome.tabs.create({
			url : request.url,
			active : false
		}, function(tab) {

		});
	}
});