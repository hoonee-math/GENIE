<template>
  <section id="pricing" class="py-24 bg-gray-50">
    <div class="max-w-6xl mx-auto px-4">
      <h2 class="text-2xl font-bold text-center mb-12">크레딧 패키지</h2>
      <div class="grid md:grid-cols-4 gap-8">
        <!-- Free -->
        <div
          class="bg-white rounded-xl shadow-lg p-8 border-2 border-brand flex flex-col"
        >
          <h3 class="text-xl font-semibold mb-4 text-brand">Free</h3>
          <p class="text-4xl font-extrabold mb-2">₩0</p>
          <p class="text-sm text-gray-500 mb-6">10 크레딧 · 체험용</p>
          <ul class="space-y-2 text-sm text-gray-700 flex-1">
            <li>기본 문제 유형 제한 이용</li>
            <li>PDF 내보내기 불가</li>
          </ul>
          <a
            href="#"
            class="mt-6 px-6 py-3 rounded-full text-white brand-gradient text-center"
            >시작하기</a
          >
        </div>

        <!-- Starter -->
        <div class="bg-white rounded-xl shadow p-8 flex flex-col">
          <h3 class="text-xl font-semibold mb-4 text-brand">Starter</h3>
          <p class="text-4xl font-extrabold mb-2">₩20,000</p>
          <p class="text-sm text-gray-500 mb-6">100 크레딧 · (₩200/크레딧)</p>
          <ul class="space-y-2 text-sm text-gray-700 flex-1">
            <li>모든 문제 유형 생성</li>
            <li>해설·채점표 포함</li>
          </ul>
          <a
            href="#"
            class="mt-6 px-6 py-3 rounded-full text-white brand-gradient text-center"
            >구매하기</a
          >
        </div>

        <!-- Standard -->
        <div class="bg-white rounded-xl shadow p-8 flex flex-col">
          <h3 class="text-xl font-semibold mb-4 text-brand">Standard</h3>
          <p class="text-2xl font-bold text-gray-500 line-through">₩60,000</p>
          <p class="text-4xl font-extrabold mb-2">₩57,000</p>
          <p class="text-sm text-gray-500 mb-6">400 크레딧 · (₩143/크레딧)</p>
          <ul class="space-y-2 text-sm text-gray-700 flex-1">
            <li>Starter 혜택 + 우선 처리</li>
          </ul>
          <a
            href="#"
            class="mt-6 px-6 py-3 rounded-full text-white brand-gradient text-center"
            >가장 인기</a
          >
        </div>

        <!-- Pro -->
        <div class="bg-white rounded-xl shadow p-8 flex flex-col">
          <h3 class="text-xl font-semibold mb-4 text-brand">Pro</h3>
          <p class="text-2xl font-bold text-gray-500 line-through">₩100,000</p>
          <p class="text-4xl font-extrabold mb-2">₩90,000</p>
          <p class="text-sm text-gray-500 mb-6">1,000 크레딧 · (₩90/크레딧)</p>
          <ul class="space-y-2 text-sm text-gray-700 flex-1">
            <li>Standard 혜택 + 전담 기술 지원</li>
            <li>팀 공유 크레딧</li>
          </ul>
          <a
            href="#"
            class="mt-6 px-6 py-3 rounded-full text-white brand-gradient text-center"
            >구매하기</a
          >
        </div>
      </div>
    </div>
  </section>
</template>
