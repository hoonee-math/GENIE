<template>
  <!-- 데스트탑 -->
  <div class="hidden md:block">
    <div v-if="workItems.length === 0">
      <!-- 사용법 바로가기  -->
      <NotionLink />

      <!-- 최근 작업 내역 -->
      <div class="p-12">
        <div class="bg-white rounded-xl shadow-sm p-8 text-center">
          <h4 class="text-xl font-semibold mb-2">최근 작업 내역</h4>
          <span class="text-gray-500 block mb-4"
            >아직 생성하신 지문/문항이 없습니다.</span
          >
          <router-link to="/passage">
            <button
              class="bg-[#0086FF] hover:bg-[#0073E6] text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              지금 바로 시작하기
            </button>
          </router-link>
        </div>
      </div>
    </div>
    <div v-else class="p-12 pt-8">
      <section>
        <!-- 제목 + 필터 + 화살표 아이콘 -->
        <div class="flex items-center justify-between mb-4">
          <!-- 제목 + 화살표 아이콘 -->
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-semibold">최근 작업 내역</h2>
            <!-- 우측 화살표 아이콘 -->
            <svg
              class="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </div>
          <!-- 필터 컨트롤 그룹 -->
          <div class="flex gap-3 flex-wrap items-center text-sm">
            <!-- 유형 필터 -->
            <div class="relative">
              <select
                v-model="typeFilter"
                class="block w-36 px-3 py-2 pr-8 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">전체</option>
                <option value="지문">지문</option>
                <option value="문항">문항</option>
              </select>
              <svg
                class="absolute top-1/2 right-2 w-4 h-4 text-gray-400 pointer-events-none transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table
            id="historyTable"
            class="w-full table-auto whitespace-nowrap text-left"
          >
            <thead
              class="bg-white text-sm text-slate-700 border-b border-blue-100"
            >
              <tr>
                <!-- 작업명 -->
                <th
                  class="relative group px-4 py-3 w-60 min-w-[400px] max-w-[600px] cursor-pointer hover:bg-blue-50 transition-colors text-lg"
                  data-sort-key="name"
                  @click="handleSort('name')"
                >
                  작업명
                  <svg
                    class="sort-icon w-4 h-4 inline-block ml-1 text-gray-300 transition-colors group-hover:text-brand-90"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      class="asc"
                      :class="{
                        hidden:
                          currentSort.key !== 'name' ||
                          currentSort.direction !== 'asc',
                      }"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 15l7-7 7 7"
                    />
                    <path
                      class="desc"
                      :class="{
                        hidden:
                          currentSort.key !== 'name' ||
                          currentSort.direction !== 'desc',
                      }"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <div
                    class="absolute top-0 right-0 h-full w-2 cursor-col-resize group-hover:bg-brand-10 resizer"
                  ></div>
                </th>

                <!-- 제재 -->
                <th
                  class="relative group px-4 py-3 w-40 min-w-[300px] max-w-[600px] cursor-pointer hover:bg-blue-50 transition-colors text-lg"
                  data-sort-key="subject"
                  @click="handleSort('subject')"
                >
                  제재
                  <svg
                    class="sort-icon w-4 h-4 inline-block ml-1 text-gray-300 transition-colors group-hover:text-brand-90"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      class="asc"
                      :class="{
                        hidden:
                          currentSort.key !== 'subject' ||
                          currentSort.direction !== 'asc',
                      }"
                      d="M5 15l7-7 7 7"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      class="desc"
                      :class="{
                        hidden:
                          currentSort.key !== 'subject' ||
                          currentSort.direction !== 'desc',
                      }"
                      d="M19 9l-7 7-7-7"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div
                    class="absolute top-0 right-0 h-full w-2 cursor-col-resize group-hover:bg-brand-10 resizer"
                  ></div>
                </th>
                <!-- 유형 -->
                <th
                  class="group px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors whitespace-nowrap text-lg"
                  data-sort-key="type"
                  @click="handleSort('type')"
                >
                  유형
                  <svg
                    class="sort-icon w-4 h-4 inline-block ml-1 text-gray-300 group-hover:text-brand-90"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      class="asc"
                      :class="{
                        hidden:
                          currentSort.key !== 'type' ||
                          currentSort.direction !== 'asc',
                      }"
                      d="M5 15l7-7 7 7"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      class="desc"
                      :class="{
                        hidden:
                          currentSort.key !== 'type' ||
                          currentSort.direction !== 'desc',
                      }"
                      d="M19 9l-7 7-7-7"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </th>

                <!-- 작업일시 -->
                <th
                  class="group px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors whitespace-nowrap text-lg"
                  data-sort-key="date"
                  @click="handleSort('date')"
                >
                  작업일시
                  <svg
                    class="sort-icon w-4 h-4 inline-block ml-1 text-gray-300 group-hover:text-brand-90"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      class="asc"
                      :class="{
                        hidden:
                          currentSort.key !== 'date' ||
                          currentSort.direction !== 'asc',
                      }"
                      d="M5 15l7-7 7 7"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      class="desc"
                      :class="{
                        hidden:
                          currentSort.key !== 'date' ||
                          currentSort.direction !== 'desc',
                      }"
                      d="M19 9l-7 7-7-7"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </th>

                <th
                  class="px-4 py-3 text-center hover:bg-blue-50 transition-colors whitespace-nowrap min-w-[200px] text-lg"
                >
                  다운로드
                </th>
                <th
                  class="group px-4 py-3 text-center hover:bg-blue-50 cursor-pointer text-lg"
                  data-sort-key="favorite"
                  @click="handleSort('favorite')"
                >
                  즐겨찾기
                  <svg
                    class="sort-icon w-4 h-4 inline-block ml-1 text-gray-300 group-hover:text-brand-90"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      class="asc"
                      :class="{
                        hidden:
                          currentSort.key !== 'favorite' ||
                          currentSort.direction !== 'asc',
                      }"
                      d="M5 15l7-7 7 7"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      class="desc"
                      :class="{
                        hidden:
                          currentSort.key !== 'favorite' ||
                          currentSort.direction !== 'desc',
                      }"
                      d="M19 9l-7 7-7-7"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </th>
              </tr>
            </thead>

            <tbody id="historyTableBody" class="divide-y text-[16px]">
              <tr
                v-for="(item, index) in displayItems"
                :key="index"
                class="group hover:bg-[#eeeeee] cursor-pointer"
                :data-status="item.status"
                @click="handleWorkItemClick(item)"
              >
                <td class="px-4 py-2">
                  <div class="flex items-center gap-1">
                    <span>{{ item.PAS_TITLE }}</span>
                    <span
                      v-if="item.status"
                      :class="{
                        'text-orange-500': item.status === '임시저장',
                        'text-gray-400': item.status === '초안',
                      }"
                      class="ml-1"
                      :title="item.status"
                      >{{ item.status }}</span
                    >
                  </div>
                </td>
                <td class="px-4 py-2">{{ item.PAS_KEYWORD }}</td>
                <td class="px-4 py-2" :data-type="item.PAS_IS_GENERATED">
                  <span
                    :class="{
                      'bg-blue-100 text-blue-700':
                        item.PAS_IS_GENERATED === '지문',
                      'bg-purple-100 text-purple-700':
                        item.PAS_IS_GENERATED === '문항',
                    }"
                    class="px-2 py-0.5 rounded"
                    >{{ item.PAS_IS_GENERATED }}</span
                  >
                </td>
                <td class="px-4 py-2" :data-date="item.PAS_DATE">
                  {{ item.PAS_DATE }}
                </td>
                <td
                  class="px-4 py-2 text-center"
                  style="min-width: 60px; max-width: 100px; width: 80px"
                  @click.stop
                >
                  <div
                    class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <button
                      title="다운로드"
                      class="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      @click.stop="openFileModal(item)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
                <td
                  class="px-4 py-2 text-center"
                  :data-favorite="item.PAS_IS_FAVORITE"
                  @click.stop
                >
                  <span
                    class="inline-block w-6 h-6 text-[24px]"
                    title="즐겨찾기"
                    @click.stop="toggleFavorite(index)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      role="img"
                      viewBox="0 0 24 24"
                      :fill="item.PAS_IS_FAVORITE ? '#FF9F40' : 'none'"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      :class="
                        item.PAS_IS_FAVORITE ? 'text-[#FF9F40]' : 'text-gray-300'
                      "
                    >
                      <path
                        d="M12.854 3.5a.979.979 0 0 0-1.708 0q-.3.546-.577 1.106a27 27 0 0 0-1.48 3.656c-.139.431-.551.73-1.023.743a29.4 29.4 0 0 0-4.267.425c-.774.136-1.065 1.018-.515 1.556q.188.185.38.365a32 32 0 0 0 3.03 2.527c.367.269.518.73.378 1.152a27 27 0 0 0-1.14 4.927c-.1.755.708 1.288 1.41.928a28.6 28.6 0 0 0 3.98-2.472a1.15 1.15 0 0 1 1.356 0a28.5 28.5 0 0 0 3.98 2.472c.701.36 1.51-.173 1.41-.928q-.058-.425-.127-.845a27 27 0 0 0-1.013-4.082c-.14-.422.01-.883.378-1.152a31.5 31.5 0 0 0 3.41-2.892c.55-.538.26-1.42-.515-1.556a29 29 0 0 0-4.267-.425a1.1 1.1 0 0 1-1.023-.743a27 27 0 0 0-2.057-4.761"
                      />
                    </svg>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 파일 선택 모달 -->
      <FileSelectModal
        :isOpen="isModalOpen"
        :pasCode="selectedItem?.PAS_CODE"
        @close="closeFileModal"
        @confirm="handleFileSelection"
      />
    </div>
  </div>

  <!-- 모바일 -->
  <div class="md:hidden">
    <section>
      <div class="flex items-center justify-end">
        <button @click="isFilterOpen = !isFilterOpen" 
                class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm">
          <span>{{ typeFilter || '전체' }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" 
               class="w-4 h-4 transition-transform duration-200"
               :class="{ 'rotate-180': isFilterOpen }"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div v-if="isFilterOpen" 
           class="fixed inset-0 bg-black/20 z-40"
           @click="isFilterOpen = false">
        <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl transform transition-transform duration-300"
             :class="{ 'translate-y-0': isFilterOpen, 'translate-y-full': !isFilterOpen }"
             @click.stop>
          <div class="p-4 mb-[70px]">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">유형 선택</h3>
              <button @click="isFilterOpen = false" class="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="space-y-2">
              <button @click="selectType('')" 
                      class="w-full px-4 py-3 text-left rounded-xl hover:bg-gray-50 transition-colors"
                      :class="{ 'bg-blue-50 text-blue-600': typeFilter === '' }">
                전체
              </button>
              <button @click="selectType('문항')" 
                      class="w-full px-4 py-3 text-left rounded-xl hover:bg-gray-50 transition-colors"
                      :class="{ 'bg-blue-50 text-blue-600': typeFilter === '문항' }">
                문항
              </button>
              <button @click="selectType('지문')" 
                      class="w-full px-4 py-3 text-left rounded-xl hover:bg-gray-50 transition-colors"
                      :class="{ 'bg-blue-50 text-blue-600': typeFilter === '지문' }">
                지문
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="workItems.length === 0" class="mt-8">
        <div class="bg-white rounded-xl p-8 text-center">
          <h4 class="text-lg font-semibold mb-2">최근 작업 내역</h4>
          <span class="text-gray-500 block mb-6">아직 생성하신 지문/문항이 없습니다.</span>
          <router-link to="/passage">
            <button class="bg-[#0086FF] hover:bg-[#0073E6] text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200">
              지금 바로 시작하기
            </button>
          </router-link>
        </div>
      </div>

      <div v-else class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[600px] text-sm">
            <thead class="text-xs text-gray-600 border-b border-gray-100">
              <tr>
                <th class="px-4 py-3 text-left font-medium w-[40%]">작업명</th>
                <th class="px-4 py-3 text-left font-medium w-[18%]">제재</th>
                <th class="px-4 py-3 text-left font-medium w-[15%]">유형</th>
                <th class="px-4 py-3 text-left font-medium w-[15%]">작업일시</th>
                <th class="px-4 py-3 text-center font-medium w-[10%] whitespace-nowrap">다운로드</th>
                <th class="px-4 py-3 text-center font-medium w-[10%] whitespace-nowrap">즐겨찾기</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(item, index) in displayItems" 
                  :key="index"
                  class="hover:bg-gray-50/50 transition-colors border-b border-gray-100 cursor-pointer"
                  @click="handleWorkItemClick(item)">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <span class="text-gray-900 truncate text-sm">{{ item.PAS_TITLE }}</span>
                    <span v-if="item.status" 
                          :class="{
                            'text-orange-500': item.status === '임시저장',
                            'text-gray-400': item.status === '초안'
                          }"
                          class="text-xs whitespace-nowrap">{{ item.status }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600 truncate text-sm">{{ item.PAS_KEYWORD }}</td>
                <td class="px-4 py-3">
                  <span :class="{
                    'bg-blue-100 text-blue-700': item.PAS_IS_GENERATED === '지문',
                    'bg-purple-100 text-purple-700': item.PAS_IS_GENERATED === '문항'
                  }" class="px-2 py-0.5 rounded text-xs whitespace-nowrap">{{ item.PAS_IS_GENERATED }}</span>
                </td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap text-sm">{{ item.PAS_DATE }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-1" @click.stop>
                    <button v-if="item.status === '임시저장' || item.status === '초안'"
                            @click.stop="handleWorkItemClick(item)"
                            class="p-1.5 rounded-lg hover:bg-green-50 text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347c.75.413.75 1.559 0 1.972l-11.54 6.347c-.75.413-1.667-.13-1.667-.986V5.653Z"/>
                      </svg>
                    </button>
                    <button @click.stop="openFileModal(item)"
                            class="p-1.5 rounded-lg hover:bg-gray-50 text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                      </svg>
                    </button>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <button @click.stop="toggleFavorite(index)" class="p-1.5 mx-auto block">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" 
                         :class="item.PAS_IS_FAVORITE ? 'text-[#FF9F40]' : 'text-gray-300'"
                         :fill="item.PAS_IS_FAVORITE ? '#FF9F40' : 'none'"
                         viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                            d="M12.854 3.5a.979.979 0 0 0-1.708 0q-.3.546-.577 1.106a27 27 0 0 0-1.48 3.656c-.139.431-.551.73-1.023.743a29.4 29.4 0 0 0-4.267.425c-.774.136-1.065 1.018-.515 1.556q.188.185.38.365a32 32 0 0 0 3.03 2.527c.367.269.518.73.378 1.152a27 27 0 0 0-1.14 4.927c-.1.755.708 1.288 1.41.928a28.6 28.6 0 0 0 3.98-2.472a1.15 1.15 0 0 1 1.356 0a28.5 28.5 0 0 0 3.98 2.472c.701.36 1.51-.173 1.41-.928q-.058-.425-.127-.845a27 27 0 0 0-1.013-4.082c-.14-.422.01-.883.378-1.152a31.5 31.5 0 0 0 3.41-2.892c.55-.538.26-1.42-.515-1.556a29 29 0 0 0-4.267-.425a1.1 1.1 0 0 1-1.023-.743a27 27 0 0 0-2.057-4.761"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import FileSelectModal from "@/components/common/FileSelectModal.vue";
import NotionLink from "@/views/main/NotionLink.vue";
import { apiGet, apiPatch } from '@/utils/http';

// 라우터와 스토어 초기화
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 작업 아이템 상태
const workItems = ref([]);

// 필터 상태
const isFilterOpen = ref(false);
const typeFilter = ref("");
const statusFilter = ref("");
const dateFilter = ref("");

// 정렬 상태
const currentSort = ref({ key: null, direction: "asc" });

// 컴포넌트 마운트 시, 데이터 로드
onMounted(() => {
  fetchWorkItems();
  setupTableResize();
});

// 최대 표시 아이템 수
const maxDisplayItems = 10;

// 필터링된 아이템들
const filteredItems = computed(() => {
  return workItems.value.filter((item) => {
    const typeMatch =
      !typeFilter.value || item.PAS_IS_GENERATED === typeFilter.value;
    const statusMatch =
      !statusFilter.value || item.status === statusFilter.value;
    const dateMatch = !dateFilter.value || item.PAS_DATE === dateFilter.value;
    return typeMatch && statusMatch && dateMatch;
  });
});

// 정렬된 아이템들
const sortedItems = computed(() => {
  const items = [...filteredItems.value];
  if (!currentSort.value.key) return items;

  return items.sort((a, b) => {
    let valA, valB;

    switch (currentSort.value.key) {
      case "name":
        valA = a.PAS_TITLE.toLowerCase();
        valB = b.PAS_TITLE.toLowerCase();
        break;
      case "subject":
        valA = a.PAS_KEYWORD.toLowerCase();
        valB = b.PAS_KEYWORD.toLowerCase();
        break;
      case "type":
        valA = a.PAS_IS_GENERATED.toLowerCase();
        valB = b.PAS_IS_GENERATED.toLowerCase();
        break;
      case "date":
        valA = a.PAS_DATE;
        valB = b.PAS_DATE;
        break;
      case "favorite":
        valA = a.PAS_IS_FAVORITE ? 1 : 0;
        valB = b.PAS_IS_FAVORITE ? 1 : 0;
        break;
      default:
        return 0;
    }

    if (valA < valB) return currentSort.value.direction === "asc" ? -1 : 1;
    if (valA > valB) return currentSort.value.direction === "asc" ? 1 : -1;
    return 0;
  });
});

// 표시할 아이템들
const displayItems = computed(() => {
  return sortedItems.value.slice(0, maxDisplayItems);
});

// 정렬 처리 함수
const handleSort = (key) => {
  if (currentSort.value.key === key) {
    currentSort.value.direction =
      currentSort.value.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.value = { key, direction: "asc" };
  }
};

// 테이블 리사이즈 설정
const setupTableResize = () => {
  const resizableColumns = document.querySelectorAll(
    'th[data-sort-key="name"], th[data-sort-key="subject"]'
  );

  resizableColumns.forEach((th) => {
    const resizer = th.querySelector(".resizer");
    if (!resizer) return;

    let startX, startWidth;

    resizer.addEventListener("mousedown", (e) => {
      startX = e.pageX;
      startWidth = th.offsetWidth;
      document.body.style.cursor = "col-resize";

      const onMouseMove = (e) => {
        const newWidth = Math.max(startWidth + (e.pageX - startX), 60);
        th.style.width = `${newWidth}px`;

        const idx = Array.from(th.parentNode.children).indexOf(th);
        document.querySelectorAll("#historyTable tbody tr").forEach((tr) => {
          tr.children[idx].style.width = `${newWidth}px`;
        });
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });
};

// 최근 작업 내역 리스트 가져오기
const fetchWorkItems = async () => {
  try {
    // console.log('WorkList: 작업 목록 요청 시작');
    
    // 보안 우선 API 시스템 사용
    const data = await apiGet('/api/pass/select/recelist');
    
    // console.log('WorkList: 작업 목록 수신 성공:', data);
    
    // 기존 데이터 처리 로직 그대로 유지
    if (data && data.length > 0) {
        // workItems.value = data;
        workItems.value = data.map((item) => ({
          PAS_CODE: item.pasCode,
          PAS_TITLE: item.title,
          PAS_KEYWORD: item.keyword,
          PAS_IS_GENERATED: item.isGenerated === 1 ? "지문" : "문항",
          PAS_DATE: item.date,
          PAS_IS_FAVORITE: item.isFavorite === 1,
        }));
    } else {
      workItems.value = [];
    }
    
  } catch (error) {
    console.error('WorkList: 작업 목록 요청 실패:', error);
    workItems.value = [];
  }
};

// 작업명 클릭시, 해당 화면으로 이동
const handleWorkItemClick = async (item) => {
  const pasCode = item.PAS_CODE;



  // PAS_IS_GENERATED 값에 따라 API 및 페이지 분기처리
  const isGeneratedText = item.PAS_IS_GENERATED;
  const isPassage = isGeneratedText === "지문";
  // '지문'인 경우 true, '문항'인 경우 false

  // api 엔드 포인트 결정
  const endpoint = isPassage
    ? `/api/pass/select/${pasCode}`
    : `/api/pass/ques/select/${pasCode}`;

  
  try {
    // API 호출 (자동 토큰 갱신 및 401 에러 처리)
    const data = await apiGet(endpoint);

    if (isPassage) {
      // 지문인 경우 - PassageContent.vue로 이동
      // 데이터 형식 변환 및 저장
      const passageData = {
        pasCode: data.pasCode,  title: data.title,      type: data.type,
        keyword: data.keyword,  content: data.content,  gist: data.gist,
      };

      // 통합 키로 저장
      localStorage.setItem(
        "genieq-passage-data",
        JSON.stringify(passageData)
      );

      // 지문 생성 페이지로 이동
      router.push(`/passage/view/${passageData.pasCode}`);
    } else {
      // 문항인 경우 - GenerateQuestion.vue로 이동
      // 데이터 형식 변환 및 저장
      const questionData = {
        passage: {
          pasCode: data.pasCode,  title: data.title,      type: data.type,          
          keyword: data.keyword,  content: data.content,  gist: data.gist,
          questions: data.questions.map((q) => ({
            queCode: q.queCode, queQuery: q.queQuery, queOption: q.queOption,
            queAnswer: q.queAnswer, description: q.description,
          })),
        },
      };

      // 로컬 스토리지에 저장
      localStorage.setItem("saveResponse", JSON.stringify(questionData));

      // 문항 생성 페이지로 이동
      router.push({
        path: `/questions/view/${pasCode}`,
        // query: { from: route.path }, // 현재 경로 전달
      });
    }

  } catch (error) {
    // 에러 처리 (APIError 클래스 활용)
    console.error('데이터 조회 실패:', error);
    
    if (error.status === 401) {
      // 401 에러는 이미 apiGet에서 자동 처리됨
      // 여기서는 추가적인 UI 피드백만 제공
      alert("인증이 만료되었습니다. 다시 로그인해주세요.");
    } else if (error.status === 404) {
      alert("요청한 데이터를 찾을 수 없습니다.");
    } else {
      alert("데이터를 가져오는 중 오류가 발생했습니다: " + error.message);
    }
  }
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
const toggleFavorite = async (index) => {
    const item = workItems.value[index];

    // 즐겨찾기 토글 로직
    const newFavoriteStatus = !item.PAS_IS_FAVORITE;

    try {
        const data = await apiPatch('/api/pass/favo',{pasCode: item.PAS_CODE});
        // 서버에서 반환한 업데이트된 데이터로 항목 상태 갱신
        if (data.isFavorite !== undefined) {
            item.PAS_IS_FAVORITE = data.isFavorite === 1;
        } else {
            // 서버에서 업데이트된 상태를 반환하지 않는 경우, 로컬에서 토글
            item.PAS_IS_FAVORITE = newFavoriteStatus;
        }
    } catch(error) {
        console.error("즐겨찾기 업데이트 실패")
    }
};

// 유형 선택 함수
const selectType = (type) => {
  typeFilter.value = type;
  isFilterOpen.value = false;
};
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
