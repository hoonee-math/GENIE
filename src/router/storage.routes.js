// import LikeMain from "@/views/storage/LikeMain.vue";
import WorkListMain from "@/views/temp/stroage/WorkListMain.vue";
// import TrashMain from "@/views/storage/TrashMain.vue";
import StorageView from "@/components/storage/temp/StorageView.vue";

const storageRoutes = [
    {
        path: 'storage',
        name: 'storage',
        children: [
            {
                // /storage/:type
                path: ':type',  // type: recent|favorites|trash
                name: 'storageView',
                component: StorageView,
                props: true
            },

            // Storage 컴포넌트 분리 및 개선 작업 전 상태 확인용 임시 라우터
            // /storage/old
            { path : 'old', name:'worklistMain', component: WorkListMain},
            // { path : 'favorites', name:'likelistMain', component: LikeMain},
            // { path : 'trash', name:'deletedMain', component: TrashMain},
            // { path : '', redirect: '/storage/recent' }
        ]
    }
]

export default storageRoutes;