import { createApp } from "vue";
import { createPinia } from "pinia";
import { Icon } from "@iconify/vue";
import "./assets/main.css";

import App from "./App.vue";
import router from "./router";

// Google Tag Manager 초기화
function initializeGTM() {
    try {
        const gtmId = import.meta.env.VITE_GTM_ID;
        
        // GTM ID가 없으면 초기화하지 않음
        if (!gtmId) {
            console.log('🚫 GTM 비활성화');
            return;
        }
        
        console.log(`🚀 GTM 초기화: ${gtmId}`);
        
        // dataLayer 초기화
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });
        
        // GTM 스크립트 동적 로드
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
        document.head.appendChild(script);
        
        // noscript 태그 추가
        const noscript = document.createElement('noscript');
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
        iframe.height = '0';
        iframe.width = '0';
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
        noscript.appendChild(iframe);
        document.body.insertBefore(noscript, document.body.firstChild);
    } catch (error) {
        console.error('❌ GTM 초기화 실패:', error);
        // 앱은 계속 동작해야 함 - 에러를 throw하지 않음
    }
}
// GTM 초기화 실행
initializeGTM();

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.component("Icon", Icon); // https://icon-sets.iconify.design/
app.use(pinia);

app.mount("#app");
