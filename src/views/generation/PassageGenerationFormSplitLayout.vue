<!-- components/layout/SplitLayout.vue -->
<template>
    <div class="flex flex-col md:flex-row h-full">
        <!-- 왼쪽 영역 (모바일에서는 위쪽) -->
        <div class="flex-1">
            <div class="flex flex-col gap-10 h-full">
                <slot name="left" />
            </div>
        </div>

        <!-- 구분선 -->
        <!-- 모바일: 가로선 (또는 숨김) -->
        <!-- 데스크톱: 세로선 -->
        <div class="h-px bg-gray-300 my-6 md:w-px md:h-auto md:bg-gray-300 md:mx-9 md:my-0"></div>

        <!-- 오른쪽 영역 (모바일에서는 아래쪽) -->
        <div class="flex-1">
            <div class="flex flex-col gap-10 h-full">
                <slot name="right" />
            </div>
        </div>
    </div>
</template>