import Vue from 'vue';
import Router from 'vue-router';
import VueResource from 'vue-resource';
import VueSocketio from 'vue-socket.io';
import User from '@/components/User';

Vue.use(Router);
Vue.use(VueResource);
// Vue.use(VueSocketio, 'http://localhost:3000');
Vue.use(VueSocketio, 'http://174.138.71.184/');

export default new Router({
  routes: [
    {
      path: '/users/:handle',
      name: 'User',
      component: User,
    },
  ],
});
