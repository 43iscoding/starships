(function(){

    var interval;

    function loadGame() {
        //processLoader();
        res.onReady(loaded);
        res.load(["starship", "laser", "shield", "asteroidPale", "crates", "ui", "sound"]);
        res.loadSound(["explosion", "laser", "powerup", ["soundtrack", true]]);
    }

    function processLoader() {
        interval = setInterval(function() {renderLoading()}, 250);
    }

    function loaded() {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        canvas.width = WIDTH * PIXEL_RATIO();
        canvas.height = (HEIGHT + PANEL_HEIGHT) * PIXEL_RATIO();
        canvas.style.width = WIDTH + 'px';
        canvas.style.height = HEIGHT + PANEL_HEIGHT + 'px';
        context.setTransform(PIXEL_RATIO(), 0, 0, PIXEL_RATIO(), 0, 0);
        context.font = "25px Visitor";
        context.textAlign = "center";
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.fillStyle = "#555";
        context.fillText("LOADED!", WIDTH / 2 + 0.5, HEIGHT / 2 + 0.5);
        setTimeout(init, 1000);
    }

    function renderLoading() {
        console.log("loader!");
        /*var context = document.getElementById('canvas').getContext('2d');
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.fillStyle = "#555";
        context.fillText("TEST", WIDTH / 2, HEIGHT / 2);*/

        if (res.loaded()) {
            clearInterval(interval);
        }
    }

    window.loadGame = loadGame;
}());