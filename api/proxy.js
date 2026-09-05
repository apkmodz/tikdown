const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const targetUrl = req.query.url;

  if (!targetUrl) return res.status(400).send('Parameter url diperlukan');

  try {
    const response = await axios({
      url: targetUrl,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.tiktok.com/'
      },
      timeout: 10000
    });

    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    response.data.pipe(res);
  } catch (err) {
    res.status(500).send('Proxy error: ' + err.message);
  }
};
