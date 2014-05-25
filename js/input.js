(function() {
    var pressed = {};
    document.addEventListener("keydown", function (e) {
        setKey(e.which, true);
    });
    document.addEventListener("keyup", function (e) {
        setKey(e.which, false);
    });

    function setKey(keyCode, state) {
        var key;
        switch (keyCode) {
            case 32:
                key = 'SPACE';
                break;
            case 37:
                key = 'LEFT';
                break;
            case 38:
                key = 'UP';
                break;
            case 39:
                key = 'RIGHT';
                break;
            case 40:
                key = 'DOWN';
                break;
            case 80:
                key = 'P';
                break;
            case 82:
                key = 'R';
                break;
            case 77:
                key = 'M';
                break;
            default:
                key = String.fromCharCode(keyCode);
                break;
        }
        pressed[key] = state;
    }

    function isPressed(key) {
        return pressed[key];
    }

    window.input = {
        isPressed: isPressed
    };
}());