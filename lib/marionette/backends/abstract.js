(function(exports) {
  if (typeof(exports.Marionette) === 'undefined') {
    exports.Marionette = {};
  }

  if (typeof(exports.Marionette.Backends) === 'undefined') {
    exports.Marionette.Backends = {};
  }

  function Abstract(options) {
    this._sendQueue = [];
    this._responseQueue = [];
  }

  Abstract.prototype = {

    /**
     * Timeout for commands
     *
     * @type Numeric
     */
    timeout: 10000,

    /**
     * Waiting for a command to finish?
     *
     * @type Boolean
     */
    _waiting: false,

    /**
     * Is system ready for commands?
     *
     * @type Boolean
     */
    ready: false,

    /**
     * Connection id for the server.
     *
     * @type Numeric
     */
    connectionId: null,

    /**
     * Sends remote command to server.
     * Each command will be queued while waiting for
     * any pending commands. This ensures order of
     * response is correct.
     *
     *
     * @param {Object} command remote command to send to marionette.
     * @param {Function} callback executed when response comes back.
     */
    send: function(cmd, callback) {
      if (!this.ready) {
        throw new Error('connection is not ready');
      }

      if (typeof(callback) === 'undefined') {
        throw new Error('callback is required');
      }

      this._responseQueue.push(callback);
      this._sendQueue.push(cmd);

      this._nextCommand();
    },

    /**
     * Connects to a remote server.
     * Requires a _connect function to be defined.
     * Example:
     *
     *    MyClass.prototype._connect = function(){
     *      //open a socket to marrionete accept response
     *      //you *must* call _onDeviceResponse with the first
     *      //response from marionette it looks like this:
     *      //{ from: 'root', applicationType: 'gecko', traits: [] }
     *      this.connectionId = result.id;
     *    }
     *
     * @param {Function} callback \
     *  executes after successfully connecting to the server.
     */
    connect: function(callback) {
      this.ready = true;
      this._responseQueue.push(function(data) {
        this.applicationType = data.applicationType;
        this.traits = data.traits;
        callback();
      }.bind(this));
      this._connect();
    },

    /**
     * Checks queue if not waiting for a response
     * Sends command to websocket server
     *
     * @private
     */
    _nextCommand: function() {
      if (!this._waiting && this._sendQueue.length) {
        this._waiting = true;
        this._sendCommand(this._sendQueue.shift());
      }
    },

    /**
     * Handles responses from devices.
     * Will only respond to the event if the connectionId
     * is equal to the event id and the client is ready.
     *
     * @param {Object} data response from server.
     * @private
     */
    _onDeviceResponse: function(data) {
      var cb;
      if (this.ready && data.id === this.connectionId) {
        cb = this._responseQueue.shift();
        cb(data.response);

        this._waiting = false;
        this._nextCommand();
      }
    }

  };

  exports.Marionette.Backends.Abstract = Abstract;

}(
  (typeof(window) === 'undefined') ? module.exports : window
));