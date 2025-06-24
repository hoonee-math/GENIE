<template>
  <BaseModal :isOpen="isOpen" width="435px" height="292px" @close="closeModal">
    <div class="modal-container">
      <!-- ✅ 항상 표시되는 경고 아이콘 -->
      <div class="warning-icon">
        <div class="warning-circle">
          <div class="warning-inner-circle">
            <Icon
              icon="mdi:alert-outline"
              class="warning-icon-symbol"
              width="24"
              height="24"
            />
          </div>
        </div>
      </div>
      <div class="modal-content-group">
        <div class="modal-content">
          <div class="modal-title">{{ title }}</div>
          <div class="modal-msg" v-html="message"></div>
        </div>

        <!-- ✅ 취소 & 실행 버튼 -->
        <div class="modal-buttons">
          <BaseButton
            :text="cancelText"
            type="type3"
            width="183.5px"
            height="46px"
            @click="closeModal"
          />
          <BaseButton
            :text="confirmText"
            type="type1"
            width="183.5px"
            height="46px"
            @click="confirmAction"
          />
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from "@/components/common/BaseModal.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: "경고" },
  message: { type: String, default: "경고 내용" },
  cancelText: { type: String, default: "취소하기" },
  confirmText: { type: String, default: "실행" },
});

const emit = defineEmits(["close", "confirm"]);

const closeModal = () => {
  emit("close");
};

const confirmAction = () => {
  emit("confirm");
  closeModal();
};
</script>

<style scoped>
.modal-container {
  display: flex;
  flex-direction: column;
}

.modal-content-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 30px;
  width: 391px;
  height: 180px;
}

.warning-icon {
  align-self: center;
}

/* ✅ 경고 아이콘 스타일 */
.warning-circle {
  width: 60px;
  height: 60px;
  background-color: #7fc7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.warning-inner-circle {
  width: 40px;
  height: 40px;
  background-color: #7fc7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.warning-icon-symbol {
  color: #0086ff;
}

.modal-content {
  display: flex;
  flex-direction: column;
  padding: 8px 0px;
  gap: 24px;
  width: 391px;
  height: 94px;
}

.modal-title {
  font-weight: 700;
  font-size: 20px;
  line-height: 30px;
  letter-spacing: -2%;
  text-align: center;
}

.modal-msg {
  font-weight: 400;
  font-size: 16px;
  /* line-height: 24px; */
  letter-spacing: -2%;
  text-align: center;
}

/* 버튼 그룹 */
.modal-buttons {
  display: flex;
  gap: 16px;
}
</style>
