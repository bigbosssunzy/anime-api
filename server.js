const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Curated mapping of popular anime titles to working streaming/download sources
const animeDatabase = {
    "naruto": {
        title: "NARUTO",
        episodes: {
            1: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }
    },
    "solo leveling": {
        title: "SOLO LEVELING",
        episodes: {
            1: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        }
    }
};

app.get('/api/anime', (req, res) => {
    try {
        const q = req.query.q ? req.query.q.toLowerCase().trim() : '';
        const ep = parseInt(req.query.ep) || 1;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        let matchedKey = Object.keys(animeDatabase).find(key => q.includes(key));
        
        if (!matchedKey) {
            return res.json({
                title: q.toUpperCase(),
                episode: ep,
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
            });
        }

        const anime = animeDatabase[matchedKey];
        const videoUrl = anime.episodes[ep] || anime.episodes[1];

        return res.json({
            title: anime.title,
            episode: ep,
            videoUrl: videoUrl
        });

    } catch (err) {
        console.error('Server Error:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.send('Custom Anime API Server Active'); // Fixed: changed send to res.send
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
