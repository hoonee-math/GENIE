<template>
  <div class="box-border bg-white border border-[#E5E7EB] rounded-xl">
    <EditTitle
      ref="editTitleRef"
      :initialTitle="title"
      @title-changed="handleTitleChange"
    />
    <div class="flex flex-col items-start p-4 sm:p-[2%_3%] gap-2">
      <p
        class="font-pretendard font-bold text-lg sm:text-xl leading-[150%] tracking-[-0.02em] text-[#16252d]"
      >
        편집 도구
      </p>
      <div
        class="relative box-border min-h-[73px] bg-white border border-[#757575] rounded-xl w-full flex flex-col sm:flex-row gap-4 items-center px-4 sm:px-10 py-3 sm:py-0"
      >
        <div
          class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full"
        >
          <p
            class="font-pretendard font-normal text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black whitespace-nowrap"
          >
            단어·문장 기호
          </p>
          <div
            class="flex flex-row items-center gap-2 sm:gap-3 overflow-x-auto w-full sm:w-auto"
          >
            <ul class="flex flex-row items-center gap-2 sm:gap-3 list-none">
              <li
                @click="showSymbolTooltip('㉠')"
                class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
              >
                ㉠
              </li>
              <li
                @click="showSymbolTooltip('ⓐ')"
                class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
              >
                ⓐ
              </li>
              <li
                @click="showSymbolTooltip('㉮')"
                class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
              >
                ㉮
              </li>
              <li
                @click="showSymbolTooltip('①')"
                class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
              >
                ①
              </li>
            </ul>
          </div>
        </div>

        <div
          class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full"
        >
          <p
            class="font-pretendard font-normal text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black whitespace-nowrap"
          >
            에디터
          </p>
          <div class="flex flex-row items-center gap-2 sm:gap-3">
            <ul class="flex flex-row items-center gap-2 sm:gap-3 list-none">
              <li
                @click="handleButtonClick($event, 'bold')"
                class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
              >
                <b>B</b>
              </li>
              <li
                @click="handleButtonClick($event, 'underline')"
                class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
              >
                <u>U</u>
              </li>
              <li
                @click="handleButtonClick($event, 'strikethrough')"
                class="font-pretendard text-base sm:text-xl leading-[150%] tracking-[-0.02em] text-black cursor-pointer hover:text-[#0086ff]"
              >
                <s>S</s>
              </li>
            </ul>
          </div>
        </div>
        <SymbolTooltip
          :message="symbolList.join('')"
          :symbolType="currentSymbolType"
          class="absolute top-[65px] left-[166px]"
          v-if="showTooltip"
          @symbol-click="insertSymbol"
        />
      </div>
    </div>
    <div class="p-[2%_3%] relative">
      <div class="flex flex-col sm:flex-row items-start gap-4">
        <p
          class="font-pretendard font-bold text-xl leading-[150%] tracking-[-0.02em] text-[#16252d]"
        >
          지문
        </p>
        <div
          class="w-fit h-6 text-right font-pretendard font-medium text-base leading-[150%] tracking-[-0.02em] text-[#bdbdbd] mt-2 sm:mt-0 sm:ml-auto"
        >
          <span class="text-[#0086ff]">{{ textLength }}</span
          >/5000
        </div>
      </div>

      <div
        class="box-border flex flex-row justify-center items-center p-8 gap-2 bg-white border border-[#0086ff] rounded-xl mt-4"
      >
        <div
          id="content-text"
          contenteditable="true"
          placeholder="본문을 입력해주세요."
          @select="onTextSelect"
          @click="onTextSelect"
          @keyup="onTextSelect"
          @input="onContentChange"
          class="w-full h-[398px] font-normal text-base leading-7 tracking-[-0.02em] text-[#303030] outline-none overflow-y-auto text-left p-0 whitespace-pre-wrap min-h-[398px] focus:outline-none"
        ></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, defineProps, defineEmits } from "vue";
import SymbolTooltip from "@/views/generation/question/SymbolTooltip.vue";
import EditTitle from "@/views/generation/question/EditTitle.vue";

const props = defineProps({
  initialTitle: {
    type: String,
    default: "",
  },
  initialContent: {
    type: String,
    default: "",
  },
});

// 상수 정의
const MIN_LENGTH = 500;
const MAX_LENGTH = 5000;

// 상태 관리
const title = ref(props.initialTitle || "");
const content = ref(props.initialContent || "");
const symbolList = ref([]);
const showTooltip = ref(false);
const contentText = ref("");
const currentSymbolType = ref("㉠");
const selectionStart = ref(0);
const selectionEnd = ref(0);
const textLength = ref(0);

// 글로벌 선택 상태 변수 추가
let savedRange = null;

// 사용자 정의 이벤트 발생
const emit = defineEmits(["content-changed"]);

// 내용이 변경될 때마다 텍스트 길이 업데이트
const updateTextLength = () => {
  const contentDiv = document.getElementById("content-text");
  textLength.value = contentDiv ? contentDiv.textContent.length : 0;
};

// 최대 글자 수 제한
const checkMaxLength = () => {
  const contentDiv = document.getElementById("content-text");
  if (contentDiv && contentDiv.textContent.length > MAX_LENGTH) {
    // 현재 내용 가져오기
    const html = contentDiv.innerHTML;

    // HTML을 지정한 텍스트 길이로 자르기
    contentDiv.innerHTML = truncateHtmlToTextLength(html, MAX_LENGTH);
  }
};

const emitChange = () => {
  emit("content-changed", {
    title: title.value || "",
    content: content.value || "",
  });
};

// 제목 수정 처리
const handleTitleChange = (newTitle) => {
  title.value = newTitle || "";

  emit("content-changed", {
    title: title.value || "",
    content: content.value || "",
  });
};

// 내용이 변경될 때 이벤트 발생
// 내용 수정 처리
const onContentChange = (skipSaveSelection = false) => {
  const contentDiv = document.getElementById("content-text");
  if (contentDiv) {
    content.value = contentDiv.innerHTML || "";
  }

  updateTextLength(); // 텍스트 길이 업데이트

  // 최대 글자 수 검사
  checkMaxLength();

  // skipSaveSelection이 true가 아닐 때만 선택 영역 저장
  if (!skipSaveSelection) {
    saveSelection();
  }

  // 내용 변경을 localStorage에 저장하여 부모 컴포넌트에 알림
  localStorage.setItem("editPassageChanged", "true");
};

// 텍스트 길이 계산 함수
const getTextLength = () => {
  const contentDiv = document.getElementById("content-text");
  if (!contentDiv) return 0;

  // HTML 태그를 제외한 순수 텍스트 길이만 반환
  return contentDiv.textContent.length;
};

// 텍스트 선택 처리
const onTextSelect = () => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const contentDiv = document.getElementById("content-text");

  // 선택 범위가 content-text 내부에 있는지 확인
  if (contentDiv && contentDiv.contains(range.commonAncestorContainer)) {
    // 나중에 선택 범위를 복원할 수 있도록 관련 정보 저장
    selectionStart.value = range.startOffset;
    selectionEnd.value = range.endOffset;
  }
};

// 심볼 툴팁 표시
const showSymbolTooltip = (symbol) => {
  // 이미 열려있는 같은 심볼 툴팁이면 닫기
  if (showTooltip.value && currentSymbolType.value === symbol) {
    showTooltip.value = false;
    return;
  }

  currentSymbolType.value = symbol;

  // 각 심볼에 따른 목록 정의
  const symbolSeries = {
    "㉠": ["㉠", "㉡", "㉢", "㉣", "㉤"],
    "㉮": ["㉮", "㉯", "㉰", "㉱", "㉲"],
    "ⓐ": ["ⓐ", "ⓑ", "ⓒ", "ⓓ", "ⓔ"],
    "①": ["①", "②", "③", "④", "⑤"],
  };

  // 선택된 심볼에 해당하는 시리즈 설정
  symbolList.value = symbolSeries[symbol] || [];

  // 툴팁 표시
  showTooltip.value = true;
};

// HTML을 지정된 텍스트 길이로 자르는 함수
const truncateHtmlToTextLength = (html, maxLength) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  function truncateNode(node, length) {
    if (length <= 0) return 0;

    if (node.nodeType === 3) {
      // 텍스트 노드
      if (node.length > length) {
        node.textContent = node.textContent.substr(0, length);
        return 0;
      }
      return length - node.length;
    }

    let remainingLength = length;
    const childNodes = Array.from(node.childNodes);

    for (let i = 0; i < childNodes.length; i++) {
      remainingLength = truncateNode(childNodes[i], remainingLength);
      if (remainingLength <= 0) {
        // 남은 노드 제거
        while (i + 1 < node.childNodes.length) {
          node.removeChild(node.childNodes[i + 1]);
        }
        break;
      }
    }

    return remainingLength;
  }

  truncateNode(tempDiv, maxLength);
  return tempDiv.innerHTML;
};

// 심볼 삽입 함수
const insertSymbol = (symbol) => {
  // 저장된 선택 영역 복원
  restoreSelection();

  // 컨텐츠 영역에 포커스 설정
  const contentDiv = document.getElementById("content-text");
  if (contentDiv) {
    contentDiv.focus();
  }

  // 선택된 텍스트 대신 심볼 삽입
  document.execCommand("insertText", false, symbol);

  // 현재 선택 영역 가져오기
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    // 현재 위치 저장
    savedRange = selection.getRangeAt(0).cloneRange();
  }

  // 내용 변경 이벤트 발생
  onContentChange(true);
};

// 텍스트 서식 적용
const formatText = (type) => {
  // 현재 선택된 텍스트 확인
  const selection = window.getSelection();
  if (!selection.rangeCount || selection.toString() === "") return; // 선택된 텍스트가 없으면 아무것도 하지 않음

  // document.execCommand 사용하여 서식 적용
  let command;
  switch (type) {
    case "bold":
      command = "bold";
      break;
    case "underline":
      command = "underline";
      break;
    case "strikethrough":
      command = "strikeThrough";
      break;
    default:
      return;
  }

  // 명령어 실행
  document.execCommand(command, false, null);

  // 현재 선택 영역 가져오기
  if (selection.rangeCount > 0) {
    // 현재 위치 저장
    savedRange = selection.getRangeAt(0).cloneRange();
  }

  // 내용 변경 이벤트 발생
  onContentChange(true);
};

// 에디터 버튼 클릭 처리
const handleButtonClick = (event, type) => {
  // 기본 이벤트 동작 방지
  event.preventDefault();

  // contentDiv 요소 가져오기
  const contentDiv = document.getElementById("content-text");
  if (contentDiv) {
    contentDiv.focus();
  }

  // 저장된 선택 영역 복원
  restoreSelection();

  // 포커스 설정
  contentDiv.focus();

  // 서식 적용
  formatText(type);
};

// 글자 수 검증 함수
const validateTextLength = () => {
  if (getTextLength() < MIN_LENGTH) {
    return false;
  }
  return true;
};

// 지문 내용 설정 메서드
const setContent = (content) => {
  //console.log('EditPassage - setContent 호출됨:', content);
  if (content) {
    const contentDiv = document.getElementById("content-text");
    if (contentDiv) {
      contentDiv.innerHTML = content;
      contentText.value = content;
      updateTextLength(); // 내용 설정 후 텍스트 길이 업데이트
    }
    //console.log('EditPassage - contentText 설정 후:', contentText.value);
  }
};

// 내용 가져오기 메서드
const getContent = () => {
  const contentDiv = document.getElementById("content-text");
  return contentDiv ? contentDiv.innerHTML : "";
};

// 선택 영역 저장 함수
const saveSelection = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const contentDiv = document.getElementById("content-text");
    const range = selection.getRangeAt(0);

    // 선택 영역이 contentDiv 내부에 있는지 확인
    if (contentDiv && contentDiv.contains(range.commonAncestorContainer)) {
      savedRange = range.cloneRange();
    }
  }
};

// 선택 영역 복원 함수
const restoreSelection = () => {
  if (savedRange) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }
};

// 컴포넌트 마운트 시 이벤트 리스너 추가
onMounted(() => {
  if (props.initialTitle) {
    title.value = props.initialTitle;
  }
  if (props.initialContent) {
    setContent(props.initialContent);
  }

  // 본문 영역에만 이벤트 리스너 추가
  const contentDiv = document.getElementById("content-text");
  if (contentDiv) {
    contentDiv.addEventListener("mouseup", saveSelection);
    contentDiv.addEventListener("keyup", saveSelection);
  }

  updateTextLength(); // 초기 텍스트 길이 설정
});

watch(
  () => props.initialTitle,
  (newValue) => {
    // console.log("제목 변경 감지: ", newValue);
    if (newValue !== undefined && newValue !== null) {
      title.value = newValue;
    }
  }
);

watch(
  () => props.initialContent,
  (newValue) => {
    // console.log(" 지문 변경 감지: ", newValue);
    if (newValue !== undefined && newValue !== null) {
      saveSelection();
      content.value = newValue;
      setContent(newValue); // 값이 변경되면 자동 반영
      updateTextLength(); // 텍스트 길이 업데이트
      restoreSelection();
    }
  }
);

// 외부에서 접근할 메서드 노출
// 수정된 상태 외부에서 접근 가능하도록 expose 설정
defineExpose({
  validateTextLength,
  getContent: () => content.value,
  setContent,
  getTitle: () => title.value,
});
</script>
