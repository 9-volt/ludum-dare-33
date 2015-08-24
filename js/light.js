function Light(game) {
  this.game = game
  this.setup()
  this.lightIsEnabled = true
}

Light.prototype.setup = function() {
  // Create the shadow texture
  this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height)

  // Create an object that will use the bitmap as a texture
  this.shadowImage = this.game.add.image(0, 0, this.shadowTexture)

  // Set the blend mode to MULTIPLY. This will darken the colors of everything below this sprite.
  this.shadowImage.blendMode = Phaser.blendModes.MULTIPLY
}

Light.prototype.setX = function(offset) {
  if (!this.lightIsEnabled) return false;
  if (this.game.isPaused) return false;

  // return true
  this.shadowImage.x = offset

  // Draw shadow
  this.shadowTexture.context.fillStyle = 'rgb(5, 5, 5)'
  this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height)
}

Light.prototype.clear = function() {
  this.shadowTexture.cls()
  this.shadowTexture.dirty = true
}

Light.prototype.bringToTop = function() {
  this.shadowImage.bringToTop()
};

Light.prototype.glow = function(lightX, lightY, radius) {
  if (!this.lightIsEnabled) return false;
  if (this.game.isPaused) return false;

  // Draw circle of light with a soft edge
  var gradient = this.shadowTexture.context.createRadialGradient(lightX, lightY, radius * 0.25, lightX, lightY, radius);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

  this.shadowTexture.context.beginPath();
  this.shadowTexture.context.fillStyle = gradient;
  this.shadowTexture.context.arc(lightX, lightY, radius, 0, Math.PI*2);
  this.shadowTexture.context.fill();
}

Light.prototype.done = function() {
  if (!this.lightIsEnabled) return false;
  if (this.game.isPaused) return false;

  // This just tells the engine it should update the texture cache
  this.shadowTexture.dirty = true
}
