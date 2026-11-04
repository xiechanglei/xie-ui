import { createApp } from 'vue';
import '@xie-work/xie-ui'; // 别名 → src/index.ts：注册全部自定义元素并注入设计令牌
import './styles/docs.css';
import App from './App.vue';
import router from './router';

createApp(App).use(router).mount('#app');
