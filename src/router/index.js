import { createRouter, createWebHistory } from 'vue-router';
import ApiTest from '@/components/ApiTest.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'HomeRedirect',
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('token');
      const isAuthenticated = token && token !== "null" && token !== "undefined";
      if (isAuthenticated) {
        next('/course/list');
      } else {
        next({ name: 'Login' });
      }
    }
  },
  {
    path: '/api-test',
    name: 'ApiTest',
    component: ApiTest,
    meta: { title: 'API测试' }
  },
  // 课程管理路由组
  {
    path: '/course/list',
    name: 'CourseList',
    component: () => import('../views/course/CourseList.vue'),
    meta: { 
      title: '课程列表',
      parentMenu: 'course-management'
    }
  },
  {
    path: '/course/detail/:id',
    name: 'CourseDetail',
    component: () => import('../views/course/CourseDetail.vue'),
    meta: { 
      title: '课程详情',
      parentTitle: '课程列表',
      parentMenu: 'course-management'
    },
    props: true
  },
  // 班级管理路由组
  {
    path: '/class/list',
    name: 'ClassList',
    component: () => import('../views/classmgt/ClassList.vue'),
    meta: { 
      title: '班级列表',
      parentMenu: 'class-main-management'
    }
  },
  {
    path: '/class/students/:classId',
    name: 'ClassStudents',
    component: () => import('../views/classmgt/ClassStudentManage.vue'),
    meta: { 
      title: '学生列表',
      parentTitle: '班级列表',
      parentMenu: 'class-main-management'
    }
  },
  {
    path: '/class/courses/:classId',
    name: 'ClassCourses',
    component: () => import('../views/classmgt/ClassCourseManage.vue'),
    meta: { 
      title: '课程列表',
      parentTitle: '班级列表',
      parentMenu: 'class-main-management'
    }
  },
  {
    path: '/information/list',
    name: 'InformationList',
    component: () => import('../views/information/InformationList.vue'),
    meta: { 
      title: '资讯列表',
      parentMenu: 'information-management'
    }
  },
  {
    path: '/information/detail/:id',
    name: 'InformationDetail',
    component: () => import('../views/information/InformationDetail.vue'),
    meta: { 
      title: '资讯详情',
      parentTitle: '资讯列表',
      parentMenu: 'information-management'
    },
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
  // 个人信息页面
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { 
      title: '个人信息',
      requiresAuth: true,
      requiresTeacher: true
    }
  },
];

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
    if (requiresAuth && isAuthenticated && userInfo) {
      // 如果页面明确要求教师权限
      if (to.meta.requiresTeacher && userInfo.role !== 1) {
        console.warn('非教师用户尝试访问受保护页面');
        // 重定向到无权限页面
        next({ name: 'Login' });
        return;
      }
    }
    next();
  }
});

export default router