import ff from "fluent-ffmpeg"
import { PassThrough } from "stream"

export async function processMedia(inputBuffer, args = [], format = "ogg") {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough()
    inputStream.end(inputBuffer)

    const outputStream = new PassThrough()
    const chunks = []
    const command = ff(inputStream)

    if (format === "ogg") {
      command.audioCodec("libopus")
      command.outputOptions([
        "-vn",
        "-b:a 64k",
        "-ac 2",
        "-ar 48000",
        ...args
      ])
    } else {
      command.outputOptions(args).format(format)
    }

    command
      .format(format)
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks)))
      .pipe(outputStream, { end: true })

    outputStream.on("data", chunk => chunks.push(chunk))
  })
}

export async function generateWaveform(inputBuffer, bars = 64) {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough()
    inputStream.end(inputBuffer)

    const chunks = []

    ff(inputStream)
      .audioChannels(1)
      .audioFrequency(16000)
      .format("s16le")
      .on("error", err => reject(err))
      .on("end", () => {
        const rawData = Buffer.concat(chunks)

        if (rawData.length === 0) {
          return resolve(Buffer.from(new Uint8Array(bars).fill(64)).toString("base64"))
        }

        const samples = rawData.length / 2
        const amplitudes = []
        for (let i = 0; i < samples; i++) {
          amplitudes.push(Math.abs(rawData.readInt16LE(i * 2)) / 32768)
        }

        const blockSize = Math.floor(amplitudes.length / bars)
        if (blockSize === 0) {
          return resolve(Buffer.from(new Uint8Array(bars).fill(64)).toString("base64"))
        }

        const avg = []
        for (let i = 0; i < bars; i++) {
          let block = amplitudes.slice(i * blockSize, (i + 1) * blockSize)
          avg.push(block.reduce((a, b) => a + b, 0) / block.length || 0)
        }

        let max = Math.max(...avg)

        if (max < 0.5) {
          const factor = 0.5 / (max || 0.01)
          for (let i = 0; i < avg.length; i++) avg[i] *= factor
          max = Math.max(...avg)
        }

        let normalized
        if (max === 0) {
          normalized = new Uint8Array(bars).fill(64)
        } else {
          normalized = avg.map(v => Math.min(127, Math.round((v / max) * 127)))
        }

        resolve(Buffer.from(normalized).toString("base64"))
      })
      .pipe()
      .on("data", chunk => chunks.push(chunk))
  })
}

export async function convertToOpus(inputBuffer) {
  return new Promise((resolve, reject) => {
    const inStream = new PassThrough()
    const outStream = new PassThrough()
    const chunks = []

    inStream.end(inputBuffer)

    ff(inStream)
      .noVideo()
      .audioCodec('libopus')
      .format('ogg')
      .audioBitrate('48k')
      .audioChannels(1)
      .audioFrequency(48000)
      .outputOptions([
        '-map_metadata', '-1',
        '-application', 'voip',
        '-compression_level', '10',
        '-page_duration', '20000'
      ])
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(outStream, { end: true })

    outStream.on('data', c => chunks.push(c))
  })
}