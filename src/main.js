import { createApp } from "vue";
import { createPinia } from "pinia";
import { Icon } from "@iconify/vue";
import "./assets/main.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.component("Icon", Icon); // https://icon-sets.iconify.design/
app.use(pinia);

app.mount("#app");
