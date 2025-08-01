<template>
  <StorageList
    type="trash"
    title="휴지통"
    api-endpoint="/api/pass/select/deletedList"
    empty-message="삭제된 문서가 없습니다."
    empty-mobile-message="삭제된 문서가 없습니다."
  />
</template>

<script setup>
import StorageList from '@/components/storage/StorageList.vue';
</script>

<style scoped>
</style>