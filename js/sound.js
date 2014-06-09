(function() {

    var prefix = "resources/sound/";
    var postfix = ".mp3";

    var sounds = {};

    var state = res.getCookie(cookie.MUTED, muted.NONE);

    function registerSound(name, audio, music) {
        sounds[name] = {audio: audio, music: music};
    }

    function play(name, loop) {
        if (sounds[name] == "undefined" || sounds[name] == null) {
            console.log("Could not play sound: " + name + " is not loaded yet");
            return;
        }
        var audio = sounds[name].audio;
        audio.play();
        muteIfNeeded(audio, sounds[name].music);
        audio.onended = function() {
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
        if (state == muted.NONE) {
            state = muted.MUSIC;
        } else if (state == muted.MUSIC) {
            state = muted.ALL;
        } else {
            state = muted.NONE;
        }

        for (var audio in sounds) {
            if (!sounds.hasOwnProperty(audio)) continue;
            muteIfNeeded(sounds[audio].audio, sounds[audio].music);
        }
        res.setCookie(cookie.MUTED, state);
    }

    function muteIfNeeded(audio, music) {
        audio.muted = (state == muted.ALL) || (state == muted.MUSIC && music);
    }

    window.sound = {
        play: play,
        toggleMute: toggleMute,
        registerSound: registerSound,
        format: format,
        muted: function() {
            return state;
        }
    };
}());