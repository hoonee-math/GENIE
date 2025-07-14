import PassageContent from "@/views/generation/passage/PassageContent.vue";
import PassageMain from "@/views/generation/passage/PassageMain.vue";
import GenerateQuestion from "@/views/generation/question/GenerateQuestion.vue";
import QuestionMain from "@/views/generation/question/QuestionMain.vue";
import PassageGenerationForm from "@/views/temp/PassageGenerationForm.vue";
import GeneratedPassageView from "@/views/temp/GeneratedPassageView.vue";

// passage 라우트를 라우트 객체 배열로 정의
const generationRoutes = [
  {
    path: "passage",
    name: "passage",
    children: [
      { path: "", name: "passage-main", component: PassageGenerationForm },
      { path: "create", name: "passage-create", component: PassageContent },
      // 새로 만든 임시 주소
      { path: "form", name: "passage-form", component: PassageGenerationForm },
      { path: "view/:pasCode", name: "passage-view", component: GeneratedPassageView },
    ],
  },
  {
    path: "questions",
    name: "questions",
    children: [
      { path: "", name: "question-main", component: QuestionMain },
      {
        path: "generate",
        name: "question-generate",
        component: GenerateQuestion,
      },
    ],
  },
];

export default generationRoutes;
