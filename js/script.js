var game = new Phaser.Game(700, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update })
  , fish
  , food
  , background
  , terrain
  , light

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

  light = new Light(game)

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
    light.setX(game.camera.x + updateStep)
    light.glow(fish.getLightX() - game.camera.x - updateStep, fish.getLightY(), fish.life)
  } else {
    background.tilePosition.x = -game.camera.view.x + gameDeltaX;

    // Update shadow texture
    light.setX(game.camera.x)
    light.glow(fish.getLightX() - game.camera.x, fish.getLightY(), fish.life)
  }

  // light.glow(fish.getLightX() - game.camera.x - (offsetX - game.camera.x), fish.getLightY(), currentLifeRadius)
  light.done()

  // Dim light by 5 units every second
  fish.life -= 5 * game.time.physicsElapsed
}
