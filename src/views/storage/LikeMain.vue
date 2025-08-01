<template>
  <StorageList
    type="favorite"
    title="즐겨찾기"
    api-endpoint="/api/pass/select/favolist"
    empty-message="중요 표시한 문서가 없습니다."
    empty-mobile-message="중요 표시한 문서가 없습니다."
  />
</template>

<script setup>
import StorageList from '@/components/storage/StorageList.vue';
</script>

<style scoped>
</style>