const getLength = frame => {
  let bufferLength = Buffer.from([frame.length])

  if (frame.length === 126) {
    const buffer = Buffer.alloc(2)

    buffer.writeUInt16BE(frame.payloadLength)

    bufferLength = Buffer.concat([bufferLength, buffer])
  } else if (frame.length === 127) {
    const buffer = Buffer.alloc(8)

    buffer.writeBigInt64BE(frame.payloadLength)

    bufferLength = Buffer.concat([bufferLength, buffer])
  }

  return bufferLength
}

module.exports = getLength
