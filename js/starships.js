(function() {

    function Entity(x, y, width, height, xSpeed, ySpeed, type, sprite, args) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.type = type;
        this.sprite = new Sprite(res.get(sprite['name']), sprite['pos'], [width, height],
            sprite['frames'] == undefined ? 1 : sprite['frames'],
            sprite['speed'] == undefined ? 0 : sprite['speed']);
        if (args != undefined) {
            this.worldSpeedAffected = args['worldSpeed'] == undefined ? false : args['worldSpeed'];
            this.applyInertia = args['applyInertia'] == undefined ? false : args['applyInertia'];
            this.canLeaveScreen = args['canLeaveScreen'] == undefined ? true : args['canLeaveScreen'];
        }
    }

    Entity.prototype = {
        updateSprite : function() {
            this.sprite.update();
        }
    };

    function Ship(x, y, xSpeed, ySpeed, sprite, args) {
        Entity.call(this, x, y, 30, 10, xSpeed, ySpeed, "ship", sprite, args);
        this.bullets = INITIAL_BULLETS;
        this.lives = INITIAL_LIVES;
        this.invulnerable = 0;
        this.shield = new Sprite(res.get("shield"), [0, 0], [40, 20], 2, 1);
    }

    Ship.prototype = Object.create(Entity.prototype);

    function Bonus(x, y, xSpeed, ySpeed, sprite, args) {
        Entity.call(this, x, y, 18, 18, xSpeed, ySpeed, "bonus", sprite, args);
        this.ammo = args['ammo'];
        this.bonusType = args['type'];
    }

    Bonus.prototype = Object.create(Entity.prototype);

    function createShipNew() {
        return new Ship(WIDTH / 10, HEIGHT / 2, 0, 0,
            {name : "starship", pos : [0,0], frames: 3, speed: 3},
            {inertia : true, leaveScreen : false});
    }

    function generateAsteroid() {
        var pos = getFreePosition(18, 18, WIDTH * 11 / 10);
        return new Entity(pos.x, pos.y, 18, 18, -1, 0, "asteroid",
            {name : "asteroidPale", pos : [18 * Math.round(Math.random() * 2), 0]},
            {worldSpeed : true});
    }

    function generateBullet() {
        return new Entity(ship.x + ship.sprite.size[0], ship.y + ship.sprite.size[1] / 2, 10, 5,
            5, 0, "bullet",
            {name : "laser", pos : [0, 0]});
    }

    function generateCrate() {
        var pos = getFreePosition(18, 18, WIDTH * 11 / 10);
        var id = Math.round(Math.random() * 3);
        return new Bonus(pos.x, pos.y, -1, 0,
            {name : "crates", pos : [20 * id, 0]},
            {worldSpeed : true, ammo: (id + 1) * 2, type : id == 3 ? 'life' : 'ammo'});
    }

    var canvas;
    var context;

    var asteroids = [];
    var bullets = [];
    var crates = [];

    var bgStars = new Array(BG_STARS_NUM);

    var time = 0;
    var score = 0;
    var lastTimeShot = 0;
    var lastTimeRestarted = 0;
    var lastTimeMuted = 0;
    var SHAKE = [0, 0, 0]; //shake screen (x,y,timeToShake)
    var worldSpeed = WORLD_SPEED;

    var generator = new Prime();
    var ship;

    function createShip() {
        return {x: WIDTH / 10, y: HEIGHT / 2,
            sprite: new Sprite(res.get("starship"), [0, 0], [30, 10], 3, 3),
            xSpeed: 0, ySpeed: 0, maxSpeed: 2, applyInertia: true,
            cannotLeaveScreen: true, bullets: INITIAL_BULLETS, lives: INITIAL_LIVES,
            shield: new Sprite(res.get("shield"), [0, 0], [40, 20], 2, 1), invulnerable: 0
        };
    }

    function getFreePosition(width, height, desirableX, desirableY) {
        var tries = 100;
        var x, y;
        while (tries > 0) {
            var collision = false;
            x = desirableX != null ? desirableX : Math.random() * (WIDTH - width);
            y = desirableY != null ? desirableY : Math.random() * (HEIGHT - height);
            for (var i = 0; i < asteroids.length && !collision; i++) {
                collision = intersect(asteroids[i].x, asteroids[i].y, asteroids[i].sprite.size[0], asteroids[i].sprite.size[1], x, y, width, height);
            }
            for (i = 0; i < crates.length && !collision; i++) {
                collision = intersect(crates[i].x, crates[i].y, crates[i].sprite.size[0], crates[i].sprite.size[1], x, y, width, height);
            }
            if (!collision) return {x: x, y: y};
        }
        console.log("Warning - random free slot not found: (" + x + ":" + y + " )");
        return {x: x, y: y};
    }

    function loadGame() {
        lowLag.init({ sm2url : "lib/sm2/swf/",
                      urlPrefix : "resources/sound/",
                      debug : "none"});
        lowLag.load(['explosion.wav'], 'explosion');
        lowLag.load(['laser.wav'], 'laser');
        lowLag.load(['powerup.wav'], 'powerup');
        res.onReady(start);
        res.load(["starship", "laser", "shield", "asteroidPale", "crates", "ui", "sound"]);
    }

    function start() {
        canvas = document.getElementById('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT + PANEL_HEIGHT;
        context = canvas.getContext("2d");
        initBackground();
        ship = createShip();
        tick();
    }

    function tick() {
        time++;
        if (time % 50 == 0) {
            worldSpeed += 0.0625;
        }
        score += 1 / fps;
        processInput();
        worldStep();
        render();
        setTimeout(tick, 1000 / fps);
    }

    function processInput() {
        if (input.isPressed("UP")) {
            ship.ySpeed = -ship.maxSpeed;
        } else if (input.isPressed("DOWN")) {
            ship.ySpeed = ship.maxSpeed;
        }
        if (input.isPressed("LEFT")) {
            ship.xSpeed = -ship.maxSpeed;
        } else if (input.isPressed("RIGHT")) {
            ship.xSpeed = ship.maxSpeed;
        }
        if (input.isPressed("SPACE") && lastTimeShot + SHOOT_DELAY < Date.now() && ship.bullets > 0) {
            shoot();
        }

        if (input.isPressed("R") && lastTimeRestarted + 1000 < Date.now()) {
            lastTimeRestarted = Date.now();
            restart();
        }

        if (input.isPressed("M") && lastTimeMuted + 1000 < Date.now()) {
            lastTimeMuted = Date.now();
            sound.toggleMute();
        }
    }

    function shoot() {
        sound.play("laser");
        ship.bullets--;
        lastTimeShot = Date.now();
        bullets.push(generateBullet());
    }

    function updateEntities(entities) {
        for (var i = 0; i < entities.length; i++) {
            updateEntity(entities[i]);
        }
    }

    function updateEntity(entity) {
        entity.sprite.update();
        if (entity.applyInertia) {
            applyInertia(entity);
        }
        if (entity.worldSpeedAffected) {
            entity.x += entity.xSpeed * worldSpeed;
            entity.y += entity.ySpeed * worldSpeed;
        } else {
            entity.x += entity.xSpeed;
            entity.y += entity.ySpeed;
        }
        if (entity.cannotLeaveScreen) {
            if (entity.x < 0) entity.x = 0;
            if (entity.x + entity.sprite.size[0] > WIDTH) entity.x = WIDTH - entity.sprite.size[0];
            if (entity.y < 0) entity.y = 0;
            if (entity.y + entity.sprite.size[1] > HEIGHT) entity.y = HEIGHT - entity.sprite.size[1];
        }
    }

    function worldStep() {
        generateAsteroids(time);

        if (time % 500 == 0) {
            crates.push(generateCrate());
        }
        updateEntity(ship);
        if (ship.invulnerable > 0) {
            ship.invulnerable--; //TODO: move to expiring effects
            ship.shield.update();
        } else {
            ship.shield.reset();
        }
        for (var i = 0; i < asteroids.length; i++) {
            updateEntity(asteroids[i]);

            if (asteroids[i].x + asteroids[i].sprite.size[0] < 0) {
                asteroids.splice(i, 1);
                i--;
            }
        }
        updateEntities(bullets);
        updateEntities(crates);
        processCollisions();
        if (SHAKE[2] > 0) {
            SHAKE[2]--;
            SHAKE[0] = Math.round(Math.random() * 4 - 2);
            SHAKE[1] = Math.round(Math.random() * 4 - 2);
        } else {
            SHAKE[0] = 0;
            SHAKE[1] = 0;
        }
    }

// Generating asteroids:
// for each 1000 ticks additional asteroid timer is added
// each (ticks % prime)
    function generateAsteroids(ticks) {
        for (var i = Math.floor(ticks / 1000); i >= 0; i--) {
            if (ticks % generator.getPrime(i) == 0) {
                asteroids.push(generateAsteroid());
            }
        }
    }

    function restart() {
        initBackground();
        resetShip();
        asteroids = [];
        bullets = [];
        crates = [];
        var highScore = res.getCookie("highscore", 0);
        if (score > highScore) {
            res.setCookie("highscore", score);
        }
        score = 0;
        time = 0;
        worldSpeed = WORLD_SPEED;
        SHAKE = [0, 0, 0];
    }

    function resetShip() {
        ship.x = WIDTH / 10;
        ship.y = HEIGHT / 2;
        ship.bullets = INITIAL_BULLETS;
        ship.lives = INITIAL_LIVES;
        ship.invulnerable = 0;
    }


    function processCollisions() {
        for (var i = crates.length - 1; i >= 0; i--) {
            if (collision(crates[i], ship)) {
                sound.play("powerup");
                if (crates[i].bonusType == "ammo") {
                    ship.bullets += crates[i].ammo;
                } else if (crates[i].bonusType = "life") {
                    ship.lives++;
                }
                crates.splice(i, 1);
            }
        }
        for (i = asteroids.length - 1; i >= 0; i--) {
            if (collision(asteroids[i], ship)) {
                if (ship.invulnerable == 0) {
                    sound.play("explosion");
                    SHAKE[2] = TIME_TO_SHAKE;
                    ship.lives--;
                    ship.invulnerable = INVULNERABILITY;
                    if (ship.lives == 0) {
                        //showOverlay();
                        restart();
                        return;
                    }
                }
                asteroids.splice(i, 1);
                continue;
            }
            for (var j = bullets.length - 1; j >= 0; j--) {
                if (collision(asteroids[i], bullets[j])) {
                    score += 5;
                    asteroids.splice(i, 1);
                    bullets.splice(j, 1);
                    break;
                }
            }
        }
    }

    function showOverlay() {
        document.getElementById("overlay").style.display = "block";
    }

    function collision(entity1, entity2) {
        return intersect(entity1.x, entity1.y, entity1.sprite.size[0], entity1.sprite.size[1],
            entity2.x, entity2.y, entity2.sprite.size[0], entity2.sprite.size[1]);
    }

    function intersect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !((x1 > x2 + w2) ||
            (x1 + w1 < x2) ||
            (y1 > y2 + h2) ||
            (y1 + h1 < y2));
    }


    function applyInertia(entity) {
        var delta = INERTIA;
        var sign = entity.xSpeed < 0;
        if (sign) delta *= -1;
        entity.xSpeed -= delta;
        if (entity.xSpeed < 0 != sign) entity.xSpeed = 0;
        delta = INERTIA;
        sign = entity.ySpeed < 0;
        if (sign) delta *= -1;
        entity.ySpeed -= delta;
        if (entity.ySpeed < 0 != sign) entity.ySpeed = 0;
    }

    function render() {
        renderBackground();

        renderEntities(bullets);
        renderEntities(asteroids);
        renderEntities(crates);
        renderEntity(ship);
        if (ship.invulnerable > 0) {
            renderSprite(ship.shield, ship.x - 5, ship.y - 5);
        }
        renderUI();
    }

    function renderUI() {
        context.drawImage(res.get("ui"), 0, HEIGHT);
        context.font = "25px Visitor";
        context.textAlign = "left";

        context.fillStyle = "#000";
        context.fillText("SCORE", WIDTH - 117, HEIGHT + 17);
        context.fillText("HIGH", WIDTH - 105, HEIGHT + 32);
        context.fillText("BULLETS", 5, HEIGHT + 17);
        context.fillText("LIVES", 29, HEIGHT + 32);

        context.fillStyle = "#171";
        //draw sound button
        if (sound.muted()) {
            context.drawImage(res.get("sound"),30, 0, 30, 30, WIDTH - 15, 0, 15, 15);
        } else {
            context.drawImage(res.get("sound"),0, 0, 30, 30, WIDTH - 15, 0, 15, 15);
        }

        context.fillText(pad(Math.floor(score).toString(), 4), WIDTH - 52, HEIGHT + 17);
        var highScore = res.getCookie("highscore", 0);
        context.fillText(pad(Math.floor(highScore).toString(), 4), WIDTH - 52, HEIGHT + 32);
        context.fillText(pad(ship.bullets.toString(), 2), 94, HEIGHT + 17);
        context.fillText(pad(ship.lives.toString(), 2), 94, HEIGHT + 32);
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

    function renderEntities(list) {
        for (var i = 0; i < list.length; i++) {
            renderEntity(list[i]);
        }
    }

    function renderEntity(entity) {
        renderSprite(entity.sprite, entity.x, entity.y);
    }

    function renderSprite(sprite, x, y) {
        context.save();
        context.translate(x + SHAKE[0], y + SHAKE[1]);
        sprite.render(context);
        context.restore();
    }

    function initBackground() {
        for (var i = 0; i < bgStars.length; i++) {
            bgStars[i] = {x: i * WIDTH / bgStars.length, y: i * 700 * Math.random() % HEIGHT};
        }
    }

    function getBGOffset() {
        return (time * BG_SPEED) % WIDTH;
    }

    function renderBackground() {
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.fillStyle = "white";
        for (var i = 0; i < bgStars.length; i++) {
            var x = bgStars[i].x - getBGOffset();
            x = x < 0 ? x + WIDTH : x;
            context.fillRect(x + SHAKE[0], bgStars[i].y + SHAKE[1], 1, 1);
        }
    }

    window.loadGame = loadGame;
}());
