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
    let currentMusic = computed(() => { return playlist.value[playlistIndex.value] })
    let musicStatus = ref({ duration: 0, currentTime: 0, paused: true })
    // 播放列表
    let playlistIds = ref([])
    //{id,name,artist,tns,url,picurl,?lyric}
    let playlist = ref([])
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
    //添加监听事件 用来更新播放进度状态 和上面的区别是 这些事件需要交到mediaSession
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
    function updateProgress(updateSession = false, conf = { duration: NaN, playbackRate: NaN, position: NaN }) {
        if ("mediaSession" in navigator) {
            //conf是媒体会话的配置对象 这里只是配置 下面才会应用
            conf.duration = conf.duration || player.value.duration
            if (!conf.duration) {
                conf.duration = 114.5141919
            }
            conf.playbackRate = conf.playbackRate || player.value.playbackRate || 1
            conf.position = conf.position || player.value.currentTime || 0
            if (updateSession) {
                if (conf.duration == 114.5141919) {//这么臭的数 想必正常情况不会出现吧（智将
                    setTimeout(() => {//如果为114.5141919，则说明没有获取到duration，则延迟2秒再获取一次
                        updateProgress(true);
                    }, 2000);
                }
                //把配置对象传给媒体会话
                if (!(isNaN(conf.duration) || isNaN(conf.position) || isNaN(conf.playbackRate))) {
                    navigator.mediaSession.setPositionState(conf);
                }
                //设置播放状态 是否暂停
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

        musicStatus.value.paused = player.value.paused
        musicStatus.value.duration = player.value.duration
        musicStatus.value.currentTime = player.value.currentTime

    }
    //切歌后操作 需要手动调用
    function musicChanged() {
        let value = currentMusic.value
        parseLyric(value.id)//解析歌词
        player.value.src = value.url//将audio元素的源地址设置为这首歌
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
        save();

    }
    //解析歌词
    async function parseLyric() {
        if (!('lyric' in currentMusic.value)) {//如果没有保存的数据才去请求
            let apiResult = await api.lyricNew(currentMusic.value.id)
            apiResult = apiResult.data;
            let lyric = [];
            let lrc = apiResult.lrc.lyric.split('\n');
            for (let i = 0; i < lrc.length; i++) {
                lyric.push({
                    time: lrcToMS(lrc[i]),
                    lrc: lrcToLyric(lrc[i]),
                    roma: '',
                    tran: ''
                });
            }
            try {
                lrc = apiResult.romalrc.lyric.split('\n');
                for (let i = 0; i < lrc.length; i++) {
                    for (let j = 0; j < lyric.length; j++) {
                        if (lyric[j].time == lrcToMS(lrc[i])) {
                            lyric[j].roma = lrcToLyric(lrc[i]);
                        }
                    }
                }
            } catch (e) {
                console.log('看起来没有罗马音歌词');
            }
            try {
                lrc = apiResult.tlyric.lyric.split('\n');
                for (let i = 0; i < lrc.length; i++) {
                    for (let j = 0; j < lyric.length; j++) {
                        if (lyric[j].time == lrcToMS(lrc[i])) {
                            lyric[j].tran = lrcToLyric(lrc[i]);
                        }
                    }
                }
            } catch (e) {
                console.log('看起来没有翻译歌词');
            }
            playlist.value[playlistIndex.value].lyric = lyric;//最终赋值
        }
    }
    //清除列表 使用新的列表替换
    async function playlistInit(ids) {
        stop()
        let storageNow = JSON.parse(localStorage.getItem('playlist') || '{}')
        if (ids == undefined && 'version' in storageNow && storageNow.version == 1) {//如果没传参数 使用本地数据
            ids = storageNow.ids;
            playlistIndex.value = storageNow.current;
            playlist.value = storageNow.playlist;
            playlistIds.value = storageNow.ids;
            return;
        } else if (ids == undefined) {//没传参数，本地也没存，那我干鸡毛啊
            console.error('播放列表初始化未提供参数');
            return;
        }

        await addMusic(ids, 0);
        playlistIndex.value = 0;
        save();//保存到localstorage
        return;
    }
    /**
     * 添加音乐到播放列表 默认添加到最前面
     * @param {String} id 
     * @param {Number} position 
     * @param {Boolean} letIndexIsNew 是否让index指向新添加的音乐的第一个
     */
    async function addMusic(ids = [], position = 0, letIndexIsNew = false) {
        if (ids.length == 0) {//如果没传id
            return;
        }
        let list = {};
        list = ids.map(item => {
            return {
                id: item
            }
        })
        //获取urls
        let res = await api.songUrlV1(ids.join(','), 'jymaster');
        res = res.data.data;
        //因为返回的数据不按请求的id顺序返回 所以特殊处理
        res = res.map(item => {
            return { id: item.id, url: item.url }
        })
        list = api.mergeMusicObjArrs(list, res);
        //获取detail
        res = await api.songDetail(ids.join(','));
        res = res.data.songs;
        //同上，特殊处理
        res = res.map(item => {
            return {
                id: item.id,
                name: item.name,
                artist: item.ar.map(item => item.name).join('、'),
                picurl: item.al.picUrl,
                tns: api.parseArray(item.tns),
                fee: item.fee,
            }
        })
        list = api.mergeMusicObjArrs(list, res);
        //将结果放到播放列表中
        playlist.value.splice(position, 0, ...list)
        console.log(playlistIds);
        playlistIds.value.splice(position, 0, ...ids)
        if (letIndexIsNew == true) {
            playlistIndex.value = position;
        } else {
            if (position < playlistIndex.value) {
                playlistIndex.value += position;
            }
        }
    }
    function save() {
        let storage = { version: 1, playlist: playlist.value, current: playlistIndex.value, ids: playlistIds.value, };
        localStorage.removeItem('playlist');
        localStorage.setItem('playlist', JSON.stringify(storage));
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
        currentMusic,
        playlist,
        playlistIds,
        playlistIndex,
        musicStatus,
        playlistInit,
        addMusic,
        stop,
        play,
        pause,
        next,
        prev,
        seek,
        musicChanged,
    }

})