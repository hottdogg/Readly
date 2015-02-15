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

    var getCurrentArticle = function (includeFirstArticleInList) {
        // opened article
        var inlineFrame = document.querySelector('.inlineFrame');
        // selected, but closed article
        var selectedEntry = document.querySelector('.u0Entry.selectedEntry');
        // last article
        var articleById = getLastArticle();

        var firstArticle = includeFirstArticleInList ? document.querySelector('.u0Entry') : null;

        var currentArticle = inlineFrame || selectedEntry || articleById || firstArticle;

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

    var scrollToArticleTop = function () {
        if (!lastArticleId) {
            return;
        }
        var article = document.getElementById(lastArticleId + '_inlineframe');
        document.body.scrollTop = article.offsetTop - 50;
    };

    var showMessage = function (text) {
        var getClientHeight = function (x) {
            var w = x.defaultView;
            if (typeof(w.innerHeight) == "number") {
                return w.innerHeight
            } else {
                if (x.documentElement && x.documentElement.clientHeight) {
                    return x.documentElement.clientHeight
                } else {
                    if (x.body && x.body.clientHeight) {
                        return x.body.clientHeight
                    }
                }
            }
        };

        var getClientWidth = function (x) {
            if (x == null || x.defaultView == null) {
                return 1024
            }
            var w = x.defaultView;
            if (typeof(w.innerWidth) == "number") {
                return w.innerWidth
            } else {
                if (x.documentElement && x.documentElement.clientWidth) {
                    return x.documentElement.clientWidth
                } else {
                    if (x.body && x.body.clientWidth) {
                        return x.body.clientWidth
                    }
                }
            }
        };

        var message = document.getElementById('feedlySignPart');
        message.innerHTML = text;
        message.style.opacity = 1;
        message.style.display = 'block';
        message.style.top = (document.defaultView.pageYOffset + (getClientHeight(document) - message.offsetHeight) / 3 * 2) + 'px';
        message.style.left = ((getClientWidth(document) - message.offsetWidth) / 2) + 'px';
    };

    var hideMessage = function () {
        var message = document.getElementById('feedlySignPart');
        message.style.display = 'none';
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

                var article = getCurrentArticle(true);
                if (!article) {
                    return;
                }

                if (!/_main$/.test(article.id)) {
                    // get next article with "_main" postfix
                    do {
                        article = article.nextElementSibling;
                    } while (article && !/_main$/.test(article.id));
                }

                if (!article) {
                    // null if this is last article
                    return;
                }

                updateLastArticleId(article);
                article.click();
                scrollToArticleTop();
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

                updateLastArticleId(article);
                article.click();
                scrollToArticleTop();
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
                        hideMessage();
                    }
                }, false);
                request.send(JSON.stringify({
                    action: isArtcileRead ? 'keepUnread' : 'markAsRead',
                    entryIds: [lastArticleId],
                    type: 'entries'
                }));
                showMessage('Marking as ' + (isArtcileRead ? 'unread' : 'read') + '...');
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
