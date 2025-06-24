<template>
  <div v-if="isVisible" :style="{ width }">
    <div
      class="bg-[#333] text-white px-4 py-2.5 pr-10 relative flex items-center"
    >
      <span
        class="h-6 font-pretendard font-light text-base leading-[150%] tracking-[-0.02em] text-white"
      >
        {{ message }}
      </span>
      <button
        class="absolute right-4 bg-transparent border-none text-white text-xl cursor-pointer font-light"
        @click="hideMessage"
      >
        ✕
      </button>
    </div>
    <div
      class="absolute -bottom-3 right-12 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[15px] border-l-transparent border-r-transparent border-t-[#333]"
    ></div>
  </div>
</template>

<script>
export default {
  name: "PlainTooltip",
  props: {
    message: {
      type: String,
      default: "개발자님, 메시지를 입력해주세요.",
    },
    width: {
      type: String,
      default: "auto",
    },
  },
  data() {
    return {
      isVisible: true,
    };
  },
  methods: {
    hideMessage() {
      this.isVisible = false;
      this.$emit("close");
    },
  },
};
</script>
