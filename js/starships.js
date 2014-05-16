var fps = 60;
var rev_fps = 1 / fps;
var WIDTH = 320;
var HEIGHT = 200;
var PANEL_HEIGHT = 40;
var BG_SPEED = 0.75;
var canvas;
var context;
var asteroids = [];
var bullets = [];
var crates = [];
var BG_STARS_NUM = 100;
var bgStars = new Array(BG_STARS_NUM);
var inertia = 0.1;
var shipImage = new Image();
shipImage.src = "resources/starship.png";
var shieldImage = new Image();
shieldImage.src = "resources/shield.png";
var bulletImage = new Image();
bulletImage.src = "resources/laser.png";
var asteroidImage = new Image();
asteroidImage.src = "resources/asteroidPale.png";
var crateImage = new Image();
crateImage.src = "resources/crates.png";
var uiImage = new Image();
uiImage.src = "resources/ui.png";
var time = 0;
var score = 0;
var highScore = 0;
var worldSpeed = 0.5;
var lastTimeShot = 0;
var shootDelay = 500;
var INITIAL_BULLETS = 5;
var INITIAL_LIVES = 3;
var INVULNERABILITY = 100;
var SHAKE = [0,0,0]; //shake screen (x,y,timeToShake)
var TIME_TO_SHAKE = 30;

var Prime = function() {
    this.primes = [37];
    // current generator number
    this.prime = 37;

    // return true if NUM is generator
    this.isPrime = function(num) {
        var result = true;
        if (num !== 2) {
            if (num % 2 == 0) {
                result = false;
            } else {
                for (var x=3; x <= Math.sqrt(num); x += 2) {
                    if (num % x == 0) result = false;
                }
            }
        }
        return result;
    };

    this.getPrime = function(index) {
        while (this.primes[index] == null) {
            this.nextPrime(3);
        }
        return this.primes[index];
    };

    // return next generator number
    this.nextPrime = function(step) {
        if (step == null) step = 1;
        this.prime++;
        while (step > 0) {
            while (!this.isPrime(this.prime)) this.prime++;
            step--;
        }
        this.primes.push(this.prime);
        return this.prime;
    }
};

var generator = new Prime();

var ship = {x: WIDTH / 10, y: HEIGHT / 2,
    sprite: new Sprite(shipImage, [0,0], [30,10], 3, 3),
    xSpeed: 0, ySpeed: 0, maxSpeed : 2, applyInertia: true,
    cannotLeaveScreen: true, bullets: INITIAL_BULLETS, lives: INITIAL_LIVES,
    shield: new Sprite(shieldImage, [0,0], [40, 20], 2, 1), invulnerable: 0
};

function generateAsteroid() {
    var pos = getFreePosition(18, 18, WIDTH * 11 / 10);
    return {
        x: pos.x, y: pos.y,
        xSpeed: -1, ySpeed: 0, worldSpeedAffected: true,
        sprite: new Sprite(asteroidImage, [18 * Math.round(Math.random() * 2), 0], [18,18], 1, 0)
    }
}

function generateBullet() {
    return {
        x: ship.x + ship.sprite.size[0], y: ship.y + ship.sprite.size[1] / 2,
        xSpeed: 5, ySpeed: 0, worldSpeedAffected: false,
        sprite: new Sprite(bulletImage, [0,0], [10, 5], 1, 0)
    }
}

function generateCrate() {
    var pos = getFreePosition(18, 18, WIDTH * 11 / 10);
    var id = Math.round(Math.random() * 3);
    return {
        x: pos.x, y: pos.y,
        xSpeed: -1, ySpeed: 0, worldSpeedAffected: true,
        sprite: new Sprite(crateImage, [20 * id, 0], [20,20], 1, 0),
        ammo: (id + 1) * 2, type: id == 3 ? "life" : "ammo"
    }
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
    console.log("Warning - random free slot not found: (" + x + ":" + y +" )");
    return {x: x, y: y};
}

function init() {
    canvas = document.getElementById('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT + PANEL_HEIGHT;
    context = canvas.getContext("2d");
    initInput();
    initBackground();
    tick();
}

function tick() {
    time++;
    if (time % 50 == 0) {
        worldSpeed += 0.0625;
    }
    score += rev_fps;
    processInput();
    worldStep();
    render();
    setTimeout(tick, 1000 / fps);
}

function processInput() {
    if (isPressed("UP")) {
        ship.ySpeed = -ship.maxSpeed;
    } else if (isPressed("DOWN")) {
        ship.ySpeed = ship.maxSpeed;
    }
    if (isPressed("LEFT")) {
        ship.xSpeed = -ship.maxSpeed;
    } else if (isPressed("RIGHT")) {
        ship.xSpeed = ship.maxSpeed;
    }
    if (isPressed("SPACE") && lastTimeShot + shootDelay < Date.now() && ship.bullets > 0) {
        shoot();
    }
}

function shoot() {
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

function reset() {
    resetShip();
    asteroids = [];
    bullets = [];
    crates = [];
    if (score > highScore) {
        highScore = score;
    }
    score = 0;
    time = 0;
    worldSpeed = 0.5;
    SHAKE = [0,0,0];
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
            if (crates[i].type == "ammo") {
                ship.bullets += crates[i].ammo;
            } else if (crates[i].type = "life") {
                ship.lives++;
            }
            crates.splice(i, 1);
        }
    }
    for (i = asteroids.length - 1; i >= 0; i--) {
        if (collision(asteroids[i], ship)) {
            if (ship.invulnerable == 0) {
                SHAKE[2] = TIME_TO_SHAKE;
                ship.lives--;
                ship.invulnerable = INVULNERABILITY;
                if (ship.lives == 0) {
                    reset();
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

function collision(entity1, entity2) {
    return intersect(entity1.x, entity1.y, entity1.sprite.size[0], entity1.sprite.size[1],
                     entity2.x, entity2.y, entity2.sprite.size[0], entity2.sprite.size[1]);
}

function intersect(x1,y1,w1,h1, x2,y2,w2,h2) {
    return !((x1 > x2 + w2) ||
        (x1 + w1 < x2) ||
        (y1 > y2 + h2) ||
        (y1 + h1 < y2));
}



function applyInertia(entity) {
    var delta = inertia;
    var sign = entity.xSpeed < 0;
    if (sign) delta *= -1;
    entity.xSpeed -= delta;
    if (entity.xSpeed < 0 != sign) entity.xSpeed = 0;
    delta = inertia;
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
    context.drawImage(uiImage, 0, HEIGHT);
    context.font = "25px Visitor";
    context.textAlign = "left";

    context.fillStyle = "#000";
    context.fillText("SCORE", WIDTH - 117, HEIGHT + 17);
    context.fillText("HIGH", WIDTH - 105, HEIGHT + 32);
    context.fillText("BULLETS", 5, HEIGHT + 17);
    context.fillText("LIVES", 29, HEIGHT + 32);

    context.fillStyle = "#171";
    context.fillText(pad(Math.floor(score).toString(), 4), WIDTH - 52, HEIGHT + 17);
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