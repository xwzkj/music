import { defineStore } from 'pinia'
import * as api from '@/modules/api'
import { toRaw, unref } from 'vue'

export const useUserStore = defineStore('user', {
    state: () => ({
        isLogin: false,
        name: '',
        avatar: '',
        vipIcon: '',
        vipexpire: '',
        province: '',
        city: '',
        cookie: '',
        uid: '',
        playlists: [],
        likedSongs: [],
        updateTime: '',
    }),
    actions: {
        async updateByCookie(cookie) {
            let match = document.cookie.match(`MUSIC_U=[^;]+`)
            if (cookie == undefined && match != null) {
                cookie = document.cookie
            }else{
                console.log('没有cookie更新个毛的用户信息啊');
                return;
            }
            localStorage.setItem('cookie', cookie.match(`MUSIC_U=[^;]+`)[0])
            this.cookie = cookie
            this.isLogin = true

            let res = await api.loginStatus();
            if (res.data.data.code == 200) {
                this.name = res.data.data.profile.nickname
                this.avatar = res.data.data.profile.avatarUrl
                this.uid = res.data.data.profile.userId
                this.province = res.data.data.profile.province
                this.city = res.data.data.profile.city
            }
            res = await api.userPlaylist(this.uid)
            if (res.data.code == 200) {
                this.playlists = res.data.playlist
            }
            res = await api.likelist(this.uid)
            if (res.data.code == 200) {
                this.likedSongs = res.data.ids
            }
            res = await api.vipInfo();
            if (res.data.code == 200) {
                this.vipIcon = res.data.data.associator.iconUrl
                this.vipexpire = res.data.data.associator.expireTime
            }
            this.updateTime = Date.now()
            this.storeToStorage()
            ElMessage({
                message: '已同步用户信息',
                type: 'success',
                duration: 1000
            })
            console.log('pinia updatedByCookie');
        },
        updateByStorage() {
            let user = JSON.parse(localStorage.getItem('user'))
            this.updateByObj(user)
            console.log('pinia updatedByStorage');
        },
        updateByObj(obj) {
            for (let key in obj) {
                this[key] = obj[key]
            }
        },
        storeToStorage() {
            //把this转成纯对象
            let rawObj = toRaw(this);
            let pureObj = {};
            for (let key in rawObj) {
                if (key.slice(0, 1) != '_' && key.slice(0, 1) != '$' && typeof (rawObj[key]) != 'function') {
                    pureObj[key] = unref(rawObj[key]);
                }
            }
            localStorage.setItem('user', JSON.stringify(pureObj));
            console.log('pinia storeToStorage');
        },
        clearStorage() {
            localStorage.removeItem('user')
            console.log('pinia clearStorage');
        },
    }

})