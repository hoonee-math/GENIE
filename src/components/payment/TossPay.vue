<template class="tosspay-container"></template>

<script setup>
import { ref, onMounted } from "vue";
import { apiPost } from "@/utils/http";

const props = defineProps({
  defaultAmount: { type: String, required: true },
  orderName: { type: String, required: true },
  customerEmail: { type: String, default: "customer123@gmail.com" },
  customerName: { type: String, default: "김토스" },
  ticCode: { type: String, required: true },
});

const orderId = ref("");

const requestTossPayment = async () => {
  try {
    orderId.value = generateRandomString();
    const amount = props.defaultAmount;

    // 1. 결제 정보 임시 저장
    const response = await apiPost("/api/tosspay/saveAmount", {
        orderId: orderId.value,
        amount: amount,
        ticCode: props.ticCode,
    });

    console.log("[TossPay] saveAmount response:", response);
    
    // 응답 검증
    if (!response.success) {
      console.error("[TossPay] saveAmount 실패:", response.message);
      alert("결제 정보 저장에 실패했습니다: " + response.message);
      return;
    }

    // 2. 토스페이먼츠 결제 위젯 초기화
    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || "test_ck_jExPeJWYVQbme15w45pQr49R5gvN";
    const customerKey = generateRandomString();
    const tossPayments = window.TossPayments(clientKey);
    const payment = tossPayments.payment({ customerKey });

    console.log('[TossPay] 토스페이 결제 요청 시작:', payment);

    // 3. 결제 요청
    await payment.requestPayment({
      method: "CARD",
      amount: {
        currency: "KRW",
        value: amount,
      },
      orderId: orderId.value,
      orderName: props.orderName,
      successUrl: window.location.origin + "/tossPay/success",
      failUrl: window.location.origin + "/tossPay/fail",
      customerEmail: props.customerEmail,
      customerName: props.customerName,
      customerMobilePhone: "01012341234",
      card: {
        useEscrow: false,
        flowMode: "DEFAULT",
        useCardPoint: false,
        useAppCardOnly: false,
      },
    });
    
  } catch (err) {
    console.error("[TossPay] 결제 처리 중 오류:", err);
    
    if (err.name === 'APIError') {
      alert("결제 처리 중 오류가 발생했습니다: " + err.message);
    } else {
      console.warn("[TossPay] 사용자 취소 또는 토스페이먼츠 오류:", err);
      // 토스페이먼츠 오류는 사용자에게 알리지 않음 (취소일 가능성 높음)
    }
  }
};

defineExpose({ requestTossPayment });

function generateRandomString() {
  return window.btoa(Math.random()).slice(0, 20);
}
</script>

<style scoped>
.tosspay-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  padding: 3rem;
  border-radius: 26px;
  overflow-y: auto;
  max-height: 80vh;
  max-width: 660px;
}
</style>
