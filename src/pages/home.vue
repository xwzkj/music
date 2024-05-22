<template>
    <div id="home">
        <h1>这个小破站还没完工啊啊啊啊啊啊</h1>
        <p>目前可用：</p>
        <ul>
            <li>搜索</li>
            <li>播放</li>
            <li>日推</li>
            <li>歌单</li>
            <li>登录</li>
            <li>自己的主页</li>
            <li>设置(半成品)<a href="/#/setting">/setting</a></li>
        </ul>
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
    font-weight: bold;
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