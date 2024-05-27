import { defineStore } from "pinia";
import * as api from '@/modules/api'
import { ref, computed } from 'vue'

export const usePlayStore = defineStore('play', () => {
    /**
     * @typedef {Object} AudioElementWithValue
     * @property {HTMLAudioElement} value - 包含的HTMLAudioElement实例
     */

    /**
     * @type {AudioElementWithValue}
     */
    let player = ref(new Audio());
    // 当前播放歌曲信息 lrc
    let lyric = ref([{}])
    let currentMusic = computed(() => { return playlist.value[playlistIndex.value] })
    let music = ref({ duration: 0, currentTime: 0, paused: true })
    // 播放列表
    let playlistIds = ref([])
    let playlist = ref([{}])
    // 播放列表索引
    let playlistIndex = ref(0)


    //设置媒体会话的动作
    if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("previoustrack", () => prev());
        navigator.mediaSession.setActionHandler("nexttrack", () => next());
        navigator.mediaSession.setActionHandler("play", () => play());
        navigator.mediaSession.setActionHandler("pause", () => pause());
        navigator.mediaSession.setActionHandler("seekto", (conf) => {
            seek(conf.seekTime)
        });
    }
    //添加监听事件 用来更新播放进度状态
    player.value.addEventListener('timeupdate', () => { updateProgress() })
    //添加监听事件 用来更新播放进度状态
    let eventsNeedUpdate = ['play', 'pause', 'ended', 'playing', 'waiting', 'ratechange', 'durationchange']
    for (let i = 0; i < eventsNeedUpdate.length; i++) {
        player.value.addEventListener(eventsNeedUpdate[i], () => { updateProgress(true) })
    }

    //播放结束后自动下一曲
    player.value.addEventListener('ended', () => { next() })
    /**  同步播放进度状态 是回调函数
     * @param {boolean} updateSession - 是否更新媒体会话
     * @param {Object} conf - 仅参数一为true生效 媒体会话的配置对象
    */
    function updateProgress(updateSession = false, conf = { duration: null, playbackRate: null, position: null }) {
        try {
            if ("mediaSession" in navigator) {
                conf.duration = conf.duration || player.value.duration || 114.5141919
                conf.playbackRate = conf.playbackRate || player.value.playbackRate || 1
                conf.position = conf.position || player.value.currentTime || 0

                if (updateSession) {
                    if (conf.duration == 114.5141919){//这么臭的数 想必正常情况不会出现吧（智将
                        setTimeout(() => {//如果为114.5141919，则说明没有获取到duration，则延迟2秒再获取一次
                            updateProgress(true);
                        }, 2000);
                    }
                    //设置播放位置信息
                    if (!(isNaN(conf.duration) || isNaN(conf.position) || isNaN(conf.playbackRate))) {
                        navigator.mediaSession.setPositionState(conf);
                    }
                    //设置播放状态
                    if (player.value.paused === true || player.value.paused === false) {
                        navigator.mediaSession.playbackState = player.value.paused ? "paused" : "playing";
                    } else {
                        navigator.mediaSession.playbackState = "paused";
                    }
                    // ElMessage({
                    //     message: JSON.stringify(conf) + navigator.mediaSession.playbackState,
                    //     type: "success",
                    //     duration: 10000,
                    // })
                }

            }

            music.value.paused = player.value.paused
            music.value.duration = player.value.duration
            music.value.currentTime = player.value.currentTime
        } catch (e) {
            api.error('playstore出错 updateProgress' + JSON.stringify(e))
        }

    }

    //切歌后操作 需要手动调用
    function musicChanged() {
        let value = currentMusic.value
        player.value.src = value.url//将audio元素的源地址设置为这首歌
        parseLyric(value.id)//解析这首歌的歌词
        if ("mediaSession" in navigator) {//更新session元数据信息
            navigator.mediaSession.metadata = null
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentMusic.value.name,
                artist: currentMusic.value.artist,
                artwork: [{ src: currentMusic.value.picurl }]
            })
        }
        updateProgress(true, { position: 0, duration: player.value.duration });
        //保存当前播放列表
        let storage = {current: playlistIndex.value,ids: playlistIds.value}
        localStorage.setItem('playlist', JSON.stringify(storage))

    }
    //解析某一个音乐的歌词
    async function parseLyric(id) {
        let apiResult = await api.lyricNew(id)
        apiResult = apiResult.data;
        console.log(apiResult);
        lyric.value = []
        let lrc = apiResult.lrc.lyric.split('\n');
        for (let i = 0; i < lrc.length; i++) {
            lyric.value.push({
                time: lrcToMS(lrc[i]),
                lrc: lrcToLyric(lrc[i]),
                roma: '',
                tran: ''
            });
        }
        try {
            lrc = apiResult.romalrc.lyric.split('\n');
            for (let i = 0; i < lrc.length; i++) {
                for (let j = 0; j < lyric.value.length; j++) {
                    if (lyric.value[j].time == lrcToMS(lrc[i])) {
                        lyric.value[j].roma = lrcToLyric(lrc[i]);
                    }
                }
            }
        } catch (e) {
            console.log('看起来没有罗马音歌词');
        }
        try {
            lrc = apiResult.tlyric.lyric.split('\n');
            for (let i = 0; i < lrc.length; i++) {
                for (let j = 0; j < lyric.value.length; j++) {
                    if (lyric.value[j].time == lrcToMS(lrc[i])) {
                        lyric.value[j].tran = lrcToLyric(lrc[i]);
                    }
                }
            }
        } catch (e) {
            console.log('看起来没有翻译歌词');
        }

    }
    //播放列表初始化
    async function playlistInit(ids) {
        playlistIndex.value = 0;
        pause()

        let storage = { current: playlistIndex.value, ids: ids }
        if (ids != undefined) {
            localStorage.setItem('playlist', JSON.stringify(storage))
        } else if (localStorage.getItem('playlist') != null) {
            storage = JSON.parse(localStorage.getItem('playlist'))
            ids = storage.ids;
            playlistIndex.value = storage.current;
        } else {
            console.error('播放列表初始化未提供参数');
            return;
        }

        playlistIds.value = ids;
        playlist.value = [{}];
        playlist.value = ids.map((item, index) => {
            return {
                id: item,
                ...playlist.value[index]
            }
        })


        //获取urls
        let res = await api.songUrlV1(ids.join(','), 'jymaster');
        res = res.data.data;
        //使用嵌套循环而不是map是因为万恶的网页返回的值不安顺序！！！！曹操了啊
        for (let i = 0; i < res.length; i++) {
            for (let j = 0; j < playlist.value.length; j++) {
                if (playlist.value[j].id == res[i].id) {
                    playlist.value[j].url = res[i].url
                }
            }

        }

        player.value.src = playlist.value[playlistIndex.value].url;
        //获取detail
        res = await api.songDetail(ids.join(','));
        res = res.data.songs;
        for (let i = 0; i < res.length; i++) {
            for (let j = 0; j < playlist.value.length; j++) {
                if (playlist.value[j].id == res[i].id) {
                    playlist.value[j].name = res[i].name
                    playlist.value[j].artist = res[i].ar.map(item => item.name).join('、')
                    playlist.value[j].picurl = res[i].al.picUrl
                    playlist.value[j].tns = api.parseArray(res[i].tns)
                    playlist.value[j].fee = res[i].fee
                }
            }

        }
        musicChanged();//向session更新元数据    
        //解析当前音频的歌词
        await parseLyric(playlistIds.value[playlistIndex.value])

    }
    function stop() {
        player.value.src = ''
        pause()
    }
    function pause() {
        player.value.pause();
        updateProgress(true);
    }
    //开始/继续播放 从头播放需要传入true 调用前需要设置好audio的src
    function play(isNew = false) {
        if (isNew) {
            player.value.currentTime = 0;
            musicChanged();
        }
        player.value.play();
        updateProgress(true);
    }
    function next() {
        pause()
        console.log(`[playStore]next`);
        if (playlistIndex.value < playlistIds.value.length - 1) {
            playlistIndex.value++;
        } else {
            playlistIndex.value = 0;
        }
        play(true);
    }
    function prev() {
        pause()
        console.log(`[playStore]prev`);
        if (playlistIndex.value > 0) {
            playlistIndex.value--;
        } else {
            playlistIndex.value = playlistIds.value.length - 1;
        }
        play(true);
    }
    function seek(time) {
        player.value.currentTime = time;
        updateProgress(true, { position: time, duration: player.value.duration });
    }



    /**
获取一行lrc的第一个时间标签，并转换为毫秒
@param {string} lyricLine 一行歌词
@return {number}
*/
    function lrcToMS(lyricLine) {
        let express = /\[(\d+):(\d+)[:.](\d+)\]/
        let lineTime = express.exec(lyricLine);
        if (lineTime == null) {
            return 0;
        }
        if (lineTime[3].length == 1) {
            lineTime[3] = '0' + lineTime[3];
        }
        return (parseInt(lineTime[1]) * 60 + parseInt(lineTime[2])) * 1000 + parseInt(lineTime[3].slice(0, 2)) * 10;
    }
    /**
     * 获取一行lrc中的歌词文本
     * @param {string} lyricLine 一行lrc
     * @return {string} 歌词文本
     */
    function lrcToLyric(lyricLine) {
        let express = /\[\d+:\d+[:.]\d+\](.*)/
        let lineTime = express.exec(lyricLine);
        if (lineTime == null) {
            return '';
        }
        return lineTime[1];
    }
    return {
        player,
        lyric,
        currentMusic,
        playlist,
        playlistIds,
        playlistIndex,
        music,
        parseLyric,
        playlistInit,
        stop,
        play,
        pause,
        next,
        prev,
        seek,
        musicChanged,
    }

})