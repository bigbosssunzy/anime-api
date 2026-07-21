const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/api/anime', async (req, res) => {
    try {
        const { q, ep } = req.query;
        if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

        const epNum = ep || 1;

        // Search anime using Jikan API (MyAnimeList unofficial free database)
        const searchRes = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`, { timeout: 10000 });
        const animeData = searchRes.data.data?.[0];

        if (!animeData) {
            return res.status(404).json({ error: 'Anime not found' });
        }

        const title = animeData.title;
        const malId = animeData.mal_id;
        
        // Construct a safe streaming/info fallback link
        const streamingUrl = animeData.url || `https://myanimelist.net/anime/${malId}`;

        return res.json({
            title: title,
            episode: epNum,
            downloadPage: streamingUrl
        });

    } catch (err) {
        console.error('API Error:', err.message);
        return res.status(500).json({ error: 'Failed to retrieve anime data', details: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Anime API Microservice Active');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
