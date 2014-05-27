(function() {

    var muted = res.getCookie(cookie.MUTED, true) == "true";

    var LOW_LAG_ENABLED = true;

    var prefix = "resources/sound/";
    var postfix = ".wav";

    function play(name) {
        if (muted) return;
        if (LOW_LAG_ENABLED) {
            lowLag.play(name);
            return;
        }
        var audio = new Audio(format(name));
        audio.play();
    }

    function format(name) {
        return prefix + name + postfix;
    }

    function toggleMute() {
        muted = !muted;
        res.setCookie(cookie.MUTED, muted);
    }

    window.sound = {
        play: play,
        toggleMute: toggleMute,
        muted: function() {
            return muted;
        }
    };
}());