import MainHome from "@/views/main/MainHome.vue";
import TermsView from "@/components/common/TermsView.vue";
import PolicyView from "@/components/common/Privacy.vue";
import ImmediatelyComponent from "@/components/test/ImmediatelyComponent.vue";

const mainRoutes = [
  { path: "", redirect: "/home" },
  { path: "/home", name: "/home", component: MainHome },
  { path: "/terms", component: TermsView },
  { path: "/privacy", component: PolicyView },
  {
    path: "immediately",
    name: "immediately",
    component: ImmediatelyComponent,
  },
  {
    path: "delay",
    name: "delay",
    component: () => import("@/components/test/DelayComponent.vue"),
  },
];

export default mainRoutes;
