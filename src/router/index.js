import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: '/admWeb/',
  hashbang: false,
  routes: [
    {
      path: '/',
      name: 'Authorization',
      component: () => import('~/components/Authorization'),
      meta: { isAuth: true },
      props: true
    },
    {
      path: '/test',
      name: 'Authorization',
      component: () => import('~/components/Authorization'),
      meta: { isAuth: true },
      props: true
    }
  ]
});


export default router;
