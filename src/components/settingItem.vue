<template>
    <div class="setting-item-outer">
        <n-card>
            <div class="setting-item">
                <div class="title">
                    <div class="t1">
                        <slot name="t1"></slot>
                    </div>
                    <div class="t2">
                        <slot name="t2"></slot>
                    </div>
                </div>
                <div class="action">
                    <slot name="action">
                        <n-button class="button" secondary circle type="primary" @click="props.actionOnClick">
                            <template #icon>
                                <n-icon><i-hugeicons-link-square-01 /></n-icon>
                            </template>
                        </n-button>
                    </slot>
                </div>
            </div>
        </n-card>
    </div>
</template>

<script setup name="settingItem">
//仅当action插槽为默认值时生效
let props = defineProps(['actionOnClick'])
</script>

<style scoped>
.setting-item-outer {
    width: 80%;
    margin: 0.5rem;
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
    color: #666;
}

.action {
    display: flex;
    align-items: center;
}
</style>