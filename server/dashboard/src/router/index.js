import Vue from 'vue';
import Router from 'vue-router';
import VueResource from 'vue-resource';
import VueSocketio from 'vue-socket.io';
import Conversations from '@/components/Conversations';
import Analytics from '@/components/Analytics';
import Chart from '@/components/Chart';
import Settings from '@/components/Settings';

Vue.use(Router);
Vue.use(VueResource);
const production = process.env.NODE_ENV === 'production';
const domain = production ? '174.138.71.184' : 'localhost';
Vue.use(VueSocketio, `http://${domain}:3000`);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Chat',
      component: Conversations,
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: Analytics,
    },
    {
      path: '/chart',
      name: 'Chart',
      component: Chart,
      props: { chartData: [1, 3, 2, 5, 2, 4, 3], days: 7 },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
    },
  ],
});
