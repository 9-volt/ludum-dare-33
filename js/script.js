var game = new Phaser.Game(700, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update })
  , fish
  , background
  , cursors
  , userInputX = 0
  , userInputY = 0
  , fishMinXSpeed = 100
  , fishMaxXSpeed = 200
  , fishAcceleration = 0.004
  , shadowTexture
  , shadowImage
  , currentLifeRadius = 150
  , minLifeRadius = 10
  , maxLifeRadius = 250

function preload(game) {
  game.load.spritesheet('fish-sprite', 'data/fish-sprite.png', 80, 56, 19, 2, 2);
  game.load.image('deep-ocean', 'data/deep-ocean.jpg');
  game.load.image('starfield', 'data/starfield.jpg');
  game.load.image('light', 'data/light.png');
  game.load.physics('fish-data', 'data/fish-sprite.json');
}


function create() {
  game.world.setBounds(0, 0, game.width * 2, game.height);

  game.physics.startSystem(Phaser.Physics.P2JS)
  game.physics.p2.defaultRestitution = 0.8
  game.physics.p2.gravity.y = 300

  background = game.add.tileSprite(0, 0, game.width, game.height, 'starfield')
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

  // Create the shadow texture
  shadowTexture = game.add.bitmapData(game.width, game.height)

  // Create an object that will use the bitmap as a texture
  shadowImage = game.add.image(0, 0, shadowTexture)

  // Set the blend mode to MULTIPLY. This will darken the colors of everything below this sprite.
  shadowImage.blendMode = Phaser.blendModes.MULTIPLY

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
}

var updateStep = 200
  , gameDeltaX = 0
  , lastGameXBound = 0

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

  var newDelay = 150 - (Math.abs(fish.body.velocity.x) + Math.abs(fish.body.velocity.y)) / 5
  newDelay = Math.max(50, newDelay)
  newDelay = Math.min(150, newDelay)
  fish.animations.getAnimation('move').delay = newDelay

  // Update game bounds in steps by updateStep (200) pixels
  if (Math.floor((fish.position.x - updateStep) / updateStep) * updateStep != lastGameXBound) {
    lastGameXBound = Math.floor((fish.position.x - updateStep) / updateStep) * updateStep

    // Update game bounds
    game.world.setBounds(lastGameXBound, 0, game.width*2, game.height);

    // Update background position
    // BEHOLD! this is kind of magic number and works ok with game.width <= 800
    background.tilePosition.x = -gameDeltaX + (game.width / 2 - 400);

    // Update entities positions
    fish.body.x += updateStep
    light.body.x += updateStep

    // Update position keepers
    lastGameXBound += updateStep
    gameDeltaX += updateStep

    // Update shadow texture
    updateShadowTexture(game.camera.x + updateStep)
  } else {
    background.tilePosition.x = -game.camera.view.x + gameDeltaX;

    // Update shadow texture
    updateShadowTexture(game.camera.x)
  }

  // Dim light by 5 units every second
  currentLifeRadius = Math.max(0, currentLifeRadius - 5 * game.time.physicsElapsed)
  if (currentLifeRadius == 0) {
    currentLifeRadius = (maxLifeRadius + minLifeRadius) / 2
  }
}

function updateShadowTexture(offsetX) {
  shadowImage.x = offsetX

  // Draw shadow
  shadowTexture.context.fillStyle = 'rgb(5, 5, 5)'
  shadowTexture.context.fillRect(0, 0, game.width, game.height)

  var lightX = light.body.x - game.camera.x - (offsetX - game.camera.x)
    , lightY = light.body.y

  // Draw circle of light with a soft edge
  var gradient = this.shadowTexture.context.createRadialGradient(
        lightX, lightY, currentLifeRadius * 0.25, lightX, lightY, currentLifeRadius);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

  shadowTexture.context.beginPath();
  shadowTexture.context.fillStyle = gradient;
  shadowTexture.context.arc(lightX, lightY, currentLifeRadius, 0, Math.PI*2);
  shadowTexture.context.fill();

  // This just tells the engine it should update the texture cache
  shadowTexture.dirty = true
}
