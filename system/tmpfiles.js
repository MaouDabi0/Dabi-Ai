import axios from 'axios'
import Form from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

export const tmpFiles = async buffer => {
  try {
    const { ext, mime } = await fileTypeFromBuffer(buffer),
          form = new Form(),
          filename = `${Date.now()}.${ext}`
    form.append('file', buffer, { filename, contentType: mime })

    const { data } = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
      headers: form.getHeaders()
    })

    return data.data.url.replace('s.org/', 's.org/dl/')
  } catch (e) {
    console.error('Error uploading file:', e)
    throw e
  }
}