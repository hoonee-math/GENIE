<template>
  <div class="terms-page">
    <div class="terms-container">
      <h1>이용약관</h1>
      <div class="terms-box">
        <pre>{{ termsText }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const termsText = ref("");
const files = import.meta.glob('@/assets/policy/*.txt', { query: '?raw', import: 'default' })

onMounted(async () => {
  try {
    const file = await files["/src/assets/policy/terms.txt"]();
    termsText.value = file;
  } catch (error) {
    termsText.value = "이용약관을 불러오는 중 오류가 발생했습니다.";
  }
});
</script>

<style scoped>
.terms-container {
  height: 1062px;
}
.terms-box {
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px;
  gap: 8px;

  position: absolute;
  width: 1472px;
  height: 855px;
  left: 292px;
  top: 126px;

  background: #ffffff;
  border: 1px solid #0086ff;
  border-radius: 12px;
}

.terms-container h1 {
  position: absolute;
  height: 36px;
  left: 292px;
  top: 66px;

  font-family: "Pretendard";
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 150%;

  letter-spacing: -0.02em;
  color: #000000;
}
</style>
