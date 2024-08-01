const { default: axios } = require('axios')
const express = require('express')
// const ZingMp3 = require("zingmp3-api")
// const { ZingMp3 } = require("zingmp3-api-full-v3")
const { ZingMp3 } = require("zingmp3-api-full")

const app = express()
const port = 3000
const hostname = "127.0.0.1"

app.get('/', async (req, res) => {
    console.log("deployed")
    res.json({ aaa: "deployed" })
});

app.get('/api/v2/search/multi', async (req, res) => {
    try {
        const results = await ZingMp3.search(req.query.search);
        console.log(results);
        res.json(results);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

app.get('/api/v2/info/get', async (req, res) => {
    try {
        const results = await ZingMp3.getInfoSong(req.query.encode_id);
        res.json(results);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

app.get('/api/v2/page/get/home', async (req, res) => {
    try {
        const results = await ZingMp3.getHome();
        res.json(results);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

app.get('/api/v2/page/get/top-100', async (req, res) => {
    try {
        const results = await ZingMp3.getTop100();
        res.json(results);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

app.get('/api/v2/page/get/chart-home', async (req, res) => {
    try {
        const results = await ZingMp3.getChartHome();
        res.json(results);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

app.get('/api/v2/page/get/playlist', async (req, res) => {
    try {
        const results = await ZingMp3.getDetailPlaylist(req.query.id);
        res.json(results);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

app.get('/api/v2/song/get/streaming', async (req, res) => {
    try {
        const results = await ZingMp3.getSong(req.query.id);
        console.log(results);
        if (results.url != null) {
            const data = axios.get(results.url);
            res.json(data);
            return;
        }
        res.json(results);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

app.get('/api/v2/lyric/get/lyric', async (req, res) => {
    try {
        const results = await ZingMp3.getLyric(req.query.id);
        console.log(results);
        res.json(results);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

app.get('/api/v2/page/get/video', async (req, res) => {
    try {
        const results = await ZingMp3.getVideo(req.query.id);
        console.log(results);
        res.json(results);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

app.use((req, res) => {
    res.status(404).send('Not Found')
})

app.listen(port, () => {
    console.log(`Server running at ${port}/`)
})
