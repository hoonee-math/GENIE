<template>
  <div class="flex flex-col gap-5 p-4 sm:p-6">
    <!-- 저장 버튼 -->
    <div class="flex justify-end">
      <BaseButton
        text="저장하기"
        :type="isDataModified ? 'type1' : 'disabled'"
        id="save-button"
        @click="saveUserInfo"
        :disabled="!isDataModified"
      />
    </div>

    <div class="flex flex-col gap-8 sm:gap-10">
      <!-- 기본 정보 -->
      <section class="w-full bg-white rounded-xl p-4 sm:p-5">
        <div class="flex items-center p-2 border-b border-[#e1e1e1] w-full">
          <span
            class="text-lg sm:text-xl font-bold text-[#0086ff] tracking-tight"
            >기본 정보</span
          >
        </div>
        <div class="flex flex-row items-center p-2 gap-3 sm:gap-6 w-full">
          <span
            class="w-[120px] text-sm sm:text-base font-medium text-[#424242]"
            >이름</span
          >
          <input
            class="flex-1 h-10 px-2 border border-[#0086ff] rounded-lg text-[#303030] text-sm sm:text-base"
            v-model="userData.name"
            @input="checkModified"
          />
        </div>
        <div class="flex flex-row items-center p-2 gap-3 sm:gap-6 w-full">
          <span
            class="w-[120px] text-sm sm:text-base font-medium text-[#424242]"
            >이메일</span
          >
          <span class="flex-1 text-sm sm:text-base text-[#303030]">{{
            userData.email
          }}</span>
        </div>
        <div class="flex flex-row items-center p-2 gap-3 sm:gap-6 w-full">
          <span
            class="w-[120px] text-sm sm:text-base font-medium text-[#424242]"
            >비밀번호</span
          >
          <div class="flex items-center gap-3 sm:gap-4 flex-1">
            <span class="text-sm sm:text-base text-[#303030]">****</span>
            <BaseButton
              text="비밀번호 변경"
              type="type3"
              id="pwd-change"
              @click="openPasswordModal"
              class="text-sm sm:text-base"
            />
          </div>
        </div>
      </section>

      <!-- 추가 정보 -->
      <section class="w-full bg-white rounded-xl p-4 sm:p-5">
        <div class="flex items-center p-2 border-b border-[#e1e1e1] w-full">
          <span
            class="text-lg sm:text-xl font-bold text-[#0086ff] tracking-tight"
            >추가 정보</span
          >
        </div>
        <div class="flex flex-row items-center p-2 gap-3 sm:gap-6 w-full">
          <span
            class="w-[120px] text-sm sm:text-base font-medium text-[#424242]"
            >성별</span
          >
          <span class="flex-1 text-sm sm:text-base text-[#303030]">{{
            userData.gender === "male" ? "남성" : "여성"
          }}</span>
        </div>
        <div class="flex flex-row items-center p-2 gap-3 sm:gap-6 w-full">
          <span
            class="w-[120px] text-sm sm:text-base font-medium text-[#424242]"
            >소속</span
          >
          <select
            class="flex-1 h-10 px-2 border border-[#0086ff] rounded-lg text-[#303030] text-sm sm:text-base"
            id="user-type"
            v-model="userData.memType"
            @change="checkModified"
          >
            <option value="초등교사">초등교사</option>
            <option value="중등교사">중등교사</option>
            <option value="고등교사">고등교사</option>
            <option value="학원">학원</option>
            <option value="기업">기업</option>
            <option value="학생">학생</option>
            <option value="학부모">학부모</option>
            <option value="기타">기타</option>
          </select>
        </div>
      </section>
    </div>

    <div
      v-if="isLoading"
      class="fixed top-[200px] left-1/2 -translate-x-1/2 px-5 py-2.5 bg-black/70 text-white rounded z-50"
    >
      정보를 불러오는 중...
    </div>
    <div
      v-if="error"
      class="fixed top-[250px] left-1/2 -translate-x-1/2 px-5 py-2.5 bg-red-600/90 text-white rounded z-50"
    >
      {{ error }}
    </div>

    <div
      class="flex items-center justify-end gap-4 pt-4 mt-4 border-t border-[#ccc]"
    >
      <span
        class="text-base font-medium text-[#5f5f5f] cursor-pointer"
        @click="openWithdrawalWarning"
        >회원 탈퇴</span
      >
      <span
        class="text-base font-medium text-[#0086ff] cursor-pointer"
        @click="handleLogout"
        >로그아웃</span
      >
    </div>
  </div>

  <changePasswordModal
    :isOpen="showPasswordModal"
    @close="closePasswordModal"
    @success-message="handleSuccessMessage"
    @error-message="handleErrorMessage"
  />

  <!-- 회원탈퇴 경고 모달 -->
  <WarningModalComponent
    :isOpen="showWithdrawalWarning"
    title="서비스를 탈퇴하시겠습니까?"
    message="탈퇴 시 남은 이용권은 소멸되며, <br> 회원 정보 및 생성한 데이터는 즉시 파기됩니다."
    cancelText="취소하기"
    confirmText="탈퇴하기"
    @close="closeWithdrawalWarning"
    @confirm="processWithdrawal"
  />

  <!-- 회원탈퇴 완료 확인 모달 -->
  <ConfirmModalComponent
    :isOpen="showWithdrawalComplete"
    title="서비스 탈퇴 완료"
    message="이용해 주셔서 감사합니다. '확인' 버튼을 누르시면 홈으로 이동합니다."
    @close="closeWithdrawalComplete"
    @confirm="redirectAfterWithdrawal"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import changePasswordModal from "@/components/mypage/ChangePasswordModal.vue";
import WarningModalComponent from "@/components/common/WarningModalComponent.vue";
import ConfirmModalComponent from "@/components/common/ConfirmModalComponent.vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAuth } from "@/composables/useAuth";
import { getUserInfoAPI, updateUserNameAPI, updateUserTypeAPI } from '@/api/user';
import { withdrawAPI } from '@/api/auth';

// 비밀번호 변경 모달 상태 관리
const showPasswordModal = ref(false);
const isLoading = ref(false);
const error = ref(null);

// 회원탈퇴 관련 모달 상태 관리
const showWithdrawalWarning = ref(false);
const showWithdrawalComplete = ref(false);

// 데이터 수정 여부 체크 - 여기서 먼저 선언
const isDataModified = ref(false);

// 회원탈퇴 입력 정보
const withdrawalInfo = ref({
  memEmail: "",
  memPassword: "",
});

// 라우터와 스토어 초기화
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { logout } = useAuth();

// 원본 사용자 데이터 저장 (변경 감지용)
const originalUserData = ref({
  name: "",
  memType: "",
});

// 반응형 userData 객체 생성
const userData = ref({
  name: "",
  email: "",
  gender: "",
  memType: "",
});

//수정 여부 확인 함수 구현
const checkModified = () => {
  isDataModified.value =
    userData.value.name !== originalUserData.value.name ||
    userData.value.memType !== originalUserData.value.memType;
};

// 모달 열기
const openPasswordModal = () => {
  showPasswordModal.value = true;
};

// 모달 닫기
const closePasswordModal = () => {
  showPasswordModal.value = false;
};

// 모달 알림 메시지 처리
const handleSuccessMessage = (message) => {
  alert(message);
};

const handleErrorMessage = (message) => {
  alert(message);
};

// 회원탈퇴 모달 열기
const openWithdrawalWarning = () => {
  // 이메일 필드 초기화 - 현재 로그인한 사용자의 이메일로 자동 설정
  withdrawalInfo.value.memEmail = userData.value.email;
  withdrawalInfo.value.memPassword = "";
  showWithdrawalWarning.value = true;
};

// 회원탈퇴 경고 모달 닫기
const closeWithdrawalWarning = () => {
  showWithdrawalWarning.value = false;
};

// 회원탈퇴 진행
const processWithdrawal = async  () => {
  isLoading.value = true;
  error.value = null;

  try {
    // 전용 API 함수 사용 (자동 토큰 갱신 및 에러 처리)
    const result = await withdrawAPI(userData.value.email);

    // 경고 모달 닫기
    showWithdrawalWarning.value = false;

    // 완료 모달 표시
    showWithdrawalComplete.value = true;

  } catch (error) {
    console.error('회원탈퇴 실패:', error);
    alert("회원탈퇴 처리 중 오류가 발생했습니다: " + error.message);
    
  } finally {
    isLoading.value = false;
  }
};

// 회원탈퇴 완료 모달 닫기
const closeWithdrawalComplete = () => {
  showWithdrawalComplete.value = false;
};

// 회원탈퇴 후 리다이렉트
const redirectAfterWithdrawal = () => {
  // ✅ 개선: Store 액션 사용으로 안전한 로그아웃 처리
  authStore.forceLogout(); // Setup Store의 forceLogout 액션 사용
  router.push("/login");
};

const fetchUserInfo = async () => {
    isLoading.value = true;
    
    try {
        // ✅ 실제로 존재하는 함수
        const data = await getUserInfoAPI();
        
        userData.value = {
            name: data.name || "",
            email: data.email || "",
            gender: data.gender || "",
            memType: data.memType || "",
        };
        
        // // 원본 데이터 저장
        // originalUserData.value = {
        //   name: data.name || "",
        //   memType: data.memType || "",
        // };
        
    } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류가 발생했습니다: ',error);
    } finally {
        isLoading.value = false;
    }
};

// 이름 업데이트 함수
const updateName = async () => {
  // 이름이 변경되지 않았으면 업데이트 하지 않음
  if (userData.value.name === originalUserData.value.name) {
    return Promise.resolve();
  }

  try {
    // 전용 API 함수 사용 (자동 토큰 갱신 및 에러 처리)
    const result = await updateUserNameAPI(userData.value.name);
    
    // 성공 시 원본 데이터 업데이트
    originalUserData.value.name = userData.value.name;
    return true;
    
  } catch (error) {
    console.error('이름 업데이트 실패:', error);
    throw new Error(error.message || "이름 업데이트에 실패했습니다");
  }
};

// 소속 업데이트 함수
const updateType = async () => {
  // 소속이 변경되지 않았으면 업데이트 하지 않음
  if (userData.value.memType === originalUserData.value.memType) {
    return Promise.resolve();
  }

  try {
    // 전용 API 함수 사용 (자동 토큰 갱신 및 에러 처리)
    const result = await updateUserTypeAPI(userData.value.memType);
    
    // 성공 시 원본 데이터 업데이트
    originalUserData.value.memType = userData.value.memType;
    return true;
    
  } catch (error) {
    console.error('소속 업데이트 실패:', error);
    throw new Error(error.message || "소속 업데이트에 실패했습니다");
  }
};

// 사용자 정보 저장하는 함수 (이름과 소속을 각각 업데이트)
// 이벤트 중복 실행 방지 플래그
let isSaving = false;

const saveUserInfo = () => {
  // 이미 저장 중이면 실행하지 않음
  if (isSaving) {
    return;
  }

  isSaving = true;
  isLoading.value = true;
  error.value = null;

  // 로그인 상태 확인
  if (!authStore.isAuthenticated) {
    alert("로그인이 필요합니다. 다시 로그인해주세요.");
    router.push("/login");
    isSaving = false;
    isLoading.value = false;
    return;
  }

  // 변경된 항목이 있는지 확인
  const isNameChanged = userData.value.name !== originalUserData.value.name;
  const isTypeChanged =
    userData.value.memType !== originalUserData.value.memType;

  // 변경된 항목이 없으면 알림만 표시
  if (!isNameChanged && !isTypeChanged) {
    alert("변경된 정보가 없습니다.");
    isSaving = false;
    isLoading.value = false;
    return;
  }

  // console.log('변경할 정보:', {
  //   name: isNameChanged ? userData.value.name : '변경 없음',
  //   memType: isTypeChanged ? userData.value.memType : '변경 없음'
  // });

  // 성공 여부 추적
  let successCount = 0;
  const updateCount = (isNameChanged ? 1 : 0) + (isTypeChanged ? 1 : 0);
  let namePromise = Promise.resolve();
  let typePromise = Promise.resolve();

  // 이름 변경이 필요한 경우
  if (isNameChanged) {
    namePromise = updateName()
      .then(() => {
        successCount++;
      })
      .catch((nameError) => {
        throw nameError;
      });
  }

  // 소속 변경이 필요한 경우
  if (isTypeChanged) {
    typePromise = updateType()
      .then(() => {
        successCount++;
      })
      .catch((typeError) => {
        throw typeError;
      });
  }

  // 모든 업데이트 완료 대기
  Promise.all([namePromise, typePromise])
    .then(() => {
      // 모든 업데이트가 성공한 경우에만 성공 메시지 표시
      if (successCount === updateCount) {
        alert("정보가 성공적으로 저장되었습니다.");
      }
    })
    .catch((err) => {
      error.value = `정보를 저장하는 중 오류가 발생했습니다: ${err.message}`;
      alert("정보 저장에 실패했습니다. " + err.message);
    })
    .finally(() => {
      isLoading.value = false;
      isSaving = false; // 저장 상태 초기화
    });
};
// 로그아웃 처리 함수
const handleLogout = () => {
    logout();
};

// 페이지 로드 시 사용자 정보 가져오기
onMounted(() => {
  fetchUserInfo();
});
</script>
