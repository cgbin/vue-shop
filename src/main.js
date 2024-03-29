import Vue from 'vue'
import App from './App.vue'
import router from './router'
//全局引入elemente
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/global.css'

import 'default-passive-events'

Vue.config.productionTip = false

Vue.use(ElementUI);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
