import { defineStore } from 'pinia'

export const useSettingStore = defineStore('setting', {
    state: () => ({
        showLyricWindow: false,
        lyricFontSize: '1.8rem'
    }),
    actions: {
        init() {
            let obj = JSON.parse(localStorage.getItem('setting')!)
            if (obj && obj.version == 1) {
                let { showLyricWindow, lyricFontSize } = obj;
                this.showLyricWindow = showLyricWindow;
                this.lyricFontSize = lyricFontSize ?? '1.8rem';
            }
        },
        setLyricWindowShow(show: boolean | 'auto' = 'auto') {
            if (window.isElectron) {
                if (show == 'auto') {
                    show = this.showLyricWindow ?? false
                }
                window.api.setLyricWindowShow(show as boolean)
                this.showLyricWindow = show
                this.save()
            }
        },
        setLyricFontSize(size: string) {
            this.lyricFontSize = size;
            this.save()
        },
        save() {
            let stringData = JSON.stringify({
                version: 1,
                showLyricWindow: this.showLyricWindow,
                lyricFontSize: this.lyricFontSize
            })
            localStorage.setItem('setting', stringData);
        }
    }
})