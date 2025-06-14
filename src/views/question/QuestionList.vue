<template>
  <div class="question-list-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card class="search-card">
        <div class="search-header">
          <div class="search-title">
            <el-icon class="title-icon"><Search /></el-icon>
            <span>问题查询</span>
          </div>
        </div>
        <div class="search-form">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-input 
                v-model="queryParams.content" 
                placeholder="搜索问题内容..." 
                clearable 
                size="large"
                class="search-input"
                @keyup.enter="handleQuery"
                @clear="handleContentClear">
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="3" >
              <el-select 
                v-model="queryParams.questionType" 
                placeholder="问题类型" 
                clearable 
                size="large"
                style="width: 100%">
                <el-option label="全部类型" value="" />
                <el-option 
                  v-for="type in questionTypes" 
                  :key="type" 
                  :label="getQuestionTypeText(type)" 
                  :value="type" />
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-select 
                v-model="queryParams.hasAdopt" 
                placeholder="采纳状态" 
                clearable 
                size="large"
                style="width: 100%">
                <el-option label="全部状态" value="" />
                <el-option label="已采纳" :value="1" />
                <el-option label="未采纳" :value="0" />
                <el-option label="不采纳" :value="2" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <div class="search-actions">
                <el-button type="primary" size="large" @click="handleQuery" class="search-btn">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button size="large" @click="resetQuery" class="reset-btn">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 操作区域 -->
    <div class="action-section">
      <div class="action-header">
        <div class="page-title">
          <h2>问题反馈管理</h2>
          <p class="subtitle">共 {{ total }} 个问题</p>
        </div>
        <div class="action-buttons">
          <el-button type="success" size="large" @click="handleBatchAdopt" :disabled="selectedQuestions.length === 0" class="batch-btn">
            <el-icon><Check /></el-icon>
            批量采纳
          </el-button>
        </div>
      </div>
    </div>

    <!-- 问题列表 -->
    <div class="question-list" v-loading="loading">
      <el-table 
        :data="questionList" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        class="question-table">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="问题内容" min-width="300">
          <template #default="scope">
            <div class="question-content">
              <p class="content-text">{{ truncateContent(scope.row.content, 100) }}</p>
              <div class="question-meta">
                <el-tag :type="getQuestionTypeTag(scope.row.questionType)" size="small">
                  {{ getQuestionTypeText(scope.row.questionType) }}
                </el-tag>
                <span class="create-time">{{ formatDate(scope.row.createTime) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提问学生" width="150">
          <template #default="scope">
            <div class="student-info">
              <el-avatar :size="32" class="student-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="student-name">{{ scope.row.stuName || '未知学生' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="互动数据" width="120">
          <template #default="scope">
            <div class="interaction-data">
              <div class="data-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ scope.row.commentNum || 0 }}</span>
              </div>
              <div class="data-item">
                <el-icon><Star /></el-icon>
                <span>{{ scope.row.likeNum || 0 }}</span>
              </div>
              <div class="data-item">
                <el-icon><Collection /></el-icon>
                <span>{{ scope.row.collectionNum || 0 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="采纳状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="scope.row.hasAdopt === 1 ? 'success' : scope.row.hasAdopt === 2 ? 'danger' : 'warning'" 
              size="small">
              {{ scope.row.hasAdopt === 1 ? '已采纳' : scope.row.hasAdopt === 2 ? '不采纳' : '未采纳' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <!-- 未采纳状态：显示采纳和不采纳按钮 -->
              <template v-if="scope.row.hasAdopt === 0">
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleAdopt(scope.row)">
                  <el-icon><Check /></el-icon>
                  采纳
                </el-button>
                <el-button 
                  type="warning" 
                  size="small" 
                  @click="handleReject(scope.row)">
                  <el-icon><Close /></el-icon>
                  不采纳
                </el-button>
              </template>
              <!-- 已采纳状态：显示取消采纳按钮 -->
              <template v-else-if="scope.row.hasAdopt === 1">
                <el-button 
                  type="info" 
                  size="small" 
                  @click="handleCancelAdopt(scope.row)">
                  <el-icon><RefreshLeft /></el-icon>
                  取消采纳
                </el-button>
              </template>
              <!-- 不采纳状态：显示重新采纳按钮 -->
              <template v-else-if="scope.row.hasAdopt === 2">
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleAdopt(scope.row)">
                  <el-icon><Check /></el-icon>
                  重新采纳
                </el-button>
              </template>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页器 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="modern-pagination"
      />
    </div>

    <!-- 问题详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="问题详情"
      width="800px"
      :close-on-click-modal="false"
      class="question-detail-dialog"
    >
      <div v-if="currentQuestion" class="question-detail">
        <div class="detail-header">
          <div class="question-info">
            <h3>{{ currentQuestion.content }}</h3>
            <div class="question-meta">
              <el-tag :type="getQuestionTypeTag(currentQuestion.questionType)" size="small">
                {{ getQuestionTypeText(currentQuestion.questionType) }}
              </el-tag>
              <span class="create-time">发布时间：{{ formatDate(currentQuestion.createTime) }}</span>
            </div>
          </div>
          <div class="question-status">
            <el-tag 
              :type="currentQuestion.hasAdopt === 1 ? 'success' : currentQuestion.hasAdopt === 2 ? 'danger' : 'warning'" 
              size="large">
              {{ currentQuestion.hasAdopt === 1 ? '已采纳' : currentQuestion.hasAdopt === 2 ? '不采纳' : '未采纳' }}
            </el-tag>
          </div>
        </div>
        
        <div class="detail-content">
          <div class="student-info">
            <h4>提问学生信息</h4>
            <p>学生ID: {{ currentQuestion.stuId }}</p>
            <p>班级ID: {{ currentQuestion.classId }}</p>
          </div>
          
          <div class="interaction-stats">
            <h4>互动统计</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>评论数：{{ currentQuestion.commentNum || 0 }}</span>
              </div>
              <div class="stat-item">
                <el-icon><Star /></el-icon>
                <span>点赞数：{{ currentQuestion.likeNum || 0 }}</span>
              </div>
              <div class="stat-item">
                <el-icon><Collection /></el-icon>
                <span>收藏数：{{ currentQuestion.collectionNum || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <!-- 未采纳状态：显示采纳和不采纳按钮 -->
          <template v-if="currentQuestion && currentQuestion.hasAdopt === 0">
            <el-button 
              type="success" 
              @click="handleAdoptInDetail">
              <el-icon><Check /></el-icon>
              采纳问题
            </el-button>
            <el-button 
              type="warning" 
              @click="handleRejectInDetail">
              <el-icon><Close /></el-icon>
              不采纳
            </el-button>
          </template>
          <!-- 已采纳状态：显示取消采纳按钮 -->
          <template v-else-if="currentQuestion && currentQuestion.hasAdopt === 1">
            <el-button 
              type="info" 
              @click="handleCancelAdoptInDetail">
              <el-icon><RefreshLeft /></el-icon>
              取消采纳
            </el-button>
          </template>
          <!-- 不采纳状态：显示重新采纳按钮 -->
          <template v-else-if="currentQuestion && currentQuestion.hasAdopt === 2">
            <el-button 
              type="success" 
              @click="handleAdoptInDetail">
              <el-icon><Check /></el-icon>
              重新采纳
            </el-button>
          </template>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Refresh, 
  Check, 
  Delete, 
  View, 
  Edit, 
  User, 
  ChatDotRound, 
  Star, 
  Collection,
  Close,
  RefreshLeft
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { questionApi, studentApi } from '@/api'
import pinyin from 'js-pinyin'

const router = useRouter()

// 查询参数
const queryParams = reactive({
  content: '',
  questionType: '',
  hasAdopt: '',
  pageNum: 1,
  pageSize: 20
})

// 表格数据
const loading = ref(false)
const questionList = ref([])
const allQuestions = ref([]) // 存储所有问题数据用于前端筛选
const total = ref(0)
const selectedQuestions = ref([])
const questionTypes = ref([]) // 动态问题类型列表

// 弹窗相关
const detailDialogVisible = ref(false)
const currentQuestion = ref(null)

// 获取问题类型列表
const getQuestionTypes = async () => {
  try {
    const types = await questionApi.getQuestionTypes()
    questionTypes.value = types || []
  } catch (error) {
    console.error('获取问题类型失败:', error)
  }
}

// 获取问题列表
const getQuestionList = async () => {
  loading.value = true
  try {
    // 获取所有问题数据
    const data = await questionApi.getQuestionList()
    allQuestions.value = data || []
    // 补充学生姓名信息
    await enrichQuestionList()
    // 应用筛选
    applyFilters()
  } catch (error) {
    console.error('获取问题列表失败:', error)
    ElMessage.error(error.message || '获取问题列表失败')
  } finally {
    loading.value = false
  }
}

// 补充问题列表的学生姓名信息
const enrichQuestionList = async () => {
  try {
    // 获取学生列表
    const response = await studentApi.getAllStudents()
    let students = response
    
    // 如果返回的是分页数据，提取list
    if (response && response.list) {
      students = response.list
    }
    
    if (students && Array.isArray(students)) {
      // 为每个问题添加学生姓名
      allQuestions.value.forEach(question => {
        const student = students.find(s => s.id === question.stuId)
        if (student) {
          question.stuName = student.stuName || student.name
        }
      })
    }
  } catch (error) {
    console.error('获取学生信息失败:', error)
  }
}

// 应用筛选条件
const applyFilters = () => {
  let filteredData = [...allQuestions.value]
  
  // 内容筛选（支持拼音查询）
  if (queryParams.content) {
    const searchTerm = queryParams.content.toLowerCase()
    filteredData = filteredData.filter(item => {
      const content = item.content || ''
      // 直接匹配
      if (content.toLowerCase().includes(searchTerm)) {
        return true
      }
      // 拼音匹配
      const pinyinContent = pinyin.getFullChars(content).toLowerCase()
      const pinyinShort = pinyin.getCamelChars(content).toLowerCase()
      return pinyinContent.includes(searchTerm) || pinyinShort.includes(searchTerm)
    })
  }
  
  // 问题类型筛选
  if (queryParams.questionType) {
    filteredData = filteredData.filter(item => item.questionType === queryParams.questionType)
  }
  
  // 采纳状态筛选
  if (queryParams.hasAdopt !== '') {
    filteredData = filteredData.filter(item => item.hasAdopt === queryParams.hasAdopt)
  }
  
  questionList.value = filteredData
  total.value = filteredData.length
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  applyFilters()
}

// 重置搜索
const resetQuery = () => {
  Object.assign(queryParams, {
    content: '',
    questionType: '',
    hasAdopt: '',
    pageNum: 1,
    pageSize: 20
  })
  applyFilters()
}

// 清空内容搜索
const handleContentClear = () => {
  queryParams.content = ''
  applyFilters()
}

// 分页
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  queryParams.pageNum = 1
  getQuestionList()
}

const handleCurrentChange = (page) => {
  queryParams.pageNum = page
  getQuestionList()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedQuestions.value = selection
}

// 查看详情
const handleViewDetail = (row) => {
  // 跳转到问题详情页
  router.push(`/question/detail/${row.id}`)
}

// 采纳问题
const handleAdopt = async (row) => {
  try {
    await ElMessageBox.confirm('确定要采纳这个问题吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await questionApi.adoptQuestion(row.id)
    ElMessage.success('采纳成功')
    getQuestionList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('采纳问题失败:', error)
      ElMessage.error('采纳失败')
    }
  }
}

// 详情中采纳
const handleAdoptInDetail = async () => {
  await handleAdopt(currentQuestion.value)
  if (currentQuestion.value) {
    currentQuestion.value.hasAdopt = 1
  }
}

// 详情中取消采纳
const handleCancelAdoptInDetail = async () => {
  await handleCancelAdopt(currentQuestion.value)
  if (currentQuestion.value) {
    currentQuestion.value.hasAdopt = 0
  }
}

// 详情中不采纳
const handleRejectInDetail = async () => {
  await handleReject(currentQuestion.value)
  if (currentQuestion.value) {
    currentQuestion.value.hasAdopt = 2
  }
}

// 批量采纳
const handleBatchAdopt = async () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请选择要采纳的问题')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要采纳选中的 ${selectedQuestions.value.length} 个问题吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedQuestions.value.map(item => item.id)
    await questionApi.batchAdoptQuestions(ids)
    ElMessage.success('批量采纳成功')
    getQuestionList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量采纳失败:', error)
      ElMessage.error('批量采纳失败')
    }
  }
}

// 取消采纳
const handleCancelAdopt = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消采纳这个问题吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await questionApi.cancelAdoptQuestion(row.id)
    ElMessage.success('取消采纳成功')
    getQuestionList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消采纳失败:', error)
      ElMessage.error('取消采纳失败')
    }
  }
}

// 不采纳问题
const handleReject = async (row) => {
  try {
    await ElMessageBox.confirm('确定不采纳这个问题吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await questionApi.rejectQuestion(row.id)
    ElMessage.success('已标记为不采纳')
    getQuestionList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('不采纳操作失败:', error)
      ElMessage.error('不采纳失败')
    }
  }
}

// 删除问题
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个问题吗？删除后无法恢复！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await questionApi.deleteQuestion(row.id)
    ElMessage.success('删除成功')
    getQuestionList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除问题失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 工具函数
const truncateContent = (content, maxLength) => {
  if (!content) return ''
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getQuestionTypeText = (type) => {
  // 直接返回字符串类型，因为后端返回的就是字符串
  return type || '未知类型'
}

const getQuestionTypeTag = (type) => {
  const tagMap = {
    '技术问题': 'danger',
    '课程问题': 'primary',
    '其他问题': 'info'
  }
  return tagMap[type] || 'info'
}

// 页面加载
onMounted(() => {
  getQuestionTypes()
  getQuestionList()
})
</script>

<style scoped>
.question-list-container {
  padding: 24px;
  min-height: 100vh;
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 20px;
}

.search-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-header {
  margin-bottom: 20px;
}

.search-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.title-icon {
  margin-right: 8px;
  color: #409eff;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-actions {
  display: flex;
  gap: 12px;
}

.search-btn, .reset-btn {
  border-radius: 8px;
  font-weight: 500;
}

/* 操作区域样式 */
.action-section {
  margin-bottom: 20px;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-title h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  margin: 4px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.action-buttons {
  display: flex;
}

/* 问题列表样式优化 */
.question-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.question-table {
  border-radius: 12px;
}

.question-table :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.question-table :deep(.el-table__header th) {
  background-color: #f8f9fa;
  color: #303133;
  font-weight: 600;
  border-bottom: 2px solid #e4e7ed;
}

.question-table :deep(.el-table__row) {
  transition: all 0.3s ease;
}

.question-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.question-content {
  padding: 8px 0;
}

.content-text {
  margin: 0 0 8px 0;
  line-height: 1.5;
  color: #303133;
  font-size: 14px;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.create-time {
  color: #909399;
  font-size: 12px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.student-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.student-name {
  color: #606266;
  font-size: 13px;
}

.interaction-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 12px;
}

.data-item .el-icon {
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  border-radius: 6px;
  font-size: 12px;
}

.batch-btn {
  border-radius: 8px;
  font-weight: 500;
}

/* 分页器样式优化 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.modern-pagination {
  --el-pagination-font-size: 14px;
  --el-pagination-bg-color: #f5f7fa;
  --el-pagination-text-color: #606266;
  --el-pagination-border-radius: 6px;
}

.modern-pagination :deep(.el-pagination__total) {
  color: #909399;
  font-weight: 500;
}

.modern-pagination :deep(.btn-prev),
.modern-pagination :deep(.btn-next) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.modern-pagination :deep(.btn-prev:hover),
.modern-pagination :deep(.btn-next:hover) {
  background-color: #409eff;
  color: white;
}

.modern-pagination :deep(.el-pager li) {
  border-radius: 6px;
  margin: 0 2px;
  transition: all 0.3s ease;
}

.modern-pagination :deep(.el-pager li:hover) {
  background-color: #409eff;
  color: white;
}

.modern-pagination :deep(.el-pager li.is-active) {
  background-color: #409eff;
  color: white;
  font-weight: 600;
}

/* 问题列表样式 */
.question-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.question-table {
  border-radius: 12px;
}

.question-content {
  padding: 8px 0;
}

.content-text {
  margin: 0 0 8px 0;
  line-height: 1.5;
  color: #303133;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.create-time {
  color: #909399;
  font-size: 12px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.student-name {
  font-size: 14px;
  color: #606266;
}

.interaction-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 分页器样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.modern-pagination {
  --el-pagination-button-color: #606266;
  --el-pagination-hover-color: #409eff;
}

/* 详情弹窗样式 */
.question-detail-dialog {
  border-radius: 12px;
}

.question-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.question-info h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 18px;
  line-height: 1.5;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.detail-content h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.detail-content p {
  margin: 8px 0;
  color: #606266;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-list-container {
    padding: 12px;
  }
  
  .action-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .search-actions {
    flex-direction: column;
  }
}
</style>