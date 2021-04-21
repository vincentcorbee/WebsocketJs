const getLength = frame => {
  let bufLength = Buffer.from([frame.length])
  let b

  if (frame.length === 126) {
    b = Buffer.alloc(2)

    b.writeUInt16BE(frame.payloadLength)

    bufLength = Buffer.concat([bufLength, b])
  } else if (frame.length === 127) {
    const Uint64BE = require('int64-buffer').Uint64BE

    b = new Uint64BE([frame.payloadLength]).toBuffer()

    bufLength = Buffer.concat([bufLength, b])
  }

  return bufLength
}

module.exports = getLength
