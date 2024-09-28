import { defineStore } from "pinia";
import * as api from '@/modules/api.js'
import * as lyricTools from '@/modules/lyric.js'
import { ref, computed } from 'vue'
import { useUserStore } from "./user.js";
import { useSettingStore } from "./setting.js";

export const usePlayStore = defineStore('play', () => {
    // console.log('playstore被创建 ');
    let player = ref(new Audio());
    // player.value.crossOrigin = 'anonymous';
    window.player = player.value;
    let lyricIndexNow = ref({ lineIndex: -1, wordIndex: -1, wordDuration: 0 });//内部变量 供给下面的计算属性使用
    let currentMusic = computed(() => {
        let userStore = useUserStore();
        return {
            id: 0,
            picurl: '/icon.png',
            name: '暂无歌曲',
            artist: '',
            ...playlist.value[playlistIndex.value],//以上默认内容会被覆盖
            isLiked: userStore.likedSongs.includes(playlist.value[playlistIndex.value]?.id),
            currentLyricIndex: lyricIndexNow.value
        }
    })

    let musicStatus = ref({ duration: 0, currentTime: 0, paused: true })
    // 播放列表
    //{id,name,artist,tns,url,picurl,?lyric}
    let playlist = ref([])
    // 播放列表索引
    let playlistIndex = ref(0)
    // 随机播放的顺序
    // 存储格式为number数组 代表对应index需要播放的播放列表里的歌曲
    let playOrder = ref([])
    let playOrderIndex = computed(() => {
        return playOrder.value.findIndex(v => v == playlistIndex.value);
    })
    let playMode = ref(0);//0为顺序播放 1为随机播放
    let nameWithTns = computed(() => {
        let tns = currentMusic.value.tns;
        let name = currentMusic.value.name;
        if (tns) {
            return `<span class="text1">${name}</span><span class="text2">&nbsp;&nbsp;&nbsp;(${tns})</span>`
        } else {
            return name;
        }
    })

    // 设置标题
    watchEffect(() => {
        if (currentMusic.value.id != 0) {
            document.title = `${currentMusic.value.name} - ${currentMusic.value.artist} - 奶酪音乐`;
        }
    })

    // 设置媒体会话的动作
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
    //注意：下面的歌词更新事件也会触发此函数
    player.value.addEventListener('timeupdate', () => { updateProgress() })
    //添加监听事件 用来更新播放进度状态 和上面的区别是 这些事件需要交到mediaSession
    let eventsNeedUpdate = ['play', 'pause', 'ended', 'playing', 'waiting', 'ratechange', 'durationchange']
    for (let i = 0; i < eventsNeedUpdate.length; i++) {
        player.value.addEventListener(eventsNeedUpdate[i], () => { updateProgress(true) })
    }

    //播放结束后自动下一曲
    player.value.addEventListener('ended', () => { next() })

    interface updateProgressConf {
        duration?: number
        playbackRate?: number
        position?: number
    }
    /**  同步播放进度状态 是回调函数
     * @param {boolean} updateSession - 是否更新媒体会话
     * @param {Object} conf - 仅参数一为true生效 媒体会话的配置对象
    */
    function updateProgress(updateSession = false, conf: updateProgressConf = { duration: NaN, playbackRate: NaN, position: NaN }) {
        if (updateSession) {
            if ("mediaSession" in navigator) {
                //conf是媒体会话的配置对象 这里只是配置 下面才会应用
                conf.duration = conf.duration || player.value.duration
                if (!conf.duration) {
                    conf.duration = 114.5141919
                }
                conf.playbackRate = conf.playbackRate || player.value.playbackRate || 1
                conf.position = conf.position || player.value.currentTime || 0
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
        if (playlist.value.length == 0) {
            return;
        }
        lyricIndexNow.value.lineIndex = -1;
        let value = currentMusic.value
        parseLyric()
        if (window.isElectron) {
            //如果是electron环境 就发送歌名给桌面歌词
            window.api.sendLyric(JSON.stringify({
                time: 0,
                lrc: api.textToParsedYrcLine(value?.name),
                roma: api.textToParsedYrcLine(value?.artist),
                tran: api.textToParsedYrcLine(value?.artist)
            }))
        }
        if ("mediaSession" in navigator) {//更新session元数据信息
            navigator.mediaSession.metadata = null
            navigator.mediaSession.metadata = new MediaMetadata({
                title: value.name,
                artist: value.artist,
                artwork: [{ src: value.picurl }]
            })
        }
        updateProgress(true, { position: 0, duration: player.value.duration });
        //保存当前播放列表
        save();

    }
    //获取并解析歌词
    async function parseLyric() {
        if (!('lyric' in currentMusic.value)) {//如果没有保存的数据才去请求
            let apiResult: any = await api.lyricNew(currentMusic.value.id)
            apiResult = apiResult.data;
            let lyric = [];
            if (apiResult.code == 200) {
                if (apiResult?.yrc?.lyric) {
                    lyric = lyricTools.parseYrc(apiResult.yrc.lyric);
                    if (apiResult?.yromalrc?.lyric) {
                        lyric = lyricTools.parseSecondaryLrc(apiResult.yromalrc.lyric, lyric, 'roma');
                    }
                    if (apiResult?.ytlrc?.lyric) {
                        lyric = lyricTools.parseSecondaryLrc(apiResult.ytlrc.lyric, lyric, 'tran');
                    }

                } else if (apiResult?.lrc?.lyric) {
                    lyric = lyricTools.parseLrc(apiResult.lrc.lyric);
                    if (apiResult?.romalrc?.lyric) {
                        lyric = lyricTools.parseSecondaryLrc(apiResult.romalrc.lyric, lyric, 'roma');
                    }
                    if (apiResult?.tlyric?.lyric) {
                        lyric = lyricTools.parseSecondaryLrc(apiResult.tlyric.lyric, lyric, 'tran');
                    }
                }
            }
            // console.log(lyric);
            playlist.value[playlistIndex.value].lyric = lyric;//最终赋值
        }
    }
    //获取并应用歌曲url
    async function getAudioUrl(id) {
        let settingStore = useSettingStore();
        let res = await api.songUrlV1(id, settingStore.musicLevel, localStorage.getItem('specialApi'), localStorage.getItem('cookie'));
        let d = res.data.data[0].url;
        player.value.src = d;
        return d;
    }
    //把api返回的detail内容转换为播放列表的存储形式
    function parseDetailToList(data) {
        return data.map((item) => {
            return {
                id: item.id,
                name: item.name,
                artist: item.ar.map(item => item.name).join('、'),
                picurl: item.al.picUrl,
                tns: api.parseArray(item.tns),
                fee: item.fee,
            }
        });
    }
    //清除列表 使用新的列表替换 参数一二选择一个传入
    async function playlistInit(ids = null, dataFromApi = null) {
        stop()
        playlist.value = [];
        playlistIndex.value = -1;
        playOrder.value = [];
        if (ids == null) {//没传递id列表
            let storageNow = JSON.parse(localStorage.getItem('playlist') || '{}')
            if (dataFromApi) {//传入了api数据
                playlist.value = parseDetailToList(dataFromApi);
                listRandom();
            } else if (ids == null && 'version' in storageNow && storageNow.version == 3) {//如果没传参数 使用localstorage的数据
                playlistIndex.value = storageNow.current;
                playlist.value = storageNow.playlist;
                playOrder.value = storageNow.playOrder;
                setPlayMode(storageNow.playMode);
            } else {//localstorage也没有数据
                console.error('播放列表初始化未提供参数');
            }
        } else {//传了id列表
            await addMusic(ids, '0', true);
        }
        if (playlistIndex.value == -1 && playMode.value == 1) {
            playlistIndex.value = playOrder.value[0];
        } else if (playlistIndex.value == -1) {
            playlistIndex.value = 0;
        }
        save();//保存到localstorage
        musicChanged();//把当前音乐应用到播放器
    }
    /**
     * 添加音乐到播放列表 默认添加到最前面
     * @param {String} id 
     * @param {Number} position 
     * @param {Boolean} letIndexIsNew 是否让index指向新添加的音乐的第一个
     */
    async function addMusic(ids = [], position: string | number = 'now', letIndexIsNew = false) {
        if (position == 'now') {
            position = playlistIndex.value + 1;
        }
        position = Number(position);
        // console.log('添加音乐到播放列表', ids, position, letIndexIsNew);
        if (ids.length == 0) {//如果没传id
            return;
        }
        let list: any = {};
        let res;
        list = ids.map(item => {
            return {
                id: item
            }
        })
        //获取detail----------------------
        res = await api.songDetail(ids.join(','));
        res = res.data.songs;
        //因为返回的数据也许不按请求的id顺序返回 所以特殊处理
        res = parseDetailToList(res);
        list = api.mergeMusicObjArrs(list, res);//按照唯一标识符id合并



        //将结果放到播放列表中---------------------
        //插入列表
        playlist.value.splice(position, 0, ...list)
        //改变index
        if (letIndexIsNew == true) {
            playlistIndex.value = Math.min(position, playlist.value.length - 1);
        } else {
            if (position < playlistIndex.value) {
                playlistIndex.value += position;
            }
        }

        // 生成随机播放顺序
        listRandom();
        return playlist.value;
    }
    // 进行随机播放列表算法
    function listRandom() {
        let listOrder = [];
        // 初始化列表（自然数数列
        for (let i = 0; i < playlist.value.length; i++) {
            listOrder.push(i);
        }
        // 随机排序洗牌
        listOrder.sort(() => Math.random() - 0.5);
        // 加入顺序列表
        playOrder.value = listOrder
    }
    function save() {
        let list = playlist.value.map(item => {
            //移除url和歌词 因为音频URL有时效性 歌词则是因为localstorage的容量限制 所以移除
            let { url, lyric, ...a } = item;
            return a;
        })
        let storage = { version: 3, playlist: list, current: playlistIndex.value, playOrder: playOrder.value, playMode: playMode.value };
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
    async function play(isNew = false) {
        //如果当前没有可以播放的源 那么就现在获取
        if (player.value.readyState == 0) {
            isNew = true
        }
        if (isNew) {
            player.value.currentTime = 0;
            musicChanged();
            await getAudioUrl(currentMusic.value.id)
        }
        player.value.play();
        updateProgress(true);
    }
    async function playWithPlaylistIndex(index) {
        playlistIndex.value = index;
        await play(true);
    }
    function next() {
        pause()
        console.log(`⏭下一曲`);
        beforeMusicChanged();
        const computIndex = (length, indexNow) => {
            if (indexNow < length - 1) {
                return indexNow + 1;
            } else {
                return 0;
            }
        }
        switch (playMode.value) {
            case 0://顺序播放
                playlistIndex.value = computIndex(playlist.value.length, playlistIndex.value);
                break;
            case 1://随机播放
                playlistIndex.value = playOrder.value[computIndex(playOrder.value.length, playOrderIndex.value)];
                break;
        }
        play(true);
    }
    function prev() {
        pause()
        console.log(`⏮上一曲`);
        beforeMusicChanged();

        const computIndex = (length, indexNow) => {
            if (indexNow > 0) {
                return indexNow - 1;
            } else {
                return length - 1;
            }
        }
        switch (playMode.value) {
            case 0://顺序播放
                playlistIndex.value = computIndex(playlist.value.length, playlistIndex.value);
                break;
            case 1://随机播放
                playlistIndex.value = playOrder.value[computIndex(playOrder.value.length, playOrderIndex.value)];
                break;
        }
        play(true);
    }
    function beforeMusicChanged() {

        let scrobble = (id: string, currentTime: number) => {
            let userStore = useUserStore();
            if (userStore.isLogin) {// 登录了
                if (currentTime >= 15) {// 播放位置大于15秒才上报
                    console.log(`📋️听歌打卡： ${id} ${currentTime}`);
                    api.scrobble(id, currentTime, 0);
                }
            }
        }
        //进行防抖处理 每10秒只能上报一次
        scrobble = api.debounce(scrobble, 5000, 1);

        // console.log(`[playStore]beforeMusicChanged`);
        scrobble(currentMusic.value.id, Math.floor(musicStatus.value.currentTime));

    }
    function seek(time) {
        // console.log(`[playStore]seek ${time}`);
        player.value.currentTime = time;
        updateProgress(true, { position: time, duration: player.value.duration });
    }
    function setPlayMode(mode = null) {
        if (mode == null) {
            mode = playMode.value ?? 0;
            // console.log(playMode);
        }
        // console.log(`[playStore]setPlayMode ${mode}`);
        playMode.value = mode;
        save();
    }
    setInterval(() => {
        updateLyric()
        updateKtvLyric();
    }, 50)
    function updateLyric() {
        try {
            if (musicStatus.value.paused == false && 'lyric' in currentMusic.value) {//正在播放 并且有歌词
                // 当前播放时间（毫秒
                // updateProgress();
                let currentTime = player.value.currentTime * 1000 + 80;
                let lyric = currentMusic.value.lyric;
                // 找当前行index
                let lineIndex = lyric.findIndex((_, index) => {
                    if (index + 1 < lyric.length) {
                        return lyric[index + 1].time > currentTime && lyric[index].time <= currentTime
                    } else {
                        return lyric[index].time <= currentTime
                    }
                });
                if (lineIndex != -1) {
                    // 歌词滚动
                    if (lyricIndexNow.value.lineIndex != lineIndex) {
                        lyricIndexNow.value.lineIndex = lineIndex;
                        updateKtvLyric();
                        // if (window.isElectron) {
                        //     //如果是electron环境 就发送歌词给桌面歌词
                        //     window.api.sendLyric(JSON.stringify(currentMusic.value?.lyric?.[lineIndex]))
                        // }
                        //////////现在是musicController发送了
                    }
                } else {
                    lyricIndexNow.value.lineIndex = -1;
                }
            }
        }
        catch (e) {
            api.error(`出错了！\n位置:playStore updateLyric\n错误信息:${e}`)
        }
    }
    function updateKtvLyric() {
        // 逐字歌词
        try {
            if (lyricIndexNow.value.lineIndex >= 0 || !musicStatus.value.paused || 'lyric' in currentMusic.value) {

                // 当前播放时间（毫秒
                // updateProgress();
                let currentTime = player.value.currentTime * 1000 + 80;
                // console.log(currentTime);
                let lyric = currentMusic.value.lyric;

                /**@type {array} */
                let line = lyric?.[lyricIndexNow.value.lineIndex]?.lrc ?? [];
                // 找逐字歌词index
                let wordIndex = line.findIndex((_, index) => {
                    if (index + 1 < line.length) {
                        return line[index + 1].time > currentTime && line[index].time <= currentTime
                    } else {
                        return line[index].time <= currentTime
                    }
                });
                if (wordIndex != -1 && wordIndex != lyricIndexNow.value.wordIndex) {
                    lyricIndexNow.value.wordIndex = wordIndex;
                    lyricIndexNow.value.wordDuration = line[wordIndex].duration;
                    // lyricIndexNow.value.percent = (currentTime - line[wordIndex].time) / line[wordIndex].duration;

                    // console.log('逐字歌词改变', lyricIndexNow.value.percent);
                }
            }
        } catch (e) {
            api.error(`出错了！\n位置:playStore updateKtvLyric\n错误信息:${e}`)
        }
    }

    return {
        player,
        currentMusic,
        playlist,
        playOrder,
        playlistIndex,
        playMode,
        musicStatus,
        nameWithTns,
        playlistInit,
        addMusic,
        stop,
        play,
        pause,
        next,
        prev,
        seek,
        musicChanged,
        setPlayMode,
        playWithPlaylistIndex,
    }

})