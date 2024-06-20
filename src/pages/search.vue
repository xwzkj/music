<template>
    <div v-show="result">
        <musicList v-if="result" :value="result" :nameOnClick="play" />
    </div>
    <n-spin v-if="!result" class="loading-center" />

</template>
<script setup name="search">
import * as api from '@/modules/api.js'
import { useRouter } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import musicList from '@/components/musicList.vue'
import { usePlayStore } from '@/stores/play'
let playStore = usePlayStore();
let router = useRouter();
let props = defineProps(['keyword']);
let result = ref('');
watch(props, (value) => {
    // console.log('search.vue props变化');
    search();
}, { deep: true })
onMounted(() => {
    // console.log('search.vue组件被挂载');
    search();
})
// console.log('search.vue script执行');


async function search() {
    result.value = null;
    let res = await api.cloudsearch(props.keyword)
    // console.log('搜索/cloudsearch', res.data);
    result.value = res.data.result.songs;
}
async function play(id) {
    await playStore.addMusic([id], 0, true);
    playStore.play(true);
    router.push({ name: 'player' })
}
</script>
<style scoped>
.loading-center {
    width: 100%;
    height: 70vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.result-li {
    display: flex;
    align-items: center;
    justify-content: space-around;
}

.result-name {
    flex: 35%;
    flex-wrap: nowrap;
    cursor: pointer;
}

.result-ar {
    flex: 20%;
    flex-wrap: nowrap;
    height: 100%;
}

.result-img {
    width: 2rem;
    border-radius: 0.5rem;
}

.result-al {
    flex: 20%;
}

.result-dt {
    flex: 10%;
}

.result {
    padding: 0.2rem;
    display: flex;
    font-size: 1rem;

}
</style>