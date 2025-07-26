const axios = require("axios")
const crypto = require("crypto")
const { HttpProxyAgent } = require("http-proxy-agent")
const { HttpsProxyAgent } = require("https-proxy-agent")

class ZingMp3Api {
    constructor(VERSION, URL, SECRET_KEY, API_KEY, CTIME) {
        this.VERSION = VERSION
        this.URL = URL
        this.SECRET_KEY = SECRET_KEY
        this.API_KEY = API_KEY
        this.CTIME = CTIME
    }

    getHash256(str) {
        return crypto.createHash("sha256").update(str).digest("hex")
    }

    getHmac512(str, key) {
        let hmac = crypto.createHmac("sha512", key)
        return hmac.update(Buffer.from(str, "utf8")).digest("hex")
    }

    hashParamNoId(path) {
        return this.getHmac512(
            path + this.getHash256(`ctime=${this.CTIME}version=${this.VERSION}`),
            this.SECRET_KEY
        )
    }

    hashParam(path, id) {
        return this.getHmac512(
            path + this.getHash256(`ctime=${this.CTIME}id=${id}version=${this.VERSION}`),
            this.SECRET_KEY
        )
    }

    hashParamHome(path) {
        return this.getHmac512(
            path + this.getHash256(`count=30ctime=${this.CTIME}page=1version=${this.VERSION}`),
            this.SECRET_KEY
        )
    }

    hashCategoryMV(path, id, type) {
        return this.getHmac512(
            path + this.getHash256(`ctime=${this.CTIME}id=${id}type=${type}version=${this.VERSION}`),
            this.SECRET_KEY
        )
    }

    hashListMV(path, id, type, page, count) {
        return this.getHmac512(
            path +
            this.getHash256(`count=${count}ctime=${this.CTIME}id=${id}page=${page}type=${type}version=${this.VERSION}`),
            this.SECRET_KEY
        )
    }

    hashWeekChart(path, id, week, year) {
        return this.getHmac512(
            path + this.getHash256(`ctime=${this.CTIME}id=${id}version=${this.VERSION}`),
            this.SECRET_KEY
        )
    }

    getCookie = async () => {
        try {
            let cookie = await axios.get(this.URL)
            if (cookie.headers["set-cookie"]) {
                return cookie.headers["set-cookie"][1]
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    requestZingMp3 = async (path, qs) => {
        try {
            const client = axios.create({ baseURL: `${this.URL}` })
            client.interceptors.response.use((res) => res.data)
            let cookie = await this.getCookie()
            const proxyAgent = new HttpProxyAgent("http://14.241.80.37:8080");

            let response = await client.get(path, {
                headers: {
                    Cookie: `${cookie}`,
                },
                params: {
                    ...qs,
                    ctime: this.CTIME,
                    version: this.VERSION,
                    apiKey: this.API_KEY,
                },
                httpAgent: proxyAgent,
            })
            console.log(response.request)
            return response
        } catch (error) {
            console.log(error)
            return error
        }
    }

    getWeekChart = async (chartId, weekCount, yearCount) => {
        try {
            let weekChart = await this.requestZingMp3("/api/v2/page/get/week-chart", {
                id: chartId,
                week: weekCount,
                year: yearCount,
                sig: this.hashParam("/api/v2/page/get/week-chart", chartId)
            })
            return weekChart
        } catch (error) {
            return error
        }
    }

    getSongStreaming = async (songId) => {
        try {
            let song = await this.requestZingMp3("/api/v2/song/get/streaming", {
                id: songId,
                sig: this.hashParam("/api/v2/song/get/streaming", songId)
            })
            return song
        } catch (error) {
            return error
        }
    }

    getDetailsPlaylist = async (playlistId) => {
        try {
            let playlist = await this.requestZingMp3("/api/v2/page/get/playlist", {
                id: playlistId,
                sig: this.hashParam("/api/v2/page/get/playlist", playlistId)
            })
            return playlist
        } catch (error) {
            return error
        }
    }

    getHome = async () => {
        try {
            let home = await this.requestZingMp3("/api/v2/page/get/home", {
                page: 1,
                segmentId: "-1",
                count: "30",
                sig: this.hashParamHome("/api/v2/page/get/home")
            })
            return home
        } catch (error) {
            return error
        }
    }

    getTop100 = async () => {
        try {
            const top100 = await this.requestZingMp3("/api/v2/page/get/top-100", {
                sig: this.hashParamNoId("/api/v2/page/get/top-100")
            })
            return top100
        } catch (error) {
            return error
        }
    }

    getChartHome = async () => {
        try {
            let chartHome = await this.requestZingMp3("/api/v2/page/get/chart-home", {
                sig: this.hashParamNoId("/api/v2/page/get/chart-home")
            })
            return chartHome
        } catch (error) {
            return error
        }
    }

    getNewReleaseChart = async () => {
        try {
            const newReleaseChart = await this.requestZingMp3("/api/v2/page/get/newrelease-chart", {
                sig: this.hashParamNoId("/api/v2/page/get/newrelease-chart")
            })
            return newReleaseChart
        } catch (error) {
            return error
        }
    }

    getInfoSong = async (songId) => {
        try {
            let songInfo = await this.requestZingMp3("/api/v2/song/get/info", {
                id: songId,
                sig: this.hashParam("/api/v2/song/get/info", songId)
            })
            return songInfo
        } catch (error) {
            return error
        }
    }

    getListArtistSong = async (artistId, page, count) => {
        try {
            let artistSongs = await this.requestZingMp3("/api/v2/song/get/list", {
                id: artistId,
                type: "artist",
                page: page,
                count: count,
                sort: "new",
                sectionId: "aSong",
                sig: this.hashListMV("/api/v2/song/get/list", artistId, "artist", page, count)
            })
            return artistSongs
        } catch (error) {
            return error
        }
    }

    getArtist = async (name) => {
        try {
            const artist = await this.requestZingMp3("/api/v2/page/get/artist", {
                alias: name,
                sig: this.hashParamNoId("/api/v2/page/get/artist")
            })
            return artist
        } catch (error) {
            return error
        }
    }

    getLyric = async (songId) => {
        try {
            const lyric = await this.requestZingMp3("/api/v2/lyric/get/lyric", {
                id: songId,
                sig: this.hashParam("/api/v2/lyric/get/lyric", songId)
            })
            return lyric
        } catch (error) {
            return error
        }
    }

    search = async (name) => {
        try {
            const search = await this.requestZingMp3("/api/v2/search/multi", {
                q: name,
                sig: this.hashParamNoId("/api/v2/search/multi")
            })
            return search
        } catch (error) {
            return error
        }
    }

    getListMV = async (id, page, count) => {
        try {
            const listMV = await this.requestZingMp3("/api/v2/video/get/list", {
                id: id,
                type: "genre",
                page: page,
                count: count,
                sort: "listen",
                sig: this.hashListMV("/api/v2/video/get/list", id, "genre", page, count),
            })
            return listMV
        } catch (error) {
            return error
        }
    }

    getCategoryMV = async (id) => {
        try {
            const categoryMV = await this.requestZingMp3("/api/v2/genre/get/info", {
                id: id,
                type: "video",
                sig: this.hashCategoryMV("/api/v2/genre/get/info", id, "video"),
            })
            return categoryMV
        } catch (error) {
            return error
        }
    }

    getVideo = async (videoId) => {
        try {
            let video = await this.requestZingMp3("/api/v2/page/get/video", {
                id: videoId,
                sig: this.hashParam("/api/v2/page/get/video", videoId),
            })
            return video
        } catch (error) {
            return error
        }
    }
}

const ZingMp3 = new ZingMp3Api(
    "1.6.34", // VERSION
    "https://zingmp3.vn", // URL
    "2aa2d1c561e809b267f3638c4a307aab", // SECRET_KEY
    "88265e23d4284f25963e6eedac8fbfa3", // API_KEY
    String(Math.floor(Date.now() / 1000)) // CTIME
)

module.exports = ZingMp3