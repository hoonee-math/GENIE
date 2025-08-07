<template>
    <!-- 확장된 텍스트 에디터 툴바 -->
    <div
        class="p-2 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between text-gray-600 flex-wrap gap-2">
        <!-- ... 툴바 내용은 이전과 동일 ... -->
        <div class="flex items-center gap-1">
            <button class="p-1.5 hover:bg-gray-200 rounded font-bold">B</button>
            <button class="p-1.5 hover:bg-gray-200 rounded italic">I</button>
            <button class="p-1.5 hover:bg-gray-200 rounded underline">U</button>
            <button class="p-1.5 hover:bg-gray-200 rounded line-through">S</button>
            <div class="w-px h-5 bg-gray-300 mx-1"></div>
            <button class="p-1.5 hover:bg-gray-200 rounded"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clip-rule="evenodd" />
                </svg></button>
            <button class="p-1.5 hover:bg-gray-200 rounded"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clip-rule="evenodd" />
                </svg></button>
            <button class="p-1.5 hover:bg-gray-200 rounded"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clip-rule="evenodd" />
                </svg></button>
        </div>
    </div>

    <!-- A4 용지 컨테이너 -->
    <div class="p-8 overflow-y-auto bg-gray-100/50 flex justify-center">
        <!-- A4 용지 시트 -->
        <div class="w-full max-w-4xl bg-white px-8 py-12 shadow-2xl flex flex-col aspect-[210/297]">
            <!-- 세분화된 머리말 입력 영역 -->
            <header class="border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <div class="flex justify-between items-center gap-4">
                    <input type="text" placeholder="좌상단 머리말"
                        class="w-1/3 p-1 text-xs text-left border-none bg-gray-50 rounded-sm focus:ring-1 focus:ring-blue-400 placeholder-gray-400">
                    <input type="text" placeholder="중앙 머리말"
                        class="w-1/3 p-1 text-xs text-center border-none bg-gray-50 rounded-sm focus:ring-1 focus:ring-blue-400 placeholder-gray-400">
                    <input type="text" placeholder="우상단 머리말"
                        class="w-1/3 p-1 text-xs text-right border-none bg-gray-50 rounded-sm focus:ring-1 focus:ring-blue-400 placeholder-gray-400">
                </div>
            </header>

            <!-- 빈 콘텐츠 영역 -->
            <div class="flex-grow flex items-center justify-center text-center text-gray-400">
                <div class="py-20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-300" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <p class="mt-4 text-base">왼쪽에서 지문을 불러오면</p>
                    <p class="text-base">여기에 문제가 표시됩니다.</p>
                </div>
            </div>

            <!-- 세분화된 꼬리말 입력 영역 -->
            <footer class="border-t-2 border-dashed border-gray-300 pt-4 mt-4">
                <div class="flex justify-between items-center gap-4">
                    <input type="text" placeholder="좌하단 꼬리말"
                        class="w-1/3 p-1 text-xs text-left border-none bg-gray-50 rounded-sm focus:ring-1 focus:ring-blue-400 placeholder-gray-400">
                    <input type="text" placeholder="중앙 꼬리말"
                        class="w-1/3 p-1 text-xs text-center border-none bg-gray-50 rounded-sm focus:ring-1 focus:ring-blue-400 placeholder-gray-400">
                    <input type="text" placeholder="우하단 꼬리말"
                        class="w-1/3 p-1 text-xs text-right border-none bg-gray-50 rounded-sm focus:ring-1 focus:ring-blue-400 placeholder-gray-400">
                </div>
            </footer>
        </div>
    </div>
</template>
<script>
</script>
<style></style>