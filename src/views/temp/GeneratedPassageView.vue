<template>
    <div class="flex flex-col gap-8 p-0 md:p-8 box-border w-full">
        <PassageAndQuestionLayout>
            <template #title>
                passage.title
            </template>
            <template #left>
                generated_passage
            </template>
            <template #right>
                generated_core_point
            </template>
        </PassageAndQuestionLayout>

        
        <PassageAndQuestionLayout :left-ratio="3" :right-ratio="2" >
            
        </PassageAndQuestionLayout>
    </div>
</template>
<script setup>
import PassageAndQuestionLayout from './PassageAndQuestionLayout.vue';
</script>
<style scoped>
    
</style>