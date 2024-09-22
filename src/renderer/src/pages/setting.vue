<template>
    <div>
        <div class="setting">
            <settingItem :actionOnClick="loginByCookie" v-show="!isElectron">
                <template #t1>手动输入cookie来登录</template>
                <template #t2>奇奇怪怪的登录方式 仅网页端可用</template>
            </settingItem>
            <settingItem :needInput="true" :actionOnClick="updateSpecialApi" :defaultValue="defaultSpecialApi">
                <template #t1>设置专用api</template>
                <template #t2>用于获取歌曲的url</template>
            </settingItem>
            <settingItem :actionOnClick="update">
                <template #t1>马上更新用户信息！</template>
                <template #t2>每三分钟自动更新</template>
            </settingItem>
            <settingItem :actionOnClick="showCk">
                <template #t1>查看当前的cookie</template>
                <template #t2>言简意赅</template>
            </settingItem>
            <settingItem>
                <template #t1>主题色</template>
                <template #t2>默认是#DEB237</template>
                <template #action>
                    <n-color-picker class="color-picker" v-model:value="primaryColor" :show-alpha="false"
                        :modes="['hex']" />
                </template>
            </settingItem>
            <settingItem>
                <template #t1>设置歌词字体大小</template>
                <template #t2>默认是1.8rem</template>
                <template #action>
                    <div class="w-128px">
                        <n-slider :value="lyricFontSize" :min="1" :max="4" :step="0.1"
                            :format-tooltip="(value) => `${value}rem`"
                            @update:value="(value) => settingStore.setLyricFontSize(value + 'rem')" />
                    </div>
                </template>
            </settingItem>
            <settingItem>
                <template #t1>退出登录</template>
                <template #t2>拜拜~</template>
                <template #action>
                    <n-button class="button" type="error" secondary @click="logout">退出登录</n-button>
                </template>
            </settingItem>
        </div>
    </div>
</template>

<script setup name="setting" lang="js">
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { useSettingStore } from '@/stores/setting'
import * as api from '@/modules/api'
import settingItem from '@/components/settingItem.vue'
const isElectron = ref(window.isElectron)
let settingStore = useSettingStore()
let userStore = useUserStore()
let themeStore = useThemeStore()

let lyricFontSize = computed(() => {
    return parseFloat(settingStore.lyricFontSize)
})
let primaryColor = ref('');
let defaultSpecialApi = ref(localStorage.getItem('specialApi') ?? '')
onMounted(() => {
    primaryColor.value = themeStore.mainColor;
    watch(primaryColor, (value) => {
        themeStore.setMainColor(value)
    })
})

function updateSpecialApi(value) {
    localStorage.setItem('specialApi', value);
    api.success('已设置~')
}

function logout() {
    userStore.logout();
    api.success('退出登录~')
}
function loginByCookie() {
    api.success('开始尝试更新用户信息了喔');
    document.cookie = prompt('输入cookie的MUSIC_U字段 例如MUSIC_U=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    userStore.updateByCookie();
}
function update() {
    api.success('开始更新，成功后会有提示')
    userStore.updateByCookie();
}
function showCk() {
    let ck = userStore.cookie
    alert(ck)
}
</script>

<style scoped>
* {
    box-sizing: border-box;
}

.setting {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* .button {
    width: fit-content;
} */

.color {
    margin: 1rem;
    display: flex;
    align-items: center;
}

.color-picker {
    width: 8rem;
    height: 2rem;
}
</style>