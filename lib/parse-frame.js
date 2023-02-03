const parseFrame = (data, socket) => {
  const FIN = Boolean(data[0] & 0x80)
  const RSV1 = Boolean(data[0] & 0x40)
  const RSV2 = Boolean(data[0] & 0x20)
  const RSV3 = Boolean(data[0] & 0x10)
  const Opcode = data[0] & 0x0f
  const mask = data[1] & 0x80
  const length = data[1] & 0x7f

  let nextByte = 2

  if (length === 126) {
    payloadLength = data.readUInt16BE(nextByte)

    nextByte += 2
  }

  else if (length === 127) {
    payloadLengthHi = data.readUInt32BE(nextByte)
    payloadLengthLow = data.readUInt32BE(nextByte + 4)

    payloadLength = payloadLengthHi * 0xffffffff + payloadLengthLow

    /*
      Can't be represented as a normal number
    */
    if (payloadLength > Number.MAX_SAFE_INTEGER) {
      // payloadLength = data.readBigInt64BE(nextByte + 8)
    }

    nextByte += 8
  }

  else payloadLength = length

  let maskingKey

  if (mask) maskingKey = data.slice(nextByte, nextByte += 4)

  const payload = data.slice(nextByte, nextByte + payloadLength)

  if (
    socket.bufferedAmount === socket.bufferedSize &&
    payloadLength === payload.byteLength &&
    mask
  ) {
    for (let i = 0; i < payloadLength; i++) {
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
