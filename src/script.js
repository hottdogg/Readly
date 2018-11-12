(function () {
  var getCurrentArticle = function () {
    // opened article
    var inlineFrame = document.querySelector('.inlineFrame');
    // selected, but closed article
    var selectedEntry = document.querySelector('.u0Entry.selectedEntry');

    return inlineFrame || selectedEntry;
  };

  var keyActions = {
    '86': {
      srcElement: ['INPUT', false],
      handler: function () {
        // v - open article in background tab

        var article = getCurrentArticle();
        if (!article) {
          return;
        }

        var url = article.querySelector('a.title').href;
        chrome.extension.sendMessage({
          url: url,
        });
      },
    },
  };

  var getPressedKeys = function (event) {
    var keys = '';

    (event.ctrlKey || event.metaKey) && (keys += 'c');
    event.shiftKey && (keys += 's');
    event.altKey && (keys += 'a');

    keys += event.keyCode;

    return keys;
  };

  document.addEventListener('keydown', function (event) {
    var keyInfo = keyActions[getPressedKeys(event)];
    if (!keyInfo) {
      return;
    }

    var handler = keyInfo.handler;
    var elementInfo = keyInfo.srcElement;

    if (handler && event.srcElement.tagName === elementInfo[0] === elementInfo[1]) {
      handler(event);

      // stop event propagation
      event.stopPropagation();
      event.preventDefault();
    }
  }, false);
}());
