import myPageWrapper from "@/views/mypage/MyPageWrapper.vue";
import Notice from "@/views/mypage/Notice.vue";
import NoticeDetail from "@/views/mypage/NoticeDetail.vue";


const myPageRoutes = [
    {
      path: 'mypage',
      name: 'mypage',
      children: [
        { path: '', name: 'my-page-wrapper', component: myPageWrapper },
        
      ]
    },
    {
      path: '/notice',
      name: 'Notice',
      component: Notice
    },
    { path: '/notice/:id', name: 'NoticeDetail', component: NoticeDetail},
  ];
  
  export default myPageRoutes;


 
 

  