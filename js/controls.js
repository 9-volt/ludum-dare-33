function Controls(game) {
  this.game = game
  this.progress = 0
  this.audio = true

  this.tracks = {
    background: null
  , lowLife: null
  , bulik: null
  }

  this.setup()
}

Controls.prototype.setup = function() {
  this._text = this.game.add.bitmapText(this.game.camera.x + this.game.camera.width - 210, 20, 'font','00000', 34);
  this._text.fixedToCamera = true

  this._button = game.add.button(this.game.camera.x + 20, 20, 'audio-button', this.onButtonClick, this);
  this._button.fixedToCamera = true

  this.tracks.background = game.add.audio('music-background')
  this.tracks.background.loop = true

  this.tracks.lowLife = this.game.add.audio('music-low-life')
  this.tracks.lowLife.loop = true

  this.tracks.bulik = this.game.add.audio('music-bulik')
  this.tracks.bulik.loop = false

  this.tracks.bite1 = this.game.add.audio('music-bite1')
  this.tracks.bite1.loop = false

  this.tracks.bite2 = this.game.add.audio('music-bite2')
  this.tracks.bite2.loop = false
}

Controls.prototype.lose = function() {
  this.game.paused = true;
  var that = this

  setTimeout(function() {
    that.checkScore()

    var text1 = 'High Score: ' + that.getHighScore()
      , text2 = 'Eat submarines'
      , text3 = 'Avoid terrain'
      , text4 = 'Keep light on'
      , text5 = 'Press Space'

    this.game.add.bitmapText(this.game.camera.x + 100, 150, 'font', text1, 34);
    this.game.add.bitmapText(this.game.camera.x + 200, 250, 'font', text2, 24);
    this.game.add.bitmapText(this.game.camera.x + 200, 300, 'font', text3, 24);
    this.game.add.bitmapText(this.game.camera.x + 200, 350, 'font', text4, 24);
    this.game.add.bitmapText(this.game.camera.x + 160, 500, 'font', text5, 34);

    this.game.input.onDown.add(function() { that.restart() })
  }, 100);
};

Controls.prototype.getHighScore = function() {
  return parseFloat(Cookies.get('anglerFish9voltHighScore')) || 0
};

Controls.prototype.setHighScore = function(score) {
  Cookies.set('anglerFish9voltHighScore', Math.floor(score) || 0)
}

Controls.prototype.checkScore = function() {
  if (this.progress > this.getHighScore()) {
    this.setHighScore(this.progress)
  }
}

Controls.prototype.restart = function() {
  window.location.reload();
};

Controls.prototype.update = function() {
  this.progress += this.game.time.physicsElapsed
  this._text.text = pad(Math.floor(this.progress), 5) // Progresse in physics seconds
}

Controls.prototype.onButtonClick = function() {
  this._button.frame = 1 - this._button.frame
  this.audio = !this._button.frame

  if (this.audio) {
    this.enableTracks()
  } else {
    this.disableTracks()
  }
}

Controls.prototype.play = function(type) {
  var track = this.tracks[type]

  if (!track.isPlaying && this.audio) {
    track.play()
  }
}

Controls.prototype.stop = function(type) {
  var track = this.tracks[type]

  if (track.isPlaying) {
    track.stop()
  }
}

Controls.prototype.enableTracks = function() {
  for (var key in this.tracks) {
    if (this.tracks[key].shouldBePlaying) {
      this.tracks[key].shouldBePlaying = false
      this.tracks[key].play()
    }
  }
}

Controls.prototype.disableTracks = function() {
  for (var key in this.tracks) {
    if (this.tracks[key].isPlaying) {
      this.tracks[key].shouldBePlaying = true
      this.tracks[key].stop()
    }
  }
}

Controls.prototype.bringToTop = function() {
  this._text.parent.bringToTop(this._text) // don't ask why
  this._button.bringToTop()
}
