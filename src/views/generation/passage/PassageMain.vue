<template>
    <div class="flex flex-col gap-8 p-0 md:p-8 box-border w-full">
        <div
            class="flex flex-col items-start gap-4 w-full px-4 md:mt-0 bg-white md:bg-[#f9fafb]"
        >
            <p
                class="hidden md:block min-w-[120px] font-pretendard font-bold text-2xl md:text-xl leading-[150%] tracking-[-0.02em] text-[#16252d]"
            >
                지문 생성
            </p>

            <div class="w-full">
                <!-- 데스크탑 -->
                <div class="hidden md:flex flex-row gap-6 w-full bg-[#f9fafb]">
                    <CreatePassageMain
                        @input-change="updateInput"
                        @category-change="updateCategory"
                        @title-change="updateTitle"
                        @credit-update="onCreditUpdate"
                        @handle-create-passage="handleCreatePassage"
                    />
                    <PaymentUsage
                        ref="paymentUsageRef"
                        @credit-update="onCreditUpdate"
                    />
                </div>

                <!-- 모바일 -->
                <div class="block md:hidden bg-white">
                    <CreatePassageMainMobile
                        @input-change="updateInput"
                        @category-change="updateCategory"
                        @title-change="updateTitle"
                        @credit-update="onCreditUpdate"
                        @handle-create-passage="handleCreatePassage"
                    />
                </div>
            </div>

            <!-- 데스크탑 버튼 -->
            <div
                class="hidden md:flex flex-col sm:flex-row justify-end gap-4 w-full"
            >
                <BaseButton
                    id="reset_button"
                    text="초기화"
                    type="type2"
                    width="100%"
                    sm:width="248px"
                    height="54px"
                    :disabled="!hasContent"
                    @click="resetButton"
                    class="w-full sm:w-auto hover:shadow-xl active:scale-[0.98]"
                />
                <BaseButton
                    id="create_button"
                    text="지문 생성하기"
                    type="type2"
                    width="100%"
                    sm:width="248px"
                    height="54px"
                    :disabled="!isButtonEnabled"
                    @click="handleCreatePassage"
                    class="w-full sm:w-auto hover:shadow-xl active:scale-[0.98]"
                />
            </div>
        </div>

        <!-- 공통 - 확인 모달 추가 -->
        <WarningModalComponent
            :isOpen="isConfirmModalOpen"
            title="지문을 생성하시겠습니까?"
            message="생성 시 이용권이 차감되며,<br>오타가 있을 경우 AI가 잘못된 지문을 생성할 수 있습니다. <br>"
            cancelText="취소하기"
            confirmText="생성하기"
            @close="closeConfirmModal"
            @confirm="confirmCreatePassage"
        />

        <!-- 공통 - 작업 공간 부족 모달 추가 -->
        <ConfirmModalComponent
            :isOpen="isListLimitModalOpen"
            title="최근 작업 내역이 꽉 찼습니다."
            message="생성할 문항을 저장할 공간이 부족합니다. 최근 작업 내역에서 공간을 확보하고 다시 시도하세요."
            @close="isListLimitModalOpen = false"
            @confirm="isListLimitModalOpen = false"
        />

        <!-- 공통 - 로딩 표시 추가 -->
        <LoadingModal :isOpen="isLoading" :message="loadingMessage" />
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import CreatePassageMain from "@/views/generation/passage/CreatePassageMain.vue";
import PaymentUsage from "@/views/generation/PaymentUsage.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import ConfirmModalComponent from "@/components/common/ConfirmModalComponent.vue";
import WarningModalComponent from "@/components/common/WarningModalComponent.vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import LoadingModal from "@/components/common/LoadingModal.vue";
import CreatePassageMainMobile from "@/views/generation/passage/CreatePassageMainMobile.vue";
import { apiGet, apiPost } from '@/utils/api';

// 라우터 및 인증 스토어
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 사용자 입력 관련 상태
const titleText = ref("");
const inputText = ref("");
const selectedCategory = ref("인문");
const passageTitle = ref("");
const createPassageMainRef = ref(null);
const paymentUsageRef = ref(null);

// UI 상태 관리
const isConfirmModalOpen = ref(false);
const isLoading = ref(false);
const loadingMessage = ref(
    "지문을 생성 중입니다.\n생성까지 최대 3분이 소요될 수 있습니다."
);

// 중복 요청 방지를 위한 처리 상태 플래그 추가
const isProcessing = ref(false);

// 버튼 활성화 상태 계산 - authStore.userTicketCount getter 사용
const isButtonEnabled = computed(() => {
    const ticketCount = authStore.userTicketCount;
    // 입력 텍스트가 있고 보유 이용권이 0보다 큰 경우 활성화
    const isEnabled =
        inputText.value.length >= 1 &&
        titleText.value.length >= 1 &&
        ticketCount > 0;
    return isEnabled;
});

// 내용 존재 여부 계산
const hasContent = computed(() => {
    return inputText.value && inputText.value.trim().length > 0;
});

// PaymentUsage 컴포넌트 - 이용권 업데이트 이벤트
const onCreditUpdate = (count) => {
    authStore.updateTicketCount().then((newCount) => {});
};

// 제목, 제재, 분야 업데이트
const updateTitle = (text) => {
    titleText.value = text;
};
const updateInput = (text) => {
    inputText.value = text;
};
const updateCategory = (category) => {
    selectedCategory.value = category;
};

// 초기화 함수
const resetButton = () => {
    inputText.value = "";
    if (createPassageMainRef.value) {
        createPassageMainRef.value.resetForm();
    }
};

// 지문 생성하기 버튼 클릭 핸들러
const handleCreatePassage = async () => {
    try {
        const titleElement = document.querySelector("#passage-title");
        passageTitle.value = titleElement ? titleElement.value : "지문 작업";
        // console.log('작업 이름:', passageTitle.value);
    } catch (error) {
        // console.error('작업 이름 가져오기 실패:', error);
        passageTitle.value = "지문 작업";
    }

    try{
        const count = await apiGet('/api/pass/select/count/recent');
        if(count) {
            recentListCount.value = count;
            if (count >= 150) {
                isListLimitModalOpen.value = true;
            } else {
                isConfirmModalOpen.value = true;
            }
        } else {
                isConfirmModalOpen.value = true;
        }
    } catch (error) {
        console.log('작업 내역 개수 확인 요청 실패:', error);
    }
    // // 작업 내역 개수 확인 (150 개 이상인 경우 경고)
    // fetch(`/api/pass/select/count/recent`, {
    //     method: "GET",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    // })
    //     .then((response) => {
    //         if (!response.ok) {
    //             if (response.status === 401) {
    //                 authStore.user = null;
    //                 authStore.isAuthenticated = false;
    //                 localStorage.removeItem("authUser");
    //                 router.push({
    //                     path: "/login",
    //                     query: { redirect: route.fullPath },
    //                 });
    //                 throw new Error("인증이 필요합니다");
    //             }
    //             throw new Error("API 호출 실패: " + response.status);
    //         }
    //         return response.json();
    //     })
    //     .then((count) => {
    //         recentListCount.value = count;
    //         if (count >= 150) {
    //             isListLimitModalOpen.value = true;
    //         } else {
    //             isConfirmModalOpen.value = true;
    //         }
    //     })
    //     .catch((error) => {
    //         // console.error('작업 내역 확인 중 오류 발생:', error);
    //     });
};
// 현재 "최근 작업 내역"의 개수 // 작업 내역 150개 이상인 경우, 띄울 모달창 정보
const recentListCount = ref(0);
const isListLimitModalOpen = ref(false);

// 확인,경고 모달 관련 핸들러
const closeConfirmModal = () => {
    isConfirmModalOpen.value = false;
};

// 지문 생성 확인 모달에서 생성하기 버튼 클릭
const confirmCreatePassage = () => {
    // 중복 요청 방지, 처리 중 플래그, 모달 닫고 로딩 시작
    if (isProcessing.value) {
        return;
    }

    isProcessing.value = true;
    isConfirmModalOpen.value = false;
    isLoading.value = true;
    loadingMessage.value =
        "지문을 생성 중입니다.\n생성까지 최대 3분이 소요될 수 있습니다.";

    try {
        if (authStore.userTicketCount <= 0) {
            throw new Error("이용권이 부족합니다. 이용권을 구매해주세요.");
        }
        const requestData = {
            type_passage: selectedCategory.value,
            keyword: [inputText.value],
            type_structure : "", // 지문 구조 선택사항
            requirement : "" // 추가 요청 선택사항
        };

        fetch("/fastapi/generate-single-passage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`API 호출 실패: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                localStorage.setItem("pathFromGenerate", "true");

                // 생성된 데이터를 로컬 스토리지에 저장
                const passageData = {
                    type: data.type_passage || selectedCategory.value,
                    type_passage: selectedCategory.value,
                    keyword: [inputText.value],
                    title: passageTitle.value,
                    content: data.content || "",
                    gist: data.gist || [],
                };

                // 로컬 스토리지에 저장
                localStorage.setItem(
                    "genieq-passage-data",
                    JSON.stringify(passageData)
                );
                savePassageToBackend(data);
            })
            .catch((error) => {
                alert("지문 생성 중 오류가 발생했습니다: " + error.message);
            })
            .finally(() => {
                isLoading.value = false;
                isProcessing.value = false;
            });
    } catch (error) {
        alert("지문 생성 중 오류가 발생했습니다: " + error.message);
        isLoading.value = false;
        isProcessing.value = false;
    }
};

const savePassageToBackend = async (data) => {
    try {
        loadingMessage.value = "생성된 지문을 저장 중입니다...";
        
        // ✅ 지문 생성 후 토큰 갱신 (3분 경과로 인한 만료 대비)
        console.log('지문 저장 전 토큰 갱신 시도...');
        const tokenRefreshSuccess = await authStore.refreshToken();
        if (!tokenRefreshSuccess) {
            throw new Error('토큰 갱신 실패 - 재로그인이 필요합니다.');
        }
        console.log('토큰 갱신 성공 - 지문 저장 진행');

        // const saveData = {
        //     type: data.type_passage || selectedCategory.value,
        //     keyword: data.keyword || inputText.value,
        //     title: passageTitle.value || "지문 작업",
        //     content: data.content || "",
        //     gist: data.gist || [],
        //     isGenerated: 1,
        // };
        const saveData = {
            type: data.type_passage || selectedCategory.value,
            keyword: Array.isArray(data.keyword) ? data.keyword.join(', ') : (data.keyword || inputText.value),
            title: passageTitle.value || "지문 작업",
            content: data.content || "",
            gist: Array.isArray(data.gist) ? data.gist.join(', ') : (data.gist || ""),
            isGenerated: 1,
        };
        // 백엔드 API 호출
        
        const responseData = await apiPost('/api/pass/insert/each', saveData);

        authStore.updateTicketCount(); // 차감된 이용권으로 update

        // 로컬 스토리지에 저장할 데이터 구조 수정
        const passageData = {
            pasCode: responseData.pasCode,
            title: saveData.title,
            type: saveData.type,
            keyword: saveData.keyword,
            content: saveData.content,
            gist: saveData.gist,
        };

        // 로컬 스토리지에 저장
        localStorage.setItem(
            "genieq-passage-data",
            JSON.stringify(passageData)
        );

        // 지문 생성 페이지로 이동
        router.push("/passage/create");
    } catch (error) {
        alert("저장 중 오류가 발생했습니다: " + error.message);
    } finally {
        isLoading.value = false;
        isProcessing.value = false;
    }
};


// const savePassageToBackend2 = (data) => {
//     loadingMessage.value = "생성된 지문을 저장 중입니다...";

//     const saveData = {
//         type: data.type_passage || selectedCategory.value,
//         keyword: data.keyword || inputText.value,
//         title: passageTitle.value || "지문 작업",
//         content: data.generated_passage,
//         gist: data.generated_core_point,
//         isGenerated: 1,
//     };

//     // 백엔드 API 호출
//     fetch(`/api/pass/insert/each`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(saveData),
//     })
//         .then((response) => {
//             if (!response.ok) {
//                 if (response.status === 401) {
//                     authStore.user = null;
//                     authStore.isAuthenticated = false;
//                     localStorage.removeItem("authUser");
//                     router.push({
//                         path: "/login",
//                         query: { redirect: router.currentRoute.value.fullPath },
//                     });
//                     throw new Error("인증이 필요합니다");
//                 }
//                 return response.text().then((text) => {
//                     throw new Error("저장 API 호출 실패: " + text);
//                 });
//             }
//             return response.json();
//         })
//         .then((responseData) => {
//             authStore.updateTicketCount(); // 차감된 이용권으로 update

//             // 로컬 스토리지에 저장할 데이터 구조 수정
//             const passageData = {
//                 pasCode: responseData.pasCode,
//                 title: saveData.title,
//                 type: saveData.type,
//                 keyword: saveData.keyword,
//                 content: saveData.content,
//                 gist: saveData.gist,
//             };

//             // 로컬 스토리지에 저장
//             localStorage.setItem(
//                 "genieq-passage-data",
//                 JSON.stringify(passageData)
//             );

//             // 지문 생성 페이지로 이동
//             router.push("/passage/create");

//             // 상태 초기화
//             isLoading.value = false;
//             isProcessing.value = false;
//         })
//         .catch((error) => {
//             alert("저장 중 오류가 발생했습니다: " + error.message);
//             isLoading.value = false;
//             isProcessing.value = false;
//         });
// };

onMounted(() => {
    localStorage.removeItem("genieq-passage-data");
    authStore.updateTicketCount(); // 이용권 update
});
</script>

// console.log('[2-3] 로컬 스토리지에 저장된 데이터:', passageData);
