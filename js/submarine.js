function SubmarineGroup(game) {
  this.game = game

  this.setup()
}

SubmarineGroup.prototype.setup = function(){
  this.submarineGroup = game.add.physicsGroup(Phaser.Physics.P2JS)
}

SubmarineGroup.prototype.chooseCoords = function(){
  var x = Math.random() * 500 + 700;
  var y = Math.random() * 200 + 200;
  return { x: x, y: y}
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

  // Allways have up to 3 submarines
  while (this.submarineGroup.length < 2) {
    var coords = this.chooseCoords();
    submarine = game.add.sprite(game.camera.x + coords.x, coords.y, 'submarine-sprite')
    submarine.scale.setTo(0.3, 0.3)
    submarine.anchor.setTo(0,3, 0.3)

    submarine.smoothed = false
    submarine.animations.add('move')
    submarine.play('move', 8, true)

    this.submarineGroup.add(submarine)
    submarine.body.data.gravityScale = (Math.random() - 0.5) / 7
    this.game.add.tween(submarine.body).to({angle: -15}, 500, Phaser.Easing.Sinusoidal.InOut, true, 0,
      Number.POSITIVE_INFINITY, true);
    submarine.body.velocity.x = Math.random() * -50;

    submarine.body.setCollisionGroup(collisionGroups.submarines);
    submarine.body.collides([collisionGroups.player, collisionGroups.terrain]);
    submarine.lastGlow = 10
    submarine.glowIncreasing = false
  }
}

SubmarineGroup.prototype.moveX = function(offset) {
  for (var i in this.submarineGroup.children) {
    this.submarineGroup.children[i].body.x += offset
  }
}

SubmarineGroup.prototype.glow = function(light) {
  for (var i = this.submarineGroup.children.length - 1; i >= 0; i--) {
    submarine = this.submarineGroup.children[i]

    // Draw each submarine glow
    if (submarine.body && submarine.width + submarine.x > game.camera.x) {
      if (submarine.glowIncreasing) {
        submarine.lastGlow += game.time.physicsElapsed * 10
        if (submarine.lastGlow > 8) {
          submarine.lastGlow = 8
          submarine.glowIncreasing = false
        }
      } else {
        submarine.lastGlow -= game.time.physicsElapsed * 10
        if (submarine.lastGlow < 1) {
          submarine.lastGlow = 1
          submarine.glowIncreasing = true
        }
      }

      light.glow(submarine.x - this.game.camera.x - 4, submarine.y + 2, submarine.lastGlow)
    }
  }
}

SubmarineGroup.prototype.isEaten = function(submarine) {
  this.creteSubmarineDebris(submarine.x, submarine.y)
  this.submarineGroup.removeChild(submarine.sprite)
  submarine.sprite && submarine.sprite.destroy()
}

SubmarineGroup.prototype.creteSubmarineDebris = function(x, y) {
  console.log(x, y)
}
