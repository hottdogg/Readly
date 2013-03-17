var keyActions = {
	'86' : function() {
		// v - open article in background tab

		// opened article
		var inlineFrame = document.querySelector('.inlineFrame');
		// var selected, but closed article
		var selectedEntry = document.querySelector('.u0Entry.selectedEntry');

		var article = inlineFrame || selectedEntry;
		if (article) {
			var url = article.querySelector('a.title').href;
			chrome.extension.sendMessage({
				url : url
			});
		}
	},
	's65' : function() {
		// shift+a - mark all as read

		var pageActionMarkAsRead = document.getElementById('pageActionMarkAsRead');
		if (pageActionMarkAsRead && pageActionMarkAsRead.style.display !== 'none') {
			// mark as read button is present and visible - we can click on it
			pageActionMarkAsRead.click();
		}
	}
};

var getPressedKeys = function(e) {
	var keys = '';

	e.shiftKey && (keys += 's');
	e.ctrlKey && (keys += 'c');
	e.metaKey && (keys += 'm');
	e.altKey && (keys += 'a');

	keys += e.keyCode;

	return keys;
};

document.addEventListener('keydown', function(e) {
	var pressedKeys = getPressedKeys(e);

	var handler = keyActions[pressedKeys];
	if (handler) {
		handler();

		// stop event propagation
		e.stopPropagation();
		e.preventDefault();
	}
}, false);

// hide categories with no unread items
// I'll leave here for now, maybe some optimizations later
(function hideCategories() {
	var categories = document.querySelectorAll('#feedlyTabs .tab');
	var i = 0, l = categories.length, cat, unread;
	for (; i < l; i += 1) {
		cat = categories[i];
		if (/^\d+_tab/.test(cat.id)) {
			unread = cat.querySelector('.categoryUnreadCount');
			if (!unread.innerText.trim() || unread.innerText.trim() === '0') {
				cat.style.display = 'none';
			}
		}
	}
	setTimeout(hideCategories, 500);
}());