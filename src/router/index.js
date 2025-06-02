import { createRouter, createWebHistory } from 'vue-router'
import ApiTest from '@/components/ApiTest.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'HomeRedirect', // 给根路径一个名字
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('token');
      const isAuthenticated = token && token !== "null" && token !== "undefined";
      if (isAuthenticated) {
        next('/course/list'); // 如果已登录，则跳转到课程列表
      } else {
        next({ name: 'Login' }); // 如果未登录，则跳转到登录页
      }
    }
    // 如果不想用 beforeEnter，也可以指向一个组件，在组件内部逻辑跳转
    // component: () => import('@/views/HomeRedirector.vue')
  },
  {
    path: '/api-test',
    name: 'ApiTest',
    component: ApiTest,
    meta: { title: 'API测试' }
  },
  {
    path: '/course/list',
    name: 'CourseList',
    component: () => import('../views/course/CourseList.vue'),
    meta: { title: '课程列表' }
  },
  {
    path: '/course/chapter',
    name: 'CourseChapter',
    component: () => import('../views/course/ChapterManage.vue'),
    meta: { title: '章节管理' }
  },
  {
    path: '/course/chapter/:id',
    name: 'CourseChapterDetail',
    component: () => import('../views/course/ChapterManage.vue'),
    meta: { title: '章节管理' }
  },
  {
    path: '/class/list',
    name: 'ClassList',
    component: () => import('../views/classmgt/ClassList.vue'),
    meta: { title: '班级列表', parentTitle: '班级管理' } // parentTitle 可选，如果一级菜单名和它一样则不用特别显示
  },
  {
    path: '/class/students/:classId',
    name: 'ClassStudentManage',
    component: () => import('../views/classmgt/ClassStudentManage.vue'),
    meta: { title: '班级学生管理', parentTitle: '班级管理' },
    props: true
  },
  {
    path: '/class/courses/:classId',
    name: 'ClassCourseManage', // ClassCourseManage.vue
    component: () => import('../views/classmgt/ClassCourseManage.vue'),
    meta: { title: '班级课程管理', parentTitle: '班级管理' }, // parentTitle 应为 "班级管理"
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', guest: true } // guest: true 表示该页面不需要登录即可访问
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const requiresAuth = !to.meta.guest;

  // 检查token是否存在且未过期
  let isAuthenticated = false;
  if (token && token !== "null" && token !== "undefined" && tokenExpiry) {
    const now = new Date().getTime();
    if (now <= parseInt(tokenExpiry)) {
      isAuthenticated = true;
    } else {
      // token已过期，清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('userInfo');
    }
  }

  // 如果目标页面是登录页
  if (to.name === 'Login') {
    if (isAuthenticated) {
      // 已登录用户访问登录页，重定向到首页
      next({ path: '/' });
    } else {
      // 未登录用户访问登录页，允许通过
      next();
    }
    return;
  }

  // 如果目标页面需要认证
  if (requiresAuth && !isAuthenticated) {
    // 只有在不是从登录页跳转过来的情况下才重定向到登录页
    if (from.name !== 'Login') {
      next({ name: 'Login' });
    } else {
      // 如果是从登录页跳转过来的，说明是登录失败，不进行重定向
      next(false); // 取消导航
    }
  } else {
    // 角色权限判断
    if (requiresAuth && isAuthenticated && userInfo && userInfo.role !== 1) {
      console.warn('非教师用户尝试访问受保护页面');
      // 可以根据需求进行拦截或允许通过
    }
    next();
  }
});

export default router