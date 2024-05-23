import { defineStore } from "pinia";
import * as api from '@/modules/api'
import { toRaw, unref } from 'vue'

export const usePlayStore = defineStore('play', {
    state: () => {
        return {
            // 播放列表
            playlist: [],
            // 播放列表索引
            playlistIndex: 0,
            // 播放状态
            playStatus: false,
        }
    }
})