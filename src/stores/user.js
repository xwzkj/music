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
        ip: '',
        playlists: [],
        likedSongs: [],
        updateTime: '',
    }),
    actions: {
        async updateLikelist(){
            let res = await api.likelist(this.uid)
            if (res.data.code == 200) {
                this.likedSongs = res.data.ids
                this.storeToStorage()
                return res.data.ids
            }else{
                throw new Error('获取喜欢列表失败')
            }
        },
        async updateByCookie(cookie) {
            let match = document.cookie.match(`MUSIC_U=[^;]+`)
            if (cookie == undefined && match != null) {
                cookie = document.cookie.match(`MUSIC_U=[^;]+`)[0]
            } else if (cookie == undefined) {
                this.logout()
                api.error('[未登录]更新用户信息时：没有cookie');
                return;
            }
            localStorage.setItem('cookie', cookie)
            this.cookie = cookie
            this.isLogin = true

            let res = await api.loginStatus();
            if (res.data.data.code == 200) {
                this.isLogin = !(res.data.data.profile == null)
                if (this.isLogin) {
                    this.name = res.data.data.profile.nickname
                    this.avatar = res.data.data.profile.avatarUrl
                    this.uid = res.data.data.profile.userId
                    this.province = res.data.data.profile.province
                    this.city = res.data.data.profile.city
                }
            }
            if (!this.isLogin) {
                this.logout()
                api.error('登录状态过期，请重新登录！')
                return;
            }
            res = await api.userPlaylist(this.uid)
            if (res.data.code == 200) {
                this.playlists = res.data.playlist
            }
            await this.updateLikelist();

            res = await api.vipInfo();
            if (res.data.code == 200) {
                this.vipIcon = res.data.data.associator.iconUrl
                this.vipexpire = res.data.data.associator.expireTime
            }
            this.updateTime = Date.now()
            this.storeToStorage()
            api.success('用户信息更新成功')
            console.log('pinia updatedByCookie');
        },
        async updateByStorage() {
            let user = JSON.parse(localStorage.getItem('user'))
            this.updateByObj(user)
            if (this.ip == '') {
                this.ip = await api.getMyIp()
            }
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
            localStorage.removeItem('cookie')
            console.log('pinia clearStorage');
        },
        logout(){
            this.$reset();
            this.clearStorage();
            document.cookie = "MUSIC_U=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    }

})