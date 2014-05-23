(function() {

    var mute = false;

    var LOW_LAG_ENABLED = true;

    var prefix = "resources/sound/";
    var postfix = ".wav";

    function play(name) {
        if (mute) return;
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
        mute = !mute;
    }

    window.sound = {
        play: play,
        toggleMute: toggleMute,
        muted: function() {
            return mute;
        }
    };
}());