function Food(game) {
  this.game = game

  this.squidGroup = new SquidGroup(game)
  this.submarineGroup = new SubmarineGroup(game)
}

Food.prototype.update = function() {
  this.squidGroup.update()
  this.submarineGroup.update()
}

Food.prototype.moveX = function(offset) {
  this.squidGroup.moveX(offset)
  this.submarineGroup.moveX(offset)
}
