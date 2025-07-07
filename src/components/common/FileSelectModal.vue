<template>
  <BaseModal :isOpen="isOpen" width="435px" height="332px" @close="closeModal">
    <div class="modal-content-group">
      <div class="modal-title">추출할 파일 형식을 선택하세요</div>

      <div class="file-options">
        <div
          v-for="file in fileTypes"
          :key="file.type"
          :class="['file-option', { active: selectedFile === file.type }]"
          @click="() => selectFile(file.type)"
        >
          <Icon
            class="file-icon"
            :icon="file.icon"
            width="53.33px"
            height="66.67px"
          />
          <div class="file-label">{{ file.label }}</div>
        </div>
      </div>
    </div>

    <div class="modal-buttons">
      <BaseButton
        text="취소하기"
        type="type3"
        width="183.5px"
        height="46px"
        @click="closeModal"
      />
      <BaseButton
        text="추출하기"
        type="type1"
        width="183.5px"
        height="46px"
        :disabled="!selectedFile"
        @click="getFile"
      />
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import { Icon } from "@iconify/vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiGet } from "@/utils/http";

// 라우터와 스토어 초기화
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const props = defineProps({
  isOpen: Boolean,
  pasCode: Number,
});

const emit = defineEmits(["close", "confirm"]);

const fileTypes = [
  { type: "pdf", label: ".pdf 파일", icon: "bxs:file-pdf" },
  { type: "word", label: ".word 파일", icon: "mdi:file-word" },
  { type: "txt", label: ".txt 파일", icon: "bxs:file-txt" },
];

// ✅ PDF를 기본 선택값으로 설정
const selectedFile = ref("pdf");
const isProcessing = ref(false);

const selectFile = (fileType) => {
  selectedFile.value = fileType;
};

// ✅ 파일 선택 시 처리 함수
const getFile = async () => {
  if (!selectedFile.value) {
    alert("파일 형식을 선택해주세요.");
    return;
  }

  if (!props.pasCode) {
    alert("pasCode 값이 없습니다.");
    return;
  }

  if (isProcessing.value) return; // 중복 실행 방지
  isProcessing.value = true;

  // console.log("파일 타입: ", selectedFile.value);
  // console.log("pasCode: ", props.pasCode);

  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    const responseData = await apiGet(`/api/pass/export/each/${props.pasCode}?type=${selectedFile.value}`);

    // 응답을 blob으로 변환
    const blob = await responseData.blob();

    // 다운로드 링크 생성
    const url = window.URL.createObjectURL(blob);

    // 다운로드 링크 생성 및 클릭 이벤트 발생시키기
    const a = document.createElement("a");
    a.href = url;

    //  Content-Disposition에서 파일 이름 추출 정규식 수정
    const contentDisposition = responseData.headers.get("Content-Disposition");
    let fileName = `file.${
      selectedFile.value === "word" ? "docx" : selectedFile.value
    }`;

    if (contentDisposition) {
      // 규식 수정 → 큰따옴표, 작은따옴표 모두 처리
      const filenameMatch =
        contentDisposition.match(
          /filename\*?=['"]?(?:UTF-\d['"]?)?([^;\r\n"']*)['"]?/i
        ) ||
        contentDisposition.match(/filename="([^"]*)"/) ||
        contentDisposition.match(/filename=([^;]*)/);

      if (filenameMatch && filenameMatch[1]) {
        try {
          // 디코딩 시도 (이미 디코딩된 경우를 대비해 try-catch 사용)
          let decodeFilename = decodeURIComponent(filenameMatch[1].trim());

          // "+" 문자를 공백으로 변환 (인코딩 과정에서 +가 공백을 의미하는 중)
          fileName = decodeFilename.replace(/\+/g, " ");
        } catch (e) {
          // 디코딩 실패 시 원래 값 사용
          fileName = filenameMatch[1].trim();
        }
      }
    }

    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // 메모리 누수 방지를 위한 객체 URL 해제
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log(`파일 다운로드 성공: ${fileName}`);
    closeModal();
  } catch (error) {
    console.error("파일 다운로드 실패:", error.message);
    alert(`파일 다운로드 실패: ${error.message}`);
  } finally {
    //상태 초기화 추가
    isProcessing.value = false;
  }
};

const closeModal = () => {
  emit("close");
};

// 모달이 열릴 때 기본값을 PDF로 설정
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      selectedFile.value = "pdf";
    }
  }
);

const confirmSelection = () => {
  emit("confirm", selectedFile.value);
  closeModal();
};
</script>

<style scoped>
.modal-content {
  padding: 22px;
  border-radius: 12px;
  gap: 36px;
}

.modal-content-group {
  display: flex;
  flex-direction: column;
  width: 296px;
  height: 190px;
  gap: 24px;
}

/* 제목 */
.modal-title {
  height: 46px;
  padding: 8px;
  gap: 8px;
  font-weight: 700;
  font-size: 20px;
  line-height: 30px;
  letter-spacing: -2%;
  text-align: center;
}

/* 파일 선택 영역 */
.file-options {
  display: flex;
  justify-content: center;
  gap: 15px;
  width: 296px;
  height: 120px;
  padding: 8px;
  gap: 20px;
}

.file-option {
  width: 80px;
  height: 104px;
  cursor: pointer;
}

.file-icon {
  width: 53.33px;
  height: 66.67px;
  color: #bdbdbd;
  transform: scale(1.2);
}

.file-option.active .file-icon {
  color: #303030;
}

.file-label {
  width: 80px;
  height: 24px;
  font-size: 16px;
  font-weight: 300;
  line-height: 24px;
  letter-spacing: -2%;
  text-align: center;
  color: #424242;
}

.file-option.active .file-label {
  font-weight: 600;
}

/* 버튼 영역 */
.modal-buttons {
  width: 391px;
  height: 62px;
  gap: 24px;
  padding-top: 8px;
  padding-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
