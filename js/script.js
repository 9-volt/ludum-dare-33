var game = new Phaser.Game(700, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update })
  , fish
  , background
  , cursors
  , userInputX = 0
  , userInputY = 0
  , fishMinXSpeed = 100
  , fishMaxXSpeed = 200
  , fishAcceleration = 0.004

function preload(game) {
  game.load.spritesheet('fish-sprite', 'data/fish-sprite.png', 80, 56, 19, 2, 2);
  game.load.image('deep-ocean', 'data/deep-ocean.jpg');
  game.load.image('starfield', 'data/starfield.jpg');
  game.load.image('light', 'data/light.png');
  game.load.physics('fish-data', 'data/fish-sprite.json');
}


function create() {
  game.world.setBounds(0, 0, 20000, 600);

  game.physics.startSystem(Phaser.Physics.P2JS)
  game.physics.p2.defaultRestitution = 0.8
  game.physics.p2.gravity.y = 300

  background = game.add.tileSprite(0, 0, game.width, game.height, 'starfield')
  // background.scale = new PIXI.Point(0.5, 0.5)
  background.fixedToCamera = true

  fish = game.add.sprite(200, 200, 'fish-sprite')
  light = game.add.sprite(200, 200, 'light')
  game.physics.p2.enable([fish, light], false);
  game.camera.follow(fish);

  fish.smoothed = false
  fish.animations.add('move', [0,1,2,3,4,5,6,7, 8, 9, 10, 11], 10, true)
  // fish.animations.add('move', [12, 13, 14, 15, 16, 17], 10, true)
  fish.play('move')

  fish.body.gravityScale = 1
  fish.body.clearShapes()
  fish.body.loadPolygon('fish-data', 'one-fish')
  fish.body.mass = 1000

  light.body.gravityScale = 0
  light.body.mass = 1

  var constraint = game.physics.p2.createDistanceConstraint(fish, light, 0, [36, -7], [0, 0])

  game.input.keyboard.addCallbacks(game, function(ev) {
    if (ev.keyCode == 38) {
      userInputY = 1
    } else if (ev.keyCode == 40) {
      userInputY = -1
    }

    if (ev.keyCode == 39) {
      userInputX = 1
    } else if (ev.keyCode == 37) {
      userInputX = -1
    }

    if (ev.keyCode == 32) {
      fish.body.velocity.y -= 200
    }
    // console.log(ev.keyCode)
  }, function(ev){
    if (ev.keyCode == 38 || ev.keyCode == 40) {
      userInputY = 0
    }

    if (ev.keyCode == 37 || ev.keyCode == 39) {
      userInputX = 0
    }
  })

  // console.log(arguments)
  // var sprite = game.add.sprite(40, 100, 'fish-sprite')
  // sprite.animations.add('walk')
  // sprite.animations.play('walk', 10, true)
}

function update(game) {
  // SPEED X
  // =======
  fish.body.velocity.x += fish.body.velocity.y * fishAcceleration * Math.max(1, 60 * game.time.physicsElapsed)
  // Min velocity
  fish.body.velocity.x = Math.max(fishMinXSpeed, fish.body.velocity.x)
  // Max velocity
  fish.body.velocity.x = Math.min(fishMaxXSpeed, fish.body.velocity.x)

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

  // console.log(150 - (Math.abs(fish.body.velocity.x) + Math.abs(fish.body.velocity.y)) / 5)
  var newDelay = 150 - (Math.abs(fish.body.velocity.x) + Math.abs(fish.body.velocity.y)) / 5
  newDelay = Math.max(50, newDelay)
  newDelay = Math.min(150, newDelay)
  fish.animations.getAnimation('move').delay = newDelay

  // console.log(fish.body.rotation)
  // fish.body.rotation = -0.5

  // if (userInputX == 1) {
  //   if (fish.body.velocity.x < fishMaxXSpeed * 0.29) {
  //     fish.body.velocity.x = fishMaxXSpeed * 0.3
  //   } else {
  //     fish.body.velocity.x = Math.min(fishMaxXSpeed, fish.body.velocity.x * (1 + game.time.physicsElapsed))
  //   }
  // } else {
  //   if (fish.body.velocity.x > fishMinXSpeed) {
  //     fish.body.velocity.x *= Math.pow(0.97, Math.max(1, 60 * game.time.physicsElapsed))
  //   } else {
  //     fish.body.velocity.x = fishMinXSpeed
  //   }
  // }

  // if (userInputY == 1) {
  //   fish.body.moveUp(200)
  // } else if (userInputY == -1) {
  //   fish.body.moveDown(200)
  // } else {
  //   // fish.body.setZeroVelocity();
  //   fish.body.moveUp(0)
  // }

  // console.log(fish.body.velocity.x, fish.body.velocity.y, game.time.physicsElapsed)

  if (!game.camera.atLimit.x) {
    background.tilePosition.x -= ((fish.body.velocity.x) * game.time.physicsElapsed);
  }

  if (!game.camera.atLimit.y) {
    background.tilePosition.y -= ((fish.body.velocity.y) * game.time.physicsElapsed);
  }
}
