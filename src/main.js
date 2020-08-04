
import Vue from 'vue';
import App from '~/App';

import ElementUI from 'element-ui';
import DynamicStyle from 'vue-dynamic-style';

Vue.use(ElementUI);
Vue.use(DynamicStyle, { prefix: '', scoped: false});

(async () => {

  new Vue({
    el: '#app',
    render: h => h(App)
  });

})();