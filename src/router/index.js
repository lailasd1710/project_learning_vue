import { createRouter, createWebHistory } from 'vue-router'
import login from '../views/LoginView.vue'
import Login from '@/components/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/home',
      name: 'home',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/HomeView.vue'),
      children: [
        {
          path: 'dash',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'teachers',
          name: 'teachers',
          component: () => import('../views/TeachersView.vue'),
        },
        {
          path: 'teachersInfo/:id',
          name: 'teachersInfo',
          component: () => import('../views/TeacherInfo.vue'),
        },
        {
          path: 'students',
          name: 'students',
          component: () => import('../views/StudentsView.vue'),
        },
        {
          path: 'subjects',
          name: 'subjects',
          component: () => import('../views/SubjectsView.vue'),
        },
        {
          path: 'lessons',
          name: 'lessons',
          component: () => import('../views/LessonsView.vue'),
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('../views/ReportsView.vue'),
        },
      ],
    },
  ],
})

export default router
