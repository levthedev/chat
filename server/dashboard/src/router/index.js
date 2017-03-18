import Vue from 'vue';
import Router from 'vue-router';
import VueResource from 'vue-resource';
import VueSocketio from 'vue-socket.io';
import User from '@/components/User';

Vue.use(Router);
Vue.use(VueResource);
// Vue.use(VueSocketio, 'http://localhost:3000');
// Vue.use(VueSocketio, 'http://174.138.71.184:3000/');
const production = process.env.NODE_ENV === 'production';
const domain = production ? '174.138.71.184' : 'localhost';
Vue.use(VueSocketio, `http://${domain}:3000`);

export default new Router({
  routes: [
    {
      path: '/users/:handle',
      name: 'User',
      component: User,
    },
  ],
});
