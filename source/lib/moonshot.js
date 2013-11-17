(function(exports) {
  'use strict';

  var _ = require('./vendor/underscore-min.js'),
      $ = require('./vendor/jquery-2.0.3.min.js'),
      fs = require('fs');

  var gui = window.require('nw.gui');
  var win = gui.Window.get();
  var baseEasings = {};

  $.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
    baseEasings[ name ] = function( p ) {
      return Math.pow( p, i + 2 );
    };
  });

  $.extend( baseEasings, {
    Sine: function ( p ) {
      return 1 - Math.cos( p * Math.PI / 2 );
    },
    Circ: function ( p ) {
      return 1 - Math.sqrt( 1 - p * p );
    },
    Elastic: function( p ) {
      return p === 0 || p === 1 ? p :
        -Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
    },
    Back: function( p ) {
      return p * p * ( 3 * p - 2 );
    },
    Bounce: function ( p ) {
      var pow2,
        bounce = 4;

      while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
      return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
    }
  });

  $.each( baseEasings, function( name, easeIn ) {
    $.easing[ "easeIn" + name ] = easeIn;
    $.easing[ "easeOut" + name ] = function( p ) {
      return 1 - easeIn( 1 - p );
    };
    $.easing[ "easeInOut" + name ] = function( p ) {
      return p < 0.5 ?
        easeIn( p * 2 ) / 2 :
        1 - easeIn( p * -2 + 2 ) / 2;
    };
  });

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
      game.cwd = process.cwd() + '/' + game.cwd;
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
        ,loop: false
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
              var self = this;
              $.each($('.obstacle'), function() {
                var obstacleOffset = $(this).offset()
                  ,distToObstacle = obstacleOffset.left - myOffset.left;
                if( distToObstacle < 200 && distToObstacle > 0
                  && self.state != 'jumping') {
                  self.state = 'jumping';
                  self.$el.animate(
                    { top: '-=260px' }
                    ,{
                      easing: 'easeOutCubic'
                      ,duration: 650
                      ,complete: function() {
                        self.$el.animate(
                          { top: '+=260px'  }
                          ,{
                            easing: 'easeInCubic'
                            ,duration: 650
                            , complete: function() {
                              self.state = 'running';
                            }
                          }
                        );
                      }
                    });
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
          case 'button1':
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
