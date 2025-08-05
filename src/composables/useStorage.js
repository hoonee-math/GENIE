import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePassageStore } from "@/stores/passage";
import { apiGet, apiPatch } from "@/utils/http";

/**
 * Storage 관련 상태 및 로직을 관리하는 Composable
 * - 캐싱 없는 단순한 API 호출 방식
 * - Query Parameter 기반 상태 관리
 * - 백엔드 응답 구조를 그대로 사용
 */
export function useStorage() {
  const route = useRoute();
  const router = useRouter();
  const store = usePassageStore();

  // ===== URL 상태 파싱 =====
  const currentType = computed(() => route.params.type || "recent");
  const currentPage = computed(() => parseInt(route.query.page) || 1);

  // 🔥 Query Parameter에서 필터 상태 파싱
  const currentFilters = computed(() => ({
    field: route.query.field || "", // 분야 필터 (인문, 사회, 예술, 과학, 기술)
    type: route.query.type || "", // 유형 필터 (지문, 문항)
    search: route.query.search || "", // 검색어
    sort: route.query.sort || "date", // 정렬 기준 (date, title, favorite)
    order: route.query.order || "desc", // 정렬 순서 (asc, desc)
  }));

  // ===== Store 상태 접근 =====
  const currentData = computed(() => store.getListItems(currentType.value));
  const pagination = computed(() => store.getListPagination(currentType.value));
  const isLoading = computed(() => store.isListLoading(currentType.value));
  const error = computed(() => store.getListError(currentType.value));

  // ===== API 엔드포인트 매핑 =====
  const getApiEndpoint = (storageType) => {
    const endpoints = {
      recent: "/api/pass/storage/recent",
      favorites: "/api/pass/storage/favorite",
      trash: "/api/pass/storage/deleted",
    };
    return endpoints[storageType] || endpoints.recent;
  };

  // ===== 타입별 제목 매핑 =====
  const getTypeTitle = (type) => {
    const titles = {
      recent: "최근 문서함",
      favorites: "즐겨찾기",
      trash: "휴지통",
    };
    return titles[type] || titles.recent;
  };

  // ===== 메인 데이터 Fetch 함수 (캐싱 없음) =====
  const fetchData = async (
    type = currentType.value,
    page = currentPage.value,
    filters = currentFilters.value
  ) => {
    console.log(`🔄 Fetching ${type} data - Page: ${page}, Filters:`, filters);

    // 로딩 시작
    store.setListLoading(type, true);

    try {
      // API 파라미터 구성
      const params = {
        page,
        size: 15, // 고정 페이지 크기
        ...filters, // field, type, search, sort, order
      };

      // 빈 값 제거
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const endpoint = getApiEndpoint(type);
      console.log(`📡 API 호출: ${endpoint}`, params);

      const response = await apiGet(endpoint, { params });
      // try{
      //   const response = await apiGet(endpoint, { params });
      //   console.log('****',endpoint,'요청에 대한 응답 데이터: ', response);
      // }catch{
      //   console.log('****',endpoint,'로 요청 실패');
      // }

      // const tempResponse = await apiGet("/api/pass/select/recelist");
      // console.log("tempResponse: ", tempResponse[0]);

      // // 임시로 childPassages 추가
      // const itemsWithChildPassages = tempResponse.map(item => ({
      //   ...item,
      //   childPassages: [
      //     {
      //       pasCode: 10001,
      //       title: `${item.title} - 하위 지문 1`,
      //       type: "지문+문항", isFavorite: false,
      //       date: new Date().toISOString(),
      //       questions: []
      //     },
      //     {
      //       pasCode: 10002,
      //       title: `${item.title} - 하위 지문 2`,
      //       type: "지문+문항", isFavorite: true,
      //       date: new Date().toISOString(),
      //       questions: []
      //     }
      //   ]
      // }));

      // console.log("itemsWithChildPassages: ", itemsWithChildPassages[0]);

      // const response = {
      //   totalCount: 50,
      //   totalPages: 4,
      //   items: itemsWithChildPassages,
      // };

      // 🔥 백엔드 응답 구조 예상
      // {
      //   totalCount: 50,
      //   totalPages: 4,
      //   items: [
      //     {
      //       pasCode: 1,
      //       title: "지문 제목",
      //       descriptions: [{ pasType: "기술", keyword: "AI", gist: "..." }],
      //       isGenerated: 1,
      //       date: "2024-01-01",
      //       isFavorite: true,
      //       childPassages: [...]  // 추후 추가 예정
      //     }
      //   ]
      // }

      console.log("response: ", response);
      // Store에 데이터 저장 (변환 없이 그대로)
      store.setListData(
        type,
        response.items || [],
        response.totalCount || 0,
        response.totalPages || 0,
        page
      );

      console.log(
        `✅ ${type} 데이터 로드 완료:`,
        response.items?.length,
        "개 아이템"
      );
      return response.items || [];
    } catch (error) {
      console.error(`❌ ${type} 데이터 fetch 실패:`, error);

      // 에러 상태 저장
      store.setListError(
        type,
        error.message || "데이터를 불러오는데 실패했습니다."
      );

      return [];
    } finally {
      // 로딩 완료
      store.setListLoading(type, false);
    }
  };

  // ===== URL 업데이트 함수들 =====

  /**
   * 필터 변경 시 URL 업데이트
   * @param {Object} newFilters - 새로운 필터 값들
   * @param {boolean} resetPage - 페이지를 1로 리셋할지 여부
   */
  const updateFilters = async (newFilters, resetPage = true) => {
    const query = { ...route.query };

    // 새로운 필터 값들 적용
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key] && newFilters[key] !== "") {
        query[key] = newFilters[key];
      } else {
        delete query[key]; // 빈 값은 쿼리에서 제거
      }
    });

    // 페이지 리셋
    if (resetPage) {
      if (query.page && query.page !== "1") {
        query.page = "1";
      } else {
        delete query.page; // 1페이지면 쿼리에서 제거
      }
    }

    // URL 업데이트
    await router.push({
      path: `/storage/${currentType.value}`,
      query: Object.keys(query).length > 0 ? query : undefined,
    });
  };

  /**
   * 페이지 변경 (필터 유지)
   * @param {number} page - 이동할 페이지 번호
   */
  const changePage = async (page) => {
    const query = { ...route.query };

    if (page === 1) {
      delete query.page; // 1페이지면 쿼리에서 제거
    } else {
      query.page = page.toString();
    }

    await router.push({
      path: `/storage/${currentType.value}`,
      query: Object.keys(query).length > 0 ? query : undefined,
    });
  };

  /**
   * 타입 변경 (recent, favorites, trash)
   * @param {string} type - 변경할 타입
   */
  const changeType = async (type) => {
    await router.push({
      path: `/storage/${type}`,
      // 쿼리 파라미터 초기화 (타입 변경 시 필터 리셋)
    });
  };

  /**
   * 필터 초기화
   */
  const clearFilters = async () => {
    await router.push({
      path: `/storage/${currentType.value}`,
      // 쿼리 파라미터 없음 = 모든 필터 초기화
    });
  };

  // ===== 아이템 상호작용 함수들 =====

  /**
   * 즐겨찾기 토글
   * @param {Object} item - 토글할 아이템
   */
  const toggleFavorite = async (item) => {
    try {
      // API 호출 (기존 StorageList.vue와 동일한 방식)
      const response = await apiPatch("/api/pass/favo", {
        pasCode: item.pasCode
      });

      // 로컬 데이터 즉시 업데이트
      const itemIndex = currentData.value.findIndex(dataItem => dataItem.pasCode === item.pasCode);
      if (itemIndex !== -1) {
        if (response.isFavorite !== undefined) {
          currentData.value[itemIndex].isFavorite = response.isFavorite === 1;
        } else {
          // API 응답에 isFavorite가 없으면 토글
          currentData.value[itemIndex].isFavorite = !item.isFavorite;
        }
        console.log('🌟 즐겨찾기 업데이트 완료:', currentData.value[itemIndex].isFavorite);
      }

      // Store 업데이트 (선택사항 - 필요에 따라)
      if (store.updateListItem) {
        store.updateListItem(currentType.value, item.pasCode, {
          isFavorite: response.isFavorite !== undefined ? response.isFavorite === 1 : !item.isFavorite,
        });
      }
    } catch (error) {
      console.error("즐겨찾기 업데이트 실패:", error);
    }
  };

  /**
   * 아이템 클릭 처리 (상세 페이지로 이동)
   * @param {Object} item - 클릭된 아이템
   */
  const handleItemClick = async (item) => {
    try {
      const isGeneratedText = item.isGenerated === 1;

      if (currentType.value === "recent") {
        // recent: 라우팅 방식
        if (isGeneratedText) {
          await router.push({
            path: `/passage/view/${item.pasCode}`,
            query: { from: route.path },
          });
        } else {
          await router.push({
            path: `/questions/view/${item.pasCode}`,
            query: { from: route.path },
          });
        }
      } else {
        // favorites, trash: localStorage 방식 (기존 로직 유지)
        const endpoint = isGeneratedText
          ? `/api/pass/select/${item.pasCode}`
          : `/api/pass/ques/select/${item.pasCode}`;

        const data = await apiGet(endpoint);

        if (isGeneratedText) {
          const passageData = {
            pasCode: data.pasCode,
            title: data.title,
            type: data.type,
            keyword: data.keyword,
            content: data.content,
            gist: data.gist,
          };
          localStorage.setItem(
            "genieq-passage-data",
            JSON.stringify(passageData)
          );
          await router.push("/passage/create");
        } else {
          const questionData = {
            passage: {
              pasCode: data.pasCode,
              title: data.title,
              type: data.type,
              keyword: data.keyword,
              content: data.content,
              gist: data.gist,
              questions: data.questions.map((q) => ({
                queCode: q.queCode,
                queQuery: q.queQuery,
                queOption: q.queOption,
                queAnswer: q.queAnswer,
                description: q.description,
              })),
            },
          };
          localStorage.setItem("saveResponse", JSON.stringify(questionData));
          await router.push({
            path: "/questions/generate",
            query: { from: route.path },
          });
        }
      }
    } catch (error) {
      console.error("아이템 클릭 처리 실패:", error);
      alert("데이터를 가져오는 중 오류가 발생했습니다: " + error.message);
    }
  };

  // ===== 반환값 =====
  return {
    // 상태
    currentType,
    currentPage,
    currentFilters,
    currentData,
    pagination,
    isLoading,
    error,

    // 메서드
    fetchData,
    updateFilters,
    changePage,
    changeType,
    clearFilters,
    toggleFavorite,
    handleItemClick,

    // 유틸리티
    getTypeTitle,
  };
}