const parseFrame = (data, socket) => {
  const message = data.slice()
  const FIN = Boolean(message[0] & 0x80)
  const RSV1 = Boolean(message[0] & 0x40)
  const RSV2 = Boolean(message[0] & 0x20)
  const RSV3 = Boolean(message[0] & 0x10)
  const Opcode = message[0] & 0x0f
  const mask = message[1] & 0x80
  const length = message[1] & 0x7f

  let nextByte = 2
  let payloadLength = length

  if (length === 126) {
    payloadLength = parseInt(message.slice(nextByte, 4).readUInt16BE(0), 10)
    nextByte += 2
  } else if (length === 127) {
    const Uint64BE = require('int64-buffer').Uint64BE

    payloadLength = new Uint64BE(message.slice(nextByte, 10)).toNumber()
    nextByte += 8
  }

  let maskingKey = null

  if (mask) {
    maskingKey = message.slice(nextByte, nextByte + 4)
    nextByte += 4
  }

  const payload = message.slice(nextByte, nextByte + payloadLength)

  if (
    socket.bufferedAmount === socket.bufferedSize &&
    payloadLength === payload.byteLength &&
    maskingKey
  ) {
    const length = payload.length

    for (let i = 0; i < length; i++) {
      payload[i] = payload[i] ^ maskingKey[i % 4]
    }
  }

  return {
    FIN,
    RSV1,
    RSV2,
    RSV3,
    Opcode,
    mask,
    length,
    payload,
    payloadLength,
  }
}

module.exports = parseFrame
