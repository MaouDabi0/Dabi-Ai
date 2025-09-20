import axios from 'axios';

async function play(query) {
  try {
    if (!query) throw 'Query kosong! Masukkan judul lagu atau nama video YouTube.';

    const url = `https://api.vreden.my.id/api/v1/download/play/audio?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url);

    if (!data.status || data.status_code !== 200 || !data.result?.status) {
      throw 'Gagal mengambil data dari API.';
    }

    const { metadata, download } = data.result;

    return {
      title: metadata.title,
      author: metadata.author?.name || 'Unknown',
      duration: metadata.duration?.timestamp || metadata.timestamp,
      url: metadata.url,
      image: metadata.thumbnail || metadata.image,
      audio: {
        url: download.url,
        quality: download.quality,
        filename: download.filename
      }
    };
  } catch (err) {
    throw typeof err === 'string' ? err : 'Terjadi kesalahan saat mengambil data musik.';
  }
}

export default play;