<template>
    <BaseModal :isOpen="isOpen" width="435px" height="600px" @close="closeModal">
        <div class="w-full h-full relative">
            <div class="flex flex-col gap-5 px-5 pt-[52px]">
                <p class="font-bold text-2xl leading-[150%] tracking-[-0.02em] text-[#303030]">
                    결제
                </p>
                <div class="flex flex-col w-full border border-[#0086ff] rounded-lg overflow-hidden">
                    <div class="flex justify-between items-center px-3 py-5 border-b border-[#0086ff]">
                        <div class="font-medium text-base leading-[150%] tracking-[-0.02em] text-[#303030]">
                            보유 이용권
                        </div>
                        <div class="font-semibold text-base leading-[150%] tracking-[-0.02em] text-[#303030]">
                            {{ creditcount }}회
                        </div>
                    </div>

                    <div class="flex justify-between items-center px-3 py-5 border-b border-[#0086ff]">
                        <div class="font-medium text-base leading-[150%] tracking-[-0.02em] text-[#303030]">
                            사용 예정 이용권
                        </div>
                        <div class="font-semibold text-base leading-[150%] tracking-[-0.02em] text-[#303030]">
                            <span class="text-[#0086ff]">1</span>회
                        </div>
                    </div>

                    <div v-if="creditcount > 0"
                        class="flex justify-between items-center px-3 py-5 bg-[#7fc7ff2e] rounded-b-lg">
                        <div class="font-medium text-base leading-[150%] tracking-[-0.02em] text-[#303030]">
                            잔여 이용권
                        </div>
                        <div class="font-semibold text-base leading-[150%] tracking-[-0.02em] text-[#303030]">
                            {{ creditcount - 1 }}회
                        </div>
                    </div>
                    <div v-else class="flex justify-between items-center px-3 py-5 bg-[#7fc7ff2e] rounded-b-lg">
                        <div class="font-medium text-base leading-[150%] tracking-[-0.02em] text-[#303030]">
                            ※ 보유하신 잔여 이용권이 모두 소진되었습니다.
                        </div>
                    </div>
                </div>
            </div>

            <p class="absolute left-5 top-[308px] font-normal text-sm leading-[150%] tracking-[-0.02em] text-[#e84739]">
                ※ 생성이 시작된 중단 및 취소가 불가능합니다.
            </p>

            <div class="absolute left-5 bottom-5 flex gap-5 w-[calc(100%-40px)]">
                <BaseButton text="닫기" type="type3" class="w-[140px] h-[54px]" @click="closeModal" />
                <BaseButton v-if="creditcount > 0" :text="createText" class="flex-1 h-[54px]"
                    @click="generateQuestion" />
                <BaseButton v-else text="이용권 구매하기" class="flex-1 h-[54px]" @click="goToTicketPage" />
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import { useRouter } from "vue-router";
// import { useAuthStore } from "@/stores/auth";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const emit = defineEmits(["close", "generate", "credit-update"]);

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    createText: {
        type: String,
        default: "생성하기",
    },
    selectedQuestion: {
        type: Object,
        default: () => ({
            mode: "",
            title: "",
            options: [],
        }),
    },
});

const creditcount = ref(0);
// const authStore = useAuthStore();
const { updateTicketCount } = useAuth();

watch(
    () => props.isOpen,
    (newVal) => {
        if (newVal === true) {
            updateTicketCount().then((count) => {
                creditcount.value = count;
            });
        }
    }
);

const updateCreditCount = (count) => {
    creditcount.value = count || authStore.userTicketCount;
    emit("credit-update", creditcount.value);
};

onMounted(() => {
    updateTicketCount()
        .then((count) => {
            creditcount.value = count;
            emit("credit-update", creditcount.value);
        })
        .catch((error) => {
            creditcount.value = authStore.userTicketCount;
            emit("credit-update", creditcount.value);
        });
});

const closeModal = () => {
    emit("close");
};

const generateQuestion = () => {
    const savedPassageData = localStorage.getItem("generateQuestionPassageData");
    const selectedQuestionData = localStorage.getItem("selectedQuestionData");

    try {
        emit("generate");
        emit("close");
    } catch (error) { }
};

const goToTicketPage = () => {
    try {
        router.push({
            path: "/mypage",
            query: { tab: "이용권" },
        });
        emit("close");
    } catch (error) { }
};

defineExpose({
    creditcount,
    updateCreditCount,
});
</script>
