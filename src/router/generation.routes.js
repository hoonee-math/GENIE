import PassageContent from "@/views/generation/passage/PassageContent.vue";
import PassageMain from "@/views/generation/passage/PassageMain.vue";
import GenerateQuestion from "@/views/generation/question/GenerateQuestion.vue";
import QuestionMain from "@/views/generation/question/QuestionMain.vue";
import GeneratePassageForm from "@/views/temp/GeneratePassageForm.vue";
import GeneratedPassageView from "@/views/temp/GeneratedPassageView.vue";
import GenerateQuestionForm from "@/views/temp/GenerateQuestionForm.vue";
import GeneratedQuestionView from "@/views/temp/GeneratedQuestionView.vue";

// passage 라우트를 라우트 객체 배열로 정의
const generationRoutes = [
  {
    path: "passage",
    name: "passage",
    children: [
      { path: "", name: "passage-main", component: GeneratePassageForm },
      { path: "create", name: "passage-create", component: PassageContent },
      // 새로 만든 임시 주소
      { path: "form", name: "passage-form", component: GeneratePassageForm },
      { path: "view/:pasCode", name: "passage-view", component: GeneratedPassageView },
    ],
  },
  {
    path: "questions",
    name: "questions",
    children: [
      { path: "", name: "question-main", component: GenerateQuestionForm },
      { path: "generate", name: "question-generate", component: GenerateQuestion },
      // 새로 만든 임시 주소
      { path: "form", name: "question-form", component: GenerateQuestionForm },
      { path: "view/:pasCode", name: "question-view", component: GeneratedQuestionView },
    ],
  },
];

export default generationRoutes;
