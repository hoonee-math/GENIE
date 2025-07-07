<template>
  <BaseModal :isOpen="isOpen" width="435px" height="533px" @close="closeModal">
    <div class="modal-container">
      <div class="pwd-icon">
        <div class="pwd-circle">
          <div class="pwd-inner-circle">
            <Icon
              icon="mdi:password-outline"
              class="pwd-icon-symbol"
              width="24"
              height="24"
            />
          </div>
        </div>
      </div>
      <div class="modal-title">비밀번호 변경</div>
      <form class="pwd-form" @submit.prevent="changePassword">
        <div class="pwd-input-group">
          <label>현재 비밀번호 *</label>
          <div
            class="input-container"
            :class="{ 'error-border': currentPasswordError }"
          >
            <input
              v-model="currentPassword"
              :type="showPassword.current ? 'text' : 'password'"
              placeholder="비밀번호 입력"
              @input="validateCurrentPassword"
            />
            <Icon
              :icon="
                showPassword.current
                  ? 'basil:eye-outline'
                  : 'basil:eye-closed-outline'
              "
              width="24px"
              height="24px"
              class="eye-icon"
              @click="togglePasswordVisibility('current')"
            />
          </div>
          <div class="error-area">
            <span class="error-text" v-if="currentPasswordError">{{
              currentPasswordError
            }}</span>
          </div>
        </div>
        <div class="pwd-input-group">
          <label>새로운 비밀번호 *</label>
          <div
            class="input-container"
            :class="{ 'error-border': newPasswordError }"
          >
            <input
              v-model="newPassword"
              :type="showPassword.new ? 'text' : 'password'"
              placeholder="새로운 비밀번호 입력"
              @input="validateNewPassword"
            />
            <Icon
              :icon="
                showPassword.new
                  ? 'basil:eye-outline'
                  : 'basil:eye-closed-outline'
              "
              width="24px"
              height="24px"
              class="eye-icon"
              @click="togglePasswordVisibility('new')"
            />
          </div>
          <div class="error-area">
            <span class="error-text" v-if="newPasswordError">{{
              newPasswordError
            }}</span>
            <p class="pwd-hint" v-else>
              8자리 이상, 영문+숫자+특수문자(@#$%^&*) 조합
            </p>
          </div>
        </div>

        <div class="pwd-input-group">
          <label>새로운 비밀번호 확인 *</label>
          <div
            class="input-container"
            :class="{
              'error-border': isPasswordMismatch,
              'success-border': isPasswordMatch,
            }"
          >
            <input
              v-model="confirmPassword"
              :type="showPassword.confirm ? 'text' : 'password'"
              placeholder="새로운 비밀번호 입력"
              @input="validateConfirmPassword"
            />
            <Icon
              :icon="
                showPassword.confirm
                  ? 'basil:eye-outline'
                  : 'basil:eye-closed-outline'
              "
              width="24px"
              height="24px"
              class="eye-icon"
              @click="togglePasswordVisibility('confirm')"
            />
          </div>
          <div class="error-area">
            <span class="error-text" v-if="isPasswordMismatch"
              >비밀번호가 일치하지 않습니다.</span
            >
            <span class="success-text" v-if="isPasswordMatch"
              >비밀번호가 일치합니다.</span
            >
          </div>
        </div>
        <!-- 버튼 영역 -->
        <div class="modal-footer">
          <BaseButton
            text="닫기"
            type="type3"
            width="187.5px"
            height="46px"
            @click="closeModal"
          />
          <BaseButton
            text="비밀번호 변경"
            type="type1"
            width="187.5px"
            height="46px"
            :disabled="!isButtonEnabled || isLoading"
            :loading="isLoading"
            @click="changePassword"
          />
        </div>
      </form>
    </div>
  </BaseModal>

  <!-- 비밀번호 변경 완료 확인 모달 -->
  <ConfirmModalComponent
    :isOpen="showPasswordChangeComplete"
    title="확인"
    message="비밀번호가 성공적으로 변경되었습니다."
    @close="closePasswordChangeComplete"
    @confirm="redirectAfterPasswordChange"
  />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import { Icon } from "@iconify/vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import ConfirmModalComponent from "@/components/common/ConfirmModalComponent.vue";
import { apiPatch } from "@/utils/http";

const emit = defineEmits([
  "close",
  "success-message",
  "error-message",
  "show-confirm-modal",
]);
const props = defineProps({
  isOpen: Boolean,
});

// 라우터 및 인증 스토어 초기화
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const showPassword = ref({ current: false, new: false, confirm: false });
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const currentPasswordError = ref("");
const newPasswordError = ref("");
const error = ref(null);
const showPasswordChangeComplete = ref(false); // 비밀번호 변경 완료 모달 표시 여부

const closeModal = () => {
  emit("close");
  resetForm();
};

const resetForm = () => {
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
  currentPasswordError.value = "";
  newPasswordError.value = "";
  error.value = null;
};

// 비밀번호 변경 완료 모달 관련 함수
const closePasswordChangeComplete = () => {
  showPasswordChangeComplete.value = false;
};

const redirectAfterPasswordChange = () => {
  showPasswordChangeComplete.value = false;
  // 필요한 경우 리다이렉트 처리
};

const togglePasswordVisibility = (field) => {
  showPassword.value[field] = !showPassword.value[field];
};

const isPasswordMismatch = computed(() => {
  return (
    newPassword.value !== "" &&
    confirmPassword.value !== "" &&
    newPassword.value !== confirmPassword.value
  );
});

const isPasswordMatch = computed(() => {
  return (
    newPassword.value !== "" &&
    confirmPassword.value !== "" &&
    newPassword.value === confirmPassword.value
  );
});

const isButtonEnabled = computed(() => {
  return (
    currentPassword.value.trim() !== "" &&
    newPassword.value.trim() !== "" &&
    confirmPassword.value.trim() !== "" &&
    isPasswordMatch.value &&
    !newPasswordError.value
  );
});

// 현재 비밀번호 검증 함수
const validateCurrentPassword = () => {
  currentPasswordError.value = "";
  if (!currentPassword.value) {
    currentPasswordError.value = "현재 비밀번호를 입력해주세요.";
    return false;
  }
  return true;
};

// 비밀번호 변경 함수
const changePassword = async () => {
  // 폼 제출 방지
  event?.preventDefault();

  // 에러 초기화
  currentPasswordError.value = "";
  newPasswordError.value = "";
  error.value = null;

  // 현재 비밀번호 검증
  if (!validateCurrentPassword()) {
    return;
  }

  // 인증 상태 확인
  if (!authStore.isAuthenticated) {
    emit("error-message", "로그인이 필요합니다. 다시 로그인해주세요.");
    router.push({ path: "/login", query: { redirect: route.fullPath } });
    return;
  }

  // 비밀번호 정규식 검증 (8자리 이상, 영문+숫자+특수문자(@#$%^&*) 조합)
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*]{8,}$/;
  if (!passwordRegex.test(newPassword.value)) {
    newPasswordError.value =
      "8자리 이상, 영문+숫자+특수문자(@#$%^&*) 조합이어야 합니다.";
    return;
  }

  // 비밀번호 변경 요청 보내기
  isLoading.value = true;

  try {
    // 요청 데이터
    const requestData = {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    };

    // API 요청 (자동 토큰 갱신 및 401 에러 처리)
    const responseData = await apiPatch('/api/info/update/password', requestData);

    // 성공 시 모달 닫기 및 완료 모달 표시
    closeModal();
    showPasswordChangeComplete.value = true;

  } catch (error) {
    // 에러 타입별 처리
    if (error.message.includes('비밀번호가 일치하지 않습니다') || 
        error.status === 400 || error.status === 403) {
      
      // 현재 비밀번호 오류 처리
      currentPasswordError.value = "비밀번호가 일치하지 않습니다.";
      emit("error-message", "비밀번호가 일치하지 않습니다.");

      // 입력 필드 스타일 변경
      const currentPasswordField = document.querySelector(
        ".pwd-input-group:first-child .input-container"
      );
      if (currentPasswordField) {
        currentPasswordField.classList.add("error-border");
      }
    } else {
      // 기타 오류 처리
      error.value = error.message || "비밀번호 변경 중 오류가 발생했습니다.";
      emit("error-message", error.value);
    }
  } finally {
    // 로딩 상태 해제
    isLoading.value = false;
  }
};

// 비밀번호 검증 함수
const validateNewPassword = () => {
  newPasswordError.value = "";

  // 길이 검사
  if (newPassword.value.length < 8) {
    newPasswordError.value = "8자리 이상이어야 합니다.";
    return false;
  }

  // 영문 포함 검사
  const hasLetter = /[a-zA-Z]/.test(newPassword.value);
  if (!hasLetter) {
    newPasswordError.value = "영문을 포함해야 합니다.";
    return false;
  }

  // 숫자 포함 검사
  const hasNumber = /\d/.test(newPassword.value);
  if (!hasNumber) {
    newPasswordError.value = "숫자를 포함해야 합니다.";
    return false;
  }

  // 특수문자 포함 검사
  const hasSpecial = /[@#$%^&*]/.test(newPassword.value);
  if (!hasSpecial) {
    newPasswordError.value = "특수문자(@#$%^&*)를 포함해야 합니다.";
    return false;
  }

  return true;
};

// 비밀번호 확인 검증 함수
const validateConfirmPassword = () => {
  if (newPassword.value !== confirmPassword.value) {
    return false;
  }
  return true;
};

// 컴포넌트 마운트 시 로그인 상태 확인 및 얼럿 방지 설정
onMounted(() => {
  if (!authStore.isAuthenticated) {
    // console.log('인증 상태 없음: 로그인이 필요합니다');
  }

  // 브라우저의 기본 alert 차단
  // 1. 처리되지 않은 Promise 거부 이벤트 가로채기
  window.onunhandledrejection = (event) => {
    event.preventDefault();
    // console.error('처리되지 않은 Promise 거부:', event.reason);
  };

  // 2. window.onerror 이벤트 가로채기
  window.onerror = (message, source, lineno, colno, error) => {
    // console.error('전역 오류 발생:', { message, source, lineno, colno, error });
    return true; // 기본 오류 처리 방지
  };

  // 3. console.error 재정의 (원본 기능 유지하면서 alert 방지)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    return true; // alert 방지
  };

  // 4. window.alert, window.confirm, window.prompt 메서드 무력화
  window.alert = function (message) {
    // console.log('Alert 차단됨:', message);
    return true;
  };

  window.confirm = function (message) {
    // console.log('Confirm 차단됨:', message);
    return true;
  };

  window.prompt = function (message, defaultValue) {
    // console.log('Prompt 차단됨:', message);
    return defaultValue || "";
  };
});
</script>

<style scoped>
.modal-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pwd-icon {
  align-self: center;
}

/* 잠금 아이콘 스타일 */
.pwd-circle {
  width: 60px;
  height: 60px;
  background-color: #7fc7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pwd-inner-circle {
  width: 40px;
  height: 40px;
  background-color: #7fc7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pwd-icon-symbol {
  color: #0086ff;
}

.modal-title {
  align-self: start;
  font-weight: 700;
  font-size: 20px;
  line-height: 150%;
  letter-spacing: -2%;
  color: #424242;
}

.pwd-input-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-weight: 700;
  font-size: 16px;
  line-height: 28px;
  color: #424242;
}

.input-container {
  width: 387px;
  height: 44px;
  display: flex;
  align-items: flex-start;
  border: 1px solid #757575;
  border-radius: 6px;
  padding: 8px 12px;
}

input {
  font-weight: 400;
  font-size: 16px;
  line-height: 28px;
  border: none;
  outline: none;
  flex-grow: 1;
  align-self: center;
}

.eye-icon {
  cursor: pointer;
  color: #424242;
  align-self: center;
}

.error-area {
  height: 18px;
}

.pwd-hint {
  font-weight: 400;
  font-size: 13px;
  line-height: 150%;
  letter-spacing: -2%;
  color: #757575;
}

.error-border {
  border-color: #ff4040 !important;
}

.success-border {
  border-color: #28a745 !important;
}

.error-text {
  color: #ff4040;
  font-weight: 400;
  font-size: 13px;
  line-height: 150%;
}

.success-text {
  color: #28a745;
  font-weight: 400;
  font-size: 13px;
  line-height: 150%;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 15px;
}
</style>
