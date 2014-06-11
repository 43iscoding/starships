(function() {

    var COOKIE_EXPIRES = 365;

    var cache = {};
    var callbacks = [];

    var prefix = "resources/";
    var postfix = ".png";

    var DEBUG = false;

    var ignoreLoaded = false;

    function load(url) {
        if (url instanceof Array) {
            url.forEach(function (url) {
                _load(url);
            });
        } else {
            _load(url);
        }
    }

    function loadSound(url) {
        if (url instanceof Array) {
            url.forEach(function (audio) {
                if (audio instanceof Array) {
                    _loadSound(audio[0], audio[1]);
                } else {
                    _loadSound(audio, false);
                }
            });
        } else {
            _loadSound(url);
        }
    }

    function _loadSound(name, music) {
        for (var i = 0; i < sound.getBufferSize(music); i++) {
            var audio = document.createElement('audio');
            audio.bufferIndex = i;
            audio.addEventListener('canplaythrough', function() {
                if (DEBUG) console.log("Sound loaded: " + name + (this.bufferIndex == 0 ? "" : "(Buffered-" + this.bufferIndex + ")"));
                cache[sound.format(name) + this.bufferIndex] = true;
                if (ignoreLoaded) return;
                loader.update(loadingProgress());
                if (loaded()) {
                    callbacks.forEach(function(callback) {
                        callback();
                    });
                    ignoreLoaded = true;
                }
            });
            audio.preload = 'auto';
            audio.src = sound.format(name);

            cache[sound.format(name) + audio.bufferIndex] = false;

            sound.registerSound(name, audio, music == undefined ? false : music);
        }
        //setTimeout(checkSoundsLoaded, 1000);
    }

    function checkSoundsLoaded() {
        var sounds = sound.list();
        for (var buffer in sounds) {
            if (sounds.hasOwnProperty(buffer)) {
                sounds[buffer].forEach(function(audio) {
                    console.log(buffer + " -> " + audio.audio.readyState);
                });
            }
        }
    }

    function format(url) {
        return prefix + url + postfix;
    }

    function _load(url) {
        if (cache[format(url)]) {
            return cache[format(url)];
        } else {
            var image = new Image();
            image.addEventListener('load', function() {
                cache[format(url)] = image;
                if (ignoreLoaded) return;
                loader.update(loadingProgress());
                if (loaded()) {
                    callbacks.forEach(function(callback) {
                        callback();
                    });
                    ignoreLoaded = true;
                }
            });
            cache[format(url)] = false;
            image.src = format(url);
        }
    }

    function get(url) {
        return cache[format(url)];
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
        loadSound: loadSound,
        get: get,
        loadingProgress: loadingProgress,
        onReady: addCallback,
        setCookie: setCookie,
        getCookie: getCookie,
        loaded: loaded
    };

    function loadingProgress() {
        var total = 0;
        var loaded = 0;
        for (var url in cache) {
            if (!cache.hasOwnProperty(url)) continue;
            total++;
            if (cache[url]) loaded++;
        }
        return (loaded / total * 100).toFixed();
    }

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