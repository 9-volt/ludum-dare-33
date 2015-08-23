function SquidGroup(game) {
  this.game = game
  this.squidGroup = game.add.physicsGroup(Phaser.Physics.P2JS)
}

SquidGroup.prototype.update = function() {
  var squid
    , game = this.game // alias

  // Check for out of game bounds squids
  for (var i = this.squidGroup.children.length - 1; i >= 0; i--) {
    squid = this.squidGroup.children[i]

    if (squid.width + squid.x < game.camera.x) {
      this.squidGroup.removeChild(squid)
      squid.destroy()
    }
  }

  // Allways have up to 3 squids
  while (this.squidGroup.length < 3) {
    squid = game.add.sprite(game.camera.x + Math.random() * 500, Math.random() * 500, 'squid-sprite')
    squid.smoothed = false
    squid.animations.add('move')
    squid.play('move', 8, true)

    this.squidGroup.add(squid)

    squid.body.data.gravityScale = 0.01
  }
}

SquidGroup.prototype.moveX = function(offset) {
  for (var i in this.squidGroup.children) {
    this.squidGroup.children[i].body.x += offset
  }
}
