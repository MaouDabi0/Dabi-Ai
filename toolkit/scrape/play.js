import axios from 'axios';

async function ytsearch(q) {
  return await fetch(`${termaiWeb}/api/search/youtube?query=${encodeURIComponent(q)}&key=${termaiKey}`)
    .then(r => r.json());
}

async function play(query) {
  try {
    if (!query) throw 'Query kosong! Masukkan judul lagu.';

    const yt = await ytsearch(query);
    if (yt?.status && yt.data?.items?.length) {
      const top = yt.data.items[0],
            { data: fb } = await axios.get(`${termaiWeb}/api/downloader/youtube`, {
              params: { url: top.url, key: termaiKey }
            });

      if (fb?.status && fb.data?.dlink) return {
        title: top.title,
        author: top.author?.name || 'YouTube',
        duration: top.duration || 'Unknown',
        url: top.url,
        image: top.thumbnail || null,
        audio: {
          url: fb.data.dlink,
          quality: 'default',
          filename: `${top.title || 'yt-audio'}.mp3`
        }
      };
    }

    const url = `https://api.nekolabs.my.id/downloader/spotify/play/v1?q=${encodeURIComponent(query)}`,
          { data } = await axios.get(url);

    if (!data.status || !data.result) throw 'Gagal mengambil data dari API utama.';

    const { metadata, downloadUrl } = data.result;
    if (!downloadUrl || downloadUrl.includes('undefined') || downloadUrl === 'https://api.fabdl.comundefined')
      throw 'Link unduhan Spotify rusak.';

    return {
      title: metadata.title,
      author: metadata.artist || 'Unknown',
      duration: metadata.duration || 'Unknown',
      url: metadata.url,
      image: metadata.cover,
      audio: {
        url: downloadUrl,
        quality: 'default',
        filename: `${metadata.title}.mp3`
      }
    };

  } catch (err) {
    console.error('Error play():', err);
    throw typeof err === 'string' ? err : 'Terjadi kesalahan saat mengambil data musik.';
  }
}

export default play;