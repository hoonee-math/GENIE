import LikeMain from "@/views/storage/LikeMain.vue";
import WorkList1 from "@/views/storage/WorkList1.vue";
import StorageMain from "@/views/storage/StorageMain.vue";
import WorkListMain from "@/views/storage/WorkListMain.vue";
import TrashMain from "@/views/storage/TrashMain.vue";


const strageRoutes = [
    {
        path: 'storage',
        name: 'storage',
        children: [
            { path : '', name:'storage-main', component: StorageMain },
            { path : 'storageworklist', name:'storageworklist', component: WorkList1 },
            { path : 'worklistMain', name:'worklistMain', component: WorkListMain},
            { path : 'likelistMain', name:'likelistMain', component: LikeMain},
            { path : 'deletedMain', name:'deletedMain', component: TrashMain},
        ]
    }
]

export default strageRoutes;