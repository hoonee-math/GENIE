import LikeMain from "@/views/storage/LikeMain.vue";
import WorkListMain from "@/views/storage/WorkListMain.vue";
import TrashMain from "@/views/storage/TrashMain.vue";


const storageRoutes = [
    {
        path: 'storage',
        name: 'storage',
        children: [
            { path : 'worklistMain', name:'worklistMain', component: WorkListMain},
            { path : 'likelistMain', name:'likelistMain', component: LikeMain},
            { path : 'deletedMain', name:'deletedMain', component: TrashMain},
            { path : '', redirect: '/storage/worklistMain' }
        ]
    }
]

export default storageRoutes;