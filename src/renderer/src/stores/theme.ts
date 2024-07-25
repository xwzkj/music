import { defineStore } from 'pinia'
import { generate } from '@ant-design/colors'
import emitter from '@/utils/mitt';


export const useThemeStore = defineStore('theme', {
    state: () => ({
        mainColor: '',
        mainColors: [''],
        
    }),
    getters: {
        styleColors: (state)=>{
            return {text:state.mainColors[8],background:state.mainColors[0]}
        }
    },
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
            emitter.emit('changeTheme', {
                common: {
                    primaryColor: this.mainColors[5],
                    primaryColorHover: this.mainColors[4],
                    primaryColorSuppl: this.mainColors[4],
                    primaryColorPressed: this.mainColors[6]
                }
            })
            this.save()
        },
        setMainColor(color: string) {
            this.mainColor = color
            this.mainColors = generate(color)
            this.update()
        },
        save() {
            localStorage.setItem('theme', JSON.stringify({
                version: 2,
                mainColors: this.mainColors,
                mainColor: this.mainColor
            }))
        }
    },
})