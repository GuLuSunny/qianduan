import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import BigscreenHome from '../views/BigscreenHome.vue';
import MainMenu from '@/views/MainMenuView.vue';
import ConfigManagement from '@/views/menu/configManagementMenu/ConfigManagement.vue';
import UserManagement from '@/views/menu/userManagementMenu/UserManagement.vue';
import DataDownload from '../views/menu/dataDownloadMenu/DataDownload.vue';
import BigscreenHomeSample from '../views/sample/BigscreenHomeSample.vue';
import Cesuimap from '../views/sample/Cesuimap.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/bigscreenHome',
    name: 'bigscreenHome',
    component: BigscreenHome,
  },
  {
    path: '/mainMenu',
    name: 'mainMenu',
    component: MainMenu,
  },
  {
    path: '/configManagement',
    name: 'configManagement',
    component: ConfigManagement,
  },
  {
    path: '/userManagement',
    name: 'userManagement',
    component: UserManagement,
  },
  {
    path: '/data-download',
    name: 'DataDownload',
    component: DataDownload,
  },
  {
    path: '/bigScreenSimple',
    name: 'bigScreenSimple',
    component: BigscreenHomeSample,
  },
  {
    path: '/Cesuimap',
    name: 'Cesuimap',
    component: Cesuimap
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;