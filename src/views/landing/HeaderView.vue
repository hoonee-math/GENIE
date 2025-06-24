<template>
  <header
    class="w-full sticky top-0 bg-gray-50/70 backdrop-blur z-50 shadow-sm"
  >
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <router-link to="/" class="text-2xl font-extrabold text-brand"
        >Genie</router-link
      >

      <nav class="hidden md:flex space-x-8 text-sm">
        <a href="#why" class="hover:text-brand">활용 사례</a>
        <a href="#features" class="hover:text-brand">특장점</a>
        <a href="#pricing" class="hover:text-brand">가격</a>
        <a href="#contact" class="hover:text-brand">문의</a>
      </nav>

      <router-link
        to="/login"
        class="px-6 py-2 rounded-full text-white brand-gradient shadow-md"
        >로그인</router-link
      >
    </div>
  </header>
</template>
