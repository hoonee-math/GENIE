import LikeMain from "@/views/storage/LikeMain.vue";
import WorkListMain from "@/views/storage/WorkListMain.vue";
import TrashMain from "@/views/storage/TrashMain.vue";


const storageRoutes = [
    {
        path: 'storage',
        name: 'storage',
        children: [
            { path : 'recent', name:'worklistMain', component: WorkListMain},
            { path : 'favorites', name:'likelistMain', component: LikeMain},
            { path : 'trash', name:'deletedMain', component: TrashMain},
            { path : '', redirect: '/storage/recent' }
        ]
    }
]

export default storageRoutes;