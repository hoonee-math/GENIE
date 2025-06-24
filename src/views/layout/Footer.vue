<template>
    <footer class="footer">
        <div class="footer-content">
            Copyright © Chunjae Education, Inc. ALL rights reserved.
            <router-link to="/terms" class="footer-link" active-class="active">이용약관</router-link> |
            <router-link to="/privacy" class="footer-link" active-class="active">개인정보처리방침</router-link> |
            <a href="https://pf.kakao.com/_blqXxl" target="_blank" class="footer-link">고객센터</a> |
            <router-link to="/team" class="footer-link" active-class="active">genieQ</router-link>
        </div>
    </footer>
</template>

<style scoped>
.footer {
  width: 100%; /* 전체 너비 사용 */
  height: 36px; /* 푸터 높이 고정 */
  background-color: #F6F6F6; /* 디자인 색상 적용 */
  color: #666;
  text-align: center;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  gap: 8px;
  margin-top: auto; /* 컨텐츠 영역이 끝난 후 자동으로 아래에 배치 */
}
.footer-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
}
.footer-link:hover {
  text-decoration: underline;
}
</style>
