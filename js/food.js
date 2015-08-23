function Food(game) {
  this.game = game

  this.squidGroup = new SquidGroup(game)
}

Food.prototype.update = function() {
  this.squidGroup.update()
}

Food.prototype.moveX = function(offset) {
  this.squidGroup.moveX(offset)
}
