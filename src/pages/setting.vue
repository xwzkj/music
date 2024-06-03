<template>
    <div>
        <n-button @click="logout">退出登录</n-button>
        <n-button @click="loginByCookie">输入cookie登录</n-button>
        <n-button @click="tishi">弹出一个message</n-button>
        <n-button @click="update">马上更新用户信息</n-button>
    </div>
</template>

<script setup name="setting" lang="js">
import { useUserStore } from '@/stores/user'
import * as api from '@/modules/api'
let userStore = useUserStore()
function logout() {
    userStore.logout();
    ElMessage({
        message: '好了哦',
        type: 'success',
    })
}
function loginByCookie(){
    document.cookie=prompt('输入包含MUSIC_U字段的cookie');
    userStore.updateByCookie();
    api.success('开始尝试更新用户信息了喔');
}
function tishi(){
    api.success('呐呐呐呐呐，你点我干啥')
}
function update(){
    userStore.updateByCookie();
    api.success('开始更新，成功后会有提示')
}

</script>

<style scoped></style>