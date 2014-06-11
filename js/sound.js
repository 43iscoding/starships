(function() {

    var prefix = "resources/sound/";
    var postfix = ".mp3";

    var sounds = {};

    var BUFFER_SIZE = 3;

    var state = res.getCookie(cookie.MUTED, muted.NONE);

    function registerSound(name, audio, music) {
        if (!(sounds[name] instanceof Array)) {
            sounds[name] = [];
        }
        sounds[name].push({audio: audio, music: music});
    }

    function play(name, loop) {
        if (sounds[name] == "undefined" || sounds[name] == null) {
            console.log("Could not play sound: " + name + " is not loaded yet");
            return;
        }
        var buffer = sounds[name];
        var played = false;
        for (var i = 0; i < getBufferSize(buffer[0].music); i++) {
            var audio = buffer[i].audio;
            if (!audio.paused && audio.currentTime > 0) {
                continue;
            }
            audio.play();
            muteIfNeeded(audio, buffer[i].music);
            audio.onended = function() {
                this.load();
                if (loop) {
                    play(name, true);
                }
            };
            played = true;
            break;
        }
        if (!played) {
            console.log("Could not play " + name + " - Buffer size is " + buffer);
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

        for (var buffer in sounds) {
            if (!sounds.hasOwnProperty(buffer)) continue;
            sounds[buffer].forEach(function(audio) {
                muteIfNeeded(audio.audio, audio.music);
            });
        }
        res.setCookie(cookie.MUTED, state);
    }

    function muteIfNeeded(audio, music) {
        audio.muted = (state == muted.ALL) || (state == muted.MUSIC && music);
    }

    function getBufferSize(music) {
        return music ? 1 : BUFFER_SIZE;
    }

    window.sound = {
        play: play,
        toggleMute: toggleMute,
        registerSound: registerSound,
        format: format,
        muted: function() {
            return state;
        },
        getBufferSize: getBufferSize,
        list: function() {
            return sounds;
        }
    };
}());