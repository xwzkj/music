<template>
    <div @click="props.click" class="item-card-outer">
            <img class="item-card-img" :src="props.imgurl" crossorigin="anonymous" ref="itemCardImg">
            <!-- @load="getImgMainColor" -->
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
// function getImgMainColor() {
//     let color = api.getColorFromImg(itemCardImg.value, true);
//     itemColor.value = api.mixColor(color, [0, 0, 0], 0.1, false, false);
// }

</script>

<style scoped>
.item-card-outer {
    margin: 0 1rem 2rem 1rem;
    padding: 0;
    cursor: pointer;
    padding: 0.3rem;
    /* box-shadow:0 0 0.2rem rgba(139, 150, 141, 0.7); */
    /* border: 2px solid rgb(239, 239, 245); */
    border-radius: 1rem;
}

.item-card-img {
    width: 100%;
    border-radius: 1rem;
    box-shadow: 0 0 0.2rem rgba(139, 150, 141, 0.2);
}

.item-card-name {
    width: 100%;
    height: 2.7rem;
    color: rgb(0, 0, 0);
}
</style>