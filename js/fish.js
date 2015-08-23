var fishDefaults = {
      fishMinXSpeed: 100
    , fishMaxXSpeed: 200
    , fishAcceleration: 0.004
    , life: 350
    , lowLife: 30
    , minLife: 10
    , maxLife: 350
    }

function Fish(game) {
  this.game = game
}

Fish.prototype.setup = function() {
  this._fish = game.add.sprite(200, 200, 'fish-sprite')
  this._light = game.add.sprite(200, 200, 'light')
  this._life = fishDefaults.life

  this.game.physics.p2.enable([this._fish, this._light], false)
  this.game.camera.follow(this._fish)

  this.setupAnimations()
  this.setupPhysics()
}

Fish.prototype.setupAnimations = function() {
  this._fish.smoothed = false
  this._fish.animations.add('move', [0,1,2,3], 6, true)
  this._fish.animations.add('eat', [4,5,6,7], 6, true)
  this._fish.play('move')
}

Fish.prototype.setupPhysics = function() {
  this._fish.body.gravityScale = 1
  this._fish.body.clearShapes()
  this._fish.body.loadPolygon('fish-data', 'one-fish')
  this._fish.body.mass = 1000

  this._light.body.gravityScale = 0
  this._light.body.mass = 1

  // Fish to light constraint
  this._constraint = game.physics.p2.createDistanceConstraint(this._fish, this._light, 0, [64, -12], [0, 0])
}

Fish.prototype.update = function() {
  var fish = this._fish // alias

  // SPEED X
  // =======
  fish.body.velocity.x += fish.body.velocity.y * fishDefaults.fishAcceleration * Math.max(1, 60 * game.time.physicsElapsed)
  // Min velocity
  fish.body.velocity.x = Math.max(fishDefaults.fishMinXSpeed, fish.body.velocity.x)
  // Max velocity
  fish.body.velocity.x = Math.min(fishDefaults.fishMaxXSpeed, fish.body.velocity.x)

  // ROTATION
  // ========
  var newRotation = 0
  if (fish.body.velocity.y > 0) {
    newRotation = fish.body.velocity.y * 0.0005 * Math.PI
  }  else {
    newRotation = fish.body.velocity.y * 0.0007 * Math.PI
  }

  var rotationDiff = Math.abs(newRotation - fish.body.rotation)
    , rotationPower = Math.min(1, Math.max(0.1, 1 - rotationDiff / 0.6))

  fish.body.rotation = newRotation * rotationPower

  // FISH ANIMATION SPEED
  // ====================

  var newDelay = 150 - (Math.abs(fish.body.velocity.x) + Math.abs(fish.body.velocity.y)) / 5
  newDelay = Math.max(50, newDelay)
  newDelay = Math.min(150, newDelay)
  fish.animations.getAnimation('move').delay = newDelay
}

Fish.prototype.getX = function() {
  return this._fish.position.x
}

Fish.prototype.moveX = function(offsetX) {
  this._fish.body.x += offsetX
}

Fish.prototype.getLightX = function() {
  return this._light.body.x
}

Fish.prototype.getLightY = function() {
  return this._light.body.y
}

Fish.prototype.moveLightX = function(offsetX) {
  this._light.body.x += offsetX
}

Fish.prototype.accelerateY = function(acceleration) {
  this._fish.body.velocity.y -= acceleration
}

Object.defineProperty(Fish.prototype, 'life', {
  get: function() {
    return this._life
  }
, set: function(value) {
    this._life = Math.max(fishDefaults.minLife, Math.min(fishDefaults.maxLife, value))

    if (this._life < fishDefaults.lowLife) {
      this.game.controls.play('lowLife')
    } else {
      this.game.controls.stop('lowLife')
    }
  }
})
