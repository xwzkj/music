<template>
    <div>
        <div class="setting">
            <div class="button">
                <n-button @click="logout">退出登录</n-button>
            </div>
            <div class="button">
                <n-button @click="loginByCookie">输入cookie登录</n-button>
            </div>
            <div class="button">
                <n-button @click="tishi">弹出一个message</n-button>
            </div>
            <div class="button">
                <n-button @click="update">马上更新用户信息</n-button>
            </div>
            <div class="button">
                <n-button @click="showCk">显示cookie</n-button>
            </div>
            <div class="color">
                <span>选择primary颜色</span>
                <n-color-picker class="color-picker" v-model:value="primaryColor" :show-alpha="false" :modes="['hex']" />
            </div>
        </div>
    </div>
</template>

<script setup name="setting" lang="js">
import { useUserStore } from '@/stores/user'
import * as api from '@/modules/api'
import { generate } from '@ant-design/colors'
import emitter from '@/utils/mitt';
let primaryColor = ref('')
let userStore = useUserStore()
function logout() {
    userStore.logout();
    api.success('退出登录~')
}
function loginByCookie() {
    api.success('开始尝试更新用户信息了喔');
    document.cookie = prompt('输入包含MUSIC_U字段的cookie');
    userStore.updateByCookie();
}
function tishi() {
    api.success('呐呐呐呐呐，你点我干啥')
}
function update() {
    api.success('开始更新，成功后会有提示')
    userStore.updateByCookie();
}
function showCk() {
    let ck = document.cookie + ' ' + userStore.cookie
    alert(ck)
}
watch(primaryColor, (value) => {
    let colors = generate(value)
    console.log(value);
    emitter.emit('changeTheme', {
        common: {
            primaryColor: colors[5],
            primaryColorHover: colors[4],
            primaryColorSuppl: colors[4],
            primaryColorPressed: colors[6]
        }
    })
})
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

.button {
    margin: 1rem;
    width: fit-content;
}

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