<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h3>个人信息</h3>
        </div>
      </template>
      
      <el-form 
        ref="profileFormRef" 
        :model="profileForm" 
        :rules="profileRules" 
        label-width="100px"
        class="profile-form"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <el-avatar 
                  :size="120" 
                  :src="profileForm.pic" 
                  icon="UserFilled"
                  class="profile-avatar"
                />
                <div class="avatar-overlay" @click="handleAvatarClick">
                  <el-icon><Camera /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
              <input 
                ref="avatarInputRef" 
                type="file" 
                accept="image/*" 
                style="display: none" 
                @change="handleAvatarChange"
              />
            </div>
          </el-col>
          
          <el-col :span="16">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
            
            <el-form-item label="教师姓名" prop="teaName">
              <el-input v-model="profileForm.teaName" placeholder="请输入教师姓名" />
            </el-form-item>
            
            <el-form-item label="课程数量">
              <el-input v-model="profileForm.coursNum" disabled />
            </el-form-item>
            
            <el-form-item label="创建时间">
              <el-input v-model="formattedCreateTime" disabled />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSave" :loading="saving">
                保存修改
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Camera } from '@element-plus/icons-vue';
import { userApi } from '@/api';

const profileFormRef = ref(null);
const avatarInputRef = ref(null);
const saving = ref(false);

const profileForm = reactive({
  id: null,
  username: '',
  teaName: '',
  pic: '',
  coursNum: 0,
  createTime: ''
});

const originalForm = ref({});

const profileRules = {
  teaName: [
    { required: true, message: '请输入教师姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '教师姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ]
};

const formattedCreateTime = computed(() => {
  if (!profileForm.createTime) return '';
  return new Date(profileForm.createTime).toLocaleString('zh-CN');
});

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await userApi.getCurrentUserInfo();
    Object.assign(profileForm, response);
    originalForm.value = { ...response };
  } catch (error) {
    ElMessage.error('获取用户信息失败');
  }
};

// 处理头像点击
const handleAvatarClick = () => {
  avatarInputRef.value?.click();
};

// 处理头像文件选择
const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件');
    return;
  }
  
  // 验证文件大小 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await userApi.uploadAvatar(formData);
    profileForm.pic = response.url;
    ElMessage.success('头像上传成功');
  } catch (error) {
    ElMessage.error('头像上传失败');
  }
};

// 保存修改
const handleSave = async () => {
  if (!profileFormRef.value) return;
  
  try {
    await profileFormRef.value.validate();
    saving.value = true;
    
    await userApi.updateProfile({
      teaName: profileForm.teaName,
      pic: profileForm.pic
    });
    
    // 更新本地存储
    const updatedUserInfo = { ...profileForm };
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    
    ElMessage.success('保存成功');
    originalForm.value = { ...profileForm };
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message);
    }
  } finally {
    saving.value = false;
  }
};

// 重置表单
const handleReset = () => {
  Object.assign(profileForm, originalForm.value);
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.profile-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: var(--text-color);
}

.profile-form {
  margin-top: 20px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
}

.profile-avatar {
  border: 3px solid var(--border-color);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay span {
  font-size: 12px;
  margin-top: 4px;
}

/* 黑夜模式适配 */
[data-theme="dark"] .profile-card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

[data-theme="dark"] .card-header h3 {
  color: var(--text-color);
}

[data-theme="dark"] .profile-avatar {
  border-color: var(--border-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }
  
  .el-col {
    margin-bottom: 20px;
  }
}
</style>