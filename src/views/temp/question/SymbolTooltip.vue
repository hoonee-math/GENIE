<template>
  <div>
    <div
      class="p-2 bg-white text-[#424242] flex items-center justify-around h-[40px] w-[140px] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
    >
      <span
        v-for="(symbol, index) in symbols"
        :key="index"
        class="flex justify-center items-center w-[28px] h-[32px] cursor-pointer text-[25px] text-[#424242] hover:text-[#0086ff] transition-colors duration-200"
        @click="onSymbolClick(symbol)"
      >
        {{ symbol }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "SymbolTooltip",
  props: {
    message: {
      type: String,
      default: "empty",
    },
    width: {
      type: String,
      default: "auto",
    },
    symbolType: {
      type: String,
      default: "㉠",
    },
  },
  computed: {
    symbols() {
      // 메시지를 개별 문자로 분리
      return this.message.split("");
    },
  },
  methods: {
    onSymbolClick(symbol) {
      // 클릭된 심볼을 부모 컴포넌트로 전달
      this.$emit("symbol-click", symbol);
    },
  },
};
</script>
