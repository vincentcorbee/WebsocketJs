const getLength = require('./get-length')

const process = (instance, socket, frame) => {
  let bufLength = getLength(frame)
  const { Opcode, FIN } = frame

  if (Opcode === 0) {
    if (FIN) {
      if (socket.frames.length > 0) {
        socket.frames.push(frame)

        bufLength = getLength({
          length: socket.frames[0].length,
          payloadLength: socket.frames.reduce(
            (prev, frame) => prev + frame.payloadLength,
            0
          ),
        })

        const opcode = socket.frames[0].Opcode === 1 ? 0x81 : 0x82
        const payload = Buffer.concat(socket.frames.map(frame => frame.payload))
        const buffer = Buffer.concat([Buffer.from([opcode]), bufLength, payload])

        instance.emit('message', {
          socket,
          buffer,
          payload,
        })
      }
    } else {
      socket.frames.push(frame)
    }
  } else if (Opcode === 1) {
    if (FIN) {
      const opcode = 0x81
      const buffer = Buffer.concat([Buffer.from([opcode]), bufLength, frame.payload])

      instance.emit('message', {
        socket,
        buffer,
        payload: frame.payload,
      })
    } else {
      socket.frames.push(frame)
    }
  } else if (Opcode === 2) {
    if (FIN) {
      const opcode = 0x82
      const buffer = Buffer.concat([Buffer.from([opcode]), bufLength, frame.payload])

      instance.emit('message', {
        socket,
        buffer,
        payload: frame.payload,
      })
    } else {
      socket.frames.push(frame)
    }
  } else if (Opcode === 8) {
    const buffer = Buffer.concat([Buffer.from([0x88]), bufLength, frame.payload])

    instance.emit('close', {
      socket,
      buffer,
      payload: frame.payload,
    })
  } else if (Opcode === 10) {
    // Pong frame
  } else {
    // Other frame
  }
}

module.exports = process
