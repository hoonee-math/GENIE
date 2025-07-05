import LoginView from "@/views/member/LoginView.vue";
import SingUpPage from "@/views/member/SingUpPage.vue";
import PasswordSearch from "@/views/member/PasswordSearch.vue";
import TempPasswordNotice from "@/views/member/TempPasswordNotice.vue";

const authRoutes = [
  { path: "/login", name: "login", component: LoginView },
  { path: "/signup", name: "signup", component: SingUpPage },
  {
    path: "/passwordsearch",
    name: "passwordsearch",
    component: PasswordSearch,
  },
  {
    path: "/temppasswordnotice",
    name: "temppasswordnotice",
    component: TempPasswordNotice,
  },
];

export default authRoutes;