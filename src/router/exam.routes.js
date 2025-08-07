import ExamMain from '@/views/exam/ExamMain.vue'

const storageRoutes = [
    {
        path: 'exam',
        name: 'exam',
        children: [
            { path: '', name: 'exam-main', component: ExamMain },
            { path: '', redirect: '/exam' }
        ]
    }
]

export default storageRoutes;