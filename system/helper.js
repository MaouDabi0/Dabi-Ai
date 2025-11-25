import fs from 'fs'
import path from 'path'

const number = (input) => {
  const digits = input.replace(/\D/g, '')
  return digits.startsWith("0") ? "62" + digits.slice(1) : digits
}

const own = (m) => {
  const sender = (m.key?.participantAlt || m.key?.participant || m.key?.remoteJid).replace(/@s\.whatsapp\.net$/, ''),
        number = Array.isArray(ownerNumber)
          ? ownerNumber.map(n => n.replace(/\D/g, ''))
          : [ownerNumber?.replace(/\D/g, '')]

  return number.includes(sender)
}

export {
  number,
  own
}