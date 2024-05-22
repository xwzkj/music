<template>
    <div id="login-qrlogin">
        <span style="font-size:1.5rem">扫码登录</span>
        <span style="font-size:1rem;color:grey">请使用网易云音乐APP扫码登录</span>
        <n-qr-code :value="qrcode" :size="200" v-if="qrcode != ''" />
        <span v-if="qrcode == ''">等待生成二维码</span>
        <span v-if="qrcode != ''">{{ qrStatus }}</span>
    </div>
</template>

<script setup name="login">
import * as api from '@/modules/api.js';
import { useRouter } from 'vue-router';
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useUserStore } from "@/stores/user.js";
import { NQrCode } from 'naive-ui';
let user = useUserStore();
let router = useRouter()
let qrcode = ref('');
let qrStatus = ref('等待扫码');
let check;//二维码状态检查定时器的id
onMounted(() => {
    // console.log('登录组件加载');
    createQRcode();
    user.updateByCookie();//测试使用
})
onBeforeUnmount(() => {
    clearInterval(check);
})
async function createQRcode() {
    let key = await api.loginQrKey();
    // console.log('生成qrkey /login/qr/key', key.data);
    key = key.data.data.unikey;
    let qr = await api.loginQrCreate(key);
    // console.log('生成二维码 /login/qr/create', qr.data);
    qrcode.value = qr.data.data.qrurl;
    check = setInterval(() => {
        api.loginQrCheck(key)
            .then(res => {
                if (res.data.code == 800) {
                    clearInterval(check);
                    qrStatus.value = '二维码已失效'
                    createQRcode();
                }
                if (res.data.code == 801) {
                    qrStatus.value = '等待扫码'
                }
                if (res.data.code == 802) {
                    qrStatus.value = '正在授权'
                }
                if (res.data.code == 803) {
                    qrStatus.value = '授权成功'
                    user.updateByCookie(res.data.cookie);
                    clearInterval(check);
                    router.push({ 'name': 'account' });
                }
            })
    }, 3000)
}
</script>

<style scoped>
#login-qrlogin {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>