function Sprite(img, pos, size, frames, speed) {
    this.img = img;
    this.pos = pos;
    this.size = size;
    this.frames = frames;
    this.index = 0;
    this.frame = 0;
    this.speed = speed;
}

Sprite.prototype = {
    update : function() {
        if (this.speed == 0) return;

        this.index += (fps * this.speed) / 1000;
        this.frame = Math.floor(this.index) % this.frames;
    },
    reset : function() {
        this.index = 0;
        this.frame = 0;
    },
    render : function(context) {
        var x = this.pos[0];
        var y = this.pos[1];
        x += this.frame * this.size[0];
        context.drawImage(this.img,
            x, y, this.size[0], this.size[1],
            0, 0, this.size[0], this.size[1]);
    }
};
