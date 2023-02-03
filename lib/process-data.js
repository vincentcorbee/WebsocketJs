const process = require('./process')
const parseFrame = require('./parse-frame')

const processData = (websocket, data, socket) => {
  const frame = parseFrame(data, socket)

  if (
    frame.payloadLength > frame.payload.length ||
    socket.bufferedAmount !== socket.bufferSize
  ) {
    socket.bufferedSize = socket.buffer.length === 0 ? frame.payloadLength : socket.bufferedSize

    const remaining = socket.bufferedSize - socket.bufferedAmount
    const buffer = data.byteLength > remaining ? data.slice(0, remaining) : data

    socket.bufferedAmount += socket.buffer.length === 0 ? frame.payload.byteLength : buffer.byteLength

    socket.buffer.push(buffer)

    if (socket.bufferedSize === socket.bufferedAmount) {
      const frame = parseFrame(Buffer.concat(socket.buffer), socket)

      socket.buffer = []
      socket.bufferedSize = 0
      socket.bufferedAmount = 0

      process(websocket, socket, frame)

      if (buffer.byteLength < data.byteLength) {
        processData(websocket, data.slice(buffer.byteLength), socket)
      }
    }
  } else {
    socket.bufferedAmount = 0
    socket.bufferedSize = 0
    socket.buffer = []

    process(websocket, socket, frame)
  }
}

module.exports = processData
