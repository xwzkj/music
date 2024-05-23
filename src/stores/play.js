import { defineStore } from "pinia";
import * as api from '@/modules/api'
import { watch, ref } from 'vue'

export const usePlayStore = defineStore('play', () => {
    // 播放器 类型为 HTMLAudioElement
    let player = ref(null)
    // 当前播放歌曲信息 lrc
    let lyric = ref([{}])
    let paused = ref(true)
    let currentMusic = computed(() => { return playlist.value[playlistIndex.value] })
    // 播放列表
    let playlistIds = ref([])
    let playlist = ref([{}])
    // 播放列表索引
    let playlistIndex = ref(0)



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
        playlistIndex.value = 0;

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

        player.value.src = playlist.value[0].url;
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

        //解析第一个音频的歌词
        await parseLyric(playlistIds.value[0])

    }
    function pause() {
        player.value.pause();
    }
    function play() {
        player.value.play();
    }
    function next() {
        console.log(`[playStore]next`);
        if (playlistIndex.value < playlistIds.value.length - 1) {
            playlistIndex.value++;
        } else {
            playlistIndex.value = 0;
        }
    }
    function prev() {
        console.log(`[playStore]prev`);
        if (playlistIndex.value > 0) {
            playlistIndex.value--;
        } else {
            playlistIndex.value = playlistIds.length.value - 1;
        }
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
        play,
        pause,
        next,
        prev,
    }

})