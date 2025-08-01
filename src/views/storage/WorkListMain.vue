<template>
  <StorageList
    type="workList"
    title="최근 문서함"
    api-endpoint="/api/pass/select/recelist"
    empty-message="최근 작업 내역이 없습니다."
    empty-mobile-message="작업 목록이 없습니다."
  />
</template>

<script setup>
import StorageList from '@/components/storage/StorageList.vue';
</script>

<style scoped>
</style>
