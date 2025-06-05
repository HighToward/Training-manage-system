<template>
  <div class="login-container" :data-theme="isDarkMode ? 'dark' : 'light'">
    <!-- 主题切换按钮 - 左上角 -->
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
    
    <div class="login-left">
      <div class="welcome-text">
        <h1>欢迎光临</h1>
        <p>广东轻工职业技术大学 - 陈海涛 AI辅助开发</p>
      </div>
    </div>
    <div class="login-right">
      <div class="login-form-wrapper">
        <h2>欢迎回来</h2>
        <p class="sub-title">教师端</p>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" @submit.prevent="handleLogin">
          <p class="form-title">账号登录</p>
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" size="large" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password size="large" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" :loading="loading" class="login-button">登录</el-button>
          </el-form-item>
        </el-form>
        <p class="copyright">@2025 Training System</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { authApi } from '@/api';
import { Moon, Sunny } from '@element-plus/icons-vue';

const router = useRouter();
const loginFormRef = ref(null);
const loginForm = reactive({
  username: '',
  password: '',
});
const loading = ref(false);

// 主题状态
const isDarkMode = ref(false);

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
};

// 初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark';
  } else {
    // 检测系统主题偏好
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
});

// 监听主题变化，更新CSS变量
watch(isDarkMode, (newVal) => {
  document.documentElement.setAttribute('data-theme', newVal ? 'dark' : 'light');
}, { immediate: true });

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const response = await authApi.login(loginForm);
        
        // 设置token过期时间为30分钟（30 * 60 * 1000毫秒）
        const expiryTime = new Date().getTime() + (30 * 60 * 1000);
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        localStorage.setItem('userInfo', JSON.stringify(response.userInfo));
        
        ElMessage.success('登录成功');
        router.push('/');
      } catch (error) {
        ElMessage.error(error.message || '登录失败，请检查用户名和密码');
      }
      loading.value = false;
    }
  });
};
</script>

<style scoped>
/* CSS变量定义 */
:root {
  --login-bg-color: #ffffff;
  --login-text-color: #333333;
  --login-text-secondary: #888888;
  --login-text-light: #aaaaaa;
  --login-border-color: #eeeeee;
  --login-form-bg: #ffffff;
  --login-input-bg: #ffffff;
  --login-input-border: #dcdfe6;
}

[data-theme="dark"] {
  --login-bg-color: #1a202c;
  --login-text-color: #e2e8f0;
  --login-text-secondary: #a0aec0;
  --login-text-light: #718096;
  --login-border-color: #4a5568;
  --login-form-bg: #2d3748;
  --login-input-bg: #2d3748;
  --login-input-border: #4a5568;
}

.login-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}

/* 主题切换按钮 - 左上角 */
.theme-toggle-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

.theme-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .theme-toggle-btn {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .theme-toggle-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.login-left {
  flex: 1.2;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: white;
  text-align: center;
  position: relative;
}

/* 黑夜模式下左侧背景调整 */
[data-theme="dark"] .login-left {
  background: linear-gradient(135deg, #4a5568, #2d3748);
}

.login-left::before, .login-left::after {
  content: '';
  position: absolute;
  bottom: -50px;
  width: 150px;
  height: 150px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transform: rotate(45deg);
}

.login-left::before {
  left: 10%;
  bottom: -70px;
  width: 120px;
  height: 120px;
}

.login-left::after {
  right: 15%;
  bottom: -40px;
  width: 180px;
  height: 180px;
  background-color: rgba(255, 255, 255, 0.08);
}

.welcome-text h1 {
  font-size: 3.5em;
  margin-bottom: 20px;
  font-weight: bold;
}

.welcome-text p {
  font-size: 1.1em;
  line-height: 1.6;
  max-width: 450px;
}

.login-right {
  flex: 1;
  background-color: var(--login-bg-color);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  transition: background-color 0.3s ease;
}

.login-form-wrapper {
  width: 100%;
  max-width: 360px;
  text-align: center;
}

.login-form-wrapper h2 {
  font-size: 2em;
  color: var(--login-text-color);
  margin-bottom: 5px;
  transition: color 0.3s ease;
}

.sub-title {
  color: var(--login-text-secondary);
  margin-bottom: 30px;
  font-size: 0.9em;
  transition: color 0.3s ease;
}

.form-title {
  color: var(--login-text-light);
  font-size: 0.85em;
  text-align: left;
  margin-bottom: 20px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--login-border-color);
  transition: all 0.3s ease;
}

.el-form-item {
  margin-bottom: 25px;
}

.login-form {
  background: var(--login-form-bg);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid var(--login-border-color);
  transition: all 0.3s ease;
}

[data-theme="dark"] .login-form {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 1.1em;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* Element Plus 输入框样式适配 */
:deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: var(--login-input-bg) !important;
  border: 1px solid var(--login-input-border) !important;
  transition: all 0.3s ease;
}

:deep(.el-input__inner) {
  color: var(--login-text-color) !important;
  background-color: transparent !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: #409eff !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #409eff !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
}

/* 黑夜模式下输入框样式 */
[data-theme="dark"] :deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] :deep(.el-input__wrapper:hover) {
  border-color: #60a5fa !important;
}

[data-theme="dark"] :deep(.el-input__wrapper.is-focus) {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
}

/* 输入框图标颜色 */
:deep(.el-input__prefix-inner .el-icon) {
  color: var(--login-text-secondary) !important;
}

:deep(.el-input__suffix-inner .el-icon) {
  color: var(--login-text-secondary) !important;
}

/* 占位符文字颜色 */
:deep(.el-input__inner::placeholder) {
  color: var(--login-text-light) !important;
}

.login-button:hover {
  background: linear-gradient(to right, #5a7dfa, #9662e0);
}

.copyright {
  margin-top: 30px;
  color: var(--login-text-light);
  font-size: 0.8em;
  transition: color 0.3s ease;
}

/* Element Plus icon size */
:deep(.el-input__icon) {
  font-size: 16px;
}

/* 表单验证错误信息样式适配 */
:deep(.el-form-item__error) {
  color: #f56565 !important;
}

[data-theme="dark"] :deep(.el-form-item__error) {
  color: #fc8181 !important;
}

/* 按钮加载状态适配 */
:deep(.el-button.is-loading) {
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    flex: 0.4;
    padding: 20px;
  }
  
  .welcome-text h1 {
    font-size: 2.5em;
  }
  
  .login-right {
    flex: 0.6;
    padding: 20px;
  }
  
  .theme-toggle-container {
    top: 10px;
    left: 10px;
  }
  
  .theme-toggle-btn {
    width: 36px;
    height: 36px;
  }
}
</style>