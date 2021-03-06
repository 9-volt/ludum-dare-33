function Food(game) {
  this.game = game

  // this.squidGroup = new SquidGroup(game)
  this.submarineGroup = new SubmarineGroup(game)
}

Food.prototype.reset = function() {
  this.submarineGroup.reset()
}

Food.prototype.update = function() {
  // this.squidGroup.update()
  this.submarineGroup.update()
}

Food.prototype.moveX = function(offset) {
  // this.squidGroup.moveX(offset)
  this.submarineGroup.moveX(offset)
}

Food.prototype.isEatenSubmarine = function(submarine) {
  this.submarineGroup.isEaten(submarine)
}

Food.prototype.glow = function(light) {
  this.submarineGroup.glow(light)
}
