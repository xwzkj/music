<template>
    <div>
        <el-button @click="logout">退出登录</el-button>
        <el-button @click="loginByCookie">输入cookie登录</el-button>
        <el-button @click="tishi">弹出一个message</el-button>
        <el-button @click="update">马上更新用户信息</el-button>
    </div>
</template>

<script setup name="setting" lang="js">
import { useUserStore } from '@/stores/user'
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
    ElMessage({
        message: '开始尝试更新用户信息了喔',
        type: 'success',
    })
}
function tishi(){
    ElMessage({
        message: '呐呐呐呐呐，你点我干啥',
        type: 'success',
    })
}
function update(){
    userStore.updateByCookie();
    ElMessage({
        message: '开始更新',
        type: 'success',
    })
}

</script>

<style scoped></style>