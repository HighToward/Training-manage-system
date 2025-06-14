<template>
  <div class="question-detail-container">
    <!-- 问题主体卡片 -->
    <el-card class="question-card" v-loading="loading">
      <!-- 问题头部 -->
      <div class="question-header">
        <h1 class="question-title">{{ questionDetail.content }}</h1>
        
        <!-- 问题元信息 -->
        <div class="question-meta">
          <div class="meta-left">
            <div class="student-info">
              <el-avatar :size="40" :src="questionDetail.stuAvatar" class="student-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="student-details">
                <span class="student-name">{{ questionDetail.stuName || '未知学生' }}</span>
                <div class="meta-info">
                  <span class="comment-count">
                    <el-icon><ChatDotRound /></el-icon>
                    {{ questionDetail.commentNum || 0 }} 条评论
                  </span>
                  <span class="publish-time">{{ formatDate(questionDetail.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="meta-right">
            <!-- 未采纳状态：显示采纳和不采纳按钮 -->
            <template v-if="questionDetail.hasAdopt === 0">
              <el-button 
                type="success" 
                @click="handleAdopt" 
                class="action-btn">
                <el-icon><Check /></el-icon>
                采纳问题
              </el-button>
              <el-button 
                type="warning" 
                @click="handleReject" 
                class="action-btn">
                <el-icon><Close /></el-icon>
                不采纳
              </el-button>
            </template>
            <!-- 已采纳状态：显示取消采纳按钮 -->
            <template v-else-if="questionDetail.hasAdopt === 1">
              <el-button 
                type="info" 
                @click="handleCancelAdopt" 
                class="action-btn">
                <el-icon><RefreshLeft /></el-icon>
                取消采纳
              </el-button>
            </template>
            <!-- 不采纳状态：显示重新采纳按钮 -->
            <template v-else-if="questionDetail.hasAdopt === 2">
              <el-button 
                type="success" 
                @click="handleAdopt" 
                class="action-btn">
                <el-icon><Check /></el-icon>
                重新采纳
              </el-button>
            </template>
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

      <!-- 问题状态 -->
      <div class="question-status">
        <el-tag 
          :type="questionDetail.hasAdopt === 1 ? 'success' : questionDetail.hasAdopt === 2 ? 'danger' : 'info'" 
          size="large">
          {{ questionDetail.hasAdopt === 1 ? '已采纳' : questionDetail.hasAdopt === 2 ? '不采纳' : '未采纳' }}
        </el-tag>
        <el-tag :type="getQuestionTypeTag(questionDetail.questionType)" class="type-tag">
          {{ questionDetail.questionType || '未知类型' }}
        </el-tag>
      </div>

      <!-- 问题内容 -->
      <div class="question-content">
        <div class="content">{{ questionDetail.content }}</div>
      </div>

      <!-- 封面图片或标题 -->
      <div class="cover-section">
        <div v-if="questionImages.length > 0" class="cover-image">
          <el-image
            :src="questionImages[0].imgUrl"
            fit="cover"
            style="width: 100%; height: 200px; border-radius: 8px;"
            :preview-src-list="questionImages.map(img => img.imgUrl)"
            preview-teleported
          />
        </div>
        <div v-else class="cover-title">
          <div class="title-content">
            <h2>{{ questionDetail.content }}</h2>
            <div class="title-meta">
              <el-tag :type="getQuestionTypeTag(questionDetail.questionType)" size="small">
                {{ questionDetail.questionType }}
              </el-tag>
              <span class="publish-time">{{ formatDate(questionDetail.createTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 问题图片 -->
      <div class="question-images" v-if="questionImages.length > 1">
        <h4>更多图片</h4>
        <div class="image-grid">
          <el-image
            v-for="(image, index) in questionImages.slice(1)"
            :key="index"
            :src="image.imgUrl"
            :preview-src-list="questionImages.map(img => img.imgUrl)"
            :initial-index="index + 1"
            :preview-teleported="true"
            :z-index="3000"
            fit="cover"
            class="question-image"
            hide-on-click-modal
          />
        </div>
      </div>

      <!-- 互动统计 -->
      <div class="interaction-stats">
        <div class="stats-grid">
          <div class="stat-item">
            <el-icon><ChatDotRound /></el-icon>
            <span>评论数：{{ questionDetail.commentNum || 0 }}</span>
          </div>
          <div class="stat-item">
            <el-icon><Star /></el-icon>
            <span>点赞数：{{ questionDetail.likeNum || 0 }}</span>
          </div>
          <div class="stat-item">
            <el-icon><Collection /></el-icon>
            <span>收藏数：{{ questionDetail.collectionNum || 0 }}</span>
          </div>
        </div>
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
          <!-- 引用框 -->
          <div v-if="showQuoteBox && replyingTo" class="quote-box">
            <div class="quote-header">
              <span class="quote-label">回复</span>
              <el-button text size="small" @click="cancelReply" class="cancel-reply">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <div class="quote-content">
              <div class="quote-user-info">
                <el-avatar :size="24" :src="replyingTo.userAvatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="quote-username">{{ replyingTo.userName || '匿名用户' }}</span>
                <span class="quote-time">{{ formatDate(replyingTo.createTime) }}</span>
              </div>
              <div class="quote-text">{{ replyingTo.content }}</div>
            </div>
          </div>
          
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
          :data-comment-id="comment.id"
          class="comment-item-card"
        >
          <div class="comment-avatar">
            <el-avatar :size="36" :src="comment.userAvatar">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="commenter-name">{{ comment.userName || '匿名用户' }}</span>
              <span class="comment-time">{{ formatDate(comment.createTime) }}</span>

            </div>
            
            <!-- 引用内容显示 -->
            <div v-if="comment.parentCommentsId && comment.parentCommentsId !== 0" class="comment-quote" @click="scrollToComment(comment.parentCommentsId)">
              <div class="quote-indicator">
                <el-icon><ChatDotRound /></el-icon>
                <span>回复了</span>
              </div>
              <div class="quoted-comment">
                <div class="quoted-user-info">
                  <el-avatar :size="20" :src="getQuotedUserAvatar(comment.parentCommentsId)">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                  <span class="quoted-username">{{ getQuotedUserName(comment.parentCommentsId) }}</span>
                  <span class="quoted-time">{{ formatDate(getQuotedCommentTime(comment.parentCommentsId)) }}</span>
                </div>
                <div class="quoted-text">{{ getQuotedCommentContent(comment.parentCommentsId) }}</div>
              </div>
            </div>
            
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-actions">
              <el-button text size="small" @click="handleReply(comment)" class="comment-reply">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, 
  ChatDotRound, 
  Star, 
  Collection, 
  Check, 
  Delete, 
  Back, 
  EditPen, 
  Close,
  RefreshLeft 
} from '@element-plus/icons-vue'
import { questionApi, studentApi } from '@/api'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const commentsLoading = ref(false)
const commentLoading = ref(false)
const questionDetail = ref({})
const questionImages = ref([])
const commentList = ref([])
const newComment = ref('')
const currentUserId = ref(null)
const showQuoteBox = ref(false)
const replyingTo = ref(null)

// 获取当前用户ID
const getCurrentUserId = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  currentUserId.value = userInfo.id
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

// 获取问题类型标签样式
const getQuestionTypeTag = (type) => {
  const tagMap = {
    '技术问题': 'danger',
    '课程问题': 'primary',
    '其他问题': 'info'
  }
  return tagMap[type] || 'info'
}

// 获取问题详情
const fetchQuestionDetail = async () => {
  loading.value = true
  try {
    const response = await questionApi.getQuestionById(route.params.id)
    if (response) {
      questionDetail.value = response
      await enrichQuestionDetail()
      await fetchQuestionImages()
    } else {
      ElMessage.error('获取问题详情失败')
    }
  } catch (error) {
    console.error('获取问题详情失败:', error)
    ElMessage.error('获取问题详情失败')
  } finally {
    loading.value = false
  }
}

// 补充问题详情信息（学生名称等）
const enrichQuestionDetail = async () => {
  try {
    if (questionDetail.value.stuId && !questionDetail.value.stuName) {
      const response = await studentApi.getAllStudents()
      let students = response
      
      // 如果返回的是分页数据，提取list
      if (response && response.list) {
        students = response.list
      }
      
      if (students && Array.isArray(students)) {
        const student = students.find(s => s.id === questionDetail.value.stuId)
        if (student) {
          questionDetail.value.stuName = student.stuName || student.name
          questionDetail.value.stuAvatar = student.pic || student.avatar  // 添加头像信息
        }
      }
    }
  } catch (error) {
    console.error('补充问题详情信息失败:', error)
  }
}

// 获取问题图片
const fetchQuestionImages = async () => {
  try {
    questionImages.value = await questionApi.getQuestionImages(route.params.id)
  } catch (error) {
    console.error('获取问题图片失败:', error)
    questionImages.value = []
  }
}

// 获取评论列表
const fetchCommentList = async () => {
  commentsLoading.value = true
  try {
    const response = await questionApi.getCommentsByQuestionId(route.params.id)
    if (response && Array.isArray(response)) {
      // 处理头像路径
      commentList.value = response.map(comment => {
        if (comment.userAvatar && !comment.userAvatar.startsWith('http')) {
          // 检查是否已经包含 /uploads/avatar/ 前缀
          if (comment.userAvatar.startsWith('/uploads/avatar/')) {
            comment.userAvatar = `http://localhost:8080${comment.userAvatar}`
          } else {
            comment.userAvatar = `http://localhost:8080/uploads/avatar/${comment.userAvatar}`
          }
        }
        return comment
      })

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
      userId: currentUserId.value,
      // 如果是回复评论，添加引用信息
      parentCommentsId: replyingTo.value ? replyingTo.value.id : null,
      atId: replyingTo.value ? replyingTo.value.userId : null
    }
    
    await questionApi.createQuestionComment(route.params.id, commentData)
    ElMessage.success('评论发表成功')
    newComment.value = ''
    // 清除引用状态
    cancelReply()
    fetchCommentList()
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败')
  } finally {
    commentLoading.value = false
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
    
    await questionApi.deleteQuestionComment(commentId)
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
  replyingTo.value = comment
  showQuoteBox.value = true
  // 滚动到评论框
  nextTick(() => {
    const commentForm = document.querySelector('.comment-form-card')
    if (commentForm) {
      commentForm.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// 取消回复
const cancelReply = () => {
  replyingTo.value = null
  showQuoteBox.value = false
}

// 跳转到被引用的评论
const scrollToComment = (commentId) => {
  const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`)
  if (commentElement) {
    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // 添加高亮效果
    commentElement.classList.add('highlight')
    setTimeout(() => {
      commentElement.classList.remove('highlight')
    }, 2000)
  }
}

// 获取被引用评论的信息
const getQuotedUserName = (commentId) => {
  const comment = commentList.value.find(c => c.id === commentId || c.id === parseInt(commentId))
  return comment ? comment.userName : '已删除用户'
}

const getQuotedUserAvatar = (commentId) => {
  const comment = commentList.value.find(c => c.id === commentId || c.id === parseInt(commentId))
  return comment ? comment.userAvatar : ''
}

const getQuotedCommentContent = (commentId) => {
  const comment = commentList.value.find(c => c.id === commentId || c.id === parseInt(commentId))
  return comment ? comment.content : '该用户已删除评论。'
}

const getQuotedCommentTime = (commentId) => {
  const comment = commentList.value.find(c => c.id === commentId || c.id === parseInt(commentId))
  return comment ? comment.createTime : ''
}

// 判断是否可以删除评论
const canDeleteComment = (comment) => {
  // 获取当前用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const userType = userInfo.userType || localStorage.getItem('userType')
  
  // 调试信息
  console.log('当前用户信息:', userInfo)
  console.log('用户类型:', userType)
  console.log('当前用户ID:', currentUserId.value)
  console.log('评论信息:', comment)
  
  // 管理员可以删除所有评论，用户只能删除自己的评论
  if (userType === 'student') {
    const canDelete = comment.stuId === currentUserId.value || comment.userId === currentUserId.value
    console.log('学生权限检查:', canDelete)
    return canDelete
  } else if (userType === 'teacher') {
    const canDelete = comment.teaId === currentUserId.value || comment.userId === currentUserId.value
    console.log('教师权限检查:', canDelete)
    return canDelete
  }
  
  // 如果没有明确的用户类型，检查userId
  const canDelete = comment.userId === currentUserId.value
  console.log('通用权限检查:', canDelete)
  return canDelete
}

// 采纳问题
const handleAdopt = async () => {
  try {
    await ElMessageBox.confirm('确定要采纳这个问题吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await questionApi.adoptQuestion(route.params.id)
    ElMessage.success('采纳成功')
    questionDetail.value.hasAdopt = 1
  } catch (error) {
    if (error !== 'cancel') {
      console.error('采纳问题失败:', error)
      ElMessage.error('采纳失败')
    }
  }
}

// 取消采纳
const handleCancelAdopt = async () => {
  try {
    await ElMessageBox.confirm('确定要取消采纳这个问题吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await questionApi.cancelAdoptQuestion(route.params.id)
    ElMessage.success('取消采纳成功')
    questionDetail.value.hasAdopt = 0
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消采纳失败:', error)
      ElMessage.error('取消采纳失败')
    }
  }
}

// 不采纳问题
const handleReject = async () => {
  try {
    await ElMessageBox.confirm('确定要不采纳这个问题吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await questionApi.rejectQuestion(route.params.id)
    ElMessage.success('不采纳成功')
    questionDetail.value.hasAdopt = 2
  } catch (error) {
    if (error !== 'cancel') {
      console.error('不采纳失败:', error)
      ElMessage.error('不采纳失败')
    }
  }
}

// 删除问题
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个问题吗？删除后无法恢复！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await questionApi.deleteQuestion(route.params.id)
    ElMessage.success('删除成功')
    router.push('/question')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除问题失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 返回列表
const handleBack = () => {
  router.push('/question/list')
}

// 页面加载
onMounted(() => {
  getCurrentUserId()
  fetchQuestionDetail()
  fetchCommentList()
})
</script>

<style scoped>
.question-detail-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

/* 问题卡片样式 */
.question-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.question-header {
  margin-bottom: 24px;
}

.question-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0 0 20px 0;
  word-wrap: break-word;
}

.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-left {
  flex: 1;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar {
  border: 2px solid #e4e7ed;
}

.student-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #909399;
}

.comment-count,
.publish-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-right {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 16px;
}

.question-status {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.type-tag {
  margin-left: 8px;
}

.question-content {
  margin-bottom: 24px;
}

.content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.question-images {
  margin-bottom: 24px;
}

.question-images h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.question-image {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.question-image:hover {
  transform: scale(1.02);
}

.interaction-stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.stat-item .el-icon {
  color: #409eff;
}

/* 评论区样式 */
.comments-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
  color: #303133;
}

.title-icon {
  color: #409eff;
}

.comment-count {
  font-size: 14px;
  color: #909399;
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
  margin-top: 12px;
}

/* 引用框样式 */
.quote-box {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  position: relative;
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.quote-label {
  font-size: 12px;
  color: var(--el-color-primary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cancel-reply {
  color: var(--el-text-color-placeholder);
  padding: 0;
  min-height: auto;
}

.cancel-reply:hover {
  color: var(--el-color-danger);
}

.quote-content {
  background: var(--el-bg-color);
  border-radius: 6px;
  padding: 8px;
}

.quote-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.quote-username {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.quote-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.quote-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  display: flex;
  gap: 12px;
}

.comment-item-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-item-card.highlight {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
  background: var(--el-color-primary-light-9);
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.commenter-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* 评论中的引用内容样式 */
.comment-quote {
  margin-bottom: 12px;
  padding: 12px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-fill-color-lighter) 100%);
  border: 1px solid var(--el-color-primary-light-7);
  border-left: 4px solid var(--el-color-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comment-quote:hover {
  border-color: var(--el-color-primary-light-5);
  background: linear-gradient(135deg, var(--el-color-primary-light-8) 0%, var(--el-fill-color-light) 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.quote-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--el-color-primary);
  font-weight: 600;
}

.quote-indicator .el-icon {
  font-size: 14px;
}

.quoted-comment {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  padding: 10px;
  border: 1px solid var(--el-border-color-lighter);
}

.quoted-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.quoted-username {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.quoted-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-left: auto;
}

.quoted-text {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
  font-style: italic;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.comment-text {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin-bottom: 12px;
  word-wrap: break-word;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.comment-reply,
.comment-delete {
  font-size: 12px;
  padding: 4px 8px;
  height: auto;
}

.comment-reply:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.comment-delete:hover {
  color: var(--el-color-danger);
  background-color: var(--el-color-danger-light-9);
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

.cover-section {
  margin-bottom: 20px;
}

.cover-image {
  margin-bottom: 0;
}

.cover-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 40px 30px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cover-title::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.title-content {
  position: relative;
  z-index: 2;
}

.title-content h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.title-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.title-meta .el-tag {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.publish-time {
  font-size: 14px;
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-detail-container {
    padding: 16px;
  }
  
  .question-title {
    font-size: 24px;
  }
  
  .question-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .meta-right {
    width: 100%;
    justify-content: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>