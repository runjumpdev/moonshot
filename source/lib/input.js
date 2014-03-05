(function(exports) {
  'use strict';

  var events = require('events');
  var sys = require('sys');
  var gui = window.require('nw.gui');
  var win = gui.Window.get();

  var _ = window._,
      $ = window.$;
  var Gamepad = window.Gamepad;

  var Input = function(gamepad){
    events.EventEmitter.call(this);
    this.gamepad = gamepad;
  };

  sys.inherits(Input, events.EventEmitter);

  _.extend(Input.prototype, {
    gamepad: null
    ,_btnDown: null

    ,init: function(gamepad, updateStrategy) {
      // Reinitializing? Teardown first.
      if (this.gamepad) {
        this.teardown();
      }

      this._btnDown = {};
      this.gamepad = gamepad;

      // Start, coin, action keys
      var mapping = {};
      mapping['SPACE']        = 'action';
      mapping['LEFT_BRACKET'] = 'action';
      mapping['PLUS']         = 'coin';
      // DEBUGGING KEYS
      mapping['F']            = 'fullscreen';
      mapping['Q']            = 'quit';
      mapping['I']            = 'inspector';
      mapping['LEFT_ARROW']   = 'left';
      mapping['RIGHT_ARROW']  = 'right';
      mapping['UP_ARROW']     = 'up';
      mapping['DOWN_ARROW']   = 'down';

      _.extend(mapping, {
        DPAD_LEFT:            'left'
        ,DPAD_UP:             'up'
        ,DPAD_RIGHT:          'right'
        ,DPAD_DOWN:           'down'
        ,FACE_1:              'button1'
        ,FACE_2:              'button2'
        ,FACE_3:              'button3'
        ,FACE_4:              'button4'
        ,LEFT_TOP_SHOULDER:   'button5'
        ,RIGHT_TOP_SHOULDER:  'button6'
      });

      // Handle meta element key bindings
      $(window).keydown( _.bind(this.keydown, this) );
      $(window).keyup( _.bind(this.keyup, this) );

      gamepad.bind(Gamepad.Event.CONNECTED, _.bind(function(device) {
        this.emit('gamepad_connected', device);
      }, this));

      gamepad.bind(Gamepad.Event.DISCONNECTED, _.bind(function(device) {
        this.emit('gamepad_disconnected', device);
      }, this));

      gamepad.bind(Gamepad.Event.BUTTON_DOWN, _.bind(function(e) {
        this.pressed( mapping[e.control], e.gamepad.index );
      }, this));

      gamepad.bind(Gamepad.Event.BUTTON_UP, _.bind(function(e) {
        this.released( mapping[e.control], e.gamepad.index );
      }, this));

      // gamepad.bind(Gamepad.Event.AXIS_CHANGED, _.bind(function(e) {
      //   // TODO: Use a state machine for button/axis transitions.
      //   if (e.axis === 'LEFT_STICK_X') {
      //     e.value < 0 ? this.pressed(mapping.AXIS_LEFT, e.gamepad.index)   : this.released(mapping.AXIS_LEFT, e.gamepad.index);
      //     e.value > 0 ? this.pressed(mapping.AXIS_RIGHT, e.gamepad.index)  : this.released(mapping.AXIS_RIGHT, e.gamepad.index);
      //   }

      //   if (e.axis === 'LEFT_STICK_Y') {
      //     e.value < 0 ? this.pressed(mapping.AXIS_UP, e.gamepad.index)   : this.released(mapping.AXIS_UP, e.gamepad.index);
      //     e.value > 0 ? this.pressed(mapping.AXIS_DOWN, e.gamepad.index) : this.released(mapping.AXIS_DOWN, e.gamepad.index);
      //   }
      // }, this));

      this.mapping = mapping;
      this.gamepad = gamepad;

      this.gamepad.init();
    }

    ,keydown: function(e){
      var shift = e.shiftKey ? 'SHIFT_' : '';
      var keyCode = e.keyCode || e.which;
      var key = shift + Input.keys[keyCode];
      var event = this.mapping[key];
      if (event) {
        this.pressed(event, null);
        e.stopPropagation();
        e.preventDefault();
      }
    }

    ,keyup: function(e){
      var shift = e.shiftKey ? 'SHIFT_' : '';
      var keyCode = e.keyCode || e.which;
      var key = shift + Input.keys[keyCode];
      var event = this.mapping[key];
      if (event) {
        this.released(event, null);
        e.stopPropagation();
        e.preventDefault();
      }
    }

    ,pressed: function( name, padnum ) {
      if (this.setButtonState(name, padnum, true)) {
        this.emit('button_down', name, padnum);
      }
    }

    ,released: function( name, padnum ) {
      if (this.setButtonState(name, padnum, false)) {
        this.emit('button_up', name, padnum);
      }
    }

    ,setButtonState: function( name, padnum, state ) {
      var btn = name + '-' + padnum;
      this._btnDown[btn] = this._btnDown[btn] || false;

      // No change? No state was set.
      if (this._btnDown[btn] === state) {
        return false;
      }

      this._btnDown[btn] = state;
      return true;
    }

    // Start a manual update loop. Must be used with
    //   Input.instance.init(new Gamepad.ManualUpdateStrategy()).
    ,tick: function() {
      this.gamepad.updateStrategy.update();
      // Gamepad.js only fires TICK events when gamepads are attached. Fix that.
      if (this._gamepad.gamepads.length === 0) {
        this._gamepad._fire(Gamepad.Event.TICK, this._gamepad.gamepads);
      }
      // Loop
      window.requestAnimationFrame( _.bind(this.tick, this) );
    }

    ,teardown: function() {
      var events = [
        'gamepad_connected'
        ,'gamepad_disconnected'
        ,'button_down'
        ,'button_up',
      ];

      _(events).each(_.bind(function(event){
        this.removeAllListeners(event);
      }, this));
    }
  });

  _.extend(Input, {
    instance: function() {
      if (!Input._instance) {
        Input._instance = new Input();
      }

      return Input._instance;
    }

    // Shamelessly stolen from CraftyJS.
    ,keys: {
       8: 'BACKSPACE',
       9: 'TAB',
       13: 'ENTER',
       19: 'PAUSE',
       20: 'CAPS',
       27: 'ESC',
       32: 'SPACE',
       33: 'PAGE_UP',
       34: 'PAGE_DOWN',
       35: 'END',
       36: 'HOME',
       37: 'LEFT_ARROW',
       38: 'UP_ARROW',
       39: 'RIGHT_ARROW',
       40: 'DOWN_ARROW',
       45: 'INSERT',
       46: 'DELETE',
       48: '0',
       49: '1',
       50: '2',
       51: '3',
       52: '4',
       53: '5',
       54: '6',
       55: '7',
       56: '8',
       57: '9',
       65: 'A',
       66: 'B',
       67: 'C',
       68: 'D',
       69: 'E',
       70: 'F',
       71: 'G',
       72: 'H',
       73: 'I',
       74: 'J',
       75: 'K',
       76: 'L',
       77: 'M',
       78: 'N',
       79: 'O',
       80: 'P',
       81: 'Q',
       82: 'R',
       83: 'S',
       84: 'T',
       85: 'U',
       86: 'V',
       87: 'W',
       88: 'X',
       89: 'Y',
       90: 'Z',
       96: 'NUMPAD_0',
       97: 'NUMPAD_1',
       98: 'NUMPAD_2',
       99: 'NUMPAD_3',
       100: 'NUMPAD_4',
       101: 'NUMPAD_5',
       102: 'NUMPAD_6',
       103: 'NUMPAD_7',
       104: 'NUMPAD_8',
       105: 'NUMPAD_9',
       106: 'MULTIPLY',
       107: 'ADD',
       109: 'SUBSTRACT',
       110: 'DECIMAL',
       111: 'DIVIDE',
       112: 'F1',
       113: 'F2',
       114: 'F3',
       115: 'F4',
       116: 'F5',
       117: 'F6',
       118: 'F7',
       119: 'F8',
       120: 'F9',
       121: 'F10',
       122: 'F11',
       123: 'F12',
       16: 'SHIFT',
       17: 'CTRL',
       18: 'ALT',
       187: 'PLUS',
       188: 'COMMA',
       189: 'MINUS',
       190: 'PERIOD',
       29460: 'PULT_UP',
       29461: 'PULT_DOWN',
       4: 'PULT_LEFT',
       5: 'PULT_RIGHT',
       219: 'LEFT_BRACKET',
       22: 'RIGHT_BRACKET',
    }
  });

  exports.Input = Input;

})(((typeof(module) !== 'undefined') && module.exports) || window);
