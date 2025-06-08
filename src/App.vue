<template>
  <div v-if="isLoginPage" class="login-page-wrapper">
    <router-view />
  </div>
  <div v-else class="app-container" :class="{ 'dark-theme': isDarkMode }">
    <el-container class="main-container">
      <el-aside :width="isCollapsed ? '64px' : '220px'" class="aside">
        <div class="logo-container">
          <!-- 企业logo占位符 -->
          <div class="logo-section">
            <div class="company-logo" v-if="!isCollapsed">
              <el-icon size="48" :color="isDarkMode ? '#ffffff' : '#3b82f6'"><OfficeBuilding /></el-icon>
            </div>
            <div class="company-logo-mini" v-else>
              <el-icon size="32" :color="isDarkMode ? '#ffffff' : '#3b82f6'"><OfficeBuilding /></el-icon>
            </div>
          </div>
          <!-- 系统标题 - 折叠时完全隐藏 -->
          <h2 class="title" v-show="!isCollapsed">企业内部培训系统</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          :default-openeds="defaultOpeneds"
          class="el-menu-vertical"
          background-color="transparent"
          :text-color="isDarkMode ? '#e2e8f0' : '#606266'"
          :active-text-color="isDarkMode ? '#60a5fa' : '#3b82f6'"
          router
          :collapse="isCollapsed"
        >
          <el-sub-menu index="course-management">
            <template #title>
              <el-icon><School /></el-icon>
              <span>课程管理</span>
            </template>
            <el-menu-item index="/course/list">课程列表</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="class-main-management">
            <template #title>
              <el-icon><User /></el-icon>
              <span>班级管理</span>
            </template>
            <el-menu-item index="/class/list">班级列表</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="information-management">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>资讯管理</span>
            </template>
            <el-menu-item index="/information/list">资讯列表</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="statistics-analysis">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>统计分析</span>
            </template>
            <el-menu-item index="/statistics/course">课程统计</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="system-tools">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统工具</span>
            </template>
            <el-menu-item index="/api-test">API测试</el-menu-item>
          </el-sub-menu>
        </el-menu>
        
        <!-- 主题切换按钮 -->
        <div class="theme-toggle-container">
          <el-button 
            class="theme-toggle-btn" 
            @click="toggleTheme" 
            :icon="isDarkMode ? Sunny : Moon"
            circle
            size="small"
            :type="isDarkMode ? 'warning' : 'info'"
          />
        </div>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <!-- 折叠按钮 -->
            <el-button 
              class="collapse-btn" 
              @click="toggleCollapse" 
              :icon="isCollapsed ? Expand : Fold"
              text
              size="large"
            />
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item 
                v-if="$route.meta.parentTitle && $route.meta.parentTitle !== $route.meta.title"
                :to="getParentRoute($route.meta.parentTitle)"
              >
                {{ $route.meta.parentTitle }}
              </el-breadcrumb-item>
              <el-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" :src="userInfo?.pic" icon="UserFilled" />
                <span class="username">{{ userInfo?.teaName || '教师' }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleUserProfile">个人信息</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { Sunny, Moon, Expand, Fold, Reading, UserFilled, Document, TrendCharts, Tools } from '@element-plus/icons-vue'


const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapsed = ref(false)

// 主题状态
const isDarkMode = ref(false)

// 从store获取用户信息
const userInfo = computed(() => userStore.userInfo)

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// 处理登出
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {
    // 用户取消退出
  })
}

// 跳转到个人信息页
const handleUserProfile = () => {
  router.push('/profile')
}

// 修改密码
const handleChangePassword = () => {
  console.log('跳转到修改密码页，待实现')
}

// 获取父级路由路径的方法
const getParentRoute = (parentTitle) => {
  const parentRouteMap = {
    '课程列表': '/course/list',
    '班级列表': '/class/list',
    '资讯列表': '/information/list',
    '统计分析': '/statistics/course'
  }
  
  return { path: parentRouteMap[parentTitle] || '/' }
}

// 路由到菜单的映射配置
const routeMenuMap = {
  'CourseList': '/course/list',
  'CourseDetail': 'course-management',
  'ClassList': '/class/list',
  'ClassStudents': 'class-main-management',
  'ClassCourses': 'class-main-management',
  'CourseStatistics': 'statistics-analysis',
  'ApiTest': 'system-tools'
}

// 路径模式匹配配置
const pathPatterns = [
  { pattern: /^\/course\/detail\/\d+$/, menu: 'course-management' },
  { pattern: /^\/class\/students\/\d+$/, menu: 'class-main-management' },
  { pattern: /^\/class\/courses\/\d+$/, menu: 'class-main-management' },
  { pattern: /^\/statistics\//, menu: 'statistics-analysis' }
]

// 当前激活的菜单项
const activeMenu = computed(() => {
  const path = route.path
  const name = route.name
  
  if (name === 'CourseList' || name === 'CourseDetail' || path.startsWith('/course/')) {
    return '/course/list'
  }
  if (name === 'ClassList' || name === 'ClassStudents' || name === 'ClassCourses' || path.startsWith('/class/')) {
    return '/class/list'
  }
  if (path.startsWith('/statistics/')) {
    return '/statistics/course'
  }
  if (name === 'ApiTest' || path === '/api-test') {
    return '/api-test'
  }
  
  return path
})

// 默认展开的子菜单
const defaultOpeneds = computed(() => {
  const path = route.path
  const name = route.name
  const openeds = []
  
  if (name === 'CourseList' || name === 'CourseDetail' || path.startsWith('/course/')) {
    openeds.push('course-management')
  }
  if (name === 'ClassList' || name === 'ClassStudents' || name === 'ClassCourses' || path.startsWith('/class/')) {
    openeds.push('class-main-management')
  }
  if (path.startsWith('/statistics/')) {
    openeds.push('statistics-analysis')
  }
  if (name === 'ApiTest' || path === '/api-test') {
    openeds.push('system-tools')
  }
  
  return openeds
})

const isLoginPage = computed(() => route.name === 'Login')

// 初始化
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  // 初始化用户状态
  userStore.initializeUser()
})

// 监听主题变化
watch(isDarkMode, (newVal) => {
  document.documentElement.setAttribute('data-theme', newVal ? 'dark' : 'light')
}, { immediate: true })
</script>

<style scoped>
.login-page-wrapper {
  height: 100vh;
  width: 100%;
}

.app-container {
  height: 100vh;
  width: 100%;
  transition: all 0.3s ease;
}

.main-container {
  height: 100%;
}

/* 白天模式侧边栏 */
.aside {
  background: #ffffff;
  color: #303133;
  height: 100%;
  overflow-x: hidden;
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  border-right: 1px solid #e4e7ed;
}

/* 黑夜模式侧边栏 */
.dark-theme .aside {
  background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
  color: #e2e8f0;
  border-right: 1px solid #4a5568;
}

/* 更新：黑夜模式下折叠侧边栏的菜单项及弹出子菜单背景 */
.dark-theme .el-menu--collapse .el-menu-item,
.dark-theme .el-menu--collapse .el-sub-menu > .el-sub-menu__title { /* 直接子菜单标题 */
  background-color: transparent !important;
}

.dark-theme .el-menu--collapse .el-menu-item:hover,
.dark-theme .el-menu--collapse .el-sub-menu > .el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.dark-theme .el-menu--collapse .el-menu-item.is-active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: #ffffff !important;
}

/* 针对折叠时弹出的子菜单 (popper) */
.el-menu--popup-container .el-menu--popup {
  transition: background-color 0.3s ease, color 0.3s ease; /* 添加过渡效果 */
}

.dark-theme .el-menu--popup-container .el-menu--popup {
  background-color: #2d3748 !important; /* 黑夜模式下弹出菜单的背景色 */
  border: 1px solid #4a5568 !important; /* 可选：边框颜色 */
}

.dark-theme .el-menu--popup-container .el-menu--popup .el-menu-item,
.dark-theme .el-menu--popup-container .el-menu--popup .el-sub-menu__title {
  color: #e2e8f0 !important; /* 黑夜模式下弹出菜单项的文字颜色 */
  background-color: transparent !important; /* 确保菜单项背景透明，继承父级popper背景 */
}

.dark-theme .el-menu--popup-container .el-menu--popup .el-menu-item:hover,
.dark-theme .el-menu--popup-container .el-menu--popup .el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.1) !important; /* 悬停背景色 */
  color: #60a5fa !important; /* 悬停文字颜色 */
}

.dark-theme .el-menu--popup-container .el-menu--popup .el-menu-item.is-active {
  background-color: #3b82f6 !important; /* 激活背景色 */
  color: #ffffff !important; /* 激活文字颜色 */
}


/* 白天模式logo容器 */
.logo-container {
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 10px 15px 10px;
  margin: 50px 0;
  position: relative;
}

/* 黑夜模式logo容器 */
.dark-theme .logo-container {
}

.logo-container::after {
  content: '';
  position: absolute;
  top: 130px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%);
}

.dark-theme .logo-container::after {
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
}

.logo-section {
  margin-bottom: 12px;
}

/* 白天模式logo */
.company-logo {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
}

/* 黑夜模式logo */
.dark-theme .company-logo {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.company-logo:hover {
  transform: translateY(-2px);
}

.dark-theme .company-logo:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.company-logo-mini {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
}

.dark-theme .company-logo-mini {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.company-logo-mini:hover {
  transform: translateY(-2px);
}

.dark-theme .company-logo-mini:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* 白天模式标题 */
.title {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  margin: 0;
  text-align: center;
  line-height: 1.2;
}

/* 黑夜模式标题 */
.dark-theme .title {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.el-menu-vertical {
  border-right: none;
  background: transparent !important;
}

/* 白天模式菜单项 */
.el-menu-vertical .el-sub-menu__title {
  background: transparent !important;
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

.el-menu-vertical .el-sub-menu__title:hover {
  background: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
}

.el-menu-vertical .el-menu-item {
  background: transparent !important;
  border-radius: 6px;
  margin: 2px 12px;
  transition: all 0.3s ease;
}

.el-menu-vertical .el-menu-item:hover {
  background: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
}

.el-menu-vertical .el-menu-item.is-active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* 黑夜模式菜单项 */
.dark-theme .el-menu-vertical .el-sub-menu__title:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #60a5fa !important;
}

.dark-theme .el-menu-vertical .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #60a5fa !important;
}

/* 主题切换按钮容器 */
.theme-toggle-container {
  position: absolute;
  bottom: 20px;
  left: 14px;
  z-index: 1000;
}

.theme-toggle-btn {
  width: 36px !important;
  height: 36px !important;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 白天模式header */
.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

/* 黑夜模式header */
.dark-theme .header {
  background-color: #2d3748;
  border-bottom: 1px solid #4a5568;
  color: #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  color: #606266;
  font-size: 18px;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background-color: #f5f7fa;
  color: #3b82f6;
}

.dark-theme .collapse-btn {
  color: #e2e8f0;
}

.dark-theme .collapse-btn:hover {
  background-color: #4a5568;
  color: #60a5fa;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.dark-theme .user-info:hover {
  background-color: #4a5568;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: #303133;
}

.dark-theme .username {
  color: #e2e8f0;
}

/* 白天模式main */
.main {
  background-color: #f8fafc;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  transition: all 0.3s ease;
}

/* 黑夜模式main */
.dark-theme .main {
  background-color: #1a202c;
}

/* 折叠状态下的菜单样式优化 */
.el-menu--collapse {
  width: 64px;
}

.el-menu--collapse .el-sub-menu__title {
  padding: 0 20px !important;
}

.el-menu--collapse .el-menu-item {
  padding: 0 20px !important;
}
</style>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  transition: all 0.3s ease;
}

/* 根据主题设置全局CSS变量 */
:root {
  --bg-color: #ffffff;
  --text-color: #303133;
  --border-color: #e4e7ed;
  --card-bg: #ffffff;
  --hover-bg: #f5f7fa;
}

[data-theme="dark"] {
  --bg-color: #1a202c;
  --text-color: #e2e8f0;
  --border-color: #4a5568;
  --card-bg: #2d3748;
  --hover-bg: #4a5568;
}

* {
  box-sizing: border-box;
}

/* 全局卡片样式 - 支持主题切换 */
.el-card {
  border-radius: 12px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  border: 1px solid var(--border-color) !important;
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
  transition: all 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-2px);
}

/* 黑夜模式卡片 */
[data-theme="dark"] .el-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3) !important;
}

[data-theme="dark"] .el-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.4) !important;
}

/* 对话框主题适配 */
.el-dialog {
  border-radius: 12px !important;
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
}

/* 按钮主题适配 */
.el-button {
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

/* 输入框主题适配 */
.el-input__wrapper {
  border-radius: 8px !important;
  background-color: var(--bg-color) !important;
  border-color: var(--border-color) !important;
}

.el-input__inner {
  color: var(--text-color) !important;
}

/* 表格主题适配 */
.el-table {
  border-radius: 8px !important;
  overflow: hidden;
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
}

.el-table th.el-table__cell {
  background-color: var(--hover-bg) !important;
  color: var(--text-color) !important;
}

.el-table tr {
  background-color: var(--card-bg) !important;
}

.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
  background-color: var(--hover-bg) !important;
}

/* 分页器主题适配 */
.el-pagination {
  justify-content: center;
}

.el-pagination .el-pager li {
  border-radius: 6px !important;
  margin: 0 2px;
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
  border: 1px solid var(--border-color) !important;
}

.el-pagination .btn-prev,
.el-pagination .btn-next {
  border-radius: 6px !important;
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
  border: 1px solid var(--border-color) !important;
}

/* 下拉菜单主题适配 */
.el-dropdown-menu {
  background-color: var(--card-bg) !important;
  border: 1px solid var(--border-color) !important;
}

.el-dropdown-menu__item {
  color: var(--text-color) !important;
}

.el-dropdown-menu__item:hover {
  background-color: var(--hover-bg) !important;
}

/* 面包屑主题适配 */
.el-breadcrumb__inner {
  color: var(--text-color) !important;
}

/* 选择器主题适配 */
.el-select .el-input__wrapper {
  background-color: var(--card-bg) !important;
}

.el-select-dropdown {
  background-color: var(--card-bg) !important;
  border: 1px solid var(--border-color) !important;
}

.el-select-dropdown__item {
  color: var(--text-color) !important;
}

.el-select-dropdown__item:hover {
  background-color: var(--hover-bg) !important;
}

/* 标签主题适配 */
.el-tag {
  background-color: var(--hover-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border-color) !important;
}

/* 空状态主题适配 */
.el-empty {
  color: var(--text-color) !important;
}

/* 消息框主题适配 */
.el-message-box {
  background-color: var(--card-bg) !important;
  border: 1px solid var(--border-color) !important;
}

.el-message-box__title {
  color: var(--text-color) !important;
}

.el-message-box__content {
  color: var(--text-color) !important;
}


/* 确保这些规则在全局样式或 :root[data-theme="dark"] 中 */

/* 黑夜模式下，Element Plus 菜单弹出层样式覆盖 */
.el-menu--popup {
  transition: background-color 0.3s ease, border-color 0.3s ease; /* 平滑过渡 */
}

[data-theme="dark"] .el-menu--popup {
  background-color: #2d3748 !important; /* 黑夜模式弹出菜单背景色 */
  border: 1px solid #4a5568 !important; /* 黑夜模式弹出菜单边框颜色 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3) !important; /* 黑夜模式阴影 */
}

[data-theme="dark"] .el-menu--popup .el-menu-item,
[data-theme="dark"] .el-menu--popup .el-sub-menu__title {
  color: #e2e8f0 !important; /* 黑夜模式弹出菜单项文字颜色 */
  background-color: transparent !important; /* 确保菜单项背景透明 */
}

[data-theme="dark"] .el-menu--popup .el-menu-item:hover,
[data-theme="dark"] .el-menu--popup .el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.1) !important; /* 黑夜模式悬停背景 */
  color: #60a5fa !important; /* 黑夜模式悬停文字颜色 */
}

[data-theme="dark"] .el-menu--popup .el-menu-item.is-active {
  background-color: #3b82f6 !important; /* 黑夜模式激活背景 */
  color: #ffffff !important; /* 黑夜模式激活文字颜色 */
  /* 如果激活时有特殊指示器，也需要适配 */
}

/* 如果以上选择器仍然无效，尝试针对更具体的 Element Plus 内部类名，
   例如 .el-popper.is-dark (如果Element Plus在黑夜模式下会给popper添加is-dark类) 
   或者直接针对 .el-menu-popper (旧版Element UI的类名，Element Plus可能不同) */

/* 例如，如果Element Plus在黑夜模式下给popper添加了 is-dark 类 */
.el-popper.is-dark {
  background-color: #2d3748 !important;
  border: 1px solid #4a5568 !important;
}

.el-popper.is-dark .el-menu-item,
.el-popper.is-dark .el-sub-menu__title {
  color: #e2e8f0 !important;
}

.el-popper.is-dark .el-menu-item:hover,
.el-popper.is-dark .el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #60a5fa !important;
}

.el-popper.is-dark .el-menu-item.is-active {
  background-color: #3b82f6 !important;
  color: #ffffff !important;
}
</style>

