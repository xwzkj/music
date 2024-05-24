import { defineStore } from "pinia";
import * as api from '@/modules/api'
import { ref, computed } from 'vue'

export const usePlayStore = defineStore('play', () => {
    // 播放器 类型为 HTMLAudioElement
    let player = ref(new Audio());
    // 当前播放歌曲信息 lrc
    let lyric = ref([{}])
    let paused = ref(true)
    let currentMusic = computed(() => { return playlist.value[playlistIndex.value] })
    // 播放列表
    let playlistIds = ref([])
    let playlist = ref([{}])
    // 播放列表索引
    let playlistIndex = ref(0)
    if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("previoustrack", prev);
        navigator.mediaSession.setActionHandler("nexttrack", next);
        navigator.mediaSession.setActionHandler("seekto", (detail) => {
            updateMedaiSession();
            player.value.fastSeek(detail.seekTime);
            updateMedaiSession();
        });
        player.value.addEventListener('timeupdate',updateMedaiSession);
    }

    player.value.addEventListener('play', () => { paused.value = false })
    player.value.addEventListener('pause', () => { paused.value = true })
    player.value.addEventListener('ended', () => { paused.value = true })
    function updateMedaiSession() {
        // 同步媒体会话的播放位置
        let conf = {
            duration: player.value.duration,
            playbackRate: player.value.playbackRate,
            position: player.value.currentTime
        }
        console.log(conf);
        navigator.mediaSession.setPositionState(conf);
    }
    function musicChanged() {
        let value = currentMusic.value
        player.value.src = value.url//将audio元素的源地址设置为这首歌
        parseLyric(value.id)//解析这首歌的歌词

        //保存当前播放的音乐索引
        let storage = JSON.parse(localStorage.getItem('playlist'))
        storage.current = playlistIndex.value
        localStorage.setItem('playlist', JSON.stringify(storage))

    }
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
                }
            }

        }

        //解析当前音频的歌词
        await parseLyric(playlistIds.value[playlistIndex.value])

    }
    function stop() {
        player.value.src = ''
        pause()
        if ("mediaSession" in navigator) {
            navigator.mediaSession.playbackState = 'none';
        }
    }
    function pause() {
        player.value.pause();
        if ("mediaSession" in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
    }
    function play(isNew = false) {
        player.value.play();
        if (isNew) {
            player.value.currentTime = 0;
        }
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentMusic.value.name,
                artist: currentMusic.value.artist,
                artwork: [{ src: currentMusic.value.picurl }]
            })
            navigator.mediaSession.playbackState = 'playing';
        }
    }
    function next() {
        pause()
        console.log(`[playStore]next`);
        if (playlistIndex.value < playlistIds.value.length - 1) {
            playlistIndex.value++;
        } else {
            playlistIndex.value = 0;
        }
        musicChanged();
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
        musicChanged();
        play(true);
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
        paused,
        parseLyric,
        playlistInit,
        stop,
        play,
        pause,
        next,
        prev,
        musicChanged,
    }

})