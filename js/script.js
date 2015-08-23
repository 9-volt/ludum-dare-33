var game = new Phaser.Game(700, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update })
  , fish
  , food
  , background
  , shadowTexture
  , shadowImage
  , currentLifeRadius = 150
  , minLifeRadius = 10
  , maxLifeRadius = 250
  , terrain

function preload(game) {
  game.load.spritesheet('fish-sprite', 'data/fish-sprite.png', 80, 56, 19, 2, 2);
  game.load.spritesheet('squid-sprite', 'data/squid-sprite.png', 118, 58, 10, 2, 2);
  game.load.image('deep-ocean', 'data/deep-ocean.jpg');
  game.load.image('starfield', 'data/starfield.jpg');
  game.load.image('light', 'data/light.png');
  game.load.physics('fish-data', 'data/fish-sprite.json');
}

function create() {
  game.world.setBounds(-game.width * 0.5, 0, game.width * 2.5, game.height);

  game.physics.startSystem(Phaser.Physics.P2JS)
  game.physics.p2.defaultRestitution = 0.8
  game.physics.p2.gravity.y = 300

  background = game.add.tileSprite(0, 0, game.width, game.height, 'starfield')
  background.fixedToCamera = true

  fish = new Fish(game)
  fish.setup() // World follows the fish

  food = new Food(game)

  // Create the shadow texture
  shadowTexture = game.add.bitmapData(game.width, game.height)

  // Create an object that will use the bitmap as a texture
  shadowImage = game.add.image(0, 0, shadowTexture)

  // Set the blend mode to MULTIPLY. This will darken the colors of everything below this sprite.
  shadowImage.blendMode = Phaser.blendModes.MULTIPLY

  terrain = new Terrain(game);
  terrain.setup();

  // Check for spaces
  game.input.keyboard.addCallbacks(game, function(ev) {
    if (ev.keyCode == 32) {
      fish.accelerateY(200)
    }
  })
}

var updateStep = 200
  , gameDeltaX = 0
  , lastGameXBound = 0

function update(game) {
  fish.update()
  food.update()

  // Update game bounds in steps by updateStep (200) pixels
  if (Math.floor((fish.getX() - updateStep) / updateStep) * updateStep != lastGameXBound) {
    lastGameXBound = Math.floor((fish.getX() - updateStep) / updateStep) * updateStep

    // Update game bounds
    game.world.setBounds(lastGameXBound - game.width * 0.5, 0, game.width*2.5, game.height);

    // Update background position
    // BEHOLD! this is kind of magic number and works ok with game.width <= 800
    background.tilePosition.x = -gameDeltaX + (game.width / 2 - 400);

    // Update entities positions
    fish.moveX(updateStep)
    fish.moveLightX(updateStep)
    food.moveX(updateStep)
    terrain.moveX(updateStep)

    // Update position keepers
    lastGameXBound += updateStep
    gameDeltaX += updateStep

    // Update shadow texture
    updateShadowTexture(game.camera.x + updateStep)
  } else {
    background.tilePosition.x = -game.camera.view.x + gameDeltaX;
    // squid.x = game.camera.view.x + 100

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
  return true
  shadowImage.x = offsetX

  // Draw shadow
  shadowTexture.context.fillStyle = 'rgb(5, 5, 5)'
  shadowTexture.context.fillRect(0, 0, game.width, game.height)

  var lightX = fish.getLightX() - game.camera.x - (offsetX - game.camera.x)
    , lightY = fish.getLightY()

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
