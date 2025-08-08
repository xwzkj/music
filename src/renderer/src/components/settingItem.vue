<template>
    <div class="setting-item-outer">
        <n-card class="setting-item-card">
            <div class="setting-item">
                <div class="title">
                    <div class="t1 text1">
                        <slot name="t1"></slot>
                    </div>
                    <div class="t2 text2">
                        <slot name="t2"></slot>
                    </div>
                </div>
                <div class="action">
                    <slot name="action">
                        <n-input v-model:value="inputValue" v-if="props.needInput" placeholder="请输入" />
                        <n-button class="button" secondary circle type="primary">
                            <template #icon>
                                <n-icon>
                                    <i-hugeicons-link-square-01 @click="props.actionOnClick" v-if="!props.needInput" />
                                    <i-hugeicons-checkmark-square-01 @click="() => props.actionOnClick(inputValue)"
                                        v-else />
                                </n-icon>
                            </template>
                        </n-button>
                    </slot>
                </div>
            </div>
        </n-card>
    </div>
</template>

<script setup name="settingItem">
//参数一仅当action插槽为默认值时生效 参数二是Boolean
let props = defineProps(['actionOnClick', 'needInput', 'defaultValue'])
let inputValue = ref(props.defaultValue)
</script>

<style scoped>
.setting-item-outer {
    width: 100%;
    margin: 0.5rem;
}

.setting-item-card {
    background-color: #ffffff80;
}

.setting-item {
    display: flex;
    justify-content: space-between;
}

.title {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.t1 {
    font-size: 1rem;
    font-weight: 500;
}

.t2 {
    font-size: 0.8rem;
    /* color: #666; */
}

.action {
    display: flex;
    align-items: center;
}
</style>