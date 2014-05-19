var cache = {};
var callback = null;

var prefix = "resources/";
var postfix = ".png";

function load(url) {
    if (url instanceof Array) {
        url.forEach(function(url) {
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
        image.onload = function() {
            cache[url] = image;
            if (loaded()) callback();
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

function setCallback(func) {
    callback = func;
}

window.res = {
    load: load,
    get: get,
    onReady: setCallback
};