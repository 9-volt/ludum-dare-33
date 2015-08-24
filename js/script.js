var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update })
  , fish
  , food
  , background
  , terrain
  , ceiling
  , light
  , controls
  , collisionGroups

function preload(game) {
  game.load.spritesheet('fish-sprite', 'assets/graphics/fish-sprite.png', 112, 72, 8, 0, 2);
  game.load.spritesheet('submarine-sprite', 'assets/graphics/batiscaf-sprite.png', 108, 58, 4, 0, 2);
  game.load.spritesheet('audio-button', 'assets/graphics/audio-sprite.png', 32, 30, 2)
  game.load.image('background', 'assets/graphics/background.png');
  game.load.image('light', 'assets/graphics/light.png');
  game.load.physics('fish-data', 'assets/graphics/fish-sprite.json');
  game.load.bitmapFont('font', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
  game.load.audio('music-background', 'assets/music/background_music.mp3')
  game.load.audio('music-low-life', 'assets/music/low life.mp3')
  game.load.audio('music-bulik', 'assets/music/bubble.mp3')
  game.load.image('bubble', 'assets/graphics/bubble.png');
  game.load.atlas('submarine-debris', 'assets/graphics/submarine-debris-sprite.png', 'assets/graphics/submarine-debris-sprite.json');
  game.load.audio('music-bite1', 'assets/music/bite1.mp3')
  game.load.audio('music-bite2', 'assets/music/bite2.mp3')
}

function create() {
  game.world.setBounds(-game.width * 0.5, 0, game.width * 2.5, game.height);

  game.physics.startSystem(Phaser.Physics.P2JS)
  game.physics.p2.defaultRestitution = 0.8
  game.physics.p2.gravity.y = 300

  game.physics.p2.setImpactEvents(true);

  collisionGroups = {
    player: game.physics.p2.createCollisionGroup(),
    terrain: game.physics.p2.createCollisionGroup(),
    submarines: game.physics.p2.createCollisionGroup(),
    submarinesDebris: game.physics.p2.createCollisionGroup()
  }
  game.physics.p2.updateBoundsCollisionGroup();

  background = game.add.tileSprite(0, 0, game.width, game.height, 'background')
  background.fixedToCamera = true

  food = new Food(game)

  fish = new Fish(game, food)
  fish.setup() // World follows the fish

  terrain = new Terrain(game);
  ceiling = new Terrain(game, {
    height: 200,
    startY: 1,
    top: true
  })

  light = new Light(game)

  controls = new Controls(game)
  game.controls = controls // You know why
  controls.play('background')

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
  controls.update()

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
    ceiling.moveX(updateStep)

    // Update position keepers
    lastGameXBound += updateStep
    gameDeltaX += updateStep

    // Update shadow texture
    light.bringToTop()
    controls.bringToTop()
    light.setX(game.camera.x + updateStep)
    light.glow(fish.getLightX() - game.camera.x - updateStep, fish.getLightY(), fish.life)
  } else {
    background.tilePosition.x = -game.camera.view.x + gameDeltaX;

    // Update shadow texture
    light.setX(game.camera.x)
    light.glow(fish.getLightX() - game.camera.x, fish.getLightY(), fish.life)
  }

  food.glow(light)
  // light.glow(fish.getLightX() - game.camera.x - (offsetX - game.camera.x), fish.getLightY(), currentLifeRadius)
  light.done()

  var progress = game.controls.progress
    , rate = (Math.log10(Math.max(5, fish.life)) * Math.log10(progress * 1000)) + Math.log2(progress)
  fish.life -= rate * game.time.physicsElapsed
}
