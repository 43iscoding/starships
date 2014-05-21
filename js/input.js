pressed = {};

function initInput() {
    document.addEventListener("keydown", function(e) {
        setKey(e.which, true);
    });
    document.addEventListener("keyup", function(e) {
        setKey(e.which, false);
    });
}

function setKey(keyCode, state) {
    var key;
    switch (keyCode) {
        case 32: //space
            key = 'SPACE'; break;
        case 37: //left
            key = 'LEFT'; break;
        case 38: //up
            key = 'UP'; break;
        case 39: //right
            key = 'RIGHT'; break;
        case 40: //down
            key = 'DOWN'; break;
        case 82: //r
            key = 'R'; break;
        default:
            key = String.fromCharCode(keyCode); break;
    }
    pressed[key] = state;
}

function isPressed(key) {
    return pressed[key];
}

window.input = {
    isPressed: isPressed
};