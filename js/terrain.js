var Terrain = function(game) {
  this.game = game;
  this.width = game.world.bounds.width;
  this.height = game.world.bounds.height;
  this.numPoints = 3000;
  this.shape = [];
  this.collisionShape = [];
  this.simplex = new SimplexNoise();
  this.xScale = scale(0, this.numPoints, 0, this.width);
  this.yScale = scale(-2, 2, this.height, this.height / 2);
  this.largeScale = scale(-1, 1, this.height, this.height / 2)
  this.smallScale = scale(-1, 1, -5, 5);
  this.miniScale = scale(-1, 1, -2, 2);
  this.every = 20;
  this.startPoint = 1;

  this.generate();
}

Terrain.prototype.setup = function() {
  this.ground = this.game.add.graphics(0, 0);

  this.groundTexture = this.game.add.graphics(0, 0);
  this.groundTexture.beginFill(0xFF33ff);
  this.groundTexture.drawPolygon(this.toPoly().points);
  this.groundTexture.endFill();

  this.game.physics.p2.enable([this.ground], true);
  this.ground.body.addPolygon({}, this.toCollisionArray(0));
  this.ground.body.static = true;
}

Terrain.prototype.moveX = function(step) {
  this.ground.body.x += updateStep
  this.groundTexture.position.x += updateStep
}

Terrain.prototype.generate = function() {
  for (var i = this.startPoint; i < this.startPoint + this.numPoints; i ++) {
    var currentX = this.xScale(i);

    var largeNoise = this.simplex.noise(i / 1000, 0)
    var mediumNoise = this.simplex.noise(i / 100, 0)
    var smallNoise = this.simplex.noise(i / 10, i / 10)
    var miniNoise = this.simplex.noise(i / 1, i / 10)
    var currentY = this.yScale(largeNoise + mediumNoise)
    if (i % this.every == 0) {
      this.collisionShape.push(currentX, this.yScale(largeNoise + mediumNoise));
    };

    this.shape.push(currentX, currentY + this.smallScale(smallNoise) + this.miniScale(miniNoise))
  };
}

Terrain.prototype.minY = function() {
  min = this.shape[1]
  for (var i = this.shape.length - 1; i >= 1; i-=2) {
    if(this.shape[i] < min)
      min = this.shape[i]
  };
  return min;
};
Terrain.prototype.maxY = function() {
  min = this.shape[1]
  for (var i = this.shape.length - 1; i >= 1; i-=2) {
    if(this.shape[i] > min)
      min = this.shape[i]
  };
  return min;
};

Terrain.prototype.toArray = function() {
  var result = [0, this.height];
  result = result.concat(this.shape);
  result.push(this.width, this.height);
  return result
}

Terrain.prototype.toCollisionArray = function(currentPosition) {
  var result = [0, this.height];
  result = result.concat(this.collisionShape);
  result.push(this.width, this.height);
  return result;
}

Terrain.prototype.toPoly = function() {
  return new Phaser.Polygon(this.toArray());
}