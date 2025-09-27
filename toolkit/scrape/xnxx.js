import axios from 'axios';

const api = 'https://api.vreden.my.id/api/v1';

async function fetchXnxx(url) {
  try {
    const { data } = await axios.get(`${api}/download/xnxx?url=${encodeURIComponent(url)}`);
    if (data.status && data.result?.download) return data.result;
    throw new Error(data.message || 'Struktur data tidak sesuai');
  } catch (e) {
    if (e.response) throw new Error(`Server API Error: ${e.response.status} - ${e.response.statusText}`);
    if (e.request) throw new Error('Tidak ada respons dari server API');
    throw new Error(e.message);
  }
}

async function searchXnxx(query, limit = 2) {
  try {
    const { data } = await axios.get(`${api}/search/xnxx?query=${encodeURIComponent(query)}`);
    if (data.status && data.result?.search_data?.length > 0) {
      return data.result.search_data.slice(0, limit);
    }
    throw new Error(data.message || 'Tidak ada hasil ditemukan');
  } catch (e) {
    if (e.response) throw new Error(`Server API Error: ${e.response.status} - ${e.response.statusText}`);
    if (e.request) throw new Error('Tidak ada respons dari server API');
    throw new Error(e.message);
  }
}

export { fetchXnxx, searchXnxx };