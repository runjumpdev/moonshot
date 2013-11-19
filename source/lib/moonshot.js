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

    fs.readdirSync('../games/')
      .filter(function(file) { return fs.statSync('../games/'+file).isDirectory() === true })
      .forEach(function(gameSlug) {
    if (fs.existsSync('../games/'+gameSlug+'/lexitron.json')) {
     var game = JSON.parse(
       fs.readFileSync('../games/'+gameSlug+'/lexitron.json', 'utf8')
     );
     game.slug = gameSlug;
     if(game.exec[0] !== '/') {
      game.exec = process.cwd().replace('\\source', '\\games') + '/' + game.exec;
     }
     if(game.cwd[0] !== '/') {
      game.cwd = process.cwd().replace('\\source', '\\games') + '/' + game.cwd;
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
        ,margin: 0.25
        ,loop: true
        ,keyboard: false
        ,transition: 'cube'
        ,autoSlide: 0
      });

      function runDude() {
        $('.dude').removeClass('dudeRun').animate({}, 0, function () {
          $('.dude').addClass('dudeRun');
        });
        setTimeout(runDude, 10000);
      }
      runDude();
      function runHorsie() {
        $('.horsie').removeClass('horsieRun').animate({}, 0, function () {
          $('.horsie').addClass('horsieRun');
        });
        setTimeout(runHorsie, 10000);
      }
      runHorsie();

      this._entities = [];
      $.each($('.entity'), function() {
        self._entities.push({
          $el: $(this)
          ,state: 'running'
          ,entity: $(this).data('entity')
          ,animate: function() {
            var myOffset = this.$el.offset();
            switch(this.entity) {
              case 'dude':
              case 'horsie':
              var self = this;
              $.each($('.obstacle'), function() {
                var $obstacle = $(this)
                  ,obstacleOffset = $obstacle.offset()
                  ,distToObstacle = obstacleOffset.left - myOffset.left - self.$el.width()/2 - $obstacle.width()/2;
                if( distToObstacle < self.$el.width() * 1.5 && distToObstacle > 0
                  && self.state != 'jumping') {
                  self.state = 'jumping';
                  var jumpHeight = $obstacle.height() * 1.5  + self.$el.height() * 0.50;
                  var airTime = ($obstacle.width() + distToObstacle * 1.80)/0.15;
                  self.$el.children('#'+self.entity+'Jump').toggle();
                  self.$el.css('background-size', '0px');
                  self.$el.css('-webkit-transition', 'all '+(airTime/2000)+'s ease-out');
                  self.$el.css('-webkit-transform', 'translate(0, -'+jumpHeight+'px)');
                  setTimeout(function() {
                    self.$el.css('-webkit-transition', 'all '+(airTime/2000)+'s ease-in');
                    self.$el.css('-webkit-transform', 'translate(0, 0)');
                  }, airTime*0.5);
                  setTimeout(function() {
                    self.$el.css('background-size', 'cover');
                    self.$el.children('#'+self.entity+'Jump').toggle();
                  }, airTime*0.75);
                  setTimeout(function() {
                    self.state = 'running';
                  }, airTime)
                }
              });
              break;
            }
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
    ,setAttractMode: function(enable, permanent) {
      var self = this;
      if(!enable) {
        window.clearTimeout(this._attractTimer);
        if(permanent !== true) {
          this._attractTimer = window.setTimeout(
            function() {self.setAttractMode(true);}
            , 30000);
        }
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
          case 'action':
            var slug = $(this._gallery.getCurrentSlide()).parent().data('slug');
            if(this.games.hasOwnProperty(slug)) {
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
      this.setAttractMode(false, true);
      this._gallery.togglePause();
      this._cp.exec(exec+" "+args, options, _.bind(function(error, stdout, stderr) {
        if (error) {
          console.log(error.stack);
          console.log('Error code: '+error.code);
          console.log('Signal received: '+error.signal);
        }
        console.log('Child Process STDOUT: '+stdout);
        console.log('Child Process STDERR: '+stderr);
        this.setupInputs();
        this.setAttractMode(false);
        this._gallery.togglePause();
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
