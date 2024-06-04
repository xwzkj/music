<template>
    <div @click="props.click" class="item-card-outer">
        <img class="item-card-img" :src="props.imgurl" crossorigin="anonymous" ref="itemCardImg"
            @load="getImgMainColor">
        <div class="item-card-name">
            <n-ellipsis :line-clamp="2">{{ props.text }}</n-ellipsis>
        </div>
    </div>
</template>

<script setup name="itemCard">
import * as api from "@/modules/api.js"
import { ref } from 'vue'
let props = defineProps(['imgurl', 'text', 'click'])
let itemColor = ref([235, 235, 235])
let itemCardImg = ref(null)//img元素
function getImgMainColor() {
    let color = api.getColorFromImg(itemCardImg.value, true);
    itemColor.value = api.mixColor(color, [255,255,255], 0.5, false, false);
}

</script>

<style scoped>
*{
    box-sizing: border-box;
}

.item-card-outer {
    margin: 0 1rem 2rem 1rem;
    padding: 0;
    cursor: pointer;
    box-shadow: 0 0 0.2rem v-bind(itemColor);
    background-color: v-bind(itemColor);
    border-radius: 1rem;
    overflow: hidden;
}

.item-card-img {
    margin: 0;
    display: block;
    width: 100%;
}

.item-card-name {
    padding: 0.3rem;
    width: 100%;
    height: 3.5rem;
    color: rgb(0, 0, 0);
    overflow: hidden;
}
</style>