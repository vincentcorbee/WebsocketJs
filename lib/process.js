const getLength = require('./get-length')

const process = (websocket, socket, frame) => {
  let bufferLength = getLength(frame)

  const { Opcode, FIN } = frame

  if (Opcode === 0) {
    if (FIN) {
      if (socket.frames.length > 0) {
        socket.frames.push(frame)

        bufferLength = getLength({
          length: socket.frames[0].length,
          payloadLength: socket.frames.reduce(
            (prev, frame) => prev + frame.payloadLength,
            0
          ),
        })

        const opcode = socket.frames[0].Opcode === 1 ? 0x81 : 0x82

        const payload = Buffer.concat(socket.frames.map(frame => frame.payload))
        const buffer = Buffer.concat([Buffer.from([opcode]), bufferLength, payload])

        websocket.emit('message', {
          socket,
          buffer,
          payload,
        })
      }
    }

    else socket.frames.push(frame)

  }

  else if (Opcode === 1) {
    if (FIN) {
      const opcode = 0x81
      const { payload } = frame
      const buffer = Buffer.concat([Buffer.from([opcode]), bufferLength, payload])

      websocket.emit('message', {
        socket,
        buffer,
        payload,
      })
    }

    else socket.frames.push(frame)

  }

  else if (Opcode === 2) {
    if (FIN) {
      const opcode = 0x82
      const { payload } = frame
      const buffer = Buffer.concat([Buffer.from([opcode]), bufferLength, payload])

      websocket.emit('message', {
        socket,
        buffer,
        payload
      })
    }

    else socket.frames.push(frame)
  }

  else if (Opcode === 8) {
    const opcode = 0x88
    const { payload } = frame
    const buffer = Buffer.concat([Buffer.from([opcode]), bufferLength, payload])

    websocket.emit('close', {
      socket,
      buffer,
      payload,
    })
  }

  else if (Opcode === 10) { /* Pong frame */ }

  else { /* Other frame */ }
}

module.exports = process
