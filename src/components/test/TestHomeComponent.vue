<!-- @/components/main/HomeComponent.vue -->
<template>
    <div class="home-container">
        <h1>Test 페이지 GenieQ 홈페이지</h1>
        <pre>

폴더 구조는 다음과 같습니다.

views 폴더: 로그인 페이지와 프레임이 들어있습니다. 
Frame.vue 파일에 side-nav-bar 와 footer-nav-var 를 넣어주세요

    src
    ├─📁 assets/
    ├─📁 router/
    │  └─📄 index.js        - frame의 class="content-area" 에 들어갈 컴포넌트와 주소를 설정할 수 있습니다.
    ├─📁 stores/
    ├─📁 views/             - 로그인 페이지와 프레임이 들어있습니다. 
    │  ├─📄 Frame.vue       - side-nav-bar, footer-nav-var 를 넣어주세요
    │  └─📄 LoginView.vue
    ├─📁 components/        - 각 폴더에 페이지를 구성할 메인 컴포넌트를 만들어주세요. frame의 class="content-area" 에 들어가게 됩니다.
    │  ├─📁 common/
    │  │  ├─📁 button/
    │  │  └─📁 modal/
    │  ├─📁 generation/
    │  ├─📁 main/
    │  ├─📁 mypage/
    │  └─📁 storage/
    ├─📄 App.vue
    └─📄 main.js
        </pre>
      
    </div>
</template>

<script setup>
</script>

<style scoped>
</style>