var submarineDefaults = {
      scale: 0.3
    , creationDelay: 1200
    , maxCount: 6
    , defaultGlow: 7
    , maxGlow: 8
    , minGlow: 1
    }

function SubmarineGroup(game) {
  this.game = game

  this.setup()
}

SubmarineGroup.prototype.setup = function(){
  this.submarineGroup = game.add.physicsGroup(Phaser.Physics.P2JS)
  this.submarineDebrisGroup = game.add.physicsGroup(Phaser.Physics.P2JS)

  this._lastCreatedAt = 0
}

SubmarineGroup.prototype.chooseCoords = function(){
  var x = Math.random() * 300 + 700;
  var y = Math.random() * 200 + 200;
  return {x: x, y: y}
}

SubmarineGroup.prototype.update = function() {
  var submarine
    , game = this.game // alias

  // Check for out of game bounds submarines
  for (var i = this.submarineGroup.children.length - 1; i >= 0; i--) {
    submarine = this.submarineGroup.children[i]

    if (submarine.width + submarine.x < game.camera.x) {
      this.submarineGroup.removeChild(submarine)
      submarine.destroy()
      submarine = null;
    }
  }

  // Check for out of game bounds submarines
  for (var i = this.submarineDebrisGroup.children.length - 1; i >= 0; i--) {
    submarine = this.submarineDebrisGroup.children[i]

    if (submarine.width + submarine.x < game.camera.x) {
      this.submarineDebrisGroup.removeChild(submarine)
      submarine.destroy()
      submarine = null;
    }
  }

  // Allways have from 2 to 6 fishes
  var maxCount = Math.max(2, 20 - Math.log2(game.controls.progress * 1000))
  while (this.submarineGroup.length < maxCount) {
    if (Date.now() - this._lastCreatedAt < submarineDefaults.creationDelay) break;
    this._lastCreatedAt = Date.now()

    var coords = this.chooseCoords();
    submarine = game.add.sprite(game.camera.x + coords.x, coords.y, 'submarine-sprite')
    submarine.scale.setTo(submarineDefaults.scale, submarineDefaults.scale)
    submarine.anchor.setTo(submarineDefaults.scale, submarineDefaults.scale)

    submarine.smoothed = false
    submarine.animations.add('move')
    submarine.play('move', 8, true)

    this.submarineGroup.add(submarine)
    submarine.body.data.gravityScale = (Math.random() - 0.5) / 7
    this.game.add.tween(submarine.body).to({angle: -15}, 500, Phaser.Easing.Sinusoidal.InOut, true, 0,
      Number.POSITIVE_INFINITY, true);
    submarine.body.velocity.x = Math.random() * -50;
    submarine.body.mass = 100

    submarine.body.setCollisionGroup(collisionGroups.submarines);
    submarine.body.collides([collisionGroups.player, collisionGroups.terrain]);
    submarine.lastGlow = submarineDefaults.defaultGlow
    submarine.glowIncreasing = false
  }
}

SubmarineGroup.prototype.moveX = function(offset) {
  var i
  for (i in this.submarineGroup.children) {
    this.submarineGroup.children[i].body.x += offset
  }

  for (i in this.submarineDebrisGroup.children) {
    this.submarineDebrisGroup.children[i].body.x += offset
  }
}

SubmarineGroup.prototype.glow = function(light) {
  var i
  for (i = this.submarineGroup.children.length - 1; i >= 0; i--) {
    submarine = this.submarineGroup.children[i]
    this.glowSubmarine(light, submarine)
  }

  for (i = this.submarineDebrisGroup.children.length - 1; i >= 0; i--) {
    submarine = this.submarineDebrisGroup.children[i]
    if (submarine.hasGlow) {
      this.glowSubmarine(light, submarine)
    }
  }
}

SubmarineGroup.prototype.glowSubmarine = function(light, submarine) {
  if (submarine.body && submarine.width + submarine.x > game.camera.x) {
    if (submarine.glowIncreasing) {
      submarine.lastGlow += game.time.physicsElapsed * 10
      if (submarine.lastGlow > submarineDefaults.maxGlow) {
        submarine.lastGlow = submarineDefaults.maxGlow
        submarine.glowIncreasing = false
      }
    } else {
      submarine.lastGlow -= game.time.physicsElapsed * 10
      if (submarine.lastGlow < submarineDefaults.minGlow) {
        submarine.lastGlow = submarineDefaults.minGlow
        submarine.glowIncreasing = true
      }
    }

    light.glow(submarine.x - this.game.camera.x - 4, submarine.y + 2, submarine.lastGlow)
  }
}

SubmarineGroup.prototype.isEaten = function(submarine) {
  this.creteSubmarineDebris(submarine.x, submarine.y, submarine.sprite.lastGlow, submarine.sprite.glowIncreasing)
  this.submarineGroup.removeChild(submarine.sprite)
  submarine.sprite && submarine.sprite.destroy()
}

var debrisPositions = [[0,13], [-3,13], [11,26], [19,23], [0,9], [3,-32], [13,7], [-21,-21]]

SubmarineGroup.prototype.creteSubmarineDebris = function(x, y, lastGlow, glowIncreasing) {
  var debris

  for (var i = 0; i < 8; i++) {
    debris = this.game.add.sprite(x + debrisPositions[i][0] * submarineDefaults.scale, y + debrisPositions[i][1] * submarineDefaults.scale, 'submarine-debris')
    debris.frameName = 'debris-' + (i + 1)
    debris.smoothed = false
    debris.scale.setTo(submarineDefaults.scale, submarineDefaults.scale)
    debris.anchor.setTo(submarineDefaults.scale, submarineDefaults.scale)

    this.submarineDebrisGroup.add(debris)
    debris.body.data.gravityScale = submarineDefaults.scale + Math.random() / 12
    debris.body.velocity.x = (Math.random() - 0.5) / 100;

    if (i == 1) {
      debris.body.setCollisionGroup(collisionGroups.submarinesDebris);
      debris.body.collides([collisionGroups.terrain]);

      debris.hasGlow = true
      debris.lastGlow = lastGlow
      debris.glowIncreasing = glowIncreasing
    } else {
      debris.hasGlow = false
    }
  }
}
