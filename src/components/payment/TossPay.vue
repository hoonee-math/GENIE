<template class="tosspay-container"></template>

<script setup>
import { ref, onMounted } from "vue";
import { savePaymentAmountAPI } from "@/api/payment.js";

const props = defineProps({
  defaultAmount: { type: String, required: true },
  orderName: { type: String, required: true },
  customerEmail: { type: String, default: "customer123@gmail.com" },
  customerName: { type: String, default: "김토스" },
  ticCode: { type: String, required: true },
});

const orderId = ref("");

const requestTossPayment = async () => {
  orderId.value = generateRandomString();

  const amount = props.defaultAmount;

  try {
    const result = await savePaymentAmountAPI(orderId.value, amount, props.ticCode);
    console.log("[TossPay] saveAmount 성공:", result.message);
  } catch (error) {
    console.error("[TossPay] saveAmount 실패:", error.message || error);
    alert(`결제 초기화에 실패했습니다: ${error.message || "다시 시도해주세요."}`);
    return;
  }

  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || "test_ck_jExPeJWYVQbme15w45pQr49R5gvN";
  const customerKey = generateRandomString();
  const tossPayments = window.TossPayments(clientKey);
  const payment = tossPayments.payment({ customerKey });

  try {
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
    console.warn("[TossPay] 사용자 취소 또는 오류 발생", err);
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
