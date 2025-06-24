<template>
  <div>
    <p>ExView.vue 입니다</p>
    <p>side-nav-bar 컴포넌트 삽입</p>
    <p>footer-nav-bar 컴포넌트 삽입</p>
    <p>slot 을 이용해서 MainHome/Gen/Mypage/Storage 컴포넌트 삽입</p>
  </div>
  <div class="frame-container">
    <TestSideNavBarComponent />
    <div class="content-area">
      content-area 에 각 컴포넌트가 들어가게 됩니다. <br /><br />
      <!-- 라우터 뷰로 slot을 대체합니다 -->
      <router-view />
      <!-- 기본 버튼 -->
      <div>
        <h2>기본 버튼</h2>
        <!-- 기본 크기 -->
        <BaseButton text="TYPE 1" type="type1" />

        <!-- 크기 변경 -->
        <BaseButton
          text="LARGE BUTTON"
          type="type2"
          width="200px"
          height="50px"
        />

        <!-- 더 작은 버튼 -->
        <BaseButton text="SMALL" type="type3" width="80px" height="30px" />

        <!-- 비활성화 버튼 -->
        <BaseButton text="DISABLED" type="type4" disabled />

        <!-- hover 효과 확인 -->
        <BaseButton text="HOVER ME" type="type5" width="150px" height="45px" />
      </div>

      <!-- 모달 사용 -->
      <div>
        모달 버튼
        <BaseButton
          text="확인 창 모달"
          type="type1"
          @click="showConfirmModal = true"
        />
        <BaseButton
          text="경고 창 모달"
          type="type1"
          @click="showWarningModal = true"
        />
        <BaseButton
          text="파일로 추출"
          type="type1"
          @click="showFileModal = true"
        />
        <BaseButton
          text="지문 불러오기"
          type="type1"
          @click="showLoadPassageModal = true"
        />
        <BaseButton
          text="문항 생성"
          type="type1"
          @click="showGenerateQuestionModal = true"
        />
        <BaseButton
          text="비밀번호 변경"
          type="type3"
          @click="showChangePwdModal = true"
        />
        <!-- 확인창 모달 -->
        <ConfirmModal
          :isOpen="showConfirmModal"
          title="확인"
          message="작업을 완료하시겠습니까?"
          @close="showConfirmModal = false"
        />
        <!-- 경고창 모달 -->
        <WarningModal
          :isOpen="showWarningModal"
          title="경고"
          message="이 작업을 실행하시겠습니까?"
          @close="showWarningModal = false"
        />
        <!-- 추출 파일 선택 모달 -->
        <FileSelectModal
          :isOpen="showFileModal"
          @close="showFileModal = false"
        />
        <!-- 지문 불러오기 모달 -->
        <LoadPassageModal
          :isOpen="showLoadPassageModal"
          @close="showLoadPassageModal = false"
        />
        <!-- 지문 불러오기 모달 -->
        <GenerateQuestionModal
          :isOpen="showGenerateQuestionModal"
          @close="showGenerateQuestionModal = false"
        />
        <!-- 비밀번호 변경 모달 -->
        <ChangePasswordModal
          :isOpen="showChangePwdModal"
          @close="showChangePwdModal = false"
        />
      </div>

      <!-- 기본 tooltip -->
      <div>
        <PlainTooltip id="example" message="Test Message" width="183px" />
        <!-- 피그마에 뜬 width값에 20 더해서 width 속성에 넣어주세요!! -->
        <!-- id값을 이용해서 style 태그에 position:absolute; top:00px; left:00px; 로 위치 조정해주세요 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import TestSideNavBarComponent from "@/components/test/TestSideNavBarComponent.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import ConfirmModal from "@/components/common/ConfirmModalComponent.vue";
import WarningModal from "@/components/common/WarningModalComponent.vue";
import FileSelectModal from "@/components/common/FileSelectModal.vue";
import LoadPassageModal from "@/components/generation/LoadPassageModal.vue";
import GenerateQuestionModal from "@/components/generation/GenerateQuestionModal.vue";
import ChangePasswordModal from "@/components/mypage/ChangePasswordModal.vue";
import PlainTooltip from "@/components/common/PlainTooltip.vue";
import { ref } from "vue";

const showConfirmModal = ref(false);
const showWarningModal = ref(false);
const showFileModal = ref(false);
const showLoadPassageModal = ref(false);
const showGenerateQuestionModal = ref(false);
const showChangePwdModal = ref(false);
</script>

<style scoped>
.frame-container {
  display: flex;
  min-height: 100vh;
}

.content-area {
  flex: 1;
  padding: 20px;
  background-color: #f4f6f9;
}
</style>
