<!-- components/layout/SplitLayout.vue -->
<template>
    <div class="flex h-full">
        <!-- 왼쪽 영역 -->
        <div class="flex-1">
            <div class="flex flex-col gap-10 h-full">
                <slot name="left" />
            </div>
        </div>

        <!-- 가운데 구분선 -->
        <div class="w-px bg-gray-300 mx-9"></div>

        <!-- 오른쪽 영역 -->
        <div class="flex-1">
            <div class="flex flex-col gap-10 h-full">
                <slot name="right" />
            </div>
        </div>
    </div>
</template>