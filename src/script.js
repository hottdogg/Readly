(function () {
  const getCurrentArticle = function () {
    // opened article
    const inlineFrame = document.querySelector('.inlineFrame');
    // selected, but closed article
    const selectedEntry = document.querySelector('.u0Entry.selectedEntry');

    return inlineFrame || selectedEntry;
  };

  const keyActions = {
    86: {
      srcElement: ['INPUT', false],
      handler: function () {
        // v - open article in background tab

        const article = getCurrentArticle();
        if (!article) {
          return;
        }

        const url = article.querySelector('a.title').href;
        chrome.extension.sendMessage({
          url: url,
        });
      },
    },
  };

  const getPressedKeys = function (event) {
    let keys = '';

    (event.ctrlKey || event.metaKey) && (keys += 'c');
    event.shiftKey && (keys += 's');
    event.altKey && (keys += 'a');

    keys += event.keyCode;

    return keys;
  };

  document.addEventListener(
    'keydown',
    function (event) {
      const keyInfo = keyActions[getPressedKeys(event)];
      if (!keyInfo) {
        return;
      }

      const handler = keyInfo.handler;
      const elementInfo = keyInfo.srcElement;

      if (handler && (event.srcElement.tagName === elementInfo[0]) === elementInfo[1]) {
        handler(event);

        // stop event propagation
        event.stopPropagation();
        event.preventDefault();
      }
    },
    false,
  );
})();
