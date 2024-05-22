<template>
    <div>
        <el-button @click="logout">退出登录</el-button>
        <el-button @click="loginByCookie">输入cookie登录</el-button>
        <el-button @click="tishi">弹出一个message</el-button>       
    </div>
</template>

<script setup name="setting" lang="js">
import { useUserStore } from '@/stores/user'
let userStore = useUserStore()// message.success('设置页');
function logout() {
    userStore.$reset();
    userStore.clearStorage();
    document.cookie = "MUSIC_U=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // console.log(userStore);
    ElMessage({
        message: '好了哦',
        type: 'success',
    })
}
function loginByCookie(){
    document.cookie=prompt('输入包含MUSIC_U字段的cookie');
    userStore.updateByCookie();
    ElMessage({
        message: '好了哦',
        type: 'success',
    })
}
function tishi(){
    ElMessage({
        message: '好了哦',
        type: 'success',
    })}
</script>

<style scoped></style>