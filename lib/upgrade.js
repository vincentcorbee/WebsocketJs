const processData = require('./process-data')
const crypto = require('crypto')

const upgrade = (websocket, req, socket) => {
  const { method, headers, httpVersion } = req

  const hash = crypto.createHash('sha1')
  const upgrade = headers['upgrade'].toLowerCase()
  const token = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
  const connection = headers['connection'].toLowerCase()
  const key = headers['sec-websocket-key']
  const errRes =
    'HTTP/1.1 400 Bad Request\r\n' +
    'Content-Type: text/plain\r\n' +
    'Connection: close\r\n' +
    '\r\n'

  if (method !== 'GET') {
    errRes += 'Method not allowed'

    socket.write(errRes)
    socket.destroy()
  } else if (parseFloat(httpVersion, 10) < 1.1) {
    errRes += 'httpVersion not allowed'

    socket.write(errRes)
    socket.destroy()
  } else if (upgrade.indexOf('websocket') === -1) {
    errRes += 'Incorrect upgrade header'

    socket.write(errRes)
    socket.destroy()
  } else if (connection.indexOf('upgrade') === -1) {
    errRes += 'Incorrect connection header'

    socket.write(errRes)
    socket.destroy()
  } else {
    socket.on('data', data => processData(websocket, data, socket))
    socket.on('drain', () => console.log('drained'))
    socket.on('close', err => {
      if (!err) websocket.emit('close', { socket: null, buffer: null, payload: null })
    })

    socket.on('end', () => console.log('end'))

    hash.update(key + token)

    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: WebSocket\r\n' +
        'Connection: Upgrade\r\n' +
        'Sec-WebSocket-Accept:' +
        hash.digest('base64') +
        '\r\n' +
        '\r\n'
    )
    socket.name = socket.remoteAddress + ':' + socket.remotePort

    socket.interval = setInterval(() => {
      const payload = Buffer.from('-heartbeat-')

      socket.write(Buffer.concat([Buffer.from([0x89, payload.byteLength]), payload]))
    }, 15000)
    socket.frames = []
    socket.buffer = []
    socket.bufferedAmount = 0
    socket.bufferedSize = 0

    websocket.emit('connection', { socket })
  }
}

module.exports = upgrade
