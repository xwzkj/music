<template>
    <div>
        <ul class="item-card-ul">
            <li v-if="props.needDaily" class="item-card-li">
                <itemCard :isDailySongs="true" />
            </li>
            <li v-for="item in data" class="item-card-li">
                <itemCard :imgurl="item?.coverImgUrl ?? item?.picUrl" :text="item.name"
                    @click="router.push({ name: 'playlist', query: { id: item.id } })" />
            </li>
        </ul>
    </div>
</template>
<script setup lang="ts">
import itemCard from '@/components/itemCard.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const props = withDefaults(defineProps<{
    data: any[],
    needDaily?: boolean
}>(), {
    needDaily: false
})

</script>
<style scoped>
.item-card-ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
}

li {
    list-style: none;
    margin: 0 1rem 2rem 1rem;
}

ul {
    padding: 0;
}

@media screen and (max-width: 600px) {
    .item-card-ul {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    }

    li{
        margin: 0 0.5rem 1rem 0.5rem;
    }
}
</style>