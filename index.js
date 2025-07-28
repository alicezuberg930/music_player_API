const express = require('express')
const cors = require('cors')
const ZingMp3 = require('./zingmp3.js')
const app = express()

require('dotenv').config()
const port = process.env.PORT || 3001

app.use(cors('/api/v2', { origin: ["https://music-player-website-olive.vercel.app", "http://localhost:3000"] }))

app.get('/', async (req, res) => {
    res.send("SERVER DEPLOYED")
    await ZingMp3.getHome()
})

app.get('/api/v2/search/multi', async (req, res) => {
    try {
        const results = await ZingMp3.searchMulti(req.query.query)
        console.log(results)
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/search', async (req, res) => {
    try {
        const results = await ZingMp3.searchType(req.query.query, req.query.type, req.query.page, req.query.count)
        console.log(results)
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/info/get', async (req, res) => {
    try {
        const results = await ZingMp3.getInfoSong(req.query.encode_id)
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/page/get/home', async (req, res) => {
    try {
        const results = await ZingMp3.getHome()
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/page/get/top-100', async (req, res) => {
    try {
        const results = await ZingMp3.getTop100()
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/page/get/chart-home', async (req, res) => {
    try {
        const results = await ZingMp3.getChartHome()
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/page/get/playlist', async (req, res) => {
    try {
        const results = await ZingMp3.getDetailsPlaylist(req.query.id)
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/song/get/streaming', async (req, res) => {
    try {
        const results = await ZingMp3.getSongStreaming(req.query.id)
        console.log(results)
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/song/get/info', async (req, res) => {
    try {
        const results = await ZingMp3.getInfoSong(req.query.id)
        console.log(results)
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/lyric/get/lyric', async (req, res) => {
    try {
        const results = await ZingMp3.getLyric(req.query.id)
        console.log(results)
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/page/get/video', async (req, res) => {
    try {
        const results = await ZingMp3.getVideo(req.query.id)
        console.log(results)
        res.json(results)
    } catch (ecalrror) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/page/get/artist', async (req, res) => {
    try {
        const results = await ZingMp3.getArtist(req.query.name)
        console.log(results)
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.get('/api/v2/song/get/list', async (req, res) => {
    try {
        const results = await ZingMp3.getListArtistSong(req.query.id, req.query.page, req.query.count)
        res.json(results)
    } catch (error) {
        res.json(error)
    }
})

app.get('/api/v2/page/get/week-chart', async (req, res) => {
    try {
        const results = await ZingMp3.getWeekChart(req.query.id, req.query.week, req.query.year)
        console.log(results)
        res.json(results)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

app.use((req, res) => {
    res.status(404).send('Not Found')
})

app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`)
})