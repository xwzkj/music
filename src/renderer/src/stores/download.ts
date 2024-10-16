import { defineStore } from "pinia";
import { useSettingStore } from '@/stores/setting.js'
import pinia from '@/stores/index.js'
import * as api from '@/modules/api'

export const useDownloadStore = defineStore("download", {
    state: () => ({
        list: [],
        current: {
            index: -1,
            loaded: -1,
            total: -1
        }
    }),
    actions: {
        async downloadMusicByIds(ids: string[], dirHandle?: FileSystemDirectoryHandle) {
            let settingStore = useSettingStore(pinia);
            dirHandle = dirHandle || await window.showDirectoryPicker({ mode: 'readwrite' });

            let data = []

            let res = await api.songDetail(ids.join(','))
            data = api.parseDetailToList(res.data.songs)

            res = await api.songUrlV1(ids.join(','), settingStore.musicLevel, localStorage.getItem('specialApi'), localStorage.getItem('cookie'))
            data = api.mergeMusicObjArrs(data, res.data.data.map(item => {
                return {
                    url: item.url,
                    id: item.id,
                    type: item.type.toLowerCase() ?? 'mp3'
                }
            }))

            for (let i = 0; i < data.length; i++) {
                console.log(data[i].name);
                await api.downloadFile(data[i].url, `${data[i].name}.${data[i].type}`, undefined, dirHandle)
            }
        }
    }
})