import axios from 'axios'

export async function danbooru(query, mode = '18+') {
  try {
    const processedQuery = query.replace(/ /g, '_'),
          ratingFilter = mode === 'safe' ? ['s'] : ['q', 'e'],
          url = `https://danbooru.donmai.us/posts.json?tags=${encodeURIComponent(processedQuery)}+rating:${ratingFilter.join(',')}&limit=100&random=!0`

    console.log('[Danbooru][DEBUG] URL:', url)
    const { data: posts } = await axios.get(url, { timeout: 2e4 })
    console.log('[Danbooru][DEBUG] Total posts:', posts?.length || 0)

    if (!posts || !Array.isArray(posts) || !posts.length)
      throw new Error(`Tidak ada hasil dari Danbooru untuk: ${query}`)

    const allowedExtensions = ['jpg', 'jpeg', 'png'],
          filteredPosts = posts.filter(p =>
            p && p.rating && ratingFilter.includes(p.rating) &&
            p.file_ext && allowedExtensions.includes(p.file_ext)
          )

    console.log('[Danbooru][DEBUG] Filtered posts:', filteredPosts.length)

    if (!filteredPosts.length)
      throw new Error(`Tidak ditemukan gambar (foto) untuk: ${query}\n(Mungkin hasilnya hanya video/gif)`)

    const pick = filteredPosts[Math.floor(Math.random() * filteredPosts.length)]
    console.log('[Danbooru][DEBUG] Picked post ID:', pick?.id)

    if (!pick || !pick.file_url)
      throw new Error('Postingan yang dipilih tidak memiliki URL media yang valid.')

    const fullFileUrl = pick.file_url.startsWith('http')
      ? pick.file_url
      : `https://danbooru.donmai.us${pick.file_url}`

    console.log('[Danbooru][DEBUG] Final media URL:', fullFileUrl)

    return {
      tags: pick.tag_string,
      source: pick.source,
      id: pick.id,
      full_file_url: fullFileUrl
    }
  } catch (err) {
    console.error('[Danbooru][ERROR]', err.message)
    throw new Error(`Scrape Danbooru gagal: ${err.message}`)
  }
}