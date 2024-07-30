import { defineStore } from 'pinia'
import { generate } from '@ant-design/colors'
import emitter from '@/utils/mitt';
import type { GlobalThemeOverrides } from 'naive-ui';


export const useThemeStore = defineStore('theme', {
    state: () => ({
        mainColor: '',
        mainColors: [''],
    }),
    actions: {
        initByLocalStorage() {
            let { version, mainColors } = JSON.parse(localStorage.getItem('theme') ?? '{"version":0}')
            if (version == 2 && mainColors) {
                this.mainColors = mainColors;
            } else {
                this.mainColors = generate('#c49526')
            }
            this.update()
        },
        update() {//把store的数据同步到naive-ui
            let obj:GlobalThemeOverrides = {
                common: {
                    primaryColor: this.mainColors[5],
                    primaryColorHover: this.mainColors[4],
                    primaryColorSuppl: this.mainColors[4],
                    primaryColorPressed: this.mainColors[6],
                    textColorBase: this.mainColors[8],
                }
            }
            emitter.emit('changeTheme', obj)
            this.save()
        },
        setMainColor(color: string) {
            this.mainColor = color
            this.mainColors = generate(color)
            this.update()
        },
        save() {
            let stringData = JSON.stringify({
                version: 2,
                mainColors: this.mainColors,
                mainColor: this.mainColor,
            })
            localStorage.setItem('theme', stringData);
            if(window.isElectron){
                window.sendThemeColors(stringData);
            }
        }
    },
})