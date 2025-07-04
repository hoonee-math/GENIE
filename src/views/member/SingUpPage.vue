<template>
    <!-- 회원가입 카드 영역 -->
    <div
        class="flex items-center justify-center w-full px-6 md:bg-[#e8f4ff] min-h-screen"
    >
        <!-- 모바일에서는 그림자/테두리 없음, 데스크탑에서는 카드 스타일 -->
        <div
            class="flex flex-col items-center w-full max-w-[448px] p-8 gap-6 bg-white md:rounded-[25px] md:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
        >
            <h2
                class="w-full text-2xl font-bold leading-[150%] text-center tracking-[-0.02em] text-[#303030] m-0 mb-2"
            >
                회원가입
            </h2>

            <div class="flex flex-col items-start w-full gap-4">
                <!-- 이메일 입력 -->
                <div class="w-full">
                    <label
                        class="block w-full text-sm font-semibold leading-[150%] tracking-[-0.02em] text-[#424242] mb-2"
                    >
                        이메일
                    </label>
                    <div class="relative w-full mb-2">
                        <div class="flex items-center">
                            <Icon
                                icon="lucide:user-round"
                                class="absolute left-3 w-4 h-4 text-gray-400 z-10"
                            />
                            <input
                                type="text"
                                placeholder="이메일 입력"
                                v-model="email"
                                :class="[
                                    'w-full border rounded-lg py-4 pl-10 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 hover:shadow-lg hover:-translate-y-0.3 transition-all duration-300 ease-out hover:border-[var(--primary)]',
                                    emailError
                                        ? 'border-red-500 focus:ring-red-500'
                                        : isEmailValid && !emailError
                                        ? 'border-[var(--primary)] focus:ring-[var(--primary)]'
                                        : 'border-gray-200 focus:ring-[var(--primary)]',
                                ]"
                                @input="validateEmail"
                                :disabled="isEmailSent"
                            />
                        </div>
                    </div>
                    <div
                        v-if="emailError"
                        class="text-red-500 text-xs mt-1 text-left pl-1"
                    >
                        {{ emailError }}
                    </div>
                    <button
                        class="w-full h-12 bg-[#0086FF] border-none rounded-lg text-base font-semibold leading-[150%] tracking-[-0.02em] cursor-pointer transition-all duration-300 ease-out focus:outline-none focus:bg-[#0066CC] active:bg-[#004499]"
                        :class="[
                            !isEmailValid || isEmailSent
                                ? 'text-white disabled:cursor-not-allowed disabled:hover:shadow-xl disabled:hover:-translate-y-0.3 disabled:hover:bg-blue-600 disabled:hover:opacity-90 '
                                : 'text-white hover:shadow-xl hover:-translate-y-0.3 hover:bg-[#0066CC] active:bg-[#004499]',
                        ]"
                        @click="sendVerificationEmail"
                        :disabled="!isEmailValid || isEmailSent"
                    >
                        {{ buttonText }}
                    </button>
                </div>

                <!-- 인증코드 확인 -->
                <div class="w-full">
                    <label
                        class="block w-full text-sm font-semibold leading-[150%] tracking-[-0.02em] text-[#424242] mb-2"
                    >
                        인증코드 확인
                    </label>
                    <div
                        class="flex justify-center items-center gap-4 w-full h-11"
                    >
                        <div class="relative w-full">
                            <input
                                type="text"
                                placeholder="인증코드 입력"
                                :class="[
                                    'w-full border rounded-lg py-4 pr-16 pl-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 hover:shadow-lg hover:-translate-y-0.3 transition-all duration-300 ease-out hover:border-[var(--primary)]',
                                    isVerified
                                        ? 'border-[var(--primary)] focus:ring-[var(--primary)]'
                                        : 'border-gray-200 focus:ring-[var(--primary)]',
                                ]"
                                v-model="verificationCode"
                                :disabled="
                                    !isEmailSent ||
                                    isVerified ||
                                    !isTimerRunning
                                "
                            />
                            <span
                                v-if="isTimerRunning && !isVerified"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#424242] text-sm"
                            >
                                {{ formattedTime }}
                            </span>
                        </div>
                        <button
                            class="flex justify-center items-center px-2 gap-2 w-[73px] h-11 border-none rounded-md text-base font-semibold leading-[150%] tracking-[-0.02em] cursor-pointer transition-all duration-300 ease-out"
                            :class="[
                                verificationCode && !isVerified
                                    ? 'bg-[#0086FF] text-white hover:shadow-lg hover:-translate-y-0.3 hover:bg-blue-600'
                                    : 'bg-[#7FC7FF] text-white cursor-not-allowed',
                            ]"
                            :disabled="
                                !verificationCode ||
                                isVerified ||
                                !isTimerRunning
                            "
                            @click="verifyCode"
                        >
                            {{ isVerified ? "완료" : "인증" }}
                        </button>
                    </div>
                    <div
                        v-if="verificationError"
                        class="text-red-500 text-xs mt-1 text-left pl-1"
                    >
                        {{ verificationError }}
                    </div>
                    <div
                        v-if="isVerified"
                        class="text-[var(--primary)] text-xs mt-1 text-left pl-1"
                    >
                        인증이 완료되었습니다!
                    </div>
                </div>

                <!-- 비밀번호 입력 -->
                <div class="w-full">
                    <label
                        class="block w-full text-sm font-semibold leading-[150%] tracking-[-0.02em] text-[#424242] mb-2"
                    >
                        비밀번호 입력
                    </label>
                    <div class="relative w-full mb-2">
                        <Icon
                            icon="lucide:lock-keyhole"
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10"
                        />
                        <input
                            :type="showPassword ? 'text' : 'password'"
                            placeholder="영문•숫자•특수문자 포함 8자 이상"
                            v-model="password"
                            :class="[
                                'w-full border rounded-lg py-4 pl-10 pr-12 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 hover:shadow-lg hover:-translate-y-0.3 transition-all duration-300 ease-out hover:border-[var(--primary)]',
                                passwordError
                                    ? 'border-red-500 focus:ring-red-500'
                                    : isPasswordMatch &&
                                      confirmPassword &&
                                      !passwordError
                                    ? 'border-[var(--primary)] focus:ring-[var(--primary)]'
                                    : 'border-gray-200 focus:ring-[var(--primary)]',
                            ]"
                            @input="validatePassword"
                            @blur="
                                passwordTouched = true;
                                validatePassword();
                            "
                        />
                        <Icon
                            :icon="
                                showPassword
                                    ? 'ic:baseline-remove-red-eye'
                                    : 'ic:outline-remove-red-eye'
                            "
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer transition-all duration-200 hover:text-[var(--primary)]"
                            @click="toggleShowPassword"
                        />
                    </div>
                    <div
                        v-if="passwordError"
                        class="text-red-500 text-xs mt-1 text-left pl-1"
                    >
                        {{ passwordError }}
                    </div>
                </div>

                <!-- 비밀번호 확인 -->
                <div class="w-full">
                    <label
                        class="block w-full text-sm font-semibold leading-[150%] tracking-[-0.02em] text-[#424242] mb-2"
                    >
                        비밀번호 확인
                    </label>
                    <div class="relative w-full mb-2">
                        <Icon
                            icon="lucide:lock-keyhole"
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10"
                        />
                        <input
                            :type="showConfirmPassword ? 'text' : 'password'"
                            placeholder="비밀번호 재입력"
                            v-model="confirmPassword"
                            :class="[
                                'w-full border rounded-lg py-4 pl-10 pr-12 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 hover:shadow-lg hover:-translate-y-0.3 transition-all duration-300 ease-out hover:border-[var(--primary)]',
                                confirmPasswordError
                                    ? 'border-red-500 focus:ring-red-500'
                                    : isPasswordMatch &&
                                      confirmPassword &&
                                      !passwordError
                                    ? 'border-[var(--primary)] focus:ring-[var(--primary)]'
                                    : 'border-gray-200 focus:ring-[var(--primary)]',
                            ]"
                            @input="validateConfirmPassword"
                            @blur="
                                confirmPasswordTouched = true;
                                validateConfirmPassword();
                            "
                        />
                        <Icon
                            :icon="
                                showConfirmPassword
                                    ? 'ic:baseline-remove-red-eye'
                                    : 'ic:outline-remove-red-eye'
                            "
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer transition-all duration-200 hover:text-[var(--primary)]"
                            @click="toggleShowConfirmPassword"
                        />
                    </div>
                    <div
                        v-if="confirmPasswordError"
                        class="text-red-500 text-xs mt-1 text-left pl-1"
                    >
                        {{ confirmPasswordError }}
                    </div>
                    <div
                        v-else-if="
                            isPasswordMatch && confirmPassword && !passwordError
                        "
                        class="text-[var(--primary)] text-xs mt-1 text-left pl-1"
                    >
                        비밀번호가 일치합니다!
                    </div>
                </div>

                <!-- 이름 입력 -->
                <div class="w-full">
                    <label
                        class="block w-full text-sm font-semibold leading-[150%] tracking-[-0.02em] text-[#424242] mb-2"
                    >
                        이름
                    </label>
                    <div class="relative w-full mb-2">
                        <input
                            type="text"
                            placeholder="이름 입력"
                            :class="[
                                'w-full border rounded-lg py-4 px-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 hover:shadow-lg hover:-translate-y-0.3 transition-all duration-300 ease-out hover:border-[var(--primary)]',
                                nameError
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:ring-[var(--primary)]',
                            ]"
                            v-model="username"
                            @input="validateName"
                            @blur="
                                nameTouched = true;
                                validateName();
                            "
                        />
                    </div>
                    <div
                        v-if="nameError"
                        class="text-red-500 text-xs mt-1 text-left pl-1"
                    >
                        {{ nameError }}
                    </div>
                </div>

                <!-- 체크박스 섹션 -->
                <div class="flex justify-start w-full">
                    <div class="flex flex-col gap-5">
                        <div class="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="privacy"
                                checked
                                class="hidden"
                                v-model="privacyChecked"
                            />
                            <label
                                for="privacy"
                                class="w-5 h-5 bg-white border border-[#cccccc] rounded inline-block relative cursor-pointer transition-all duration-200 hover:border-[var(--primary)]"
                                :class="{
                                    'bg-[#7fc7ff] border-[#7fc7ff]':
                                        privacyChecked,
                                }"
                            >
                                <span
                                    v-if="privacyChecked"
                                    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm"
                                    >✓</span
                                >
                            </label>
                            <span
                                class="text-sm font-medium text-[#424242] cursor-pointer transition-all duration-200 hover:underline hover:text-[var(--primary)]"
                                @click="showPrivacyModal = true"
                            >
                                개인정보 처리방침 동의
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked
                                class="hidden"
                                v-model="termsChecked"
                            />
                            <label
                                for="terms"
                                class="w-5 h-5 bg-white border border-[#cccccc] rounded inline-block relative cursor-pointer transition-all duration-200 hover:border-[var(--primary)]"
                                :class="{
                                    'bg-[#7fc7ff] border-[#7fc7ff]':
                                        termsChecked,
                                }"
                            >
                                <span
                                    v-if="termsChecked"
                                    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm"
                                    >✓</span
                                >
                            </label>
                            <span
                                class="text-sm font-medium text-[#424242] cursor-pointer transition-all duration-200 hover:underline hover:text-[var(--primary)]"
                                @click="showTermsModal = true"
                            >
                                이용약관 동의
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 가입완료 버튼 -->
                <button
                    class="w-full h-12 bg-[#0086FF] border-none rounded-lg text-base font-semibold leading-[150%] tracking-[-0.02em] cursor-pointer transition-all duration-300 ease-out focus:outline-none focus:bg-[#0066CC] active:bg-[#004499]"
                    :class="[
                        !isButtonEnabled
                            ? 'text-white cursor-not-allowed disabled:cursor-not-allowed disabled:hover:shadow-xl disabled:hover:-translate-y-0.3 disabled:hover:bg-blue-600 disabled:hover:opacity-90 '
                            : 'text-white hover:shadow-xl hover:-translate-y-0.3 hover:bg-[#0066CC] active:bg-[#004499]',
                    ]"
                    @click="submitForm"
                    :disabled="!isButtonEnabled"
                >
                    가입 완료
                </button>
            </div>
        </div>
    </div>
    <!-- 개인정보 처리방침 모달 -->
    <PrivacyModal
        :isOpen="showPrivacyModal"
        @close="showPrivacyModal = false"
    />
    <!-- 이용 약관 모달 -->
    <TermsModal :isOpen="showTermsModal" @close="showTermsModal = false" />
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import PrivacyModal from "@/components/member/PrivacyModal.vue";
import TermsModal from "@/components/member/TermsModal.vue";
import emailjs from "@emailjs/browser";
import { checkEmailAPI, signUpAPI } from '@/utils/api';

// 모달 관련 상태
const showPrivacyModal = ref(false);
const showTermsModal = ref(false);

// 이메일 인증 관련 변수
const isEmailSent = ref(false);
const verificationCode = ref("");
const verificationError = ref("");
const isVerified = ref(false);
const generatedCode = ref("");
const email = ref("");
const emailError = ref("");
const isSending = ref(false); // 이메일 전송 중 상태

// 비밀번호 관련 상태
const password = ref("");
const confirmPassword = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordTouched = ref(false);
const confirmPasswordTouched = ref(false);

// 이름 관련 상태
const username = ref("");
const nameError = ref("");
const nameTouched = ref(false);

// 타이머 관련 상태
let timerInterval = null;
const isTimerRunning = ref(false);
const remainingTime = ref(180); // 3분(180초)

// 성별 상태 관리
const gender = ref("male"); // 기본값은 남성으로 설정
const privacyChecked = ref(false);
const termsChecked = ref(false);

const selectedOption = ref("");

// 로그인 완료후 페이지 이동
const router = useRouter();

// EmailJS 초기화
onMounted(() => {
    // EmailJS 대시보드에서 확인한 Public Key
    emailjs.init("TMIPicYs3k7a7q2wS");
});

// 컴포넌트 언마운트시 타이머 정리
onUnmounted(() => {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
});

// 계산된 속성들
const isEmailValid = computed(() => {
    return email.value && !emailError.value;
});

const buttonText = computed(() => {
    if (isSending.value) return "전송 중...";
    return isEmailSent.value ? "인증메일이 발송되었습니다." : "인증메일 발송";
});

const buttonStyle = computed(() => {
    if (isSending.value || !isEmailValid.value || isEmailSent.value) {
        return { backgroundColor: "#7FC7FF", color: "#FFFFFF" };
    } else {
        return { backgroundColor: "#0086FF", color: "#FFFFFF" };
    }
});

const formattedTime = computed(() => {
    const minutes = Math.floor(remainingTime.value / 60);
    const seconds = remainingTime.value % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
});

const isPasswordMatch = computed(() => {
    return (
        password.value &&
        confirmPassword.value &&
        password.value === confirmPassword.value &&
        !passwordError.value
    );
});

const isButtonEnabled = computed(() => {
    // 이메일, 비밀번호, 이름이 유효하고
    const isEmailValid = email.value && !emailError.value && isVerified.value; // 이메일 인증 확인 추가
    const isPasswordValid =
        password.value &&
        confirmPassword.value &&
        !passwordError.value &&
        !confirmPasswordError.value;
    const isNameValid = username.value && !nameError.value;

    // 개인정보처리방침, 이용약관 체크가 되었는지 확인
    const isCheckboxesChecked = privacyChecked.value && termsChecked.value;

    // 모든 조건을 만족해야 true 반환
    return (
        isEmailValid && isPasswordValid && isNameValid && isCheckboxesChecked
    );
});

// 이메일 중복확인 함수 (회원가입용)
const sendVerificationEmail = async () => {
    validateEmail();
    if (isEmailValid.value && !isSending.value) {
        // 로딩 상태 표시
        isSending.value = true;

        try {
            // 이메일 중복 체크 API 호출
            const emailCheckResult = await checkEmailAPI(email.value);
            
            // 이메일이 이미 존재하는 경우 (회원가입 불가)
            if (emailCheckResult.exists) {
                emailError.value = "이미 존재하는 이메일입니다.";
                return; // 인증 코드 발송하지 않음
            }

            // 이메일이 존재하지 않는 경우 - 회원가입 가능 → 인증 코드 발송
            generatedCode.value = generateVerificationCode();
            
            const templateParams = {
                to_name: email.value.split("@")[0],
                from_name: "GenieQ",
                message: `인증 코드: ${generatedCode.value}`,
                verification_code: generatedCode.value,
                to_email: email.value,
                reply_to: "no-reply@genieq.com",
            };

            // 이메일 발송 (EmailJS 사용)
            const result = await emailjs.send("service_8820vki","template_oyzgwht",templateParams);

            // 이메일 발송 성공
            isEmailSent.value = true;
            startTimer(); // 타이머 시작

        } catch (error) {
            // 에러 처리
            console.error('이메일 발송 실패:', error);
            emailError.value = "인증 메일 발송에 실패했습니다. 다시 시도해주세요.";
            
        } finally {
            // 로딩 상태 해제
            isSending.value = false;
        }
    }
};

// 테스트용 인증코드 생성 함수
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// 인증코드 검증 함수
const verifyCode = () => {
    if (verificationCode.value === generatedCode.value) {
        isVerified.value = true;
        verificationError.value = "";

        // 인증 성공 시 타이머 정지 & 정리
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        isTimerRunning.value = false; // 타이머 상태 업데이트
    } else {
        verificationError.value = "인증코드가 일치하지 않습니다.";
    }
};

// 타이머 시작 함수
const startTimer = () => {
    isTimerRunning.value = true;
    remainingTime.value = 180; // 3분으로 초기화

    // 기존 타이머가 있으면 정리
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // 타이머 시작
    timerInterval = setInterval(() => {
        remainingTime.value--;

        // 시간이 다 되면 타이머 중지
        if (remainingTime.value <= 0) {
            clearInterval(timerInterval);
            isTimerRunning.value = false;
            isEmailSent.value = false; // 인증 시간 만료
            generatedCode.value = ""; // 코드 초기화
            verificationError.value =
                "인증 시간이 만료되었습니다. 다시 요청해주세요.";
        }
    }, 1000);
};

// 이메일 유효성 검사
const validateEmail = () => {
    if (!email.value) {
        emailError.value = "이메일 형식으로 입력해 주세요";
        return;
    }

    // @을 기준으로 한 구간이 알파벳 or 숫자 or 특수문자 조합으로 이루어져 있는지 체크
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.value)) {
        emailError.value = "이메일 형식으로 입력해 주세요";
    } else {
        emailError.value = "";
    }
};

// 비밀번호 보이기/숨기기 토글
const toggleShowPassword = () => {
    showPassword.value = !showPassword.value;
};

const toggleShowConfirmPassword = () => {
    showConfirmPassword.value = !showConfirmPassword.value;
};

// 비밀번호 유효성 검사
const validatePassword = () => {
    // 입력값이 없고, 아직 사용자가 입력을 시작하지 않았다면 오류 표시하지 않음
    if (!password.value && !passwordTouched.value) {
        passwordError.value = "";
        return;
    }

    // 입력값이 없고, 사용자가 이미 입력을 시작했다면 오류 표시
    if (!password.value && passwordTouched.value) {
        passwordError.value = "비밀번호를 입력해 주세요.";
        return;
    }

    // 8자리 이상 검사
    if (password.value.length < 8) {
        passwordError.value = "비밀번호를 조건에 맞게 입력해 주세요.";
        return;
    }

    // 영문 포함 검사
    const hasLetter = /[a-zA-Z]/.test(password.value);
    // 숫자 포함 검사
    const hasNumber = /[0-9]/.test(password.value);
    // 특수문자 포함 검사
    const hasSpecial = /[!@#$%^&*]/.test(password.value);

    if (!hasLetter || !hasNumber || !hasSpecial) {
        passwordError.value = "비밀번호를 조건에 맞게 입력해 주세요.";
    } else {
        passwordError.value = "";
    }

    // 확인 비밀번호가 있을 경우 일치 여부 확인
    if (confirmPassword.value) {
        validateConfirmPassword();
    }
};

// 비밀번호 확인 유효성 검사
const validateConfirmPassword = () => {
    // 입력값이 없고, 아직 사용자가 입력을 시작하지 않았다면 오류 표시하지 않음
    if (!confirmPassword.value && !confirmPasswordTouched.value) {
        confirmPasswordError.value = "";
        return;
    }

    // 입력값이 없고, 사용자가 이미 입력을 시작했다면 오류 표시
    if (!confirmPassword.value && confirmPasswordTouched.value) {
        confirmPasswordError.value = "비밀번호를 확인해 주세요.";
        return;
    }

    if (password.value !== confirmPassword.value) {
        confirmPasswordError.value = "비밀번호를 확인해 주세요.";
    } else {
        confirmPasswordError.value = "";
    }
};

// 이름 유효성 검사
const validateName = () => {
    // 입력값이 없고, 아직 사용자가 입력을 시작하지 않았다면 오류 표시하지 않음
    if (!username.value && !nameTouched.value) {
        nameError.value = "";
        return;
    }

    // 입력값이 없고, 사용자가 이미 입력을 시작했다면 오류 표시
    if (!username.value && nameTouched.value) {
        nameError.value = "이름을 입력해 주세요.";
        return;
    }

    // 한글만 허용하는 정규식
    const koreanOnly = /^[가-힣]{2,8}$/;

    // 숫자, 특수문자, 공백 포함 검사
    const hasInvalidChar = /[\d\s!@#$%^&*(),.?":{}|<>]/.test(username.value);

    if (hasInvalidChar) {
        nameError.value = "숫자, 특수문자, 공백은 입력할 수 없습니다.";
    } else if (!koreanOnly.test(username.value)) {
        nameError.value = "이름은 2~8자의 한글만 입력 가능합니다.";
    } else {
        nameError.value = "";
    }
};

const isSubmitting = ref(false);

// 폼 제출 함수
const submitForm = async (event) => {
    event.stopPropagation(); // 이벤트 전파 방지
    if (isSubmitting.value) return; // ✅ 중복 실행 방지
    isSubmitting.value = true;
    
    if (isButtonEnabled.value) {
        try {
            // API 요청에 필요한 데이터 구성
            const signUpData = {
                memEmail: email.value,
                memPassword: password.value,
                memName: username.value,
                memGender: gender.value,
                memType: selectedOption.value,
            };

            // 전용 API 함수 사용 (자동 에러 처리)
            const result = await signUpAPI(signUpData);
            
            // 성공 시 처리
            alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
            router.push("/login"); // 로그인 페이지로 이동

        } catch (error) {
            // 에러 처리
            console.error('회원가입 실패:', error);
            
            if (error.message.includes("이미 존재하는 이메일")) {
                alert("이미 등록된 이메일입니다.");
            } else {
                alert("회원가입 처리 중 오류가 발생했습니다: " + error.message);
            }
            
        } finally {
            isSubmitting.value = false; // 상태 초기화
        }
    }
};

// 입력값 변경 시 유효성 검사
watch(email, validateEmail);
watch(password, validatePassword);
watch(confirmPassword, validateConfirmPassword);
watch(username, validateName);
// 인증코드 입력 감시
watch(verificationCode, () => {
    if (verificationError.value) {
        verificationError.value = "";
    }
});
</script>
