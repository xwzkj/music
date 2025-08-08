<template>
    <div @click="props.click" class="item-card-outer" v-if="!props.isDailySongs">
        <img class="item-card-img" :src="props.imgurl + '?param=200y200'" crossorigin="anonymous" ref="itemCardImg"
            @load="getImgMainColor">
        <div class="item-card-name text1">
            <n-ellipsis :line-clamp="2">{{ props.text }}</n-ellipsis>
        </div>
    </div>
    <div v-else 
    class="item-card-outer" 
    @click="router.push({ name: 'playlist', query: { isDailySongs: true } })"
    :style="{ backgroundColor: themeStore.mainColors?.[1] }"
    >
        <div class="item-card-date-box text2">
            <n-icon size="9rem" class="item-card-icon"><i-ic-twotone-calendar-today />
                <div class="item-card-date">{{ date }}</div>
            </n-icon>

        </div>
        <div class="item-card-name text1">每日推荐</div>
    </div>
</template>

<script setup name="itemCard">
import * as api from "@/modules/api"
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { useThemeStore } from "@/stores/theme";
let themeStore = useThemeStore();
let props = defineProps(['imgurl', 'text', 'click', 'isDailySongs'])
let itemColor = ref(themeStore.mainColors?.[1])
let itemCardImg = ref(null)//img元素
let date = new Date().getDate();
function getImgMainColor() {
    let color = api.getColorFromImg(itemCardImg.value, true);
    itemColor.value = api.mixColor(color, [255, 255, 255], 0.4, false, true);
}
const router = useRouter();

</script>

<style scoped>
* {
    box-sizing: border-box;
}

.item-card-outer {
    padding: 0;
    cursor: pointer;
    box-shadow: 0 0 0.2rem lightgray;
    background-color: v-bind(itemColor);
    border-radius: 1rem;
    overflow: hidden;
}

.item-card-img {
    margin: 0;
    display: block;
    width: 100%;
    aspect-ratio: 1/1;
    object-fit: cover;
}

.item-card-name {
    padding: 0.3rem;
    width: 100%;
    height: 3.5rem;
    overflow: hidden;
}

.item-card-date-box {
    position: relative;
    display: flex;
    height: 0;
    width: 100%;
    padding-bottom: 100%;
    background-color: rgba(255, 255, 255, 0.5);
}

.item-card-date {
    font-size: 4.5rem;
    font-weight: 700;
    position: absolute;
    left: 50%;
    top: 5.8rem;
    transform: translateX(-50%) translateY(-50%);
    font-style: normal;
}

.item-card-icon {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
}
</style>