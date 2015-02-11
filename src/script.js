(function () {
    var lastArticleId = null;
    var updateLastArticleId = function (article) {
        if (!article) {
            return;
        }
        lastArticleId = article.id.replace(/_(inlineframe|main)/, '');
    };
    var getLastArticle = function () {
        if (!lastArticleId) {
            return null;
        }
        return document.getElementById(lastArticleId + '_inlineframe') || document.getElementById(lastArticleId + '_main')
    };

    var getCurrentArticle = function () {
        // opened article
        var inlineFrame = document.querySelector('.inlineFrame');
        // selected, but closed article
        var selectedEntry = document.querySelector('.u0Entry.selectedEntry');
        // last article
        var articleById = getLastArticle();

        var currentArticle = inlineFrame || selectedEntry || articleById;

        updateLastArticleId(currentArticle);

        return currentArticle;
    };

    var getFeedlyVersion = function () {
        if (window.feedlyApplicationVersion) {
            return window.feedlyApplicationVersion;
        }
        return document.documentElement.innerHTML.match(/web\/([^/]+)\/js/)[1];
    };

    var getCookie = function (cname) {
        var name = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return '';
    };

    var openRequest = function (method, url) {
        var request = new XMLHttpRequest();
        request.open(method.toUpperCase(), url);
        request.withCredentials = true;
        request.setRequestHeader('$Authorization.feedly', '$FeedlyAuth');
        request.setRequestHeader('Authorization', JSON.parse(getCookie('session@cloud')).feedlyToken);
        return request;
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
                    url: url
                });
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
        '79': {
            srcElement: ['INPUT', false],
            handler: function () {
                // o - toggle open-close article

                var article = getCurrentArticle();
                if (!article) {
                    return;
                }

                article.click();
            }
        },
        '74': {
            srcElement: ['INPUT', false],
            handler: function () {
                // j - next article

                var article = getCurrentArticle();
                if (!article) {
                    return;
                }

                // get next article with "_main" postfix
                do {
                    article = article.nextElementSibling;
                } while (article && !/_main$/.test(article.id));

                if (!article) {
                    // null if this is last article
                    return;
                }

                article.click();
            }
        },
        '75': {
            srcElement: ['INPUT', false],
            handler: function () {
                // k - prev article

                var article = getCurrentArticle();
                if (!article) {
                    return;
                }

                // get prev article with "_main" postfix
                do {
                    article = article.previousElementSibling;
                } while (article && !/_main$/.test(article.id));

                if (!article) {
                    // null if this is the first article
                    return;
                }

                article.click();
            }
        },
        '77': {
            srcElement: ['INPUT', false],
            handler: function () {
                // m - mark article as read/unread

                var article = getCurrentArticle();
                if (!article) {
                    return;
                }

                var isArtcileRead = !!article.querySelector('.title.read');

                var request = openRequest('post', 'http://feedly.com/v3/markers?ck=' + Date.now() + '&ct=feedly.desktop&cv=' + getFeedlyVersion());
                request.addEventListener('load', function () {
                    if (/^2\d+/.test(request.status.toString())) {
                        Array.prototype.slice.call(document.querySelectorAll('a[id^="' + lastArticleId + '"]'))
                            .forEach(function (title) {
                                title.classList.toggle('read');
                                title.classList.toggle('unread');
                            });
                    }
                }, false);
                request.send(JSON.stringify({
                    action: isArtcileRead ? 'keepUnread' : 'markAsRead',
                    entryIds: [lastArticleId],
                    type: 'entries'
                }));
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
