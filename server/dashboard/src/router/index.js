import Vue from 'vue';
import Router from 'vue-router';
import VueResource from 'vue-resource';
import VueSocketio from 'vue-socket.io';
import Conversations from '@/components/Conversations';
import Analytics from '@/components/Analytics';

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
  ],
});
