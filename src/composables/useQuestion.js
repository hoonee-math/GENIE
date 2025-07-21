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

    // 문항 생성 실패: TypeError: title.trim is not a function
    // 문항 생성 실패: TypeError: Cannot read properties of undefined (reading 'trim')
    // 문항 생성 실패: TypeError: Cannot read properties of undefined (reading 'length')
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
  const generateQuestionWithNewPassage = async (title, custom_passage, selectedQuestionExample, generateType, activeTab) => { // params 를 pinia store를 사용할지 추가 고려 필요
    // const validation = validateQuestionData(title, custom_passage);
    // if (!validation.isValid) {
    //   throw new Error(validation.errors.join(" "));
    // }
    console.log("문항 생성 요청 데이터:", { title, custom_passage, selectedQuestionExample, generateType, activeTab });

    try {
      // activeTab이 'user'인 경우에는 requestToPython에 generateType을 type_passage로 전달합니다.
      // activeTab이 'storage'인 경우에는 generateType을 apiFunction에서 직접 처리합니다.
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
      return generatePassageDataAPI; // 해당 api 의 requestData는 
    } // 분석 + 문항 생성 통합
    const apiMap = {
      "단일 지문": generateSinglePassageQuestionAPI,
      "복합 지문": generateMultiplePassageQuestionAPI,
      "독서론": generateReadingPassageQuestionAPI,
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

   // ===== 데이터 변환 =====
   
   /**
   * quoted_sentence와 quoted_word를 매핑하여 지문에 밑줄 태그 적용
   * @param {string} content - 원본 지문 내용
   * @param {Array<string>} quotedSentences - 인용 문장 목록
   * @param {Array<string>} quotedWords - 인용 단어 목록
   * @returns {string} - 밑줄 태그가 적용된 지문
   */
   const applyUnderlineToQuotedWords = (content, quotedSentences, quotedWords) => {
        // '㉠'은 유니코드 U+32A0 (16진수), 10진수로는 12960
        const getKoreanCircleMarker = (index) => {
            const baseCode = 0x32A0; // '㉠'
            const codePoint = baseCode + index;
            return String.fromCharCode(codePoint);
        };

        if (!quotedSentences || !quotedWords || quotedSentences.length !== quotedWords.length) {
            console.warn('quoted_sentence와 quoted_word 배열 길이가 다르거나 없습니다.');
            return content;
        }
    
        let modifiedContent = content;
    
        // 각 quoted_sentence를 순회하면서 해당하는 quoted_word에 밑줄 적용
        for (let i = 0; i < quotedSentences.length; i++) {
            const sentence = quotedSentences[i];
            const word = quotedWords[i];
            
            if (!sentence || !word) {
                console.warn(`Index ${i}에서 sentence 또는 word가 비어있습니다.`);
                continue;
            }
        
            // 원본 문장을 찾아서 해당 단어에 밑줄 태그 적용한 문장으로 교체
            const underlinedSentence = sentence.replace(word, `<u>${word}</u>`);
            modifiedContent = modifiedContent.replace(sentence, underlinedSentence);
            
            console.log(`밑줄 적용: "${word}" -> "${getKoreanCircleMarker(i)}<u>${word}</u>"`);
        }
    
        return modifiedContent;
   };
   
  const vueToPython = (custom_passage, selectedQuestionExample, generateType, activeTab) => {
    if (!selectedQuestionExample) {
        throw new Error('선택된 문항 예제가 없습니다.');
    }

    console.log("Python 요청 데이터 생성:", { selectedQuestionExample, generateType, activeTab });
    
    // 실제 Python API에 전달할 데이터 구조
    const baseRequest = {
        custom_passage,
        type_question: selectedQuestionExample.pattern,
        question_format: selectedQuestionExample.title,
        question_statement_example: selectedQuestionExample.statement,
        question_choice_example: selectedQuestionExample.question,
        question_subpassage_example: selectedQuestionExample.subpassage || null
    };
    
    // activeTab이 'user'인 경우에는 generateType을 type_passage로 전달
    if (activeTab === 'user') {
        return { kind_passage: generateType, ...baseRequest };
    } else {
        return baseRequest;
    }
  };
  const pythonToJava = (responseFromPython, custom_passage, title = "Untitled") => {
    console.log("Python 응답 변환 시작:", responseFromPython);
    
    // 1. 응답 타입 확인 (사용자 입력 vs 자료실)
    const isUserInput = responseFromPython.detail && responseFromPython.question;
    const questionData = isUserInput ? responseFromPython.question : responseFromPython;
    const detailData = isUserInput ? responseFromPython.detail : null;
    
    // description 포맷팅 함수
    const formatDescription = (generatedDescription) => {
        if (!generatedDescription) {return "";}
        
        // 배열이 아닌 경우 그대로 반환
        if (!Array.isArray(generatedDescription)) {return generatedDescription;}
        
        // 배열 길이에 따른 처리
        if (generatedDescription.length === 2) {
            // 각 항목 내의 \n을 </p><p>로 변환하고 <p>로 래핑
            const formattedFirst = `<p>${generatedDescription[0].replace(/\n/g, '</p><p>')}</p>`;
            const formattedSecond = `<p>${generatedDescription[1].replace(/\n/g, '</p><p>')}</p>`;
            return formattedFirst + formattedSecond;
        } else if (generatedDescription.length === 1) {
            return generatedDescription[0];
        } else {
            // 예외 상황: 3개 이상이거나 빈 배열인 경우
            console.warn('예상과 다른 description 배열 길이:', generatedDescription.length);
            return generatedDescription.join('\n\n');
        }
    };

    const formatOption = (generatedOption) => {
        console.log("generatedOption", generatedOption);
        if (!generatedOption) return "";
        
        // 배열이 아닌 경우 그대로 반환
        if (!Array.isArray(generatedOption)) return generatedOption;
        
        // 배열 길이에 따른 처리
        if (generatedOption.length > 0) {
            let formattedOption = '';
            const numberOption = ['①','②','③','④','⑤'];
            
            // ✅ 올바른 for 루프 사용
            for (let index = 0; index < generatedOption.length; index++) {
                formattedOption += '<p>' + numberOption[index] + ' ' + generatedOption[index] + '</p>';
            }
            
            console.log("formattedOption", formattedOption);
            return formattedOption;
        } else {
            return "";
        }
    }

    // 2. descriptions 배열 생성
    const descriptions = [];
    
    if (detailData) {
        // 사용자 입력: detail에서 descriptions 생성
        if (detailData.kind_passage === "복합 지문") {
            // 복합 지문인 경우
            descriptions.push({
                pasType: detailData.first_passage_type,
                keyword: detailData.first_passage_keyword,
                gist: detailData.generated_core_point[0] || "",
                order: 1
            });
            descriptions.push({
                pasType: detailData.second_passage_type, 
                keyword: detailData.second_passage_keyword,
                gist: detailData.generated_core_point[1] || "",
                order: 2
            });
        } else {
            // 단일 지문 or 독서론인 경우
            descriptions.push({
                pasType: detailData.type_passage || detailData.kind_passage,
                keyword: detailData.keyword,
                gist: detailData.generated_core_point[0] || "",
                order: 1
            });
        }
    } else {
        // 자료실 지문: Store에서 기존 descriptions 가져오기
        const passageStore = usePassageStore();
        if (passageStore.passage.descriptions?.length > 0) {
            descriptions.push(...passageStore.passage.descriptions);
        } else {
            // fallback: 최소한의 description 생성
            descriptions.push({
                pasType: questionData.kind_passage,
                keyword: "자동 생성",
                gist: "문항 생성됨",
                order: 1
            });
        }
    }
    
    // 3. questions 배열 생성
    const questions = [{
        queQuery: questionData.generated_question,
        queOption: formatOption(questionData.generated_option),
        queAnswer: questionData.generated_answer,
        description: formatDescription(questionData.generated_description)  // description 포맷팅 '정답 해설'과 '오답 피하기' 가 배열로 저장되는 문제 처리 -> java에서는 String으로 저장되고 정답 및 해설도 Tiptap을 이용해 출력해주는 것으로 통일하기 위해 html 로 변환
    }];
    
    // 4. quoted_sentence와 quoted_word를 사용하여 지문에 밑줄 적용
    let processedContent = custom_passage;
    if (questionData.quoted_sentence && questionData.quoted_word) {
        processedContent = applyUnderlineToQuotedWords(
            custom_passage,
            questionData.quoted_sentence,
            questionData.quoted_word
        );
        console.log('밑줄 태그 적용 완료:', processedContent !== custom_passage);
    }
    
    // 5. 최종 Java 요청 데이터 생성
    const javaRequestData = {
        title: title,
        content: processedContent,
        isGenerated: 0,
        descriptions: descriptions,
        questions: questions,
        mode: "question_generation" // 구분용
    };
    
    console.log("Java 요청 데이터 변환 완료:", javaRequestData);
    return javaRequestData;
  };
  



  // ===== 반환값 =====
  return {
    // 상태 (computed)
    passage: computed(() => passage.value),

    // 검증 함수
    validatePassageLength,
    validateQuestionData,

    // 문항 생성 함수
    generateQuestionWithNewPassage,
    addQuestionToExistingPassage,

    // API 함수 (개별)
    generateQuestion,
    saveQuestion,
  }
}