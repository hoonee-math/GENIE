<template>
  <div class="card-container">
    <div class="storage-likelist-title">
      <router-link to="/storage/likelistMina" class="worklist-link">
        <p>즐겨찾기</p>
        <Icon
          icon="weui:arrow-outlined"
          width="24"
          height="24"
          id="arrow-icon"
          style="color: #303030"
        />
      </router-link>
    </div>
    <div class="storage-likelist-table">
      <div class="table-container">
        <template v-if="displayItems.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>작업명</th>
                <th>제재</th>
                <th>유형</th>
                <th>최종 작업일</th>
                <th>추출하기</th>
                <th>즐겨찾기</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in displayItems" :key="index">
                <td class="work-name" @click="handleWorkItemClick(item)">
                  {{ item.PAS_TITLE }}
                </td>
                <td class="work-title" @click="handleWorkItemClick(item)">
                  {{ item.PAS_KEYWORD }}
                </td>
                <td class="work-type">
                  <span class="type-tag">{{ item.PAS_IS_GENERATED }}</span>
                </td>
                <td class="work-date">{{ item.PAS_DATE }}</td>
                <td class="work-action">
                  <button class="extract-btn" @click="openFileModal(item)">
                    <p id="btn-text">추출</p>
                    <Icon
                      icon="lucide:upload"
                      id="btn-icon"
                      style="color: #ffffff"
                    />
                  </button>
                </td>
                <td class="work-favorite">
                  <span class="star-container" @click="toggleFavorite(index)">
                    <Icon
                      v-if="item.PAS_IS_FAVORITE"
                      icon="mynaui:star-solid"
                      width="24"
                      height="24"
                      style="color: #0086ff"
                    />
                    <Icon
                      v-else
                      icon="mynaui:star"
                      width="24"
                      height="24"
                      style="color: #0086ff"
                    />
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-else>
          <span class="empty-message">즐겨찾기가 비어있습니다.</span>
        </template>
      </div>
    </div>

    <!-- 파일 선택 모달 -->
    <FileSelectModal
      :isOpen="isModalOpen"
      :pasCode="selectedItem?.PAS_CODE"
      @close="closeFileModal"
      @confirm="handleFileSelection"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import FileSelectModal from "@/components/common/FileSelectModal.vue";

// 라우터와 스토어 초기화
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 작업 아이템 상태
const workItems = ref([]);

// 컴포넌트 마운트 시, 데이터 로드
onMounted(() => {
  fetchWorkItems();
});

// 최대 표시 아이템 수
const maxDisplayItems = 5;

// 표시할 아이템들
const displayItems = computed(() => {
  return workItems.value.slice(0, maxDisplayItems);
});

// 즐겨찾기 리스트 가져오기
const fetchWorkItems = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  fetch(`/api/pass/select/favolist`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        // 인증 오류 처리 (401)
        if (response.status === 401) {
          // 인증 상태 초기화
          authStore.user = null;
          authStore.isAuthenticated = false;
          localStorage.removeItem("authUser");

          // 로그인 페이지로 리다이렉트
          router.push({
            path: "/login",
            query: { redirect: route.fullPath },
          });

          throw new Error("인증이 필요합니다");
        }
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
      return response.json();
    })
    .then((data) => {
      // 응답 데이터 구조에 맞게 매핑
      workItems.value = data.map((item) => ({
        PAS_CODE: item.pasCode,
        PAS_TITLE: item.title,
        PAS_KEYWORD: item.keyword,
        PAS_IS_GENERATED: item.isGenerated === 1 ? "지문" : "문항",
        PAS_DATE: item.date,
        PAS_IS_FAVORITE: item.isFavorite === 1,
      }));
    })
    .catch((error) => {});
};

// 작업명 클릭시, 해당 화면으로 이동
const handleWorkItemClick = (item) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const pasCode = item.PAS_CODE;

  // PAS_IS_GENERATED 값에 따라 API 및 페이지 분기처리
  const isGeneratedText = item.PAS_IS_GENERATED;
  const isPassage = isGeneratedText === "지문";
  // '지문'인 경우 true, '문항'인 경우 false

  // api 엔드 포인트 결정
  const endpoint = isPassage
    ? `/api/pass/select/${pasCode}`
    : `/api/pass/ques/select/${pasCode}`;

  // api 호출
  fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        // 인증 오류 처리 (401)
        if (response.status === 401) {
          // 인증 상태 초기화
          authStore.user = null;
          authStore.isAuthenticated = false;
          localStorage.removeItem("authUser");

          // 로그인 페이지로 리다이렉트
          router.push({
            path: "/login",
            query: { redirect: route.fullPath },
          });

          throw new Error("인증이 필요합니다");
        }
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
      return response.json();
    })
    .then((data) => {
      if (isPassage) {
        // 지문인 경우 - PassageContent.vue로 이동
        // 데이터 형식 변환 및 저장
        const passageData = {
          pasCode: data.pasCode,
          title: data.title,
          type: data.type,
          keyword: data.keyword,
          content: data.content,
          gist: data.gist,
        };

        // 통합 키로 저장
        localStorage.setItem(
          "genieq-passage-data",
          JSON.stringify(passageData)
        );

        // 지문 생성 페이지로 이동
        router.push("/passage/create");
      } else {
        // 문항인 경우 - GenerateQuestion.vue로 이동
        // 데이터 형식 변환 및 저장
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

        // 로컬 스토리지에 저장
        localStorage.setItem("saveResponse", JSON.stringify(questionData));

        // 문항 생성 페이지로 이동
        router.push({
          path: "/questions/generate",
          query: { from: route.path }, // 현재 경로 전달
        });
      }
    })
    .catch((error) => {
      alert("데이터를 가져오는 중 오류가 발생했습니다.");
    });
};

// 모달 상태 관리
const isModalOpen = ref(false);
const selectedItem = ref(null);

// 추출 버튼 클릭 시 모달 열기
const openFileModal = (item) => {
  selectedItem.value = item;
  isModalOpen.value = true;
};

// 모달 닫기
const closeFileModal = () => {
  isModalOpen.value = false;
};

// 파일 형식 선택 후 처리
const handleFileSelection = (fileType) => {
  // 파일 추출 로직 구현
};

const toggleFavorite = (index) => {
  const item = displayItems.value[index];
  const apiUrl = import.meta.env.VITE_API_URL;

  // 즐겨찾기 토글 로직
  const newFavoriteStatus = !item.PAS_IS_FAVORITE;

  // API 호출
  fetch(`/api/pass/favo`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      pasCode: item.PAS_CODE,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("즐겨찾기 업데이트 실패");
      }
      return response.json();
    })
    .then((data) => {
      // 서버에서 반환한 업데이트된 데이터로 항목 상태 갱신
      if (data.isFavorite !== undefined) {
        item.PAS_IS_FAVORITE = data.isFavorite === 1;
      } else {
        // 서버에서 업데이트된 상태를 반환하지 않는 경우, 로컬에서 토글
        item.PAS_IS_FAVORITE = newFavoriteStatus;
      }

      // 즐겨찾기가 해제된 경우, 리스트 다시 로드
      if (!item.PAS_IS_FAVORITE) {
        fetchWorkItems();
      }
    })
    .catch((error) => {});
};
</script>

<style scoped>
.card-container {
  width: 100%;
  min-width: 0;
  max-width: 100vw;
  min-height: 37vh;
  padding: 2% 2% 1% 2%;
  box-sizing: border-box;
  border-radius: 12px;
  position: relative;
  left: 0;
}

/* 타이틀을 카드 밖에서 쓸 수 있도록 별도 클래스 */
.list-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1em 0;
  color: #303030;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.worklist-link {
  display: flex;
  gap: 0.5em;
  text-decoration: none;
  color: #303030;
}

.storage-likelist-title {
  display: flex;
  align-items: flex-start;
  isolation: isolate;
  position: static;
  box-sizing: border-box;
  margin-bottom: 1em;
}

.storage-likelist-title p {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.storage-likelist-table {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1em;
  isolation: isolate;
  background: #ffffff;
  border-radius: 12px;
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
  min-width: 0;
  margin-top: 0.5em;
  position: static;
}

.table-container {
  width: 100%;
  min-height: 12em;
  overflow-x: auto;
  overflow-y: hidden;
}

.data-table {
  width: 100%;
  min-width: 60vw;
  max-width: 100vw;
  border-collapse: collapse;
  table-layout: fixed;
}

.data-table th {
  text-align: left;
  padding: 0.7em 1.2em;
  border-bottom: 1px solid #e1e1e1;
  font-weight: 700;
  font-size: 1.1rem;
  color: #424242;
}

.data-table td {
  text-align: left;
  padding: 0.3em 1.2em;
  color: #424242;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-table tr {
  border-bottom: 1px solid #e1e1e1;
}
.data-table tr:last-child {
  border-bottom: none;
}

/* 열 너비 조정 (비율 유지) */
.data-table th:nth-child(1),
.data-table td:nth-child(1) {
  width: 30%;
}
.data-table th:nth-child(2),
.data-table td:nth-child(2) {
  width: 20%;
}
.data-table th:nth-child(3),
.data-table td:nth-child(3) {
  width: 12%;
}
.data-table th:nth-child(4),
.data-table td:nth-child(4) {
  width: 15%;
}
.data-table th:nth-child(5),
.data-table td:nth-child(5) {
  width: 15%;
}
.data-table th:nth-child(6),
.data-table td:nth-child(6) {
  width: 10%;
  text-align: center;
}

.data-table td:nth-child(1),
.data-table td:nth-child(2) {
  cursor: pointer;
}

/* 마지막 행의 셀에 border-radius 적용 */
.data-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 12px;
}
.data-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 12px;
}

/* 유형 태그 스타일 */
.type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3em;
  height: 1.7em;
  background-color: #f0f0f0;
  border-radius: 12px;
  padding: 0 0.7em;
  font-size: 1em;
  color: #333;
  font-weight: 500;
}

/* 테이블이 비어있는 경우 */
.empty-message {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 12em;
  font-size: 1.1rem;
}

/* 추출 버튼 */
.extract-btn {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0.3em 0.7em;
  gap: 0.5em;
  width: 4.5em;
  height: 2em;
  background: #303030;
  border-radius: 8px;
}

#btn-text {
  font-family: "Pretendard";
  font-style: normal;
  font-weight: 600;
  font-size: 1em;
  line-height: 150%;
  letter-spacing: -0.02em;
  color: #ffffff;
}

#btn-icon {
  width: 1.2em;
  height: 1.2em;
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* 별 아이콘 */
.star-container {
  cursor: pointer;
}

/* 행 hover 효과 */
.data-table tbody tr:hover {
  background-color: #eaeaea;
}
</style>
