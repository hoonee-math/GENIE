<template>
    <div class="flex flex-col gap-8 p-0 md:p-8 box-border w-full">
        <PassageAndQuestionLayout :left-ratio="2" :right-ratio="1" >
            <template #title>
                passage.title
            </template>
            <template #left>
                generated_passage
            </template>
            <template #right>
                <!-- 지문 분석 (generated_core_point) -->
                <PassageSummaryLayout>
                    <!-- 지문 분야 -->
                    <template #type_passage>{{requestData.type_passage}}</template>
                    <!-- 지문 제재 -->
                    <template #keyword>{{requestData.keyword}}</template>
                    <!-- 핵심 논점 -->
                    <template #generated_core_point>{{generatedData.generated_core_point[0]}}</template>
                </PassageSummaryLayout>
            </template>
        </PassageAndQuestionLayout>
    </div>
</template>
<script setup>
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue';
import PassageSummaryLayout from './PassageSummaryLayout.vue';

const requestData = {
    type_passage : '인문/예술/사회/과학/기술',
    keyword : '인공지능, 머신러닝, 딥러닝',
}
const generatedData = {
    generated_passage : '',
    generated_core_point : ['12','123123']
}
</script>
<style scoped>
    
</style>