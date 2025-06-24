<template>
  <div class="privacy-page">
    <div class="privacy-container">
      <h1>개인정보 처리방침</h1>
      <div class="privacy-box">
        <pre>{{ privacyText }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const privacyText = ref("");
const files = import.meta.glob("@/assets/policy/*.txt", { as: "raw" });

onMounted(async () => {
  try {
    const file = await files["/src/assets/policy/privacy.txt"]();
    privacyText.value = file;
  } catch (error) {
    privacyText.value = "개인정보 처리방침을 불러오는 중 오류가 발생했습니다.";
  }
});
</script>

<style scoped>
.privacy-container {
  height: 1062px;
}
.privacy-box {
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

/* 제목 왼쪽 정렬 */
.privacy-container h1 {
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
