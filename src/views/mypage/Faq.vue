<template>
  <div class="w-full min-h-[calc(100vh-182px)]">
    <div class="mx-auto p-4 sm:p-6">
      <h2 class="text-xl sm:text-2xl font-semibold text-[#16252d] mb-8">
        자주 묻는 질문
      </h2>
      <div class="bg-white w-full rounded-xl border border-[#e0e0e0]">
        <div
          v-for="(item, index) in faqList"
          :key="index"
          class="border-b border-[#e0e0e0] last:border-b-0"
        >
          <div
            @click="toggleFAQ(index)"
            class="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          >
            <div class="flex items-center gap-4 sm:gap-5">
              <span class="text-base sm:text-lg font-semibold text-[#303030]"
                >Q.</span
              >
              <span
                class="text-sm sm:text-base font-semibold text-[#303030]"
                :class="{ 'text-[#0086FF]': item.isOpen }"
              >
                {{ item.question }}
              </span>
            </div>
            <div class="flex items-center">
              <Icon
                :icon="item.isOpen ? 'ep:arrow-up-bold' : 'ep:arrow-down-bold'"
                width="12px"
                class="text-[#303030]"
              />
            </div>
          </div>
          <div
            class="overflow-hidden transition-all duration-300"
            :class="
              item.isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            "
          >
            <div class="flex items-start gap-4 sm:gap-5 p-4 sm:p-6">
              <span class="text-base sm:text-lg font-semibold text-[#303030]"
                >A.</span
              >
              <div
                class="text-sm sm:text-base text-[#303030] leading-relaxed"
                v-html="item.answer"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import FAQData from "@/assets/data/FAQData.json";

const faqList = ref(FAQData);

const toggleFAQ = (index) => {
  faqList.value[index].isOpen = !faqList.value[index].isOpen;
};
</script>

<style scoped>
/* 링크 스타일만 유지 */
:deep(a) {
  @apply text-blue-500 no-underline font-semibold inline p-0 m-0 transition-colors duration-200 hover:text-blue-600;
}
</style>
