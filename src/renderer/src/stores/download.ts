import { defineStore } from "pinia";
import { useSettingStore } from '@/stores/setting.js'
import pinia from '@/stores/index.js'
import * as api from '@/modules/api.js'
import { song } from "@/modules/types/song.js";

interface dItem {
    id: string;
    loaded?: number;
    total?: number;
    status: 'waiting' | 'finished' | 'error';
    detail: song;
}



export const useDownloadStore = defineStore("download", {
    state: () => ({
        list: [] as dItem[],

        // 下载器工作状态
        status: 'waiting' as 'waiting' | 'working',
        current: -1,
        dirHandle: null as FileSystemDirectoryHandle | null,
    }),
    actions: {
        startTimer() {
            setInterval(() => {
                if (this.status === 'waiting') {
                    let wIndex = this.list.findIndex(item => (item.status === 'waiting'))
                    if (wIndex >= 0) {
                        this.down(wIndex)
                    }
                }
            }, 2500)
        },

        async down(index: number) {
            try {
                if (index < 0 || index >= this.list.length) return // 数组超限
                if ('showDirectoryPicker' in window) {
                    this.dirHandle = this.dirHandle || await window.showDirectoryPicker({ mode: 'readwrite' });
                }
                this.status = 'working'
                this.current = index

                let data = this.list[index]
                let settingStore = useSettingStore(pinia);

                let res = await api.songUrlV1(data.id, settingStore.musicLevel, localStorage.getItem('specialApi'), localStorage.getItem('cookie'))
                let url = res.data?.data?.[0]?.url
                let type = res.data?.data?.[0]?.type ?? 'mp3'
                console.log('⬇开始下载', `${data.detail.artist} - ${data.detail.name}.${type}`);
                await api.downloadFile(url, `${data.detail.artist} - ${data.detail.name}.${type}`, undefined, this.dirHandle)
            } catch (e) {
                console.log('下载出现错误', e)
                this.list[index].status = 'error'
            }
            this.list[index].status = 'finished'
            this.status = 'waiting'
        },
        async addDownloadItemByIds(ids: string[]) {
            if (!ids.length) return

            let data = []

            let res = await api.songDetail(ids.join(','))
            data = api.parseDetailToList(res.data.songs)
            data.forEach(item => {
                this.list.push({
                    id: item.id,
                    detail: item,
                    status: 'waiting'
                })
            })
        }
    }
})

useDownloadStore().startTimer()