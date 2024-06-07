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
                <template #t1>颜色-primary</template>
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
import * as api from '@/modules/api'
import { generate } from '@ant-design/colors'
import emitter from '@/utils/mitt';
import settingItem from '@/components/settingItem.vue'
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