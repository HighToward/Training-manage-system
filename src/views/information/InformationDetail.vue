<template>
  <div class="information-detail-container">
    <el-card class="detail-card" v-loading="loading">
      <!-- 页面头部 -->
      <template #header>
        <div class="detail-header">
          <h2 class="info-title">{{ informationDetail.infoTitle || '资讯详情' }}</h2>
          <div class="header-actions">
            <el-button type="primary" @click="handleEdit">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button @click="handleBack">
              <el-icon><Back /></el-icon>
              返回资讯列表
            </el-button>
          </div>
        </div>
      </template>

      <!-- 资讯详情内容 -->
      <div class="detail-content">
        <el-row :gutter="24">
          <!-- 左侧信息 -->
          <el-col :span="16">
            <div class="info-details">
              <div class="info-item">
                <label>资讯作者：</label>
                <span>{{ informationDetail.teaName || '未知作者' }}</span>
              </div>
              <div class="info-item">
                <label>创建时间：</label>
                <span>{{ formatDate(informationDetail.createTime) }}</span>
              </div>
              <div class="info-item full-width">
                <label>资讯内容：</label>
                <div class="content" v-html="informationDetail.infoMain"></div>
              </div>
            </div>
          </el-col>
          
          <!-- 右侧封面图片 -->
          <el-col :span="8">
            <div class="info-cover">
              <el-image
                v-if="informationDetail.infoImage"
                :src="informationDetail.infoImage"
                :preview-src-list="[informationDetail.infoImage]"
                fit="cover"
                class="cover-image"
              />
              <div v-else class="no-cover">
                <el-icon class="no-cover-icon"><Picture /></el-icon>
                <span>暂无封面</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 评论区 -->
    <el-card class="comments-card">
      <template #header>
        <div class="comments-header">
          <h3>评论区</h3>
          <span class="comment-count">{{ commentList.length }} 条评论</span>
        </div>
      </template>

      <!-- 发表评论 -->
      <div class="comment-form">
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="写下你的评论..."
          maxlength="500"
          show-word-limit
        />
        <div class="comment-actions">
          <el-button type="primary" @click="handleAddComment" :loading="commentLoading">
            发表评论
          </el-button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list" v-loading="commentsLoading">
        <div 
          v-for="comment in commentList" 
          :key="comment.id" 
          class="comment-item"
        >
          <div class="comment-avatar">
            <el-avatar :size="40">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">{{ comment.userName || '匿名用户' }}</span>
              <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
            </div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-actions">
              <el-button 
                text 
                :type="comment.isLiked ? 'primary' : 'info'"
                @click="handleLikeComment(comment)"
                :disabled="comment.userId === currentUserId"
              >
                <el-icon><Star /></el-icon>
                {{ comment.infoLikeNum || 0 }}
              </el-button>
              <el-button 
                v-if="comment.userId === currentUserId"
                text 
                type="danger"
                @click="handleDeleteComment(comment)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
        
        <el-empty v-if="commentList.length === 0 && !commentsLoading" description="暂无评论" />
      </div>
    </el-card>

    <!-- 编辑资讯对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑资讯"
      width="900px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="information-dialog"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="information-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资讯标题" prop="infoTitle">
              <el-input v-model="formData.infoTitle" placeholder="请输入资讯标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者" prop="teaId">
              <el-select v-model="formData.teaId" placeholder="请选择作者" style="width: 100%">
                <el-option
                  v-for="teacher in teacherOptions"
                  :key="teacher.id"
                  :label="teacher.teaName"
                  :value="teacher.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="封面图片" prop="infoImage">
          <el-upload
            ref="uploadRef"
            class="image-uploader"
            :action="'/api/upload/image'"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
            :headers="{ Authorization: `Bearer ${getToken()}` }"
          >
            <el-image
              v-if="formData.infoImage"
              :src="formData.infoImage"
              class="uploaded-image"
              fit="cover"
            />
            <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="资讯内容" prop="infoMain">
          <div ref="editorRef" style="height: 400px; border: 1px solid #ccc;"></div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="formLoading">
            更新
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Back, Picture, User, Star, Delete, Plus } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { informationApi, teacherApi } from '@/api'
import '@wangeditor/editor/dist/css/style.css'
import { createEditor, createToolbar } from '@wangeditor/editor'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const commentsLoading = ref(false)
const commentLoading = ref(false)
const informationDetail = ref({})
const commentList = ref([])
const newComment = ref('')
const currentUserId = ref(null)

// 编辑相关
const dialogVisible = ref(false)
const formLoading = ref(false)
const formRef = ref(null)
const uploadRef = ref(null)
const editorRef = ref(null)
const teacherOptions = ref([])
let editor = null
let toolbar = null

// 表单数据
const formData = reactive({
  id: undefined,
  infoTitle: '',
  teaId: undefined,
  infoMain: '',
  infoImage: ''
})

// 表单验证规则
const rules = {
  infoTitle: [
    { required: true, message: '请输入资讯标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  teaId: [
    { required: true, message: '请选择作者', trigger: 'change' }
  ],
  infoMain: [
    { required: true, message: '请输入资讯内容', trigger: 'blur' }
  ]
}

// 获取当前用户ID
const getCurrentUserId = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  currentUserId.value = userInfo.id
}

// 获取token
const getToken = () => {
  return localStorage.getItem('token')
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 获取资讯详情
const fetchInformationDetail = async () => {
  loading.value = true
  try {
    const response = await informationApi.getInformationById(route.params.id)
    if (response) {
      informationDetail.value = response
      await enrichInformationDetail()
    } else {
      ElMessage.error('获取资讯详情失败')
    }
  } catch (error) {
    console.error('获取资讯详情失败:', error)
    ElMessage.error('获取资讯详情失败')
  } finally {
    loading.value = false
  }
}

// 补充资讯详情信息（教师名称等）
const enrichInformationDetail = async () => {
  try {
    if (informationDetail.value.teaId && !informationDetail.value.teaName) {
      const teachers = await teacherApi.getTeacherList()
      if (teachers && Array.isArray(teachers)) {
        const teacher = teachers.find(t => t.id === informationDetail.value.teaId)
        if (teacher) {
          informationDetail.value.teaName = teacher.teaName
        }
      }
    }
  } catch (error) {
    console.error('补充资讯详情信息失败:', error)
  }
}

// 获取评论列表
const fetchCommentList = async () => {
  commentsLoading.value = true
  try {
    const response = await informationApi.getCommentsByInfoId(route.params.id)
    if (response && Array.isArray(response)) {
      commentList.value = response
    } else {
      commentList.value = []
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    commentList.value = []
  } finally {
    commentsLoading.value = false
  }
}

// 发表评论
const handleAddComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  commentLoading.value = true
  try {
    const commentData = {
      content: newComment.value.trim(),
      userId: currentUserId.value
    }
    
    await informationApi.createComment(route.params.id, commentData)
    ElMessage.success('评论发表成功')
    newComment.value = ''
    fetchCommentList()
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败')
  } finally {
    commentLoading.value = false
  }
}

// 点赞评论
const handleLikeComment = async (comment) => {
  if (comment.userId === currentUserId.value) {
    ElMessage.warning('不能为自己的评论点赞')
    return
  }
  
  try {
    if (comment.isLiked) {
      await informationApi.unlikeComment(comment.id, currentUserId.value)
      comment.isLiked = false
      comment.infoLikeNum = Math.max(0, (comment.infoLikeNum || 0) - 1)
      ElMessage.success('取消点赞成功')
    } else {
      await informationApi.likeComment(comment.id, currentUserId.value)
      comment.isLiked = true
      comment.infoLikeNum = (comment.infoLikeNum || 0) + 1
      ElMessage.success('点赞成功')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('点赞操作失败')
  }
}

// 删除评论
const handleDeleteComment = async (comment) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await informationApi.deleteComment(comment.id)
    ElMessage.success('删除成功')
    fetchCommentList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  }
}

// 返回列表
const handleBack = () => {
  router.push('/information/list')
}

// 获取教师列表
const fetchTeacherList = async () => {
  try {
    const response = await teacherApi.getTeacherList()
    if (response && Array.isArray(response)) {
      teacherOptions.value = response
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
  }
}

// 初始化编辑器
const initEditor = async () => {
  await nextTick()
  if (editorRef.value && !editor) {
    editor = createEditor({
      selector: editorRef.value,
      html: formData.infoMain,
      config: {
        placeholder: '请输入资讯内容...',
        onChange(editor) {
          formData.infoMain = editor.getHtml()
        }
      },
      mode: 'default'
    })
    
    toolbar = createToolbar({
      editor,
      selector: editorRef.value,
      config: {
        toolbarKeys: [
          'headerSelect',
          'bold',
          'italic',
          'underline',
          'through',
          'color',
          'bgColor',
          'fontSize',
          'fontFamily',
          'indent',
          'delIndent',
          'justifyLeft',
          'justifyRight',
          'justifyCenter',
          'justifyJustify',
          'insertLink',
          'uploadImage',
          'insertTable',
          'codeBlock',
          'divider',
          'undo',
          'redo',
          'fullScreen'
        ]
      },
      mode: 'default'
    })
  }
}

// 销毁编辑器
const destroyEditor = () => {
  if (toolbar) {
    toolbar.destroy()
    toolbar = null
  }
  if (editor) {
    editor.destroy()
    editor = null
  }
}

// 编辑资讯
const handleEdit = async () => {
  await fetchTeacherList()
  
  const info = informationDetail.value
  formData.id = info.id
  formData.infoTitle = info.infoTitle
  formData.teaId = info.teaId
  formData.infoMain = info.infoMain
  formData.infoImage = info.infoImage
  
  dialogVisible.value = true
  await initEditor()
  if (editor) {
    editor.setHtml(info.infoMain || '')
  }
}

// 图片上传成功
const handleImageSuccess = (response) => {
  formData.infoImage = response
  ElMessage.success('图片上传成功')
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    formLoading.value = true
    
    await informationApi.updateInformation(formData.id, formData)
    ElMessage.success('更新成功')
    
    dialogVisible.value = false
    destroyEditor()
    fetchInformationDetail()
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败')
  } finally {
    formLoading.value = false
  }
}

// 监听弹窗关闭
const handleDialogClose = () => {
  destroyEditor()
}

onMounted(() => {
  getCurrentUserId()
  fetchInformationDetail()
  fetchCommentList()
})

onUnmounted(() => {
  destroyEditor()
})
</script>

<style scoped>
.information-detail-container {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 60px);
}

.detail-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.detail-content {
  padding: 20px 0;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-item.full-width {
  flex-direction: column;
}

.info-item label {
  font-weight: 600;
  color: var(--el-text-color-primary);
  min-width: 100px;
  margin-right: 12px;
}

.info-item span {
  color: var(--el-text-color-regular);
}

.content {
  margin-top: 8px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
}

.info-cover {
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.no-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--el-text-color-placeholder);
}

.no-cover-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.comments-card {
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.comment-count {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.comment-form {
  margin-bottom: 24px;
}

.comment-actions {
  margin-top: 12px;
  text-align: right;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.comment-time {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.comment-text {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin-bottom: 12px;
}

.comment-actions {
  display: flex;
  gap: 12px;
}

.information-dialog {
  border-radius: 12px;
}

.information-form {
  padding: 20px 0;
}

.image-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-uploader:hover {
  border-color: var(--el-color-primary);
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.uploaded-image {
  width: 178px;
  height: 178px;
  display: block;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .information-detail-container {
    padding: 16px;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .info-title {
    font-size: 20px;
  }
  
  .comment-item {
    flex-direction: column;
  }
}
</style>