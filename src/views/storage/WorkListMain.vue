<template>
  <div class="hidden md:block flex flex-col gap-3 mx-auto p-4 sm:p-8 w-full">
    <!-- Title Section -->
    <div class="flex items-start gap-3 mb-2">
      <p class="text-xl sm:text-2xl font-bold text-black">최근 문서함</p>
    </div>

    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"
    >
      <div class="flex items-center gap-1">
        <span class="text-base text-black">전체</span>
        <p class="text-base font-semibold text-[#0086ff]">
          ({{ filteredWorkItems.length }}개)
        </p>
        <span
          v-if="searchQuery && hasSearchResults"
          class="text-base text-[#757575]"
        >
          "{{ searchQuery }}"에 대한 검색 결과입니다.
        </span>
      </div>

      <div
        class="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center w-full sm:w-auto"
      >
        <!-- Filter Section -->
        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <!-- 분야 필터 -->
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select
              v-model="selectedField"
              class="w-full sm:w-[140px] h-9 px-3 pr-8 text-sm text-[#757575] border border-[#757575] rounded-md focus:outline-none focus:border-[#0086ff] bg-white appearance-none bg-no-repeat bg-[length:16px] bg-[center_right_8px] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23757575%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]"
              @change="handleFilterChange"
            >
              <option value="">전체 분야</option>
              <option value="인문">인문</option>
              <option value="사회">사회</option>
              <option value="예술">예술</option>
              <option value="과학">과학</option>
              <option value="기술">기술</option>
            </select>
          </div>

          <!-- 유형 필터 -->
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select
              v-model="selectedType"
              class="w-full sm:w-[140px] h-9 px-3 pr-8 text-sm text-[#757575] border border-[#757575] rounded-md focus:outline-none focus:border-[#0086ff] bg-white appearance-none bg-no-repeat bg-[length:16px] bg-[center_right_8px] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23757575%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]"
              @change="handleFilterChange"
            >
              <option value="">전체 유형</option>
              <option value="지문">지문</option>
              <option value="문항">문항</option>
              <option value="지문+문항">지문+문항</option>
            </select>
          </div>
        </div>

        <!-- Search Box -->
        <div class="relative w-full sm:w-[140px]">
          <input
            type="text"
            placeholder="작업명 검색"
            class="w-full h-9 pl-8 pr-3 text-sm text-[#757575] border border-[#757575] rounded-md focus:outline-none focus:border-[#0086ff] bg-white"
            v-model="searchQuery"
            @input="handleSearch"
          />
          <div class="absolute left-2.5 top-1/2 -translate-y-1/2">
            <Icon
              icon="iconamoon:search-light"
              width="16px"
              height="16px"
              class="text-[#757575]"
            />
          </div>
        </div>

        <!-- Delete Button -->
        <button
          @click="openDeleteModal"
          class="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-red-600 border border-red-600 rounded-md px-3 py-1.5 hover:bg-red-50 transition-colors bg-white"
        >
          <span>삭제</span>
          <Icon icon="cil:trash" width="16" height="16" class="text-red-600" />
        </button>
      </div>
    </div>

    <!-- No Results Message -->
    <div
      v-if="filteredWorkItems.length === 0 && searchQuery"
      class="flex justify-center items-center w-full h-[667px] bg-white rounded-xl"
    >
      <div class="text-base text-[#757575]">
        "{{ searchQuery }}"에 대한 검색결과가 없습니다.
      </div>
    </div>

    <!-- Table Section -->
    <div v-else class="w-full bg-white rounded-xl shadow-sm overflow-x-auto">
      <div class="w-full overflow-x-auto">
        <template v-if="computedWorkItems.length > 0">
          <table
            id="historyTable"
            class="w-full table-auto whitespace-nowrap text-left min-w-[800px]"
          >
            <thead
              class="bg-white text-sm text-slate-700 border-b border-blue-100"
            >
              <tr>
                <th
                  class="relative group px-4 py-3 w-[7%] min-w-[60px] max-w-[80px] cursor-pointer hover:bg-blue-50 transition-colors text-base sm:text-lg text-center"
                >
                  선택
                  <div
                    class="absolute top-0 right-0 h-full w-2 cursor-col-resize group-hover:bg-[#0086ff1c] resizer"
                  ></div>
                </th>
                <th
                  class="relative group px-4 py-3 w-[20%] min-w-[200px] max-w-[400px] cursor-pointer hover:bg-blue-50 transition-colors text-base sm:text-lg"
                >
                  작업명
                  <div
                    class="absolute top-0 right-0 h-full w-2 cursor-col-resize group-hover:bg-[#0086ff1c] resizer"
                  ></div>
                </th>
                <th
                  class="relative group px-4 py-3 w-[12%] min-w-[120px] max-w-[200px] cursor-pointer hover:bg-blue-50 transition-colors text-base sm:text-lg"
                >
                  분야
                  <div
                    class="absolute top-0 right-0 h-full w-2 cursor-col-resize group-hover:bg-[#0086ff1c] resizer"
                  ></div>
                </th>
                <th
                  class="relative group px-4 py-3 w-[12%] min-w-[120px] max-w-[200px] cursor-pointer hover:bg-blue-50 transition-colors text-base sm:text-lg"
                >
                  제재
                  <div
                    class="absolute top-0 right-0 h-full w-2 cursor-col-resize group-hover:bg-[#0086ff1c] resizer"
                  ></div>
                </th>
                <th
                  class="relative group px-4 py-3 w-[9%] min-w-[80px] max-w-[120px] cursor-pointer hover:bg-blue-50 transition-colors text-base sm:text-lg text-center"
                >
                  유형
                  <div
                    class="absolute top-0 right-0 h-full w-2 cursor-col-resize group-hover:bg-[#0086ff1c] resizer"
                  ></div>
                </th>
                <th
                  class="relative group px-4 py-3 w-[11%] min-w-[100px] max-w-[150px] cursor-pointer hover:bg-blue-50 transition-colors text-base sm:text-lg text-center"
                >
                  최종 작업일
                  <div
                    class="absolute top-0 right-0 h-full w-2 cursor-col-resize group-hover:bg-[#0086ff1c] resizer"
                  ></div>
                </th>
                <th
                  class="relative group px-4 py-3 w-[10%] min-w-[90px] max-w-[120px] cursor-pointer hover:bg-blue-50 transition-colors text-base sm:text-lg text-center"
                >
                  다운로드
                  <div
                    class="absolute top-0 right-0 h-full w-2 cursor-col-resize group-hover:bg-[#0086ff1c] resizer"
                  ></div>
                </th>
                <th
                  class="relative group px-4 py-3 w-[9%] min-w-[80px] max-w-[120px] cursor-pointer hover:bg-blue-50 transition-colors text-base sm:text-lg text-center"
                >
                  즐겨찾기
                  <div
                    class="absolute top-0 right-0 h-full w-2 cursor-col-resize group-hover:bg-[#0086ff1c] resizer"
                  ></div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y text-[14px] sm:text-[16px]">
              <tr
                v-for="(item, index) in computedWorkItems"
                :key="index"
                class="group hover:bg-[#eeeeee] cursor-pointer"
                :class="{ 'bg-[#0086ff1c]': item.checked }"
              >
                <td
                  class="px-4 py-2 text-center cursor-context-menu"
                  @contextmenu="showEditForm(index, $event)"
                >
                  <label class="relative inline-block cursor-pointer">
                    <input
                      type="checkbox"
                      class="absolute opacity-0 cursor-pointer"
                      v-model="item.checked"
                    />
                    <span
                      class="relative inline-block w-5 h-5 bg-white border border-[#303030]"
                    >
                      <span
                        v-if="item.checked"
                        class="absolute left-[6px] top-[2px] w-[5px] h-[10px] border-r-2 border-b-2 border-[#303030] transform rotate-45"
                      ></span>
                    </span>
                  </label>
                </td>
                <td
                  class="px-4 py-2 text-[#424242] cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
                  @contextmenu="showEditForm(index, $event)"
                  @click="handleWorkItemClick(item)"
                >
                  <div v-if="editingIndex === index">
                    <input
                      type="text"
                      v-model="item.PAS_TITLE"
                      @blur="finishEditing"
                      @keyup.enter="finishEditing"
                      ref="editInput"
                      class="w-full p-2.5 border border-black rounded"
                    />
                  </div>
                  <div v-else class="text-[#303030]">
                    {{ item.PAS_TITLE }}
                  </div>
                </td>
                <td
                  class="px-4 py-2 text-[#424242] cursor-pointer"
                  @contextmenu="showEditForm(index, $event)"
                  @click="handleWorkItemClick(item)"
                >
                  {{ item.PAS_TYPE }}
                </td>
                <td
                  class="px-4 py-2 text-[#424242] cursor-pointer"
                  @contextmenu="showEditForm(index, $event)"
                  @click="handleWorkItemClick(item)"
                >
                  {{ item.PAS_KEYWORD }}
                </td>
                <td class="px-4 py-2 text-center">
                  <span
                    :class="{
                      'bg-blue-100 text-blue-700':
                        item.PAS_IS_GENERATED === '지문',
                      'bg-purple-100 text-purple-700':
                        item.PAS_IS_GENERATED === '문항',
                    }"
                    class="px-2 py-0.5 rounded"
                  >
                    {{ item.PAS_IS_GENERATED }}
                  </span>
                </td>
                <td class="px-4 py-2 text-[#424242] text-center">
                  {{ item.PAS_DATE }}
                </td>
                <td class="px-4 py-2 text-center" @click.stop>
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
                  class="px-4 py-2 text-center cursor-context-menu"
                  @contextmenu="showEditForm(index, $event)"
                >
                  <div class="flex justify-center">
                    <span class="cursor-pointer" @click="toggleFavorite(index)">
                      <Icon
                        v-if="item.PAS_IS_FAVORITE"
                        icon="mynaui:star-solid"
                        width="24"
                        height="24"
                        class="text-[#FF9F40]"
                      />
                      <Icon
                        v-else
                        icon="mynaui:star"
                        width="24"
                        height="24"
                        class="text-gray-300"
                      />
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-else>
          <div class="flex justify-center items-center w-full h-[414px]">
            <span class="text-base text-[#757575]"
              >최근 작업 내역이 없습니다.</span
            >
          </div>
        </template>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 0 && filteredWorkItems.length > 0"
      class="flex justify-center items-center gap-4 mt-5"
    >
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="p-2.5 text-base rounded hover:bg-[#f0f0f0] disabled:text-[#ccc] disabled:cursor-not-allowed mx-2"
      >
        &lt;
      </button>

      <span
        v-for="page in visiblePages"
        :key="page"
        @click="changePage(page)"
        class="min-w-[26px] text-center text-sm cursor-pointer select-none p-2.5 rounded hover:bg-[#f0f0f0]"
        :class="{ 'text-[#0086ff] font-bold': currentPage === page }"
      >
        {{ page }}
      </span>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="p-2.5 text-base rounded hover:bg-[#f0f0f0] disabled:text-[#ccc] disabled:cursor-not-allowed mx-2"
      >
        &gt;
      </button>
      <button
        @click="lastPage"
        :disabled="currentPage === totalPages"
        class="p-2.5 text-base rounded hover:bg-[#f0f0f0] disabled:text-[#ccc] disabled:cursor-not-allowed mx-2"
      >
        &raquo;
      </button>
    </div>

    <!-- Context Menu -->
    <div
      v-if="showContextMenu"
      class="fixed bg-white border border-[#ccc] rounded shadow-lg z-50 min-w-[120px]"
      :style="{
        top: contextMenuPosition.y + 'px',
        left: contextMenuPosition.x + 'px',
      }"
    >
      <div
        class="px-4 py-2.5 text-sm cursor-pointer hover:bg-[#f5f5f5]"
        @click="startEditing"
      >
        이름 변경
      </div>
    </div>

    <!-- File Select Modal -->
    <FileSelectModal
      :isOpen="isModalOpen"
      :pasCode="selectedItem?.PAS_CODE"
      @close="closeFileModal"
      @confirm="handleFileSelection"
    />

    <!-- Delete Warning Modal -->
    <WarningModalComponent
      :isOpen="isDeleteModalOpen"
      title="선택한 자료를 삭제하시겠습니까?"
      :message="`삭제를 진행한 자료는 영구 삭제됩니다.`"
      cancelText="취소"
      confirmText="삭제"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    />
  </div>
  <div class="md:hidden w-full h-full overflow-scroll flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="sticky top-0 z-999 bg-white/80 backdrop-blur-md justify-center shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-4 py-3.5 flex items-center">
      <div class="flex items-center gap-2">
        <div class="flex justify-center items-center w-full">
          <router-link to="/" class="text-base text-center font-bold bg-[#222] bg-clip-text text-transparent">최근 문서함</router-link>
        </div>
      </div>
    </header>

    <!-- 필터 + 토글 가능 토글 올라가면 선택한거 적어주기 -->
    <div class="px-4 py-4 bg-white border-b border-gray-200">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <button @click="isFilterOpen = !isFilterOpen" 
                  class="flex items-center gap-1 px-3 py-1.5 text-sm">
            <span>필터</span>
            <svg xmlns="http://www.w3.org/2000/svg" 
                 class="w-4 h-4 transition-transform duration-200 ml-1"
                 :class="{ 'rotate-180': isFilterOpen }"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="!isFilterOpen && (typeFilter || fieldFilter || searchQuery)" class="flex items-center gap-1 text-sm">
            <template v-if="searchQuery">
              <span class="text-blue-600">"{{ searchQuery }}"</span>
            </template>
            <template v-if="fieldFilter">
              <span v-if="searchQuery" class="text-gray-400">·</span>
              <span class="text-blue-600">{{ fieldFilter }}</span>
            </template>
            <template v-if="typeFilter">
              <span v-if="searchQuery || fieldFilter" class="text-gray-400">·</span>
              <span class="text-blue-600">{{ typeFilter }}</span>
            </template>
          </div>
        </div>
        <div class="text-sm text-gray-500">
          총 {{ filteredItems.length }}개
        </div>
      </div>

      <!-- Filter Buttons and Search -->
      <div v-if="isFilterOpen" class="flex flex-col gap-4 mb-4">
        <!-- Search Box -->
        <div class="flex flex-row items-center gap-4">
          <span class="text-sm font-medium text-gray-700 w-12">작업명</span>
          <div class="relative w-full">
            <div class="absolute left-3 top-1/2 -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="작업명 검색"
              class="w-full h-11 pl-10 pr-4 text-base text-[#757575] border border-gray-200 rounded-md focus:outline-none focus:border-[#0086ff] bg-gray-50"
              v-model="searchQuery"
              @input="handleSearch"
            />
          </div>
        </div>

        <!-- Field Filter -->
        <div class="flex flex-row items-center gap-4">
          <span class="text-sm font-medium text-gray-700 w-12">분야</span>
          <div class="overflow-x-auto w-full scrollbar-hide">
            <div class="flex gap-2 min-w-max">
              <button @click="selectField('')" 
                      class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                      :class="fieldFilter === '' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'">
                전체
              </button>
              <button @click="selectField('인문')" 
                      class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                      :class="fieldFilter === '인문' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'">
                인문
              </button>
              <button @click="selectField('사회')" 
                      class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                      :class="fieldFilter === '사회' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'">
                사회
              </button>
              <button @click="selectField('예술')" 
                      class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                      :class="fieldFilter === '예술' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'">
                예술
              </button>
              <button @click="selectField('과학')" 
                      class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                      :class="fieldFilter === '과학' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'">
                과학
              </button>
              <button @click="selectField('기술')" 
                      class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                      :class="fieldFilter === '기술' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'">
                기술
              </button>
            </div>
          </div>
        </div>

        <!-- Type Filter -->
        <div class="flex flex-row items-center gap-4">
          <span class="text-sm font-medium text-gray-700 w-12">유형</span>
          <div class="overflow-x-auto w-full scrollbar-hide">
            <div class="flex gap-2 min-w-max">
              <button @click="selectType('')" 
                      class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                      :class="typeFilter === '' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'">
                전체
              </button>
              <button @click="selectType('문항')" 
                      class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                      :class="typeFilter === '문항' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'">
                문항
              </button>
              <button @click="selectType('지문')" 
                      class="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                      :class="typeFilter === '지문' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'">
                지문
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 테이블 -->
    <div class="flex-1 bg-white">
      <div v-if="filteredItems.length === 0" class="p-8 text-center">
        <div class="text-gray-500 mb-4">작업 목록이 없습니다.</div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[600px] text-sm">
          <thead class="text-xs text-gray-600 border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left font-medium w-[40%]">작업명</th>
              <th class="px-4 py-3 text-left font-medium w-[18%]">분야</th>
              <th class="px-4 py-3 text-left font-medium w-[15%]">제재</th>
              <th class="px-4 py-3 text-left font-medium w-[15%]">유형</th>
              <th class="px-4 py-3 text-left font-medium w-[15%]">작업일시</th>
              <th class="px-4 py-3 text-center font-medium w-[8%] whitespace-nowrap">다운로드</th>
              <th class="px-4 py-3 text-center font-medium w-[8%] whitespace-nowrap">즐겨찾기</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(item, index) in filteredItems" 
                :key="index"
                class="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
              <td class="px-4 py-3 cursor-pointer" @click="handleWorkItemClick(item)">
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
              <td class="px-4 py-3 text-gray-600 truncate text-sm cursor-pointer" @click="handleWorkItemClick(item)">{{ item.PAS_TYPE }}</td>
              <td class="px-4 py-3 text-gray-600 truncate text-sm cursor-pointer" @click="handleWorkItemClick(item)">{{ item.PAS_KEYWORD }}</td>
              <td class="px-4 py-3 cursor-pointer" @click="handleWorkItemClick(item)">
                <span :class="{
                  'bg-blue-100 text-blue-700': item.PAS_IS_GENERATED === '지문',
                  'bg-purple-100 text-purple-700': item.PAS_IS_GENERATED === '문항'
                }" class="px-2 py-0.5 rounded text-xs whitespace-nowrap">{{ item.PAS_IS_GENERATED }}</span>
              </td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap text-sm cursor-pointer" @click="handleWorkItemClick(item)">{{ item.PAS_DATE }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
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

    <!-- File Selection Modal -->
    <FileSelectModal
      :isOpen="isModalOpen"
      :pasCode="selectedItem?.PAS_CODE"
      @close="closeFileModal"
      @confirm="handleFileSelection"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import FileSelectModal from "@/components/common/FileSelectModal.vue";
import WarningModalComponent from "@/components/common/WarningModalComponent.vue";

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

// 최근 작업 내역 리스트 가져오기
const fetchWorkItems = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  fetch(`/api/pass/select/recelist`, {
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
          // (추가) 로그 - 인증 오류 감지

          // 인증 상태 초기화
          authStore.user = null;
          authStore.isAuthenticated = false;
          localStorage.removeItem("authUser");

          // 로그인 페이지로 리다이렉트
          router.push({
            path: "/login",
            query: { redirect: route.fullPath },
          });

          // 추가 처리를 중단하기 위한 에러 발생
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
        PAS_TYPE: item.pasType,
        PAS_TITLE: item.title,
        PAS_TYPE : item.pasType,
        PAS_KEYWORD: item.keyword,
        PAS_IS_GENERATED: item.isGenerated === 1 ? "지문" : "문항",
        PAS_DATE: item.date,
        PAS_IS_FAVORITE: item.isFavorite === 1,
        checked: false, // 체크박스 상태 추가
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

// 검색 관련 상태
const searchQuery = ref("");

// 컨텍스트 메뉴 상태 관리
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const contextMenuIndex = ref(-1);

// 편집 중인 항목의 인덱스 (-1이면 편집 중이 아님)
const editingIndex = ref(-1);
const editInput = ref(null);

// 띄어쓰기를 제거하는 함수
const removeWhitespace = (str) => {
  return str.replace(/\s+/g, "");
};

// 검색 기능 - 띄어쓰기 무시
const handleSearch = () => {
  // 검색어가 변경될 때 첫 페이지로 돌아가기
  currentPage.value = 1;
};

// 컨텍스트 메뉴 표시
const showEditForm = (index, event) => {
  if (!event) return;

  // 기존의 컨텍스트 메뉴 닫기
  showContextMenu.value = false;

  // 새 컨텍스트 메뉴 위치 설정
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY,
  };

  // 클릭된 항목 인덱스 저장
  contextMenuIndex.value = index;

  // 컨텍스트 메뉴 표시
  showContextMenu.value = true;

  // 브라우저 기본 컨텍스트 메뉴 방지
  event.preventDefault();
};

// 이름 변경 시작
const startEditing = () => {
  // 컨텍스트 메뉴 숨기기
  showContextMenu.value = false;

  // 편집 모드 활성화
  editingIndex.value = contextMenuIndex.value;

  // 입력 필드 포커스
  nextTick(() => {
    const inputs = document.querySelectorAll(".edit-input");
    if (inputs && inputs.length > 0) {
      inputs[0].focus();
    }
  });
};

// 컨텍스트 메뉴 닫기 함수
const closeContextMenu = (event) => {
  if (showContextMenu.value && !event.target.closest(".context-menu")) {
    showContextMenu.value = false;
  }
};

// 문서 클릭 시 컨텍스트 메뉴 닫기
onMounted(() => {
  document.addEventListener("click", closeContextMenu);
});

onUnmounted(() => {
  document.removeEventListener("click", closeContextMenu);
});

// 편집 완료 및 서버 업데이트
const finishEditing = () => {
  if (editingIndex.value >= 0) {
    const item = computedWorkItems.value[editingIndex.value];
    const apiUrl = import.meta.env.VITE_API_URL;

    // API 호출하여 제목 업데이트 (PATCH 메서드 사용)
    fetch(`/api/pass/update/title`, {
      method: "put", // PUT에서 PATCH로 변경 기존 // 2025-03-21 each -> title  PATCH-> PUT 로 수정완료
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        pasCode: item.PAS_CODE,
        title: item.PAS_TITLE,
        content: item.PAS_KEYWORD || "", // content 필드가 필요한 경우 기존 값 유지
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("이름 변경 실패");
        }

        // 응답 형식 확인
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        } else {
          return { success: true };
        }
      })
      .then((data) => {
        // 원본 workItems 배열에서 해당 항목 찾아 업데이트
        const originalItem = workItems.value.find(
          (i) => i.PAS_CODE === item.PAS_CODE
        );
        if (originalItem) {
          originalItem.PAS_TITLE = item.PAS_TITLE;
        }
      })
      .catch((error) => {
        // 실패해도 UI는 업데이트 (사용자 경험을 위해)
        const originalItem = workItems.value.find(
          (i) => i.PAS_CODE === item.PAS_CODE
        );
        if (originalItem) {
          originalItem.PAS_TITLE = item.PAS_TITLE;
        }
      })
      .finally(() => {
        // 편집 모드 종료
        editingIndex.value = -1;
      });
  } else {
    editingIndex.value = -1;
  }
};

// 메소드 정의 - 화살표 함수로 작성합니다
const extractItem = (item) => {
  // 추출 버튼 클릭 시 실행될 로직
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
  const item = computedWorkItems.value[index];
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
    })
    .catch((error) => {
      // 에러 시 사용자에게 알림을 표시할 수 있습니다
    });
};

// 페이지네이션 관련 상태
const currentPage = ref(1);
const itemsPerPage = 15; // 페이지당 표시할 아이템 수
const maxVisiblePages = 5; // 한 번에 표시할 페이지 번호 최대 개수

// 검색 텍스트 정규화 함수 개선
const normalizeText = (str) => {
  if (!str) return "";
  // 문자열로 변환 후 소문자화, 띄어쓰기만 제거 (특수문자 제거하지 않음)
  return str.toString().toLowerCase().replace(/\s+/g, "");
};

// advancedSearch 함수에서 해당 함수 사용
const advancedSearch = (items, query) => {
  if (!query) return items;
  if (!items || !Array.isArray(items) || items.length === 0) return [];

  const normalizedQuery = normalizeText(query);

  return items.filter((item) => {
    try {
      // 각 필드별로 정규화 후 검색
      const normalizedTitle = normalizeText(item.PAS_TITLE || "");
      const normalizedKeyword = normalizeText(item.PAS_KEYWORD || "");

      // 정확한 매칭이 아닌 부분 문자열 검색 (includes)
      return (
        normalizedTitle.includes(normalizedQuery) ||
        normalizedKeyword.includes(normalizedQuery)
      );
    } catch (error) {
      return false;
    }
  });
};

// 필터링된 작업 아이템 계산 (검색 및 필터 기능)
const filteredWorkItems = computed(() => {
  let items = workItems.value;

  // 분야 필터 적용
  if (selectedField.value) {
    items = items.filter((item) => item.PAS_KEYWORD === selectedField.value);
  }

  // 유형 필터 적용
  if (selectedType.value) {
    if (selectedType.value === "지문+문항") {
      // 지문+문항은 모든 항목 표시
      items = items;
    } else {
      items = items.filter(
        (item) => item.PAS_IS_GENERATED === selectedType.value
      );
    }
  }

  // 검색어 필터 적용
  return advancedSearch(items, searchQuery.value);
});

// 검색 결과 유무 확인을 위한 computed 속성 (여기에 추가)
const hasSearchResults = computed(() => {
  return searchQuery.value && filteredWorkItems.value.length > 0;
});

// 총 페이지 수 계산
const totalPages = computed(() => {
  return Math.ceil(filteredWorkItems.value.length / itemsPerPage);
});

// 페이지네이션된 작업 아이템 계산
const computedWorkItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredWorkItems.value.slice(start, start + itemsPerPage);
});

// 표시할 페이지 배열 계산
const visiblePages = computed(() => {
  const total = totalPages.value;
  if (total <= 1) return [1];

  // 현재 페이지를 중심으로 최대 5개의 페이지 번호 표시
  const startPage = Math.max(
    1,
    Math.min(
      currentPage.value - Math.floor(maxVisiblePages / 2),
      total - maxVisiblePages + 1
    )
  );

  const endPage = Math.min(startPage + maxVisiblePages - 1, total);

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
});

// 페이지 변경 함수들
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const lastPage = () => {
  currentPage.value = totalPages.value;
};

// 삭제 모달 상태 관리
const isDeleteModalOpen = ref(false);

// 선택된 아이템들 찾기 (수정된 버전)
const selectedItems = computed(() => {
  const selected = workItems.value.filter((item) => item.checked);

  return selected;
});

// 삭제 버튼 클릭 시 모달 열기
const openDeleteModal = () => {
  if (selectedItems.value.length > 0) {
    isDeleteModalOpen.value = true;
  }
};

const confirmDelete = () => {
  const selectedPasCodes = selectedItems.value.map((item) => item.PAS_CODE);

  // 선택된 항목이 없으면 작업 중단
  if (selectedPasCodes.length === 0) {
    return;
  }

  // API 호출
  fetch(`/api/pass/remove/each`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      pasCodeList: selectedPasCodes,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("항목 삭제 실패");
      }
      // 응답 형식 확인
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return response.text().then((text) => {
          return { message: text };
        });
      }
    })
    .then((data) => {
      // UI에서 선택된 항목 제거
      workItems.value = workItems.value.filter((item) => !item.checked);

      // 모달 닫기
      isDeleteModalOpen.value = false;

      // 페이지 재계산
      currentPage.value = Math.min(currentPage.value, totalPages.value);
    })
    .catch((error) => {});
};

// 삭제 모달 닫기
const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
};

// 필터 관련 상태 추가
const selectedField = ref("");
const selectedType = ref("");

// 필터 변경 핸들러
const handleFilterChange = () => {
  currentPage.value = 1; // 필터 변경 시 첫 페이지로 이동
};

// 모바일 필터 관련 상태 추가
const isFilterOpen = ref(false);
const typeFilter = ref('');
const fieldFilter = ref('');

const filteredItems = computed(() => {
  let items = workItems.value;
  
  // 유형 필터 적용
  if (typeFilter.value) {
    items = items.filter(item => item.PAS_IS_GENERATED === typeFilter.value);
  }
  
  // 분야 필터 적용
  if (fieldFilter.value) {
    items = items.filter(item => item.PAS_TYPE === fieldFilter.value);
  }
  
  // 검색어 필터 적용
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter(item => 
      item.PAS_TITLE.toLowerCase().includes(query) ||
      item.PAS_KEYWORD.toLowerCase().includes(query)
    );
  }
  
  return items;
});

const selectType = (type) => {
  typeFilter.value = type;
};

const selectField = (field) => {
  fieldFilter.value = field;
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

.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>
