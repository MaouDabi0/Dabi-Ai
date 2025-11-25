import ff from 'fluent-ffmpeg'
import { PassThrough } from 'stream'

export async function processMedia(inputBuffer, args = [], format = 'ogg') {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough(),
          outputStream = new PassThrough(),
          chunks = [],
          command = ff(inputStream)

    inputStream.end(inputBuffer)

    if (format === 'ogg') {
      command.audioCodec('libopus')
      command.outputOptions([
        '-vn',
        '-b:a 64k',
        '-ac 2',
        '-ar 4.8e4',
        ...args
      ])
    } else {
      command.outputOptions(args).format(format)
    }

    command
      .format(format)
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(outputStream, { end: !0 })

    outputStream.on('data', c => chunks.push(c))
  })
}

export async function generateWaveform(inputBuffer, bars = 6.4e1) {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough(),
          chunks = []

    inputStream.end(inputBuffer)

    ff(inputStream)
      .audioChannels(1)
      .audioFrequency(1.6e4)
      .format('s16le')
      .on('error', reject)
      .on('end', () => {
        const rawData = Buffer.concat(chunks),
              samples = rawData.length / 2,
              amplitudes = []

        for (let i = 0; i < samples; i++) {
          const val = rawData.readInt16LE(i * 2)
          amplitudes.push(Math.abs(val) / 3.2768e4)
        }

        const blockSize = Math.floor(amplitudes.length / bars),
              avg = []

        for (let i = 0; i < bars; i++) {
          const block = amplitudes.slice(i * blockSize, (i + 1) * blockSize)
          avg.push(block.reduce((a, b) => a + b, 0) / block.length)
        }

        const max = Math.max(...avg),
              normalized = avg.map(v => Math.floor((v / max) * 1e2)),
              buf = Buffer.from(new Uint8Array(normalized))

        resolve(buf.toString('base64'))
      })
      .pipe()
      .on('data', c => chunks.push(c))
  })
}

export async function convertToOpus(inputBuffer) {
  return new Promise((resolve, reject) => {
    const inStream = new PassThrough(),
          outStream = new PassThrough(),
          chunks = []

    inStream.end(inputBuffer)

    ff(inStream)
      .noVideo()
      .audioCodec('libopus')
      .format('ogg')
      .audioBitrate('48k')
      .audioChannels(1)
      .audioFrequency(4.8e4)
      .outputOptions([
        '-map_metadata', '-1',
        '-application', 'voip',
        '-compression_level', '10',
        '-page_duration', '2e4'
      ])
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(outStream, { end: !0 })

    outStream.on('data', c => chunks.push(c))
  })
}