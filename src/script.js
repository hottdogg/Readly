(function () {
	var keyActions = {
		'86': {
			srcElement: ['INPUT', false],
			handler: function () {
				// v - open article in background tab

				// opened article
				var inlineFrame = document.querySelector('.inlineFrame');
				// var selected, but closed article
				var selectedEntry = document.querySelector('.u0Entry.selectedEntry');

				var article = inlineFrame || selectedEntry;
				if (article) {
					var url = article.querySelector('a.title').href;
					chrome.extension.sendMessage({
						url: url
					});
				}
			}
		},
		'82': {
			srcElement: ['INPUT', false],
			handler: function () {
				// r - reload articles

				document.getElementById('pageActionRefresh').click();
			}
		},
		's65': {
			srcElement: ['INPUT', false],
			handler: function () {
				// shift+a - mark all as read

				var pageActionMarkAsRead = document.getElementById('pageActionMarkAsRead');
				if (pageActionMarkAsRead && pageActionMarkAsRead.style.display !== 'none') {
					// mark as read button is present and visible - we can click on it
					pageActionMarkAsRead.click();
				}
			}
		},
		'cs70': {
			srcElement: ['INPUT', false],
			handler: function () {
				// ctrl+shift+f - filter freake.ru feed by trance releases

				var freakeEntries = document.querySelectorAll('.u0Entry:not(.readly-filtered)[data-alternate-link*="freake"]');
				Array.prototype.forEach.call(freakeEntries, function (entry, i) {
					entry.classList.add('readly-filtered');

					if (entry.innerHTML.toLowerCase().indexOf('trance') === -1) {
						// no trance release - mark as read
						entry.querySelector('.condensedTools img[title="Mark as read and hide"]').click();
					}
				});

				// reload feed then
				document.getElementById('pageActionRefresh').click();
			}
		}
	};

	var getPressedKeys = function (e) {
		var keys = '';

		e.ctrlKey && (keys += 'c');
		e.shiftKey && (keys += 's');
		e.metaKey && (keys += 'm');
		e.altKey && (keys += 'a');

		keys += e.keyCode;

		return keys;
	};

	document.addEventListener('keydown', function (e) {
		var keyInfo = keyActions[getPressedKeys(e)];
		if (!keyInfo) {
			return;
		}

		var handler = keyInfo.handler,
			elementInfo = keyInfo.srcElement;

		if (handler && e.srcElement.tagName === elementInfo[0] === elementInfo[1]) {
			handler();

			// stop event propagation
			e.stopPropagation();
			e.preventDefault();
		}
	}, false);
}());