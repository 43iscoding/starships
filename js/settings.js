(function() {
    //ui settings
    window.fps = 60;
    window.WIDTH = 320;
    window.HEIGHT = 200;
    window.PANEL_HEIGHT = 40;

    window.BG_STARS_NUM = 100;
    window.BG_SPEED = 0.75;

    //game settings
    window.INITIAL_BULLETS = 5;
    window.INITIAL_LIVES = 3;
    window.INVULNERABILITY = 100;
    window.SHOOT_DELAY = 500;
    window.WORLD_SPEED = 0.5;
    window.TIME_TO_SHAKE = 30;

    window.INERTIA = 0.1;

    window.overlay = {
        DEATH : "death",
        PAUSED : "pause",
        SPLASH : "splash"
    };

    window.state = {
        DEATH : "death",
        PAUSED : "pause",
        SPLASH : "splash",
        RUNNING : "running"
    };

    window.cookie = {
        MUTED : "muted",
        HIGHSCORE : "highscore"
    };

    window.muted = {
        NONE : "mute_none",
        MUSIC : "mute_music",
        ALL : "mute_all"
    };

    window.soundTrackLength = 94000;
    window.PIXEL_RATIO = function () {
        var ctx = document.getElementById("canvas").getContext("2d"),
            dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    };

}());
