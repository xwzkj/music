import { defineStore } from 'pinia'
import * as api from '@/modules/api.js'
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
        updateTime: 0,
    }),
    actions: {
        async updateLikelist() {
            let res = await api.likelist(this.uid)
            if (res.data.code == 200) {
                this.likedSongs = res.data.ids
                this.storeToStorage()
                return res.data.ids
            } else {
                throw new Error('获取喜欢列表失败')
            }
        },
        async updateByCookie(cookie: string | undefined) {
            let match: string | undefined = cookie || localStorage.getItem('cookie') || document.cookie
            match = match?.match(/MUSIC_U=[^;]+/)?.[0]
            if (match) {
                cookie = match
            } else if (!cookie) {
                this.logout()
                console.log(cookie, document.cookie, match);
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
                    //this.ip = res.data.data.profile.lastLoginIP
                    if (this.ip == '') {
                        this.ip = `111.37.150.${api.random(0, 255)}`
                    }
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

                // 如果有svip 就替换掉vip图标
                let svipIcon = res.data.data.redplus.iconUrl
                let svipexpire = res.data.data.redplus.expireTime
                if (svipexpire > Date.now()) {
                    this.vipIcon = svipIcon
                }
            }
            this.updateTime = Date.now()
            this.storeToStorage()
            // api.success('用户信息更新成功')
        },
        async updateByStorage() {
            let user = JSON.parse(localStorage.getItem('user') ?? '{}')
            this.updateByObj(user)
        },
        updateByObj(obj: any) {
            for (let key in obj) {
                let t: any = this
                t[key] = obj[key]
            }
        },
        storeToStorage() {
            //把this转成纯对象
            let rawObj: any = toRaw(this);
            let pureObj: any = {};
            for (let key in rawObj) {
                if (key.slice(0, 1) != '_' && key.slice(0, 1) != '$' && typeof (rawObj[key]) != 'function') {
                    pureObj[key] = unref(rawObj[key]);
                }
            }
            localStorage.setItem('user', JSON.stringify(pureObj));
        },
        clearStorage() {
            localStorage.removeItem('user')
            localStorage.removeItem('cookie')
        },
        logout() {
            this.$reset();
            this.clearStorage();
            document.cookie = "MUSIC_U=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    }

})
