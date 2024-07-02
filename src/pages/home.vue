<template>
    <div id="home">
        <div>播放页<a href="/#/player">点我</a></div>
        <div>登录页面<a href="/#/login">点我</a></div>
        <div>设置<a href="/#/setting">点我</a></div>
        <div id="homeRecommend">
            <div class="recommend-item" id="homeDailySongs"
                @click="router.push({ name: 'playlist', query: { isDailySongs: true } })">
                <div id="日推图片位" class="homeRecommend-img">
                    <span id="date">{{ date }}</span>
                </div>
                <div class="homeRecommend-title">每日推荐</div>
            </div>
        </div>
    </div>
</template>

<script setup name="home">
import { useRouter } from 'vue-router';
const router = useRouter();
let date = new Date().getDate();
</script>

<style scoped>
#homeRecommend {
    display: flex;
}

#日推图片位 {
    border: 0.5rem solid rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
}

#date {
    font-size: 5rem;
    font-weight: 700;
}

.homeRecommend-img {
    height: 12.5rem;
    width: 12.5rem;
    border-radius: 1rem;
    margin-top: 1rem;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
}

.homeRecommend-title {
    padding-top: 0.5rem;
    padding-left: 1rem;
}

.recommend-item {
    cursor: pointer;
}
</style>