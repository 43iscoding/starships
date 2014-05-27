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

    function clearInput() {
        pressed = {};
    }

    window.input = {
        isPressed: isPressed,
        clearInput: clearInput,
        keys: {
            BACKSPACE: {key: 'BACKSPACE', code: 8}, TAB: {key: 'TAB', code: 9}, ENTER: {key: 'ENTER', code: 13}, SHIFT: {key: 'SHIFT', code: 16},
            CTRL: {key: 'CTRL', code: 17}, ALT: {key: 'ALT', code: 18}, HOME: {key: 'HOME', code: 36}, END: {key: 'END', code: 35},
            INSERT: {key: 'INSERT', code: 45}, DELETE: {key: 'DELETE', code: 46}, PAGE_UP: {key: 'PAGE_UP', code: 33}, PAGE_DOWN: {key: 'PAGE_DOWN', code: 34},

            LEFT: {key: 'LEFT', code: 37}, UP: {key: 'UP', code: 38}, RIGHT: {key: 'RIGHT', code: 39}, DOWN: {key: 'DOWN', code: 40},

            A: {key: 'A', code: 65}, H: {key: 'H', code: 72}, O: {key: 'O', code: 79}, V: {key: 'V', code: 86},
            B: {key: 'B', code: 66}, I: {key: 'I', code: 73}, P: {key: 'P', code: 80}, W: {key: 'W', code: 87},
            C: {key: 'C', code: 67}, J: {key: 'J', code: 74}, Q: {key: 'Q', code: 81}, X: {key: 'X', code: 88},
            D: {key: 'D', code: 68}, K: {key: 'K', code: 75}, R: {key: 'R', code: 82}, Y: {key: 'Y', code: 89},
            E: {key: 'E', code: 69}, L: {key: 'L', code: 76}, S: {key: 'S', code: 83}, Z: {key: 'Z', code: 90},
            F: {key: 'F', code: 70}, M: {key: 'M', code: 77}, T: {key: 'T', code: 84},
            G: {key: 'G', code: 71}, N: {key: 'N', code: 78}, U: {key: 'U', code: 85},

            1: {key: '1', code: 49}, 6: {key: '6', code: 54},
            2: {key: '2', code: 50}, 7: {key: '7', code: 55},
            3: {key: '3', code: 51}, 8: {key: '8', code: 56},
            4: {key: '4', code: 52}, 9: {key: '9', code: 57},
            5: {key: '5', code: 53}, 0: {key: '0', code: 48},

            NUM1: {key: 'NUM1', code: 97}, NUM6: {key: 'NUM6', code: 102},
            NUM2: {key: 'NUM2', code: 98}, NUM7: {key: 'NUM7', code: 103},
            NUM3: {key: 'NUM3', code: 99}, NUM8: {key: 'NUM8', code: 104},
            NUM4: {key: 'NUM4', code: 100}, NUM9: {key: 'NUM9', code: 105},
            NUM5: {key: 'NUM5', code: 101}, NUM0: {key: 'NUM0', code: 96},

            PLUS: {key: 'PLUS', code: 107}, MINUS: {key: 'MINUS', code: 109}, MULTIPLY: {key: 'MULTIPLY', code: 106}, DIVIDE: {key: 'DIVIDE', code: 111}
        }
    };
}());