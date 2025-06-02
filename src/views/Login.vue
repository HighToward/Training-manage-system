<template>
  <div class="login-container">
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
        <p class="copyright">@2025 Training System</p> <!-- 年份更新 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { authApi } from '@/api';

const router = useRouter();
const loginFormRef = ref(null);
const loginForm = reactive({
  username: '',
  password: '',
});
const loading = ref(false);

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
.login-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden; /* 防止内容溢出导致滚动条 */
}

.login-left {
  flex: 1.2; /* 根据截图调整比例 */
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: white;
  text-align: center;
  position: relative; /* For pseudo-elements if needed for shapes */
}

.login-left::before, .login-left::after { /* 模拟底部形状 */
  content: '';
  position: absolute;
  bottom: -50px; /* 根据需要调整 */
  width: 150px; /* 根据需要调整 */
  height: 150px; /* 根据需要调整 */
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
  font-size: 3.5em; /* 调整字体大小 */
  margin-bottom: 20px;
  font-weight: bold;
}

.welcome-text p {
  font-size: 1.1em;
  line-height: 1.6;
  max-width: 450px; /* 控制文本宽度 */
}

.login-right {
  flex: 1;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 360px; /* 控制表单最大宽度 */
  text-align: center;
}

.login-form-wrapper h2 {
  font-size: 2em;
  color: #333;
  margin-bottom: 5px;
}

.sub-title {
  color: #888;
  margin-bottom: 30px;
  font-size: 0.9em;
}

.form-title {
  color: #aaa;
  font-size: 0.85em;
  text-align: left;
  margin-bottom: 20px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.el-form-item {
  margin-bottom: 25px;
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
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

.el-input__wrapper {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.login-button:hover {
  background: linear-gradient(to right, #5a7dfa, #9662e0);
}

.copyright {
  margin-top: 30px;
  color: #aaa;
  font-size: 0.8em;
}

/* Element Plus icon size */
:deep(.el-input__icon) {
  font-size: 16px;
}

</style>