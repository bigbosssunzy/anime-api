const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/api/anime', async (req, res) => {
    try {
        const q = req.query.q;
        const ep = req.query.ep || 1;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        // Safe public fallback search using Jikan API
        let animeTitle = q;
        let infoUrl = `https://myanimelist.net/anime.php?q=${encodeURIComponent(q)}`;

        try {
            const searchRes = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`, { timeout: 7000 });
            if (searchRes.data && searchRes.data.data && searchRes.data.data.length > 0) {
                animeTitle = searchRes.data.data[0].title;
                infoUrl = searchRes.data.data[0].url || infoUrl;
            }
        } catch (apiErr) {
            console.log('Jikan API warning, using fallback query data:', apiErr.message);
        }

        return res.json({
            title: animeTitle.toUpperCase(),
            episode: ep,
            downloadPage: infoUrl
        });

    } catch (err) {
        console.error('Server Catch Error:', err.message);
        return res.status(200).json({
            title: req.query.q ? req.query.q.toUpperCase() : 'ANIME',
            episode: req.query.ep || 1,
            downloadPage: 'https://myanimelist.net/'
        });
    }
});

app.get('/', (req, res) => {
    res.send('Anime API Microservice Active');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
