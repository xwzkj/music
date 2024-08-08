import { defineStore } from 'pinia'

export const useSettingStore = defineStore('setting', {
    state: () => ({
        showLyricWindow: false,
    }),
    actions: {
        init(){
            let obj = JSON.parse(localStorage.getItem('setting')!)
            if(obj && obj.version == 1){
                let { showLyricWindow } = obj;
                this.showLyricWindow = showLyricWindow;
            }
        },
        setLyricWindowShow(show:boolean|'auto' = 'auto') {
            if (window.isElectron) {
                if (show == 'auto') {
                    show = this.showLyricWindow ?? false
                }
                window.setLyricWindowShow(show)
                this.showLyricWindow = show
                this.save()
            }
        },
        save(){
            let stringData = JSON.stringify({
                version: 1,
                showLyricWindow: this.showLyricWindow,
            })
            localStorage.setItem('setting', stringData);
        }
    }
})