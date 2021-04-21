const process = require('./process')
const parseFrame = require('./get-length')

const processData = (instance, data, socket) => {
  let frame = parseFrame(data, socket)

  if (
    frame.payloadLength > frame.payload.length ||
    socket.bufferedAmount !== socket.bufferSize
  ) {
    socket.bufferedSize =
      socket.buffer.length === 0 ? frame.payloadLength : socket.bufferedSize

    const toBuffer = socket.bufferedSize - socket.bufferedAmount
    const buf = data.byteLength > toBuffer ? data.slice(0, toBuffer) : data

    socket.bufferedAmount +=
      socket.buffer.length === 0 ? frame.payload.byteLength : buf.byteLength

    socket.buffer.push(buf)

    if (socket.bufferedSize === socket.bufferedAmount) {
      frame = parseFrame(Buffer.concat(socket.buffer), socket)

      socket.buffer = []
      socket.bufferedSize = 0
      socket.bufferedAmount = 0

      process(instance, socket, frame)

      if (buf.byteLength < data.byteLength) {
        processData(instance, data.slice(buf.byteLength), socket)
      }
    }
  } else {
    socket.bufferedAmount = 0
    socket.bufferedSize = 0
    socket.buffer = []

    process(instance, socket, frame)
  }
}

module.exports = processData
