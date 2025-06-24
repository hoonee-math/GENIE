<template>
  <section id="contact" class="py-24 bg-white">
    <div class="max-w-4xl mx-auto px-4">
      <h2 class="text-2xl font-bold text-center mb-12">문의하기</h2>
      <form class="grid md:grid-cols-2 gap-6">
        <input
          type="text"
          placeholder="이름"
          class="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <input
          type="email"
          placeholder="이메일"
          class="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <textarea
          placeholder="문의 내용"
          rows="5"
          class="md:col-span-2 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#0086ff] focus:ring-opacity-50"
        ></textarea>
        <button
          type="submit"
          class="md:col-span-2 px-8 py-3 rounded-full text-white brand-gradient shadow"
        >
          문의 보내기
        </button>
      </form>
      <p class="mt-12 text-center text-sm text-gray-600">
        또는 이메일
        <a
          href="mailto:genie-support@fitbs.ac"
          class="text-brand font-medium hover:underline"
          >genie-support@fitbs.ac</a
        >
        로 연락해 주세요.
      </p>
    </div>
  </section>
</template>
