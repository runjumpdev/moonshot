(function(exports) {
  'use strict';

  var _ = require('./vendor/underscore-min.js'),
      $ = require('./vendor/jquery-2.0.3.min.js');

  var gui = window.require('nw.gui');
  var win = gui.Window.get();

  var RomCheck = function(){};

  RomCheck.prototype = {
    _actionPressedTimer: null

    ,launch: function( input, callback ) {
      this._finish = callback;
      this._input = input;

      this.setupInputs();
    }

    ,setupInputs: function(gamepad) {
      var input = this._input;

      input.on('gamepad_connected', _.bind(function(device) {
        this.pad_on( device, device.index );
      }, this));

      input.on('gamepad_disconnected', _.bind(function(device) {
        this.pad_off( device, device.index );
      }, this));

      input.on('button_down', _.bind(function(button, padnum) {
        var element;

        switch(button) {
          case 'button1':
          case 'action':
            this._actionPressedTimer = setTimeout(_.bind(this.finish, this), 3000);
            break;
          case 'inspector':
            win.showDevTools();
            return;
          case 'fullscreen':
            win.toggleFullscreen();
            return;
          case 'quit':
            gui.App.quit();
            break;
        }

        if (padnum !== null) {
          element = $('#stick' + padnum + ' .' + button);
        } else {
          element = $('#other-inputs .' + button);
        }

        element.addClass('pressed');
      }, this));

      input.on('button_up', _.bind(function(button, padnum) {
        var element;

        if (button === 'action' || button === 'button1') {
          clearTimeout(this._actionPressedTimer);
        }

        if (padnum !== null) {
          element = $('#stick' + padnum + ' .' + button);
        } else {
          element = $('#other-inputs .' + button);
        }

        element.removeClass('pressed');
      }, this));
    }

    ,pad_on: function( gamepad, padnum ) {
      var block = $('#stick' + padnum);
      var elem = block.find('.name');
      if ( elem.text() !== gamepad.id ) {
        elem.text( gamepad.id );
      }
    }
    ,pad_off: function( padnum ) {
      var block = $('#stick' + padnum);
      block.find('.name').text( 'Not connected' );
      block.find('.input').css( 'opacity', 0.5 );
    }

    ,finish: function() {
      this.teardown();
      typeof this._finish === 'function' && this._finish();
    }

    ,teardown: function() {
      this._input.teardown();
    }
  }

  exports.RomCheck = RomCheck;

})(((typeof(module) !== 'undefined') && module.exports) || window);
