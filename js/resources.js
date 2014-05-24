(function() {

    var COOKIE_EXPIRES = 365;

    var cache = {};
    var callbacks = [];

    var prefix = "resources/";
    var postfix = ".png";

    function load(url) {
        if (url instanceof Array) {
            url.forEach(function (url) {
                _load(url);
            });
        } else {
            _load(url);
        }
    }

    function format(url) {
        return prefix + url + postfix;
    }

    function _load(url) {
        if (cache[url]) {
            return cache[url];
        } else {
            var image = new Image();
            image.onload = function () {
                cache[url] = image;
                if (loaded()) {
                    callbacks.forEach(function(callback) {
                        callback();
                    })
                }
            };
            cache[url] = false;
            image.src = format(url);
        }
    }

    function get(url) {
        return cache[url];
    }

    function loaded() {
        for (var url in cache) {
            if (cache.hasOwnProperty(url) && !cache[url]) return false;
        }
        return true;
    }

    function addCallback(func) {
        callbacks.push(func);
    }

    window.res = {
        load: load,
        get: get,
        onReady: addCallback,
        setCookie: setCookie,
        getCookie: getCookie
    };

    function setCookie(name, value, days) {
        if (days == undefined) days = COOKIE_EXPIRES;
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "expires=" + date.toGMTString();
        document.cookie = name + "=" + value + "; " + expires;
    }

    function getCookie(name, defaultValue) {
        if (defaultValue == undefined) defaultValue = null;
        var nameEquals = name + "=";
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            while (cookie.charAt(0) == ' ') cookie = cookie.substring(1, cookie.length);
            if (cookie.indexOf(nameEquals) == 0) return cookie.substring(nameEquals.length, cookie.length);
        }
        return defaultValue;
    }
}());