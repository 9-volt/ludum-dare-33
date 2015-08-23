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
    submarine.scale.setTo(0.5, 0.5)
    submarine.anchor.setTo(0,5, 0.5)

    submarine.smoothed = false
    submarine.animations.add('move')
    submarine.play('move', 8, true)

    this.submarineGroup.add(submarine)
    submarine.body.data.gravityScale = 0.01
    this.game.add.tween(submarine.body)
        .to(
            { angle: -15 },
            500, Phaser.Easing.Sinusoidal.InOut, true, 0,
            Number.POSITIVE_INFINITY, true
        );
    submarine.body.velocity.x = Math.random() * -400;

    submarine.body.setCollisionGroup(collisionGroups.submarines);
    submarine.body.collides([collisionGroups.player]);
  }
}

SubmarineGroup.prototype.moveX = function(offset) {
  for (var i in this.submarineGroup.children) {
    this.submarineGroup.children[i].body.x += offset
  }
}

SubmarineGroup.prototype.isEaten = function(submarine) {
  console.log(submarine)
}
