const EventEmitter = require('events')
const upgrade = require('./upgrade')

class WebSocket extends EventEmitter {
  constructor(server) {
    super()

    this.server = server

    server.on('upgrade', (req, socket) => upgrade(this, req, socket))
  }
}

module.exports = WebSocket
