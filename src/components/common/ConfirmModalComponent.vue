<template>
  <BaseModal :isOpen="isOpen" width="435px" height="248px " @close="closeModal">
    <div class="modal-content-group">
      <div class="modal-content">
        <div class="modal-title">{{ title }}</div>
        <div class="modal-msg" v-html="message"></div>
      </div>
      <BaseButton
        text="확인"
        type="type1"
        width="224px"
        height="46px"
        @click="confirmAction"
      />
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from "@/components/common/BaseModal.vue";
import BaseButton from "@/components/common/BaseButton.vue";

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: "제목" },
  message: { type: String, default: "확인 문구" },
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
.modal-content-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 24px;
  width: 391px;
  height: 180px;
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
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -2%;
  text-align: center;
}
</style>
