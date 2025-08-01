// src/api/payment.js - 결제 관련 API 모듈
import { apiPost } from "@/utils/http.js";

/**
 * 결제 금액 임시 저장
 * @param {string} orderId - 주문 ID
 * @param {string} amount - 결제 금액
 * @param {string} ticCode - 티켓 코드
 * @returns {Promise<Object>} 응답 데이터 { message, success, orderId }
 */
export async function savePaymentAmountAPI(orderId, amount, ticCode) {
  const response = await apiPost("/api/tosspay/saveAmount", {
    orderId,
    amount,
    ticCode
  });
  
  console.log("[Payment API] saveAmount 응답:", response);
  return response;
}

/**
 * 결제 금액 검증
 * @param {string} orderId - 주문 ID
 * @param {string} amount - 결제 금액
 * @returns {Promise<Object>} 응답 데이터 { message, success }
 */
export async function verifyPaymentAmountAPI(orderId, amount) {
  const response = await apiPost("/api/tosspay/verifyAmount", {
    orderId,
    amount
  });
  
  console.log("[Payment API] verifyAmount 응답:", response);
  return response;
}

/**
 * 결제 승인 확정
 * @param {string} paymentKey - 토스 결제 키
 * @param {string} orderId - 주문 ID
 * @param {string} amount - 결제 금액
 * @param {string} ticCode - 티켓 코드
 * @returns {Promise<Object>} 응답 데이터 { message, success, paymentKey, orderId, amount }
 */
export async function confirmPaymentAPI(paymentKey, orderId, amount, ticCode) {
  const response = await apiPost("/api/tosspay/confirm", {
    paymentKey,
    orderId,
    amount,
    ticCode
  });
  
  console.log("[Payment API] confirmPayment 응답:", response);
  return response;
}