const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { url } = req.body || {};
    const TIKTOK_URL_REGEX = /https?:\/\/(?:www\.|v[mt]\.|vm\.)?tiktok\.com\/[^\s]+/;

    if (!url || !TIKTOK_URL_REGEX.test(url)) {
      return res.status(400).json({ error: 'URL TikTok tidak valid.' });
    }

    const response = await axios.post(
      'https://www.tikwm.com/api/',
      new URLSearchParams({ url, hd: '1' }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 9000
      }
    );

    const data = response.data;
    if (data.code !== 0 || !data.data) {
      return res.status(422).json({ error: 'Gagal mengambil metadata. Video mungkin privat atau link salah.' });
    }

    const payload = data.data;
    const isSlideshow = Array.isArray(payload.images) && payload.images.length > 0;

    return res.status(200).json({
      id: payload.id,
      title: payload.title || 'TikTok Media',
      author: {
        nickname: payload.author?.nickname || 'Creator',
        unique_id: payload.author?.unique_id || 'user',
        avatar: payload.author?.avatar
      },
      type: isSlideshow ? 'slideshow' : 'video',
      video: isSlideshow ? null : (payload.hdplay || payload.play),
      images: isSlideshow ? payload.images : [],
      music: {
        url: payload.music,
        title: payload.music_info?.title || 'Original Sound',
        duration: payload.music_info?.duration || payload.duration || 0
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Kesalahan Server: ' + err.message });
  }
};
