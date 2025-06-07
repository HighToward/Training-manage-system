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
                <div class="avatar-overlay" @click="avatarDialogVisible = true">
                  <el-icon><Camera /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="16">
            <el-form-item label="账号" prop="username">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
            
            <el-form-item label="教师姓名" prop="teaName">
              <el-input v-model="profileForm.teaName" placeholder="请输入教师姓名" />
            </el-form-item>
            
            <el-form-item label="课程数量">
              <el-input v-model="profileForm.coursNum" disabled />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSave" :loading="saving">
                保存
              </el-button>
              <el-button @click="handleCancel">取消</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 头像上传模态框 -->
    <el-dialog 
      v-model="avatarDialogVisible"
      title="上传头像"
      width="500px"
    >
      <div class="avatar-upload-content">
        <div class="current-avatar">
          <el-avatar 
            :size="120" 
            :src="profileForm.pic" 
            icon="UserFilled"
          />
          <p>当前头像</p>
        </div>
        
        <el-upload
          ref="uploadRef"
          class="avatar-uploader"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :on-success="handleAvatarSuccess"
          :on-error="handleAvatarError"
          accept="image/*"
        >
          <el-button type="primary" :loading="uploading">
            {{ uploading ? '上传中...' : '选择新头像' }}
          </el-button>
        </el-upload>
        
        <div class="upload-tips">
          <p>• 支持 JPG、PNG 格式</p>
          <p>• 文件大小不超过 2MB</p>
          <p>• 建议尺寸 200x200 像素</p>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="avatarDialogVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 响应式数据
const profileFormRef = ref(null)
const avatarDialogVisible = ref(false)
const uploading = ref(false)
const saving = ref(false)
const uploadRef = ref()

// 表单数据
const profileForm = reactive({
  id: null,
  username: '',
  teaName: '',
  pic: '',
  coursNum: 0,
  createTime: ''
})

const originalForm = ref({})

// 表单验证规则
const profileRules = {
  teaName: [
    { required: true, message: '请输入教师姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '教师姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 上传配置
const uploadUrl = computed(() => '/api/upload/avatar')
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${userStore.token}`
}))

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await userStore.fetchUserInfo()
    Object.assign(profileForm, response)
    originalForm.value = { ...response }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 保存修改
const handleSave = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    saving.value = true
    
    await userStore.updateProfile({
      teaName: profileForm.teaName,
      pic: profileForm.pic
    })
    
    ElMessage.success('保存成功')
    
    const updatedUserInfo = userStore.userInfo
    Object.assign(profileForm, updatedUserInfo)
    originalForm.value = { ...updatedUserInfo }
    
  } catch (error) {
    console.error('保存失败:', error)
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('保存失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 取消修改
const handleCancel = () => {
  Object.assign(profileForm, originalForm.value)
  ElMessage.info('已取消修改')
}

// 上传前验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  
  uploading.value = true
  return true
}

// 上传成功回调
const handleAvatarSuccess = (response) => {
  uploading.value = false
  
  if (response.code === 200) {
    profileForm.pic = response.data.url
    userStore.userInfo.pic = response.data.url
    
    ElMessage.success('头像上传成功！')
    avatarDialogVisible.value = false
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 上传失败回调
const handleAvatarError = (error) => {
  uploading.value = false
  console.error('头像上传失败:', error)
  ElMessage.error('头像上传失败，请重试')
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
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

.avatar-upload-content {
  text-align: center;
  padding: 20px;
}

.current-avatar {
  margin-bottom: 30px;
}

.current-avatar p {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.avatar-uploader {
  margin-bottom: 20px;
}

.upload-tips {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  text-align: left;
}

.upload-tips p {
  margin: 5px 0;
  color: #909399;
  font-size: 12px;
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