<template>
    <div>
        <div class="setting">
            <settingItem :actionOnClick="loginByCookie">
                <template #t1>手动输入cookie来登录</template>
                <template #t2>奇奇怪怪的登录方式</template>
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
                <template #t2>自定义！好耶</template>
                <template #action>
                    <n-color-picker class="color-picker" v-model:value="primaryColor" :show-alpha="false"
                        :modes="['hex']" />
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
import * as api from '@/modules/api'
import settingItem from '@/components/settingItem.vue'
let userStore = useUserStore()
let themeStore = useThemeStore()
let primaryColor = ref(themeStore.mainColor);
onMounted(() => {
    primaryColor.value = themeStore.mainColor;
    watch(primaryColor, (value) => {
        themeStore.setMainColor(value)
    })
})
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