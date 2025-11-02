export default {
  name: 'Top Uang',
  command: ['topuang', 'topsaldo', 'topmoney'],
  tags: 'Info Menu',
  desc: 'Menampilkan 10 besar pemegang uang terbanyak',
  prefix: !0,
  owner: !1,
  premium: !1,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo,
          db = getDB(),
          users = Object.entries(db.Private || {})
            .map(([name, data]) => ({ name, uang: data?.money?.amount || 0 }))
            .sort((a, b) => b.uang - a.uang)
            .slice(0, 1e1)

    return !users.length
      ? conn.sendMessage(chatId, { text: 'Belum ada data uang di database.' }, { quoted: msg })
      : (() => {
          const teks = users.map((u, i) => `${i + 1e0}. ${u.name} - Rp ${u.uang.toLocaleString('id-ID')}`).join('\n'),
                text = `Top 10 Pemegang Uang Terbanyak\n\n${teks}`
          conn.sendMessage(chatId, { text }, { quoted: msg })
        })()
  }
}