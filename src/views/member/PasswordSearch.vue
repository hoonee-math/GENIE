<template>
    <!-- 모바일에서는 배경 없음, 데스크탑에서는 그라데이션 배경 -->
    <div
        class="flex justify-center items-center w-full min-h-screen p-5 bg-white md:bg-gradient-to-b md:from-[#E8F4FF] md:to-white"
    >
        <!-- 모바일에서는 그림자/테두리 없음, 데스크탑에서는 카드 스타일 -->
        <div
            class="flex flex-col items-center w-full max-w-[435px] p-10 gap-6 bg-white md:rounded-2xl md:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
        >
            <h2
                class="w-full text-2xl font-bold leading-[150%] text-center tracking-[-0.02em] text-[#303030] m-0 mb-2"
            >
                비밀번호 찾기
            </h2>

            <div class="w-full mb-4">
                <label
                    class="block w-full text-base font-semibold leading-[150%] tracking-[-0.02em] text-[#374151] mb-2"
                    >이메일</label
                >
                <div
                    class="relative flex items-center w-full h-[50px] border border-gray-200 rounded-lg mb-2 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.3 hover:border-[var(--primary)]"
                    :class="{ 'border-red-500': emailError }"
                >
                    <Icon
                        icon="lucide:user-round"
                        class="w-4 h-4 ml-3 text-[#BDBDBD]"
                    />
                    <input
                        type="text"
                        placeholder="이메일을 입력하세요."
                        v-model="email"
                        class="flex-1 h-full px-3 border-none text-base leading-7 tracking-[-0.02em] text-[#424242] bg-transparent focus:outline-none placeholder-gray-400"
                        @input="validateEmail"
                    />
                </div>
                <div
                    v-if="emailError"
                    class="text-red-500 text-xs mt-1 text-left pl-1"
                >
                    {{ emailError }}
                </div>
                <button
                    class="w-full h-12 rounded-lg bg-[#303030] text-white text-base font-semibold transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-0.3 mt-2 mb-2 disabled:cursor-not-allowed"
                    @click="sendVerificationEmail"
                    :disabled="!isEmailValid || isEmailSent"
                >
                    {{ buttonText }}
                </button>
            </div>

            <div class="w-full mb-4">
                <label
                    class="block w-full text-base font-semibold leading-[150%] tracking-[-0.02em] text-[#374151] mb-2"
                    >인증코드 확인</label
                >
                <div class="flex items-center gap-4 w-full h-11">
                    <div
                        class="relative w-full transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.3"
                        :class="{ 'border-[#0086FF]': isVerified }"
                    >
                        <input
                            type="text"
                            placeholder="인증코드를 입력하세요."
                            class="w-full p-2 pr-[60px] border border-gray-200 rounded-md h-[50px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-300 ease-out hover:shadow-xl hover:border-[var(--primary)] disabled:bg-gray-50 disabled:cursor-not-allowed"
                            v-model="verificationCode"
                            :disabled="
                                !isEmailSent || isVerified || !isTimerRunning
                            "
                        />
                        <span
                            v-if="isTimerRunning && !isVerified"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#424242] text-sm"
                            >{{ formattedTime }}</span
                        >
                    </div>
                    <button
                        class="w-[73px] h-11 rounded-md text-base font-semibold text-white transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.3 hover:scale-[1.02] disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:scale-100"
                        :class="
                            verificationCode && !isVerified
                                ? 'bg-[#0086FF] hover:opacity-90'
                                : 'bg-gray-400 cursor-not-allowed'
                        "
                        :disabled="
                            !verificationCode || isVerified || !isTimerRunning
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
                    class="text-[#0086FF] text-xs mt-1 text-left pl-1"
                >
                    인증이 완료되었습니다!
                </div>
            </div>

            <button
                class="w-full h-12 rounded-lg text-base font-semibold text-white transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-0.3 hover:scale-[1.02] disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:scale-100"
                :class="
                    isVerified
                        ? 'bg-[#0086FF] hover:opacity-90'
                        : 'bg-[#7fc7ff] cursor-not-allowed'
                "
                @click="sendTempPassword"
                :disabled="!isVerified"
            >
                비밀번호 찾기
            </button>
        </div>
    </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { checkEmailAPI, resetPasswordAPI } from '@/utils/api';
const router = useRouter();
import emailjs from "@emailjs/browser";
const email = ref("");
const emailError = ref("");

// 이메일 인증 관련 변수
const isEmailSent = ref(false);
const verificationCode = ref("");
const verificationError = ref("");
const isVerified = ref(false);
const generatedCode = ref("");
const isSending = ref(false); // 이메일 전송 중 상태

// 타이머 관련 상태
const isTimerRunning = ref(false);
const remainingTime = ref(180); // 3분(180초)
const formattedTime = computed(() => {
    const minutes = Math.floor(remainingTime.value / 60);
    const seconds = remainingTime.value % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
});

let timerInterval = null; // 이 선언이 누락됨

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
        return { backgroundColor: "#9ca3af", color: "#FFFFFF" };
    } else {
        return { backgroundColor: "#303030", color: "#FFFFFF" };
    }
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
    // 모든 조건을 만족해야 true 반환
    return isEmailValid;
});

// 데이터베이스에 존재하는 이메일만 인증 코드 발송하도록 수정
const sendVerificationEmail = async () => {
    validateEmail();
    if (isEmailValid.value && !isSending.value) {
        // 로딩 상태 표시
        isSending.value = true;

        try {
            // 이메일 존재 여부 확인 (전용 API 함수 사용)
            const emailCheckResult = await checkEmailAPI(email.value);
            
            // 이메일이 존재하지 않는 경우
            if (!emailCheckResult.exists) {
                throw new Error("존재하지 않는 이메일입니다.");
            }

            // 이메일이 존재하는 경우 - 인증 코드 생성 및 발송 진행
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
            const result = await emailjs.send(
                "service_8820vki",
                "template_oyzgwht",
                templateParams
            );

            // 이메일 발송 성공
            isEmailSent.value = true;
            startTimer(); // 타이머 시작

        } catch (error) {
            // 에러 처리
            console.error('이메일 발송 실패:', error);
            
            if (error.message === "존재하지 않는 이메일입니다.") {
                emailError.value = "존재하지 않는 이메일입니다.";
            } else {
                emailError.value = "인증 메일 발송에 실패했습니다. 다시 시도해주세요.";
            }

            // 상태 초기화
            isEmailSent.value = false;
            generatedCode.value = "";
            
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

watch(email, validateEmail);
// 인증코드 입력 감시
watch(verificationCode, () => {
    if (verificationError.value) {
        verificationError.value = "";
    }
});

// 임시 비밀번호 생성 함수
const generateTempPassword = () => {
    // 8자리 이상, 영문 + 숫자 + 특수문자 조합
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*";

    // 각 타입에서 최소 1개 이상 포함되도록
    let password = "";
    password += letters.charAt(Math.floor(Math.random() * letters.length));
    password += letters.charAt(Math.floor(Math.random() * letters.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += specialChars.charAt(
        Math.floor(Math.random() * specialChars.length)
    );

    // 추가 랜덤 문자 (길이를 8자 이상으로)
    const allChars = letters + numbers + specialChars;
    for (let i = 0; i < 5; i++) {
        password += allChars.charAt(
            Math.floor(Math.random() * allChars.length)
        );
    }

    // 문자열 섞기
    return password
        .split("")
        .sort(() => 0.5 - Math.random())
        .join("");
};

// 임시 비밀번호 발송 함수
const sendTempPassword = async () => {
    // 이메일 인증이 완료되었는지 확인
    if (!isVerified.value) {
        alert("이메일 인증을 먼저 완료해주세요.");
        return;
    }

    // 임시 비밀번호 생성
    const tempPassword = generateTempPassword();

    // 로딩 상태 표시
    isSending.value = true;

    try {
        // 서버에 임시 비밀번호 설정 (전용 API 함수 사용)
        await resetPasswordAPI(email.value, tempPassword);

        // EmailJS로 이메일 전송
        const templateParams = {
            to_name: email.value.split("@")[0],
            from_name: "GenieQ",
            verification_code: tempPassword, // 임시 비밀번호를 verification_code로 전달
            to_email: email.value,
            reply_to: "no-reply@genieq.com",
        };

        // 이메일 발송
        await emailjs.send("service_8820vki", "template_ka2ltcr", templateParams);

        // 성공 시 다음 페이지로 이동
        router.push({
            path: "/temppasswordnotice",
            query: { email: email.value },
        });

    } catch (error) {
        console.error('임시 비밀번호 처리 실패:', error);
        
        if (error.message.includes("비밀번호 재설정 실패")) {
            alert("서버에서 비밀번호 변경에 실패했습니다: " + error.message);
        } else {
            alert("임시 비밀번호 발송에 실패했습니다. 다시 시도해주세요.");
        }
        
    } finally {
        isSending.value = false;
    }
};
</script>
