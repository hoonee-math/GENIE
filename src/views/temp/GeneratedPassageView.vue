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
                generated_core_point
                <PassageSummary>
                    <template #subject>d</template>
                    <template #keyword>d</template>
                    <template #gistText>d</template>
                </PassageSummary>
            </template>
        </PassageAndQuestionLayout>
    </div>
</template>
<script setup>
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue';
import PassageSummary from './PassageSummaryLayout.vue';
</script>
<style scoped>
    
</style>