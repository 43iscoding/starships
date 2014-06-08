(function() {

    var prefix = "resources/sound/";
    var postfix = ".mp3";

    var sounds = {};

    var muted = res.getCookie(cookie.MUTED, true) == "true";

    function registerSound(name, audio) {
        sounds[name] = audio;
    }

    function play(name, loop) {
        if (sounds[name] == "undefined" || sounds[name] == null) {
            console.log("Could not play sound: " + name + " is not loaded yet");
            return;
        }
        sounds[name].play();
        sounds[name].onended = function() {
            console.log("ended playing: " + name);
            //this.currentTime = 0;
            this.load();
            if (loop) {
                play(name, true);
            }
        }
    }

    function format(name) {
        return prefix + name + postfix;
    }

    function toggleMute() {
        muted = !muted;
        for (var audio in sounds) {
            if (!sounds.hasOwnProperty(audio)) continue;
            sounds[audio].muted = muted;
        }
        res.setCookie(cookie.MUTED, muted);
    }

    window.sound = {
        play: play,
        toggleMute: toggleMute,
        registerSound: registerSound,
        format: format,
        muted: function() {
            return muted;
        }
    };
}());