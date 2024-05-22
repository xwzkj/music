<template>
    <div>
        <n-list bordered hoverable style="overflow: hidden;">
            <n-list-item>
                <div class="result-li">
                    <span class="result-img result"></span>
                    <span class="result-name result">歌曲名</span>
                    <span class="result-ar result">
                        <n-divider vertical class="divider-vertical" />
                        <span>歌手</span>
                    </span>
                    <span class="result-al result" v-if="screenIsWide">
                        <n-divider vertical class="divider-vertical" />
                        <span>专辑</span>
                    </span>
                    <span class="result-dt result" v-if="screenIsWide">
                        <n-divider vertical class="divider-vertical" />
                        <span>时长</span>
                    </span>
                </div>
            </n-list-item>

            <n-list-item v-for="item in props.value" :key="item.id">
                <div class="result-li">
                    <img class="result-img result" :src="item.al.picUrl + '?param=80y80'" :alt="item.al.name" />
                    <span class="result-name result">
                        <span @click="props.nameOnClick(item.id)">{{ item.name
                            }}</span>
                        <n-tag v-if="item.fee == 1" type="warning" size="small" :bordered="false">VIP</n-tag>
                        <n-tag v-if="item.fee == 4" type="info" size="small" :bordered="false">数字专辑</n-tag>

                    </span>
                    <span class="result-ar result">
                        <n-divider vertical class="divider-vertical" />
                        <span>{{
                            api.parseArtist(item.ar) }}</span>
                    </span>
                    <span class="result-al result" v-if="screenIsWide">
                        <n-divider vertical class="divider-vertical" />
                        <span>{{ item.al.name }}</span>
                    </span>
                    <span class="result-dt result" v-if="screenIsWide">
                        <n-divider vertical class="divider-vertical" />
                        <span>{{ api.msToText(item.dt) }}</span>
                    </span>
                </div>
            </n-list-item>
        </n-list>

    </div>
</template>

<script setup name="musicList">
import { ref, computed } from 'vue';
import * as api from '@/modules/api';
import { NList, NListItem, NTag, NDivider } from 'naive-ui'
let props = defineProps(['value','nameOnClick']);

let windowWidth = ref(window.innerWidth);
window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
})
let screenIsWide = computed(() => {
    return windowWidth.value > 700;
})
</script>

<style scoped>
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
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
}

.result-al {
    flex: 20%;
}

.result-dt {
    flex: 10%;
}

.result {
    margin: 0.2rem;
    display: flex;
    font-size: 1rem;

}

.divider-vertical {
    height: 1.5rem;
}
</style>