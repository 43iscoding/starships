(function() {

    var LOW_LAG_ENABLED = true;

    var prefix = "resources/sound/";
    var postfix = ".wav";

    function play(name) {
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

    window.sound = {
        play: play
    };
}());