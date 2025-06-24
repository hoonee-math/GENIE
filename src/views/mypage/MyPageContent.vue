<template>
    <div class="w-full bg-[#F7F7F7] min-h-[calc(100vh-182px)]">
        <Info v-if="selectedTab === '회원정보'" />
        <Ticket v-if="selectedTab === '이용권'" />
        <Notice v-if="selectedTab === '공지사항'" />
        <Faq v-if="selectedTab === '자주 묻는 질문'" />
    </div>
</template>

<script setup>
    import Info from './Info.vue';
    import Ticket from './Ticket.vue';
    import Notice from './Notice.vue';
    import Faq from './Faq.vue';

    defineProps({
        selectedTab: String
    });
</script>