import { computed } from "vue";
import { usePassageStore } from "@/stores/passage";
import {
  getPassageFromDatabase,
  getPrevPassageListInDatabase,
  getPassageWithQuestionsFromDatabase,
  savePassageToDatabase,
} from "@/api/passage";
import {
  generateSinglePassageAPI,
  generateReadingPassageAPI,
  generateMultiplePassageAPI,
} from "@/api/generate";

export function usePassage() {
  const store = usePassageStore();

  // 지문 생성 후 응답 값으로 저장된 pasCode 값 반환
  const generateAndSavePassage = async (generateType, inputTitle, requestData) => {
    let apiResponse = "";
    try {
        // 1. FastAPI 호출 (지문 생성)
        switch (generateType) {
        case "single" || "단일 지문" || "단일지문":
            apiResponse = await generateSinglePassageAPI(requestData);
            // generateType = 'single' 일 경우 requestData 형식
            // requestData = {
            //     type_passage: singleForm.type_passage,
            //     keyword: singleForm.keyword
            // }
            break;
        case "multiple" || "복합 지문" || "복합지문":
            apiResponse = await generateMultiplePassageAPI(requestData);
            // generateType = 'multiple' 일 경우 requestData 형식
            // requestData = {
            //     first_type_passage: multipleForm.first_type_passage,
            //     first_keyword: multipleForm.first_keyword,
            //     second_type_passage: multipleForm.second_type_passage,
            //     second_keyword: multipleForm.second_keyword
            // }
            break;
        case "reading" || "독서론":
            apiResponse = await generateReadingPassageAPI(requestData);
            // generateType = 'reading' 일 경우 requestData 형식
            // requestData = {
            //     type_passage: '독서론',
            //     keyword: readingForm.keyword
            // }
            break;
        default:
            console.log("잘못된 요청입니다.");
        }
        console.log("1. ",generateType, " 지문 생성 성공: ", apiResponse);

        // 2. 데이터 변환 (백엔드 저장 형식)
        const dbData = transformApiResponseToDbFormat(
        apiResponse,
        requestData,
        generateType,
        inputTitle
        );
        console.log("2. 데이터 변환 성공 dbData:", dbData);
        // 3. 백엔드 DB 저장
        const savedPassage = await savePassageToDatabase(dbData);
        console.log("3. 백엔드 저장 성공 savedPassage:", savedPassage);
        // 4. Simple Store 에 캐싱 (중복 API 호출 방지)
        cacheGeneratedPassage(savedPassage.pasCode, apiResponse, savedPassage);
        console.log("4. setPassage 로 pinia store에 새 지문 데이터 저장 성공 pasCode: ", savedPassage.pasCode);
        // 5. DB에 저장된 pasCode값 반환
        return savedPassage.pasCode;
    } catch(error) {
        console.log(error)
    }
  };

  // 지문 생성 헬퍼 함수 : DescriptionDto 구조에 맞춰 생성
  const createDescriptions = (apiResponse, requestData, generateType) => {
    if (generateType === "single") {
      return [
        {
          pasType: requestData.type_passage,
          keyword: requestData.keyword,
          gist: apiResponse.generated_core_point[0],
          order: 1,
        },
      ];
    } else if (generateType === "multiple") {
      return [
        {
          pasType: requestData.first_type_passage,
          keyword: requestData.first_keyword,
          gist: apiResponse.generated_core_point[0],
          order: 1,
        },
        {
          pasType: requestData.second_type_passage,
          keyword: requestData.second_keyword,
          gist: apiResponse.generated_core_point[1],
          order: 2,
        },
      ];
    } else if (generateType === "reading") {
      return [
        {
          pasType: "독서론",
          keyword: requestData.keyword,
          gist: apiResponse.generated_core_point[0],
          order: 1,
        },
      ];
    }
  };
  // 지문 생성 헬퍼 함수 : 타이틀 자동 생성
  const generateTitle = (inputTitle, generateType, requestData) => {
    if (inputTitle !== "Untitled") {
      return inputTitle;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(now.getDate()).padStart(2, "0")}`;

    if (generateType === "single") {
      return `[단일 지문] ${requestData.keyword.slice(0, 10)} (${dateStr})`;
    } else if (generateType === "multiple") {
      return `[복합 지문] ${requestData.first_type_passage} & ${requestData.second_type_passage} (${dateStr})`;
    } else if (generateType === "reading") {
      return `[독서론 지문] ${requestData.keyword.slice(0, 10)} (${dateStr})`;
    }
    return inputTitle;
  };

  // 지문 생성 헬퍼 함수 : python 응답을 java 형식으로 파싱
  const transformApiResponseToDbFormat = (
    apiResponse,
    requestData,
    generateType,
    inputTitle
  ) => {
    return {
      title: generateTitle(inputTitle, generateType, requestData),
      content: convertNewlinesToParagraphs(apiResponse.generated_passage),
      isGenerated: 1,
      descriptions: createDescriptions(apiResponse, requestData, generateType),
    };
  };

  // fastApi 응답 데이터의 '\n' 형식을 Tiptap 형식에 맞게 수정하여 db 저장할 때 사용
  const convertNewlinesToParagraphs = (text) => {
    if (!text) return "";
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => `<p>${line}</p>`)
      .join("");
  };

  // 지문 조회 (캐시 우선 + API 호출 + 파싱)
  // 호출 방식: await fetchPassage(123, { force: true, includeQuestions: true })
  const fetchPassage = async (pasCode, options = {}) => {
    const numPasCode = Number(pasCode);

    // 캐시 확인
    if (!options.force && store.loadFromCache(numPasCode)) {
      console.log("⭐ 캐시에서 로드:", numPasCode, "(API 호출 없음)");
      return store.passage;
    }

    console.log("🌐 API 호출 시작:", numPasCode, "(캐시 없음)");

    // API 호출 + 파싱
    store.setLoading(true);
    try {
      // 분기처리: questions 포함 여부에 따라 API 함수 선택
      const apiResponse = options.includeQuestions
        ? await getPassageWithQuestionsFromDatabase(numPasCode)
        : await getPassageFromDatabase(numPasCode);

      // 단순 파싱 (API → Store 스키마)
      const parsed = {
        pasCode: apiResponse.pasCode,
        title: apiResponse.title,
        content: apiResponse.content, // DB에서 이미 <p> 태그로 저장되어 있음
        descriptions: apiResponse.descriptions, // 백엔드 구조 그대로
        questions: apiResponse.questions || [],
        createdAt: apiResponse.createdAt,
        updatedAt: apiResponse.updatedAt,
      };
      console.log(parsed.questions);

      store.setPassage(parsed);
      console.log("✅ API 호출 완료 및 캐시 저장:", numPasCode);
      return store.passage;
    } catch (error) {
      console.error("지문 조회 실패:", error);
      store.setLoading(false);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  // 생성 후 캐싱 (FastAPI 데이터 재활용)
  const cacheGeneratedPassage = (pasCode, fastApiData, dbData) => {
    const combined = {
      pasCode: Number(pasCode),
      title: dbData.title,
      content: dbData.content, // DB에 저장된 데이터 사용 (이미 <p> 태그)
      descriptions: dbData.descriptions,
      questions: [],
      createdAt: dbData.createdAt,
      updatedAt: dbData.updatedAt,
    };

    store.setPassage(combined);
    console.log("생성된 지문 캐싱 완료:", pasCode);
  };

  // 지문 리스트 조회 (캐시 우선 + API 호출)
  const fetchPassageList = async (options = {}) => {
    // 캐시 확인 (강제 새로고침이 아니고 캐시된 데이터가 있으면)
    if (!options.force && store.lists.storage.length > 0) {
      console.log("⭐ 리스트 캐시에서 로드 (API 호출 없음)");
      return store.lists.storage;
    }

    console.log("🌐 리스트 API 호출 시작 (캐시 없음)");

    const selectGenerateType = (descriptions) => {
      // console.log("descriptions.length & descriptions[0].pasType",descriptions.length, descriptions[0].pasType)
      if (descriptions.length > 1) return "복합 지문";
      else if (descriptions[0].pasTpye === "독서론") return "독서론";
      else return "단일 지문";
    };

    try {
      const apiResponse = await getPrevPassageListInDatabase();
      // console.log("usePassage 에서 fetchPassageList 호출, apiResponse 응답 확인 :", apiResponse)
      // 단순 파싱 (API → Store 리스트 스키마)
      const parsed = apiResponse.map((item) => ({
        pasCode: item.pasCode,
        title: item.title,
        content: item.content, // 리스트에서도 content 포함 (미리보기용)
        generateType: selectGenerateType(item.descriptions),
        createdAt: item.createdAt,
        hasQuestions: false, // 리스트에서는 questions 정보 없음
      }));
      // console.log("parsed 값: ",parsed);
      store.setStorageList(parsed);
      console.log("✅ 리스트 API 호출 완료 및 캐시 저장, 개수:", parsed.length);
      return store.lists.storage;
    } catch (error) {
      console.error("지문 리스트 조회 실패:", error);
      throw error;
    }
  };

  return {
    // Store 데이터를 computed로 감싸서 반환
    passage: computed(() => store.passage),
    corePointTabs: computed(() => store.corePointTabs),
    passageIsLoading: computed(() => store.ui.isLoading),
    errorMessage: computed(() => store.ui.errorMessage),
    storageList: computed(() => store.lists.storage),

    // Actions
    generateAndSavePassage,
    fetchPassage,
    cacheGeneratedPassage,
    fetchPassageList, // 이름 변경: fetchStorageList -> fetchPassageList

    // Store actions 직접 노출
    clearPassage: store.clearPassage,
    setLoading: store.setLoading,
  };
}
