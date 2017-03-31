import Vue from 'vue';
import App from './App';
import router from './router';

Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.config.debug = true;
Vue.config.silent = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
});
