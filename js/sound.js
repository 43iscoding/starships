(function() {
    var prefix = "resources/sound/";
    var postfix = ".wav";

    function play(name) {
        var audio = new Audio(format(name));
        //audio.volume = 0.2;
        audio.play();
    }

    function format(name) {
        return prefix + name + postfix;
    }

    window.sound = {
        play: play
    };
}());