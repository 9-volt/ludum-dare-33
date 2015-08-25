var fishDefaults = {
      fishMinXSpeed: 100
    , fishMaxXSpeed: 200
    , fishAcceleration: 0.004
    , life: 150
    , lowLife: 50
    , minLife: 10
    , maxLife: 350
    , hitPenalty: 30
    , foodLife: 25
    , hitDelay: 300 // at most one hit every X milliseconds
    }

function Fish(game, food) {
  this.game = game
  this.food = food
}

Fish.prototype.setup = function() {
  this._fish = game.add.sprite(200, 150, 'fish-sprite')
  this._light = game.add.sprite(260, 175, 'light')
  this._life = fishDefaults.life
  this._lastHit = 0

  this.game.physics.p2.enable([this._fish, this._light], false)
  this.game.camera.follow(this._fish)

  this.setupAnimations()
  this.setupPhysics()
}

Fish.prototype.reset = function() {
  this._life = fishDefaults.life
  this._lastHit = 0
  this._fish.body.x = 200
  this._fish.body.y = 150
  this._light.body.x = 260
  this._light.body.y = 175
}

Fish.prototype.setupAnimations = function() {
  this._fish.smoothed = false
  var animationMove = this._fish.animations.add('move', [0,3,2,1], 6, false)
  var animationEat = this._fish.animations.add('eat', [4,5,6,7], 30, false)
  this._fish.play('move')

  animationMove.onComplete.add(function() {})

  animationEat.onComplete.add(function(){
    this._fish.play('move')
  }, this)
}

Fish.prototype.hitGround = function() {
  if (Date.now() - this._lastHit > fishDefaults.hitDelay) {
    this._lastHit = Date.now()

    if (!this.game.isPaused) {
      this.game.controls.play('hit')
    }

    this.life -= fishDefaults.hitPenalty;

    if(this.life < fishDefaults.minLife + 1 && !this.game.isPaused) {
      pause()
      this.game.controls.play('hit')
    }
  }
}

Fish.prototype.setupPhysics = function() {
  this._fish.body.gravityScale = 1
  this._fish.body.clearShapes()
  this._fish.body.loadPolygon('fish-data', 'one-fish')
  this._fish.body.mass = 1000
  this._fish.body.setCollisionGroup(collisionGroups.player)
  this._fish.body.collides(collisionGroups.terrain, function() {
    this.hitGround()
  }, this);
  this._fish.body.collides(collisionGroups.submarines, function(fishBody, submarineBody, convex, box) {
    if (!submarineBody.isEaten) {
      var diffX = submarineBody.x - fishBody.x
        , diffY = submarineBody.y - fishBody.y

      if (diffX > 40 && diffY < 45 && diffY > -45) {
        submarineBody.isEaten = true
        this._fish.play('eat')
        this.game.controls.play('bite' + (Math.random() > 0.5 ? 1 : 2))
        this.life += fishDefaults.foodLife
        this.food.isEatenSubmarine(submarineBody)
      }
    }
  }, this);

  this._light.body.gravityScale = 0
  this._light.body.clearShapes()
  this._light.body.mass = 1

  // Fish to light constraint
  this._constraint = game.physics.p2.createLockConstraint(this._fish, this._light, [-58, 24], 90, 400)
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

  this.checkForOutOfBounds()
}

Fish.prototype.checkForOutOfBounds = function() {
  if (this._fish.body.y < 0 || this._fish.body.y > this.game.height) {
    pause()
  }
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
  this.game.controls.play('bulik')
  this._fish.play('move')
}

Object.defineProperty(Fish.prototype, 'life', {
  get: function() {
    return this._life
  }
, set: function(value) {
    this._life = Math.max(fishDefaults.minLife, Math.min(fishDefaults.maxLife, value))

    if (this._life < fishDefaults.lowLife && !game.isPaused) {
      this.game.controls.play('lowLife')
    } else {
      this.game.controls.stop('lowLife')
    }
  }
})
