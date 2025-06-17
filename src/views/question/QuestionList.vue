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
          <!-- 视图切换按钮 -->
          <div class="view-toggle">
            <el-button-group>
              <el-button
                :type="viewMode === 'card' ? 'primary' : 'default'"
                @click="viewMode = 'card'"
                class="view-btn">
                <el-icon><Grid /></el-icon>
                卡片视图
              </el-button>
              <el-button
                :type="viewMode === 'list' ? 'primary' : 'default'"
                @click="viewMode = 'list'"
                class="view-btn">
                <el-icon><List /></el-icon>
                列表视图
              </el-button>
            </el-button-group>
          </div>
          <el-button type="success" size="large" @click="handleBatchAdopt" :disabled="selectedQuestions.length === 0" class="batch-btn">
            <el-icon><Check /></el-icon>
            批量采纳
          </el-button>
        </div>
      </div>
    </div>

    <!-- 问题卡片视图 -->
    <div class="question-grid" v-loading="loading" v-show="viewMode === 'card'">
      <div v-for="(item, index) in questionList" :key="item.id" class="question-card-wrapper">
        <el-card class="question-card" shadow="hover">
          <div class="card-header">
            <div class="question-info">
              <h3 class="question-title">{{ truncateContent(item.content, 80) }}</h3>
              <div class="question-meta">
                <el-tag :type="getQuestionTypeTag(item.questionType)" size="small">
                  {{ getQuestionTypeText(item.questionType) }}
                </el-tag>
                <span class="create-time">{{ formatDate(item.createTime) }}</span>
              </div>
            </div>
            <div class="question-status">
              <el-tag 
                :type="item.hasAdopt === 1 ? 'success' : item.hasAdopt === 2 ? 'danger' : 'warning'" 
                size="large">
                {{ item.hasAdopt === 1 ? '已采纳' : item.hasAdopt === 2 ? '不采纳' : '未采纳' }}
              </el-tag>
            </div>
          </div>
          
          <div class="card-content">
            <div class="student-info">
              <el-avatar :size="32" class="student-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="student-name">{{ item.stuName || '未知学生' }}</span>
            </div>
            
            <div class="interaction-data">
              <div class="data-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ item.commentNum || 0 }}</span>
              </div>
              <div class="data-item">
                <el-icon><Star /></el-icon>
                <span>{{ item.likeNum || 0 }}</span>
              </div>
              <div class="data-item">
                <el-icon><Collection /></el-icon>
                <span>{{ item.collectionNum || 0 }}</span>
              </div>
            </div>
          </div>
          
          <div class="card-actions">
            <el-button type="primary" plain @click="handleViewDetail(item)" class="action-btn">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <!-- 未采纳状态：显示采纳和不采纳按钮 -->
            <template v-if="item.hasAdopt === 0">
              <el-button type="success" plain @click="handleAdopt(item)" class="action-btn">
                <el-icon><Check /></el-icon>
                采纳
              </el-button>
              <el-button type="warning" plain @click="handleReject(item)" class="action-btn">
                <el-icon><Close /></el-icon>
                不采纳
              </el-button>
            </template>
            <!-- 已采纳状态：显示取消采纳按钮 -->
            <template v-else-if="item.hasAdopt === 1">
              <el-button type="info" plain @click="handleCancelAdopt(item)" class="action-btn">
                <el-icon><RefreshLeft /></el-icon>
                取消采纳
              </el-button>
            </template>
            <!-- 不采纳状态：显示重新采纳按钮 -->
            <template v-else-if="item.hasAdopt === 2">
              <el-button type="success" plain @click="handleAdopt(item)" class="action-btn">
                <el-icon><Check /></el-icon>
                重新采纳
              </el-button>
            </template>
            <el-button type="danger" plain @click="handleDelete(item)" class="action-btn danger">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 问题列表视图 -->
    <div class="question-list" v-loading="loading" v-show="viewMode === 'list'">
      <el-table 
        :data="questionList" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        class="question-table">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="问题内容" min-width="250" align="left">
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
        <el-table-column label="提问学生" width="150" align="center">
          <template #default="scope">
            <div class="student-info">
              <el-avatar :size="32" class="student-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="student-name">{{ scope.row.stuName || '未知学生' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="互动数据" width="120" align="center">
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
        <el-table-column label="采纳状态" width="100" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.hasAdopt === 1 ? 'success' : scope.row.hasAdopt === 2 ? 'danger' : 'warning'" 
              size="small">
              {{ scope.row.hasAdopt === 1 ? '已采纳' : scope.row.hasAdopt === 2 ? '不采纳' : '未采纳' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" fixed="right" align="center">
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
import { ref, reactive, onMounted, computed } from 'vue'
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
  RefreshLeft,
  Grid,
  List
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { questionApi, studentApi } from '@/api'
import pinyin from 'js-pinyin'
import { useViewModeStore } from '@/stores/viewMode'

const router = useRouter()

// 视图模式
const viewModeStore = useViewModeStore()
const viewMode = computed({
  get: () => viewModeStore.getViewMode('question'),
  set: (value) => viewModeStore.setViewMode('question', value)
})

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
  transition: all 0.3s ease;
}

/* 深夜模式背景 */
[data-theme="dark"] .question-list-container {
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 32px;
}

.search-card {
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
}

[data-theme="dark"] .search-card {
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.search-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow);
}

.search-header {
  margin-bottom: 20px;
  padding: 24px 28px 0;
  border-bottom: none;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 24px;
  transition: color 0.3s ease;
}

.title-icon {
  font-size: 22px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 28px 28px;
}

/* 深夜模式输入框适配 */
[data-theme="dark"] :deep(.el-input__wrapper) {
  background-color: rgba(74, 85, 104, 0.8);
  border-color: rgba(113, 128, 150, 0.6);
  box-shadow: none;
}

[data-theme="dark"] :deep(.el-input__inner) {
  color: #e2e8f0;
}

[data-theme="dark"] :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
}

[data-theme="dark"] :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* 深夜模式下拉选择器适配 */
[data-theme="dark"] :deep(.el-select .el-input__wrapper) {
  background-color: rgba(74, 85, 104, 0.8);
  border-color: rgba(113, 128, 150, 0.6);
}

[data-theme="dark"] :deep(.el-select-dropdown) {
  background-color: rgba(45, 55, 72, 0.95);
  border-color: rgba(113, 128, 150, 0.6);
}

[data-theme="dark"] :deep(.el-select-dropdown__item) {
  color: #e2e8f0;
}

[data-theme="dark"] :deep(.el-select-dropdown__item:hover) {
  background-color: rgba(102, 126, 234, 0.2);
}

.search-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16px;
  padding: 14px 28px;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.search-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.search-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.search-btn:hover::before {
  left: 100%;
}

.reset-btn {
  background: rgba(248, 249, 250, 0.9);
  border: 2px solid rgba(233, 236, 239, 0.8);
  color: #6c757d;
  border-radius: 16px;
  padding: 14px 28px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

[data-theme="dark"] .reset-btn {
  background: rgba(74, 85, 104, 0.9);
  border-color: rgba(113, 128, 150, 0.8);
  color: #e2e8f0;
}

.reset-btn:hover {
  background: rgba(233, 236, 239, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
}

[data-theme="dark"] .reset-btn:hover {
  background: rgba(113, 128, 150, 0.9);
  box-shadow: 0 4px 12px rgba(226, 232, 240, 0.1);
}

/* 操作区域样式 */
.action-section {
  margin-bottom: 32px;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

[data-theme="dark"] .action-header {
  background: rgba(45, 55, 72, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.page-title h2 {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  transition: all 0.3s ease;
}

.subtitle {
  color: var(--text-color);
  font-size: 16px;
  margin: 8px 0 0 0;
  opacity: 0.8;
  transition: color 0.3s ease;
}

.action-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.view-toggle {
  margin-right: 16px;
}

.view-btn {
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-btn .el-icon {
  margin-right: 6px;
}

/* 问题列表样式优化 */
.question-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.question-table {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 深夜模式表格适配 */
[data-theme="dark"] :deep(.el-table) {
  background-color: transparent;
}

[data-theme="dark"] :deep(.el-table th.el-table__cell) {
  background-color: rgba(74, 85, 104, 0.8);
  color: #e2e8f0;
  border-color: rgba(113, 128, 150, 0.3);
}

[data-theme="dark"] :deep(.el-table td.el-table__cell) {
  background-color: rgba(45, 55, 72, 0.6);
  color: #e2e8f0;
  border-color: rgba(113, 128, 150, 0.2);
}

[data-theme="dark"] :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: rgba(74, 85, 104, 0.4);
}

[data-theme="dark"] :deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: rgba(102, 126, 234, 0.2) !important;
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
  color: var(--text-color);
  opacity: 0.6;
  font-size: 12px;
  transition: all 0.3s ease;
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
  gap: 16px;
  flex-wrap: center;
}

.batch-btn {
  background: linear-gradient(135deg, #67c23a 0%, #63b14f 100%);
  border: none;
  border-radius: 16px;
  padding: 16px 32px;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 120px;
}

.batch-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.batch-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.batch-btn:hover::before {
  left: 100%;
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

/* 问题卡片视图样式 */
.question-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.question-card-wrapper {
  height: 100%;
}

.question-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .question-card {
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.question-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .question-card:hover {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.question-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
}

.question-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}

.question-card .question-info {
  flex: 1;
  margin-right: 12px;
}

.question-card .question-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.question-card .question-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.question-card .question-status {
  flex-shrink: 0;
}

.question-card .card-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

[data-theme="dark"] .question-card .card-content {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: rgba(102, 126, 234, 0.2);
}

.question-card .card-content:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
  transform: translateY(-2px);
}

[data-theme="dark"] .question-card .card-content:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
}

.question-card .student-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-card .student-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.question-card .student-name {
  font-size: 15px;
  color: var(--text-color);
  font-weight: 600;
  transition: color 0.3s ease;
}

.question-card .interaction-data {
  display: flex;
  gap: 16px;
  align-items: center;
}

.question-card .data-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-color);
  font-size: 14px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.question-card .data-item:hover {
  opacity: 1;
  transform: scale(1.05);
}

.question-card .data-item .el-icon {
  font-size: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.question-card .card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
}

.question-card .action-btn {
  flex: 1;
  min-width: 90px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.question-card .action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.question-card .action-btn:hover {
  transform: translateY(-3px);
}

.question-card .action-btn:hover::before {
  left: 100%;
}

.question-card .action-btn.danger:hover {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
  box-shadow: 0 6px 20px rgba(245, 108, 108, 0.4);
}

/* 问题列表样式 */
.question-list {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

[data-theme="dark"] .question-list {
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.question-list:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .question-list:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
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
  color: var(--text-color);
  font-weight: 500;
  transition: color 0.3s ease;
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
  color: var(--text-color);
  font-weight: 500;
  transition: color 0.3s ease;
}

.interaction-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.7;
  transition: all 0.3s ease;
}

.data-item:hover {
  opacity: 1;
  transform: scale(1.05);
}

.data-item .el-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 分页器样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

[data-theme="dark"] .pagination-wrapper {
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.pagination-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .pagination-wrapper:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.modern-pagination {
  --el-pagination-button-color: var(--text-color);
  --el-pagination-hover-color: #667eea;
}

/* 深夜模式分页器适配 */
[data-theme="dark"] :deep(.el-pagination .el-pager li) {
  background: rgba(74, 85, 104, 0.6);
  color: #e2e8f0;
  border: 1px solid rgba(113, 128, 150, 0.3);
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.3s ease;
}

[data-theme="dark"] :deep(.el-pagination .el-pager li:hover) {
  background: rgba(102, 126, 234, 0.3);
  border-color: #667eea;
  color: #60a5fa;
  transform: translateY(-2px);
}

[data-theme="dark"] :deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: #ffffff;
  font-weight: 600;
  transform: scale(1.1);
}

[data-theme="dark"] :deep(.el-pagination .btn-prev),
[data-theme="dark"] :deep(.el-pagination .btn-next) {
  background: rgba(74, 85, 104, 0.6);
  color: #e2e8f0;
  border: 1px solid rgba(113, 128, 150, 0.3);
  border-radius: 8px;
}

[data-theme="dark"] :deep(.el-pagination .btn-prev:hover),
[data-theme="dark"] :deep(.el-pagination .btn-next:hover) {
  background: rgba(102, 126, 234, 0.3);
  border-color: #667eea;
  color: #60a5fa;
}

/* 详情弹窗样式 */
.question-detail-dialog {
  border-radius: 20px;
  overflow: hidden;
}

[data-theme="dark"] :deep(.el-dialog) {
  background: rgba(45, 55, 72, 0.95);
  backdrop-filter: blur(10px);
}

[data-theme="dark"] :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 1px solid rgba(113, 128, 150, 0.3);
}

[data-theme="dark"] :deep(.el-dialog__title) {
  color: white;
}

[data-theme="dark"] :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

[data-theme="dark"] :deep(.el-dialog__body) {
  background: rgba(45, 55, 72, 0.8);
  color: #e2e8f0;
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
  border-bottom: 1px solid var(--border-color);
}

.question-info h3 {
  margin: 0 0 12px 0;
  color: var(--text-color);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.detail-content h4 {
  margin: 0 0 12px 0;
  color: var(--text-color);
  font-size: 18px;
  font-weight: 700;
  transition: color 0.3s ease;
}

.detail-content p {
  margin: 8px 0;
  color: var(--text-color);
  opacity: 0.8;
  transition: all 0.3s ease;
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
  color: var(--text-color);
  opacity: 0.8;
  transition: all 0.3s ease;
}

.stat-item:hover {
  opacity: 1;
  transform: scale(1.05);
}

.stat-item .el-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 视图切换按钮样式 */
.action-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.view-toggle {
  margin-right: 16px;
}

.view-btn {
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-btn .el-icon {
  margin-right: 6px;
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
  
  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .view-toggle {
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .question-grid {
    grid-template-columns: 1fr;
  }
  
  .question-card .card-actions {
    flex-direction: column;
  }
  
  .question-card .action-btn {
    min-width: auto;
  }
  
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .search-actions {
    flex-direction: column;
  }
}
</style>