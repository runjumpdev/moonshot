(function(exports) {
  'use strict';

  var _ = require('./vendor/underscore-min.js'),
      $ = require('./vendor/jquery-2.0.3.min.js'),
      fs = require('fs');

  var gui = window.require('nw.gui');
  var win = gui.Window.get();

  var Moonshot = function(){
    _.templateSettings.variable = 'rc';

    var template = _.template($( 'script.template' ).html())
      , games = [];
      fs.readdirSync('./games/')
        .filter(function(file){ return file.indexOf('.lex') !== -1 })
        .forEach(function(file){
          var game = JSON.parse(
            fs.readFileSync('./games/'+file, 'utf8')
          );
          game.slug = file.replace('.lex', '');
          games.push(game);
        });
    var templateData = {
      games: games
    };
    $( '.slides' ).append(
        template( templateData )
    );
  };

  Moonshot.prototype = {
    _fonts: [
      'bitterregular'
      ,'armataregular'
      ,'averia_serif_libreregular'
      ,'ralewayregular'
      ,'share_tech_monoregular'
      ,'vigaregular'
    ]
    ,_fontIndex: 0

    ,launch: function(input, Reveal, callback) {
      this._cp = require('child_process');
      this._finish = callback;
      this._input = input;
      this._gallery = Reveal;
      Reveal.initialize({
        width: window.innerWidth
        ,height: window.innerHeight
        ,loop: true
        ,keyboard: false
        ,autoslide: 1000
      });

      this.setupInputs();
      this._setFont();
    }

    ,setupInputs: function() {
      var input = this._input;

      input.on('button_down', _.bind(function(button, padnum) {
        switch(button) {
          case 'button1':
          case 'action':
            this.startGame(this._gallery.getIndices().h - 1);
            break;
          case 'left':
            this._gallery.prev();
            break;
          case 'right':
            this._gallery.next();
            break;
          case 'button5':
            this._nextFont();
            break;
          case 'button6':
            this._prevFont();
            break;
          case 'inspector':
            win.showDevTools();
            break;
          case 'fullscreen':
            win.toggleFullscreen();
            break;
          case 'quit':
            gui.App.quit();
            break;
        }
      }, this));
    }

    ,startGame: _.throttle(function(idx) {
      var gameObj = $('#moonshot .game')[idx];
      var gameSlug = $(gameObj).data('name');

      this._input.teardown();
      this._cp.exec('bash games/' + gameSlug, _.bind(function(error, stdout, stderr) {
        if (error) {
          console.log(error.stack);
          console.log('Error code: '+error.code);
          console.log('Signal received: '+error.signal);
        }
        console.log('Child Process STDOUT: '+stdout);
        console.log('Child Process STDERR: '+stderr);
        this.setupInputs();
      }, this));
    }, 5000, {trailing: false})

    ,_nextFont: function() {
      // TODO: not working.
      this._fontIndex--;
      this._setFont();
    }

    ,_prevFont: function() {
      this._fontIndex++;
      if (this._fontIndex > this._fonts.length - 1) {
        this._fontIndex = this._fonts.length - 1;
      }
      this._setFont();
    }

    ,_setFont: function() {
      this._fontIndex = this._clamp(this._fontIndex, 0, this._fonts.length - 1);
      $('#moonshot').css('font-family', this._fonts[this._fontIndex]);
    }

    ,_clamp: function(num, min, max) {
      return Math.min(Math.max(min, num), max);
    }
  };

  exports.Moonshot = Moonshot;

})(((typeof(module) !== 'undefined') && module.exports) || window);
