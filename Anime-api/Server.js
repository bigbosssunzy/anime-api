const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
};

app.get('/api/anime', async (req, res) => {
    try {
        const { q, ep } = req.query;
        if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

        const epNum = ep || 1;

        const searchUrl = `https://gogoanime3.co/search.html?keyword=${encodeURIComponent(q)}`;
        const { data: searchHtml } = await axios.get(searchUrl, { headers: HEADERS, timeout: 10000 });
        const $ = cheerio.load(searchHtml);

        const firstResult = $('ul.items li').find('a').attr('href');
        if (!firstResult) {
            return res.status(404).json({ error: 'Anime not found' });
        }

        const animeSlug = firstResult.replace('/category/', '');
        const episodePageUrl = `https://gogoanime3.co/${animeSlug}-episode-${epNum}`;

        const { data: epHtml } = await axios.get(episodePageUrl, { headers: HEADERS, timeout: 10000 });
        const $ep = cheerio.load(epHtml);

        const downloadPageLink = $ep('li.downv a').attr('href');

        if (!downloadPageLink) {
            return res.status(404).json({ error: 'Download stream link not found for this episode' });
        }

        return res.json({
            title: animeSlug.replace(/-/g, ' ').toUpperCase(),
            episode: epNum,
            downloadPage: downloadPageLink
        });

    } catch (err) {
        console.error('API Error:', err.message);
        return res.status(500).json({ error: 'Failed to extract video data', details: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Anime Scraper Microservice Active');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
