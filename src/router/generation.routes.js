import GeneratePassageForm from "@/views/generation/passage/GeneratePassageForm.vue";
import GeneratedPassageView from "@/views/generation/passage/GeneratedPassageView.vue";
import GenerateQuestionForm from "@/views/generation/question/GenerateQuestionForm.vue";
import GeneratedQuestionView from "@/views/generation/question/GeneratedQuestionView.vue";

// passage 라우트를 라우트 객체 배열로 정의
const generationRoutes = [
  {
    path: "passage",
    name: "passage",
    children: [
      { path: "", name: "passage-main", component: GeneratePassageForm },
      { path: "form", name: "passage-form", component: GeneratePassageForm },
      { path: "view/:pasCode", name: "passage-view", component: GeneratedPassageView },
    ],
  },
  {
    path: "questions",
    name: "questions",
    children: [
      { path: "", name: "question-main", component: GenerateQuestionForm },
      { path: "form", name: "question-form", component: GenerateQuestionForm },
      { path: "view/:pasCode", name: "question-view", component: GeneratedQuestionView },
    ],
  },
];

export default generationRoutes;
