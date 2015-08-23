function Text(game) {
  this.game = game
  this.progress = 0

  this.setup()
}

Text.prototype.setup = function() {
  this._text = this.game.add.bitmapText(this.game.camera.x + this.game.camera.width - 210, 20, 'font','00000', 34);
  this._text.fixedToCamera = true
}

Text.prototype.update = function() {
  this.progress += this.game.time.physicsElapsed
  this._text.text = pad(Math.floor(this.progress), 5) // Progresse in physics seconds
}

Text.prototype.bringToTop = function() {
  this._text.parent.bringToTop(this._text) // don't ask why
};
Text.prototype.moveX = function() {
  this._text.x += 200
}
