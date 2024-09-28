import { defineStore } from 'pinia'

export const useSettingStore = defineStore('setting', {
    state: () => ({
        showLyricWindow: false,
        lyricFontSize: '1.8rem',
        musicLevel: 'jymaster'
    }),
    actions: {
        init() {
            let obj = JSON.parse(localStorage.getItem('setting')!)
            if (obj && obj.version == 1) {
                let { showLyricWindow, lyricFontSize, musicLevel } = obj;
                this.showLyricWindow = showLyricWindow;
                this.lyricFontSize = lyricFontSize ?? '1.8rem';
                this.musicLevel = musicLevel ?? 'jymaster'
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
        setMusicLevel(level: string) {
            this.musicLevel = level;
            this.save()
        },
        save() {
            let stringData = JSON.stringify({
                version: 1,
                showLyricWindow: this.showLyricWindow,
                lyricFontSize: this.lyricFontSize,
                musicLevel: this.musicLevel
            })
            localStorage.setItem('setting', stringData);
        }
    }
})