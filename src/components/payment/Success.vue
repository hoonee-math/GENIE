<template>
  <div class="container">
    <div class="payment-card">
      <div v-if="loading" class="loading">
        <img src="@/assets/icons/spinner.svg" alt="로딩 중" class="spinner" />
        <p>결제 정보를 확인 중입니다.</p>
      </div>

      <div v-else>
        <div v-if="valid" class="result success">
          <img src="@/assets/icons/check.svg" alt="결제 성공 아이콘" />
          <h2>결제가 완료되었습니다!</h2>
        </div>
        <div v-else class="result error">
          <img src="@/assets/icons/error.svg" alt="결제 실패 아이콘" />
          <h2>{{ message }}</h2>
        </div>
        <button @click="goHome">홈으로 돌아가기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { verifyPaymentAmountAPI, confirmPaymentAPI } from "@/api/payment.js";

const route = useRoute();
const router = useRouter();

const paymentKey = ref(route.query.paymentKey || "");
const orderId = ref(route.query.orderId || "");
const amount = ref(route.query.amount || "");
const ticCode = ref(route.query.ticCode || "");

const valid = ref(false);
const message = ref("결제 정보를 처리 중입니다…");
const loading = ref(true); 

onMounted(async () => {
  if (!orderId.value || !amount.value) {
    message.value = "유효하지 않은 접근입니다.";
    loading.value = false;
    return;
  }

  try {
    // 1. 결제 금액 검증
    const verifyResult = await verifyPaymentAmountAPI(orderId.value, amount.value);
    console.log("결제 금액 검증 성공:", verifyResult.message);

    // 2. 결제 승인 확정
    const confirmResult = await confirmPaymentAPI(paymentKey.value, orderId.value, amount.value, ticCode.value);
    console.log("결제 승인 완료:", confirmResult.message);

    valid.value = true;
  } catch (error) {
    console.error("결제 처리 중 오류:", error.message || error);
    message.value = error.message || "결제 처리 중 오류가 발생했습니다.";
  } finally {
    loading.value = false;
  }
});

function goHome() {
  router.replace("/");
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.payment-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.result img {
  width: 50px;
  height: 80px;
  margin: auto;
  margin-bottom: 1rem;
}

.result.success h2 {
  color: #000000;
  font-weight: 600;
}

.result.error h2 {
  color: #000000;
  font-weight: 600;
}

button {
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: #007aff;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}

button:hover {
  background-color: #005fcc;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
