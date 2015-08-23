var Noise = new SimplexNoise();

var Shape = function(options) {
  this.startX = options.startX;
  this.endX   = options.endX;
  this.startY = options.startY;
  this.endY   = options.endY;
  this.numPoints = options.numPoints || this.endX - this.startX;
  this.collisionDiscretization = options.collisionDiscretization || 20;
  this.simplex = Noise;

  this.xScale = scale(0, this.numPoints, this.startX, this.endX);
  this.yScale = scale(-2, 2, this.startY, this.endY);

  this.smallScale = scale(-1, 1, -5, 5);
  this.miniScale = scale(-1, 1, -2, 2);

  this.shape = [];
  this.collisionShape = [];

  this.generate();
}

Shape.prototype.generate = function() {
  for (var currentX = this.startX; currentX <= this.endX; currentX ++) {

    var largeNoise = this.simplex.noise(currentX / 10000, 0)
    var mediumNoise = this.simplex.noise(currentX / 200, 0)
    var smallNoise = this.simplex.noise(currentX / 10, currentX / 10)
    var miniNoise = this.simplex.noise(currentX / 1, currentX / 10)
    var currentY = this.yScale(largeNoise + mediumNoise)

    if (currentX % this.collisionDiscretization == 0) {
      this.collisionShape.push(currentX, this.yScale(largeNoise + mediumNoise));
    };
    this.shape.push(currentX, currentY + this.smallScale(smallNoise) + this.miniScale(miniNoise))
  };
  return this;
};

Shape.prototype.cap = function() {
  // this caps the shape and the collisionShape, turning it into a convex polygon
  var shape = [this.startX, this.startY];
  shape = shape.concat(this.shape);
  shape.push(this.endX, this.startY);

  var collisionShape = [this.startX, this.startY];
  collisionShape = collisionShape.concat(this.collisionShape);
  collisionShape.push(this.endX, this.startY);

  return { shape: shape, collisionShape: collisionShape };
};

var Terrain = function(game, options) {
  this.game = game;
  if (options == undefined) {
    options = {};
  };

  this.width  = options.width  || 1100;//game.world.bounds.width;
  this.height = options.height || game.world.bounds.height / 2;

  this.startX = options.startX || game.world.bounds.x;
  this.startY = options.startY || game.world.bounds.height;

  this.endX   = this.startX + this.width;
  this.endY   = this.startY - this.height;
  this.endXes = [];

  this.shapes = []
  this.grounds = []

  this.addGround()
  this.addGround()
}

Terrain.prototype.addGround = function() {
  var shape = new Shape({
    startX: this.startX, endX: this.endX,
    startY: this.startY, endY: this.endY
  });
  this.shapes.push(shape);
  this.grounds.push(new Ground(this.game, shape))

  this.endXes.push(this.endX)
  this.startX = this.endX;
  this.endX = this.startX + this.width;
}

var Ground = function(game, shape) {
  this.game = game;
  this.shape = shape;

  this.ground = this.game.add.graphics(0, 0);
  this.groundTexture = this.game.add.graphics(0, 0);
  this.groundTexture.beginFill(0xFF33ff);
  var cap = this.shape.cap();
  var polygon = new Phaser.Polygon(cap.shape);

  this.groundTexture.drawPolygon(polygon.points);
  this.groundTexture.endFill();

  this.game.physics.p2.enable([this.ground], true);
  this.ground.body.addPolygon({}, cap.collisionShape);
  this.ground.body.static = true;
}

Ground.prototype.destroy = function() {
  this.ground.destroy()
  this.groundTexture.destroy()
};

Ground.prototype.moveX = function(step) {
  this.ground.body.x += step
  this.groundTexture.position.x += step
};

Terrain.prototype.moveX = function(step) {
  this.endXes = this.endXes.map(function(val){
    return val + step
  })

  if(this.game.camera.x > this.endXes[0]) {
    this.grounds[0].destroy();
    this.grounds.shift();
    this.endXes.shift();
    this.addGround();
  }

  this.startX += step;
  this.endX += step;

  for (var i = 0; i < this.grounds.length; i++) {
    this.grounds[i].moveX(step);
  };
}
