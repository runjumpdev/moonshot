(function(exports) {
  'use strict';

  var _ = require('./vendor/underscore-min.js'),
      $ = require('./vendor/jquery-2.0.3.min.js'),
      fs = require('fs');

  var gui = window.require('nw.gui');
  var win = gui.Window.get();

  var Moonshot = function Moonshot(){
    _.templateSettings.variable = 'rc';
    var games = {};

    var template = _.template($( 'script.template' ).html());
    fs.readdirSync('./games/')
      .filter(function(file) { return fs.statSync('./games/'+file).isDirectory() === true })
      .forEach(function(gameSlug) {
    if (fs.existsSync('./games/'+gameSlug+'/lexitron.json')) {
     var game = JSON.parse(
       fs.readFileSync('./games/'+gameSlug+'/lexitron.json', 'utf8')
     );
     game.slug = gameSlug;
     if(game.exec[0] !== '/') {
      game.exec = process.cwd() + '/' + game.exec;
     }
     if(game.cwd[0] !== '/') {
      game.exec = process.cwd() + '/' + game.exec;
     }
     games[game.slug] = game;
    }
    });
    var templateData = {
      games: games
    };
    $( '.slides' ).append(
      template( templateData )
    );
    $('.slides script').remove();
    this.games = games;
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

    ,launch: function(input, Reveal, Parallax, callback) {
      var self = this;
      this._cp = require('child_process');
      this._finish = callback;
      this._input = input;
      this._gallery = Reveal;
      Reveal.initialize({
        width: window.innerWidth
        ,height: window.innerHeight
        ,loop: true
        ,keyboard: false
        ,transition: 'cube'
        ,autoSlide: 0
      });
      this._entities = [];
      $.each($('.entity'), function(i, el) {
        var $el = $(el);
        $el.css('left', 0);
        self._entities.push({
          el: el
          ,vx: $el.data('velocity-x') || 0
          ,vy: $el.data('velocity-y') || 0
          ,animate: function() {
            var left = $el.css('left')
              ,top = $el.css('top');
            $el.css('left', parseFloat(left.substr(0, left.length-2))+this.vx+'px');
            $el.css('top', parseFloat(top.substr(0, top.length-2))-this.vy+'px');
            //  console.log('set left to '+left+'-->'+$el.css('left'));
          }
        });
      });
      var scene = window.document.getElementById('scene');
      this._parallax = new Parallax(scene);
      // this is mainly for debugging
      this._parallax.onMouseMove = null;

      var slideCount = $('.slides')[0].childElementCount;
      this._gallery.addEventListener('slidechanged', function(event) {
        self._parallax.ix = event.indexh/slideCount;
        // removing this while we work on just reacting to dx
        // self._parallax.iy = event.indexv;
      });
      this.setupInputs();
      this._setFont();
      this.animate.call(this);
    }
    ,animate: function() {
      window.moonshot._entities.forEach(function(entity) {
        entity.animate();
      });
      window.requestAnimationFrame(window.moonshot.__proto__.animate);
    }
    ,setAttractMode: function(enable) {
      var self = this;
      if(!enable) {
        window.clearTimeout(this._attractTimer);
        this._attractTimer = window.setTimeout(
          function() {self.setAttractMode(true);}
          , 30000);
      }
      // if we want to enable or
      if (enable || this._attractMode) {
        $('[class*="autoslide"]').each(function(i, slide) {
          var delay = enable ? slide.className.match(/autoslide-(\d+)/)[1] : 0;
          slide.setAttribute('data-autoslide', delay);
        });
        this._attractMode = !this._attractMode ? 1 : 0;
        this._gallery.configure({ autoSlide: this._attractMode });
      }
    }
    ,setupInputs: function() {
      var input = this._input;

      input.on('button_down', _.bind(function(button, padnum) {
        this.setAttractMode(false);
        switch(button) {
          case 'button1':
          case 'action':
            var slug = $(this._gallery.getCurrentSlide()).parent().data('slug');
            if(this.game.hasOwnProperty(slug)) {
              this.startGame(slug);
            }
            break;
          case 'left':
            this._gallery.left();
            break;
          case 'right':
            this._gallery.right();
            break;
          case 'up':
            this._gallery.up();
            break;
          case 'down':
            this._gallery.down();
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

    ,startGame: _.throttle(function(gameSlug) {
      var exec = this.games[gameSlug].exec || ""
        , args = this.games[gameSlug].args || ""
        , options = this.games[gameSlug].cwd ? {cwd: this.games[gameSlug].cwd} : {};

      this._input.teardown();
      var gameProc = this._cp.exec(exec+" "+args, options, _.bind(function(error, stdout, stderr) {
        if (error) {
          console.log(error.stack);
          console.log('Error code: '+error.code);
          console.log('Signal received: '+error.signal);
        }
        console.log('Child Process STDOUT: '+stdout);
        console.log('Child Process STDERR: '+stderr);
        this.setupInputs();
      }, this));
     gameProc.on('exit', function (code) {
       console.log('Child process exited with exit code '+code);
     });
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
