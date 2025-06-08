<template>
  <div class="information-detail-container">
    <!-- 文章主体卡片 -->
    <el-card class="article-card" v-loading="loading">
      <!-- 文章头部 -->
      <div class="article-header">
        <h1 class="article-title">{{ informationDetail.infoTitle }}</h1>
        
        <!-- 文章元信息 -->
        <div class="article-meta">
          <div class="meta-left">
            <div class="author-info">
              <el-avatar :size="40" :src="informationDetail.teaPic" class="author-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="author-details">
                <span class="author-name">{{ informationDetail.teaName || '未知作者' }}</span>
                <span class="publish-time">{{ formatDate(informationDetail.createTime) }}</span>
              </div>
            </div>
          </div>
          <div class="meta-right">
            <el-button type="primary" @click="handleEdit" class="action-btn">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" @click="handleDelete" class="action-btn">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button @click="handleBack" class="action-btn">
              <el-icon><Back /></el-icon>
              返回
            </el-button>
          </div>
        </div>
      </div>

      <!-- 封面图片 -->
      <div class="article-cover" v-if="informationDetail.infoImage">
        <el-image
          :src="informationDetail.infoImage"
          :preview-src-list="[informationDetail.infoImage]"
          :preview-teleported="true"
          :z-index="3000"
          fit="cover"
          class="cover-image"
          hide-on-click-modal
        />
      </div>

      <!-- 文章内容 -->
      <div class="article-content">
        <div class="content" v-html="informationDetail.infoMain"></div>
      </div>
    </el-card>

    <!-- 评论区卡片 -->
    <el-card class="comments-card">
      <template #header>
        <div class="comments-header">
          <h3 class="comments-title">
            <el-icon class="title-icon"><ChatDotRound /></el-icon>
            评论区
          </h3>
          <span class="comment-count">{{ commentList.length }} 条评论</span>
        </div>
      </template>

      <!-- 发表评论 -->
      <div class="comment-form-card">
        <div class="comment-form">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="4"
            placeholder="写下你的想法..."
            maxlength="500"
            show-word-limit
          />
          <div class="comment-actions">
            <el-button type="primary" @click="handleAddComment" :loading="commentLoading">
              <el-icon><EditPen /></el-icon>
              发表评论
            </el-button>
          </div>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list" v-loading="commentsLoading">
        <div 
          v-for="comment in commentList" 
          :key="comment.id" 
          class="comment-item-card"
        >
          <div class="comment-avatar">
            <el-avatar :size="36">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="commenter-name">{{ comment.userName || '匿名用户' }}</span>
              <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
            </div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-actions">
              <el-button text size="small" @click="handleReply(comment)"
                          class="comment-reply">
                <el-icon><ChatDotRound /></el-icon>
                回复
              </el-button>
              <el-button 
                text 
                size="small" 
                type="danger" 
                @click="handleDeleteComment(comment.id)"
                v-if="canDeleteComment(comment)"
                class="comment-delete"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
        
        <div v-if="commentList.length === 0" class="no-comments">
          <el-icon class="no-comments-icon"><ChatDotRound /></el-icon>
          <p>暂无评论，快来发表第一条评论吧！</p>
        </div>
      </div>
    </el-card>

    <!-- 编辑资讯对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑资讯"
      width="1000px"
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
              :preview-disabled="true"
              preview-teleported
              :z-index="3000"
              @error="imageLoadError = true"
              hide-on-click-modal
            />
            <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="资讯内容" prop="infoMain">
          <div class="editor-container">
            <div id="toolbar-container" class="toolbar-container"></div>
            <div ref="editorRef" class="editor-content" style="height: 400px; border: 1px solid #ccc; border-top: none;"></div>
          </div>
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
import { Edit, Back, Picture, User, Star, Delete, Plus, ArrowLeft, ChatDotRound } from '@element-plus/icons-vue'
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
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
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
          informationDetail.value.teaPic = teacher.pic  // 添加头像信息
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
const handleDeleteComment = async (commentId) => {
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
    
    await informationApi.deleteComment(commentId)
    ElMessage.success('删除成功')
    fetchCommentList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  }
}

// 回复评论
const handleReply = (comment) => {
  newComment.value = `@${comment.userName || '匿名用户'} `
}

// 检查是否可以删除评论
const canDeleteComment = (comment) => {
  return comment.userId === currentUserId.value
}

// 删除资讯
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除资讯 "${informationDetail.value.infoTitle}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await informationApi.deleteInformation(route.params.id)
    ElMessage.success('删除成功')
    router.push('/information')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除资讯失败:', error)
      ElMessage.error('删除失败')
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
      selector: '#toolbar-container',
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
  // 后端返回的是 Result 对象，需要取 data 字段
  if (response && response.data) {
    formData.infoImage = response.data
  } else if (typeof response === 'string') {
    // 如果直接返回字符串URL
    formData.infoImage = response
  } else {
    console.error('图片上传响应格式错误:', response)
    ElMessage.error('图片上传响应格式错误')
    return
  }
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
/* 主容器 */
.information-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 60px);
}

/* 文章主体卡片 */
.article-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

/* 文章头部 */
.article-header {
  padding: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.article-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--el-text-color-primary);
  margin: 0 0 24px 0;
  word-wrap: break-word;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.publish-time {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.meta-right {
  display: flex;
  gap: 12px;
}

.action-btn {
  border-radius: 8px;
  padding: 8px 16px;
}

/* 封面图片 */
.article-cover {
  margin: 0 24px 24px 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cover-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
}

/* 文章内容 */
.article-content {
  padding: 0 24px 24px 24px;
}

.content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  word-wrap: break-word;
}

/* 内容样式优化 */
.content :deep(h1),
.content :deep(h2),
.content :deep(h3),
.content :deep(h4),
.content :deep(h5),
.content :deep(h6) {
  margin: 24px 0 16px 0;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.content :deep(p) {
  margin: 16px 0;
  text-align: justify;
}

.content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content :deep(blockquote) {
  border-left: 4px solid var(--el-color-primary);
  padding: 16px;
  margin: 16px 0;
  background: var(--el-fill-color-extra-light);
  border-radius: 0 8px 8px 0;
}

.content :deep(code) {
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.content :deep(pre) {
  background: var(--el-fill-color);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

/* 评论区卡片 */
.comments-card {
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.title-icon {
  color: var(--el-color-primary);
}

.comment-count {
  color: var(--el-text-color-regular);
  font-size: 14px;
  background: var(--el-fill-color-light);
  padding: 4px 12px;
  border-radius: 12px;
}

/* 评论表单 */
.comment-form-card {
  background: var(--el-fill-color-extra-light);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(0,0,0,0);
}

.comment-textarea {
  border-radius: 8px;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item-card {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.comment-item-card:hover {
  background: var(--el-fill-color-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.commenter-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 15px;
}

.comment-time {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.comment-text {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin-bottom: 12px;
  font-size: 15px;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

/* 无评论状态 */
.no-comments {
  text-align: center;
  padding: 48px 24px;
  color: var(--el-text-color-placeholder);
}

.no-comments-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--el-color-info-light-5);
}

.no-comments p {
  margin: 0;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .information-detail-container {
    padding: 16px;
  }
  
  .article-header {
    padding: 20px;
  }
  
  .article-title {
    font-size: 24px;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .article-cover {
    margin: 0 20px 20px 20px;
  }
  
  .cover-image {
    height: 200px;
  }
  
  .article-content {
    padding: 0 20px 20px 20px;
  }
  
  .comment-form-card {
    padding: 20px;
  }
  
  .comment-item-card {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .information-detail-container {
    padding: 12px;
  }
  
  .article-header {
    padding: 16px;
  }
  
  .article-title {
    font-size: 20px;
  }
  
  .cover-image {
    height: 180px;
  }
  
  .article-content {
    padding: 0 16px 16px 16px;
  }
  
  .meta-right {
    flex-direction: column;
    width: 100%;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
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

/* 编辑器容器样式 */
.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.toolbar-container {
  border-bottom: 1px solid #ccc;
  background-color: #f8f9fa;
}

.editor-content {
  border: none !important;
  border-radius: 0;
}

/* 确保编辑器在模态框中正确显示 */
.information-dialog .w-e-text-container {
  height: 400px !important;
}

.information-dialog .w-e-text {
  height: 100% !important;
}

/* 修复图片预览冲突 */
:deep(.el-image__preview) {
  z-index: 3000 !important;
}

:deep(.el-image-viewer__wrapper) {
  z-index: 3000 !important;
}

[data-theme="dark"] .breadcrumb-card,
[data-theme="dark"] .article-card,
[data-theme="dark"] .comments-card {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);
}

[data-theme="dark"] .article-title {
  color: #e2e8f0 !important;
}
[data-theme="dark"] .author-name {
  color: #e2e8f0 !important; 
}
[data-theme="dark"] .publish-time {
  color: #cbd5e0!important;
}
[data-theme="dark"] .content {
  color: #e2e8f0 !important;
}

[data-theme="dark"] .comments-title {
  color: #e2e8f0 !important;
}
[data-theme="dark"] .comment-text {
  color: #cbd5e0 !important;
}

[data-theme="dark"] .comment-textarea {
  background: #415066 !important;
}

[data-theme="dark"] .commenter-name {
  color: #cbd5e0 !important;
}
[data-theme="dark"] .comment-reply {
  color: #cbd5e0 !important;
}

[data-theme="dark"] .comment-form-card,
[data-theme="dark"] .comment-item-card {
  background: #415066;
}

</style>