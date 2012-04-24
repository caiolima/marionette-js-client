var EventEmitter = require('events').EventEmitter;

FakeSocket = function(){
  EventEmitter.call(this);
  FakeSocket.sockets.push(this);

  this.destroyed = false;
};

FakeSocket.sockets = [];

FakeSocket.prototype = Object.create(EventEmitter.prototype);
FakeSocket.prototype.connect = function(port){
  this.port = port;
};

FakeSocket.prototype.destroy = function(){
  this.destroyed = true;
}

module.exports = exports = FakeSocket;