import { computed } from "vue";
import { useRouter } from "vue-router";
import { savePassageWithQuestionsToDatabase, getPassageWithQuestionsFromDatabase, updatePassageWithQuestionsInDatabase } from "@/api/passage";
import { generatePassageDataAPI, generateReadingPassageQuestionAPI, generateSinglePassageQuestionAPI, generateMultiplePassageQuestionAPI } from "@/api/generate";
import { usePassageStore } from "@/stores/passage";
import { usePassage } from "@/composables/usePassage";

/**
 * 문항 생성 관련 순수 데이터 처리 composable
 * UI 상태 관리는 Vue 컴포넌트에서 담당
 */
export function useQuestion() {
  const router = useRouter();
  const passageStore = usePassageStore();
  const { passage, cacheGeneratedPassage } = usePassage();

  // ===== 데이터 검증 =====

  /**
   * 지문 길이 검증 (최소 500자)
   */
  const validatePassageLength = (content) => {
    const textLength = content.replace(/<[^>]*>/g, "").length;
    return textLength >= 500;
  };

  /**
   * 문항 생성 데이터 검증
   */
  const validateQuestionData = (title, content) => {
    const errors = [];

    if (!title || title.trim().length === 0) {
      errors.push("제목을 입력해주세요.");
    }

    if (!content || content.trim().length === 0) {
      errors.push("내용을 입력해주세요.");
    }

    if (content && !validatePassageLength(content)) {
      errors.push("지문은 최소 500자 이상 입력해주세요.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // ===== API 호출 =====

  /**
   * 문항 생성 API 호출
   */
  const generateQuestion = async (questionData, title, content) => {
    const requestData = {
      custom_passage: content,
      type_question: questionData.pattern,
      type_question_detail: questionData.type,
      question_example: questionData.title,
    };

    // FastAPI 호출
    const response = await generateSinglePassageQuestionAPI(requestData);

    if (!response.ok) {
      throw new Error(`문항 생성 실패: ${response.status}`);
    }

    const result = await response.json();

    // 선택지 전처리 (쉼표 제거) - 기존에 잘못된 DB설계로 인해 쉼표 제거 작업을 수행했었음. 백엔드 서버 작업 & DB 설계 변경 및 프론트엔드에서도 해당 코드를 없앤 새로운 generateQuestionWithNewPassage 함수로 대체 예정
    // 백엔드에서 문항 데이터를 통채로 저장하는 방식 고려
    const processedOptions = result.generated_option.map((option) =>
      option.replace(/,/g, "").replace(/^[①②③④⑤]\s*/, "")
    );

    return {
      ...result,
      generated_option: processedOptions,
    };
  };

   /**
    * 생성된 지문 및 문항 보기 페이지에서 문항 추가하기 요청시 사용하는 api
    */
  const addQuestionToExistingPassage = async (custom_passage, selectedQuestionExample, generateType, pasCode) => {
    try {
      const requestToPython = vueToPython(custom_passage, selectedQuestionExample, generateType);

      const apiFunction = selectPythonApiFunction(generateType);
      const responseFromPython = await apiFunction(requestToPython);

      // 문항 생성 성공시 데이터 저장 API 함수 호출
      const requestToJava = pythonToJava(responseFromPython, custom_passage, pasCode);
      const responseFromJava = await updatePassageWithQuestionsInDatabase(requestToJava);

      // 기존 passage에 새 문항만 추가해서 전체 업데이트
      const updatedPassage = {
          ...passageStore.passage,
          questions: [...passageStore.passage.questions, ...responseFromJava.questions],
      }

      passageStore.setPassage(updatedPassage) // 기존 action 재사용!

      return responseFromJava;
    } catch (error) {
      console.error("문항 추가 API 호출 실패:", error);
      throw error;
    }
  }

  /**
   * GenerateQuestionForm.vue 에서 '사용자 지문(user)' 탭이나 '자료실 지문(storage)' 탭에서 문항을 갖고있지 않는 지문을 이용해서 처음 문항을 생성할 때 사용하는 API
   * @param {string} custom_passage - 사용자 지문 or 자료실 지문 (python 에서 custom_passage 로 사용중)
   */
  const generateQuestionWithNewPassage = async (custom_passage, selectedQuestionExample, generateType, activeTab, title) => { // params 를 pinia store를 사용할지 추가 고려 필요
    const validation = validateQuestionData(title, custom_passage);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(" "));
    }

    try {
      const requestToPython = vueToPython(custom_passage, selectedQuestionExample, generateType, activeTab);

      const apiFunction = selectPythonApiFunction(activeTab, generateType);
      const responseFromPython = await apiFunction(requestToPython);

      // 문항 생성 성공시 데이터 저장 API 함수 호출
      const requestToJava = pythonToJava(responseFromPython, custom_passage);
      const responseFromJava = await savePassageWithQuestionsToDatabase(requestToJava);

      return responseFromJava;
    } catch (error) {
      console.error("문항 생성 API 호출 실패:", error);
      throw error;
    }
  };

  // generateQuestionWithNewPassage 함수에서 사용하는 파이썬 API 선택 함수
  const selectPythonApiFunction = (activeTab, generateType) => {
    if (activeTab === "user") {
      return generatePassageDataAPI;
    } // 분석 + 문항 생성 통합
    const apiMap = {
      "단일 지문": generateSinglePassageQuestionAPI,
      "복합 지문": generateMultiplePassageQuestionAPI,
      독서론: generateReadingPassageQuestionAPI,
    };
    const apiFunction = apiMap[generateType];
    if (!apiFunction) {
      throw new Error(`지원하지 않는 문항 생성 유형입니다: ${generateType}`);
    }
    return apiFunction;
  };

  /**
   * 문항 저장 API 호출 (generateQuestionWithNewPassage, addQuestionToExistingPassage에서 리팩토링하여 다시 구현함. 현재 미사용. 분리 고려 필요)
   */
  const saveQuestion = async (questionResult, questionData, title, content) => {
    const saveRequestData = {
      type: questionResult.type_passage,
      keyword: questionResult.keyword[0],
      title: title,
      content: content,
      gist: passage.value.descriptions[0]?.gist || questionResult.generated_core_point,
      isGenerated: 0,
      questions: [{
          queQuery: questionResult.generated_question,
          queOption: questionResult.generated_option,
          queAnswer: questionResult.generated_answer,
          description: questionResult.generated_description,
      }],
    }

    const response = await saveQuestionToDatabase(saveRequestData);

    if (!response.ok) {
      throw new Error(`문항 저장 실패: ${response.status}`);
    }

    return response.json();
  };

  // ===== 반환값 =====
  return {
    // 상태 (computed)
    passage: computed(() => passage.value),

    // 검증 함수
    validatePassageLength,
    validateQuestionData,

    // API 함수 (개별)
    generateQuestion,
    saveQuestion,
  }
}