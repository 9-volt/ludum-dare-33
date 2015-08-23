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
}

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
