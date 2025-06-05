<template>
  <div class="course-list-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card class="search-card">
        <div class="search-header">
          <div class="search-title">
            <el-icon class="title-icon"><Search /></el-icon>
            <span>课程查询</span>
          </div>
        </div>
        <div class="search-form">
          <el-input 
            v-model="queryParams.couName" 
            placeholder="搜索课程名称..." 
            clearable 
            size="large"
            class="search-input"
            @keyup.enter="handleQuery"
            @clear="handleCourseNameClear">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
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
        </div>
      </el-card>
    </div>

    <!-- 操作区域 -->
    <div class="action-section">
      <div class="action-header">
        <div class="page-title">
          <h2>课程管理</h2>
          <p class="subtitle">共 {{ total }} 门课程</p>
        </div>
        <el-button type="primary" size="large" @click="handleAdd" class="add-btn">
          <el-icon><Plus /></el-icon>
          新建课程
        </el-button>
      </div>
    </div>

    <!-- 课程卡片列表 -->
    <div class="course-grid" v-loading="loading">
      <div v-for="(item, index) in courseList" :key="item.id" class="course-card-wrapper">
        <el-card class="course-card" shadow="hover" @click="handleViewDetail(item)">
          <div class="card-image">
            <el-image
              v-if="item.couPic"
              :src="item.couPic ? item.couPic.trim() : ''"
              :preview-src-list="item.couPic ? [item.couPic.trim()] : []"
              fit="cover"
              class="course-image"
              preview-teleported="true"
              hide-on-click-modal="true"
            />
            <el-image
              v-else
              src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
              fit="cover"
              class="course-image"
            />
            <div class="image-overlay">
              <div class="course-stats">
                <div class="stat-item">
                  <el-icon><View /></el-icon>
                  <span>{{ item.clicks }}</span>
                </div>
                <div class="stat-item">
                  <el-icon><ShoppingCart /></el-icon>
                  <span>{{ item.purchase }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card-content">
            <div class="course-header">
              <h3 class="course-name">{{ item.couName }}</h3>
              <el-tag type="primary" class="course-type">{{ item.typeName }}</el-tag>
            </div>
            
            <div class="course-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ item.teaName }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Document /></el-icon>
                <span>{{ item.couCataNum }} 章节</span>
              </div>
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(item.createTime) }}</span>
              </div>
            </div>
            
            <div class="card-actions" @click.stop>
              <el-button type="primary" plain @click="handleEdit(item)" class="action-btn">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="success" plain @click="handleChapter(item)" class="action-btn">
                <el-icon><Document /></el-icon>
                章节
              </el-button>
              <el-button type="danger" plain @click="handleDelete(item)" class="action-btn danger">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分页器 - 根据最新反馈优化 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[12, 24, 48]"
        layout="prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="modern-pagination"
        prev-text="上一页"
        next-text="下一页"
        :pager-count="7"
        :hide-on-single-page="false"
      >
        <template #jumper>
          <span class="pagination-jumper">
            前往
            <el-input-number
              v-model="queryParams.pageNum"
              @change="handleCurrentChange"
              :min="1"
              :max="Math.ceil(total / queryParams.pageSize)"
              controls-position=""
              size="small"
              class="pagination-input"
            />
            页
          </span>
        </template>
      </el-pagination>
    </div>

    <!-- 课程表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑课程' : '新建课程'"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="course-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="course-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程名称" prop="couName">
              <el-input v-model="formData.couName" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程类型" prop="couTypeIds">
              <el-cascader
                v-model="formData.couTypeIds"
                :options="courseTypeOptions"
                :props="{ checkStrictly: false, value: 'id', label: 'typeName' }"
                clearable
                placeholder="请选择课程类型"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="教师" prop="teaId">
              <el-select v-model="formData.teaId" placeholder="请选择教师" style="width: 100%">
                <el-option
                  v-for="item in teacherOptions"
                  :key="item.id"
                  :label="item.teaName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程价格" prop="couPrice">
              <el-input-number
                v-model="formData.couPrice"
                :min="0"
                :precision="2"
                :step="10"
                style="width: 100%"
                placeholder="请输入课程价格"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="课程封面" prop="couPic">
          <div class="cover-upload-container">
            <div class="cover-preview-area">
              <!-- 图片预览区域 -->
              <div class="cover-image-wrapper" v-if="formData.couPic">
                <el-image
                  :src="formData.couPic"
                  class="cover-image"
                  fit="cover"
                  :preview-src-list="[formData.couPic]"
                  preview-teleported
                  hide-on-click-modal="true"
                  @error="handleImageError"
                />
                <el-button 
                  type="primary" 
                  size="small" 
                  class="change-cover-btn"
                  @click="triggerUpload"
                >
                  <el-icon><Edit /></el-icon>
                  点击更换封面
                </el-button>
              </div>
              
              <!-- 上传占位区域 -->
              <div class="upload-placeholder" v-else @click="triggerUpload">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传课程封面</div>
              </div>
            </div>
            
            <!-- 隐藏的上传组件 -->
            <el-upload
              ref="uploadRef"
              class="hidden-upload"
              action="#"
              :http-request="handleUpload"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :auto-upload="true"
            >
            </el-upload>
            
            <div class="upload-tip">建议上传16:9比例图片，支持JPG/PNG格式，大小不超过2MB</div>
          </div>
        </el-form-item>

        <el-form-item label="课程介绍" prop="couIntroduction">
          <el-input
            v-model="formData.couIntroduction"
            type="textarea"
            :rows="4"
            placeholder="请输入课程介绍"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelForm">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="formLoading">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { courseApi, teacherApi } from '@/api'

const router = useRouter()

// 查询参数
const queryParams = reactive({
  couName: '',
  couTypeIds: [],
  teaId: undefined,
  pageNum: 1,
  pageSize: 12 // 默认12条/页
})

// 表格数据
const loading = ref(false)
const courseList = ref([])
const total = ref(0)
const pages = ref(0)

// 下拉选项数据
const courseTypeOptions = ref([])
const teacherOptions = ref([])

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formLoading = ref(false)
const formRef = ref(null)
const imageLoadError = ref(false)
const uploadRef = ref(null)

// 表单数据
const formData = reactive({
  id: undefined,
  couName: '',
  couTypeIds: [],
  teaId: undefined,
  couPrice: 0,
  couPic: '',
  couIntroduction: ''
})

// 表单验证规则
const rules = {
  couName: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  couTypeIds: [
    { required: true, message: '请选择课程类型', trigger: 'change' }
  ],
  teaId: [
    { required: true, message: '请选择教师', trigger: 'change' }
  ],
  couIntroduction: [
    { required: true, message: '请输入课程介绍', trigger: 'blur' },
    { min: 10, max: 1000, message: '长度在 10 到 1000 个字符', trigger: 'blur' }
  ]
}

// 获取课程列表
const fetchCourseList = async () => {
  loading.value = true
  try {
    const response = await courseApi.getCourseList(queryParams)
    if (response && response.list && typeof response.total === 'number' && typeof response.pages === 'number') {
      courseList.value = response.list
      total.value = response.total
      pages.value = response.pages
    } else {
      console.error('获取课程列表失败: 响应数据结构不正确或字段缺失', response)
      ElMessage.error('获取课程列表失败: 数据格式错误')
      courseList.value = []
      total.value = 0
      pages.value = 0
    }
  } catch (error) {
    console.error('获取课程列表失败 (catch block):', error)
    ElMessage.error((error && error.message) ? `获取课程列表失败: ${error.message}` : '获取课程列表失败: 未知错误')
    courseList.value = []
    total.value = 0
    pages.value = 0
  } finally {
    loading.value = false
  }
}

// 获取课程类型树
const fetchCourseTypeTree = async () => {
  try {
    const response = await courseApi.getCourseTypeTree()
    console.log('Course types response:', response)
    if (response && Array.isArray(response) && response.length > 0) {
      courseTypeOptions.value = response
      console.log('Assigned courseTypeOptions:', courseTypeOptions.value)
    } else {
      courseTypeOptions.value = []
      console.error('获取课程类型树失败: 响应数据为空或格式不正确', response)
      ElMessage.error('获取课程类型失败: 未收到有效数据')
    }
  } catch (error) {
    courseTypeOptions.value = []
    console.error('获取课程类型树失败 (catch block):', error)
    ElMessage.error((error && error.message) ? `获取课程类型树失败: ${error.message}` : '获取课程类型树失败: 未知错误')
  }
}

// 获取教师列表
const fetchTeacherList = async () => {
  try {
    const response = await teacherApi.getTeacherList()
    console.log('Teacher list response:', response)
    if (response && Array.isArray(response) && response.length > 0) {
      teacherOptions.value = response
      console.log('Assigned teacherOptions:', teacherOptions.value)
    } else {
      teacherOptions.value = []
      console.error('获取教师列表失败: 响应数据为空或格式不正确', response)
      ElMessage.error('获取教师列表失败: 未收到有效数据')
    }
  } catch (error) {
    teacherOptions.value = []
    console.error('获取教师列表失败 (catch block):', error)
    ElMessage.error((error && error.message) ? `获取教师列表失败: ${error.message}` : '获取教师列表失败: 未知错误')
  }
}

// 查询处理
const handleQuery = () => {
  queryParams.pageNum = 1
  fetchCourseList()
}

// 处理课程名称清除事件
const handleCourseNameClear = () => {
  resetQuery()
}

// 重置查询
const resetQuery = () => {
  queryParams.couName = ''
  queryParams.couTypeIds = []
  queryParams.teaId = undefined
  handleQuery()
}

// 分页大小变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  fetchCourseList()
}

// 当前页变化
const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  fetchCourseList()
}

// 重置表单数据
const resetFormData = () => {
  formData.id = undefined
  formData.couName = ''
  formData.couTypeIds = []
  formData.teaId = undefined
  formData.couPrice = 0
  formData.couPic = ''
  formData.couIntroduction = ''
  imageLoadError.value = false
}

// 添加课程
const handleAdd = () => {
  isEdit.value = false
  resetFormData()
  dialogVisible.value = true
}

// 编辑课程
const handleEdit = async (row) => {
  isEdit.value = true
  try {
    const response = await courseApi.getCourseById(row.id)
    console.log('Course detail response:', response)
    if (response) {
      const course = response
      formData.id = course.id
      formData.couName = course.couName
      formData.couTypeIds = [course.couParTypeId, course.couTypeId].filter(id => id !== null && id !== undefined && id !== '')
      formData.teaId = course.teaId
      formData.couPrice = course.couPrice
      formData.couPic = response.couPic ? response.couPic.trim() : ''
      imageLoadError.value = false
      formData.couIntroduction = course.couIntroduction
      console.log('Populated formData for edit:', JSON.parse(JSON.stringify(formData)))
      dialogVisible.value = true
    } else {
      console.error('获取课程详情失败: 响应数据为空或课程数据缺失', response)
      ElMessage.error('获取课程详情失败: 未收到有效的课程数据')
    }
  } catch (error) {
    console.error('获取课程详情失败 (catch block):', error)
    ElMessage.error((error && error.message) ? `获取课程详情失败: ${error.message}` : '获取课程详情失败: 未知错误')
  }
}

// 查看课程详情
const handleViewDetail = (row) => {
  router.push(`/course/detail/${row.id}`)
}

// 管理章节
const handleChapter = (row) => {
  router.push(`/course/detail/${row.id}`)
}

// 删除课程
const handleDelete = async (row) => {
  console.log(`Attempting to delete course: ID=${row.id}, Name=${row.couName}`)
  try {
    await ElMessageBox.confirm(`确定要删除课程 "${row.couName || '该课程'}" 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    console.log(`Deletion confirmed for course: ID=${row.id}`)
    await courseApi.deleteCourse(row.id)
    ElMessage.success('删除成功')
    console.log(`Course ID=${row.id} deleted successfully, fetching updated list.`)
    fetchCourseList()
  } catch (error) {
    console.error(`Error in handleDelete for course ID=${row.id}:`, error)
    if (error === 'cancel') {
      console.log(`Deletion cancelled by user for course ID=${row.id}`)
    } else if (error && error.message) {
      ElMessage.error(`删除失败: ${error.message}`)
    } else {
      ElMessage.error('删除失败: 未知错误')
    }
  }
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
    formLoading.value = true
    
    const submitData = {
      ...formData,
      couParTypeId: formData.couTypeIds[0],
      couTypeId: formData.couTypeIds[1] || formData.couTypeIds[0]
    }
    
    console.log('提交的课程数据:', submitData)
    
    if (isEdit.value) {
      await courseApi.updateCourse(submitData)
      ElMessage.success('更新成功')
    } else {
      await courseApi.createCourse(submitData)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    fetchCourseList()
  } catch (error) {
    if (error !== 'validate') {
      console.error('保存课程失败:', error)
      ElMessage.error(error.message || '保存失败')
    }
  } finally {
    formLoading.value = false
  }
}

// 取消表单
const cancelForm = () => {
  dialogVisible.value = false
  resetFormData()
}

// 上传封面
const handleUpload = async (options) => {
  const file = options.file
  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.couPic = e.target.result
      imageLoadError.value = false
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('上传封面失败:', error)
    ElMessage.error('上传封面失败')
  }
}

// 上传前检查
const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('封面图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('封面图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 触发上传
const triggerUpload = () => {
  uploadRef.value.$el.querySelector('input').click()
}

// 图片加载错误处理
const handleImageError = () => {
  console.warn("封面图片加载失败，可能URL无效或网络问题。当前 src:", formData.couPic)
  imageLoadError.value = true
  formData.couPic = ''
  ElMessage.warning('课程封面图片加载失败，您可以尝试重新上传。')
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

onMounted(() => {
  fetchCourseList()
  fetchCourseTypeTree()
  fetchTeacherList()
})
</script>

<style scoped>
.course-list-container {
  padding: 24px;
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 24px;
}

.search-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-header {
  margin-bottom: 20px;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.title-icon {
  color: #409eff;
}

.search-form {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

.search-actions {
  display: flex;
  gap: 12px;
}

.search-btn, .reset-btn {
  border-radius: 4px;
}

/* 操作区域样式 */
.action-section {
  margin-bottom: 24px;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
}

.page-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.subtitle {
  margin: 4px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.add-btn {
  border-radius: 4px;
}

/* 课程卡片网格 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.course-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #ffffff;
  cursor: pointer;
}

.course-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: #f5f7fa;
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 20px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.course-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
  margin-right: 12px;
  line-height: 1.4;
}

.course-type {
  border-radius: 4px;
  font-size: 12px;
  padding: 4px 8px;
}

.course-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.meta-item .el-icon {
  color: #909399;
}

.card-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.action-btn {
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: 500;
  font-size: 14px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn .el-icon {
  margin-right: 4px;
}

.action-btn:hover {
  transform: translateY(-1px);
}

/* 搜索区域标题样式 - 支持黑夜模式 */
.search-title span,
.page-title h2,
.dialog-title-text { /* 假设弹窗标题使用此class */
  color: var(--text-color);
  transition: color 0.3s ease;
}

/* 卡片头部标题 - 支持黑夜模式 */
:deep(.el-card__header .card-header h3),
:deep(.el-card__header .clearfix span) { /* 适用于ClassCourseManage等页面的卡片标题 */
  color: var(--text-color) !important;
  transition: color 0.3s ease;
}

/* 新增或修改：确保列表中的主要标题在黑夜模式下为浅色 */
[data-theme="dark"] .course-name {
  color: #e2e8f0 !important; /* 或者 var(--text-color) */
}

[data-theme="dark"] .meta-item {
  color: #a0aec0; /* 调整元信息颜色以在深色背景下更清晰 */
}

[data-theme="dark"] .meta-item .el-icon {
  color: #718096;
}

/* Element Plus 表格表头文字颜色 - 黑夜模式 */
:deep([data-theme="dark"] .el-table th.el-table__cell > .cell) {
  color: #e2e8f0 !important;
}


/* 分页器样式 - 支持黑夜模式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

.modern-pagination {
  background: var(--card-bg);
  padding: 20px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

[data-theme="dark"] .modern-pagination {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.3);
}

/* Element Plus 分页器优化 - 支持主题切换 */
:deep(.el-pagination) {
  --el-pagination-font-size: 14px;
  --el-pagination-bg-color: var(--card-bg);
  --el-pagination-text-color: var(--text-color);
  --el-pagination-border-radius: 6px;
  --el-pagination-button-color: var(--text-color);
  --el-pagination-button-bg-color: var(--hover-bg);
  --el-pagination-button-disabled-color: #c0c4cc;
  --el-pagination-button-disabled-bg-color: var(--hover-bg);
  --el-pagination-hover-color: #409eff;
  gap: 8px;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  border-radius: 6px;
  padding: 0 12px;
  height: 32px;
  line-height: 30px;
  transition: all 0.3s;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  background: #409eff;
  border-color: #409eff;
  color: #ffffff;
}

:deep(.el-pagination .btn-prev:disabled),
:deep(.el-pagination .btn-next:disabled) {
  background: var(--hover-bg);
  border-color: var(--border-color);
  color: #c0c4cc;
  cursor: not-allowed;
}

:deep(.el-pagination .el-pager li) {
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  border-radius: 6px;
  margin: 0 2px;
  min-width: 32px;
  height: 32px;
  line-height: 30px;
  transition: all 0.3s;
}

:deep(.el-pagination .el-pager li:hover) {
  background: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

[data-theme="dark"] :deep(.el-pagination .el-pager li:hover) {
  background: rgba(64, 158, 255, 0.2);
  border-color: #409eff;
  color: #60a5fa;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: #409eff;
  border-color: #409eff;
  color: #ffffff;
  font-weight: 600;
}

.pagination-jumper {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
}

.pagination-input {
  width: 60px;
}

:deep(.pagination-input .el-input__wrapper) {
  background-color: var(--card-bg) !important; /* 确保背景色应用 */
  border-color: var(--border-color) !important; /* 确保边框色应用 */
}

:deep(.pagination-input .el-input__inner) {
  color: var(--text-color) !important; /* 确保文字颜色应用 */
}

:deep(.el-pagination .el-input__wrapper) {
  background: var(--card-bg) !important; /* 确保背景色应用 */
  border: 1px solid var(--border-color) !important; /* 确保边框色应用 */
  border-radius: 6px;
  height: 32px;
  transition: all 0.3s;
}

:deep(.el-pagination .el-input__wrapper:hover) {
  border-color: #409eff !important;
}

:deep(.el-pagination .el-input__wrapper.is-focus) {
  border-color: #409eff !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-pagination .el-input__inner) {
  color: var(--text-color) !important; /* 确保文字颜色应用 */
  text-align: center;
}

/* 黑夜模式下拉菜单适配 */
[data-theme="dark"] :deep(.el-select-dropdown) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
}

[data-theme="dark"] :deep(.el-select-dropdown__item) {
  color: var(--text-color);
}

[data-theme="dark"] :deep(.el-select-dropdown__item:hover) {
  background-color: var(--hover-bg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-list-container {
    padding: 16px;
  }
  
  .course-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .action-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .action-btn {
    flex: none;
  }
}

.course-dialog {
  border-radius: 12px;
}

.course-dialog .el-dialog__header {
  padding: 24px 24px 0;
  border-bottom: 1px solid #ebeef5;
}

.course-dialog .el-dialog__body {
  padding: 24px;
}

.course-form {
  margin-top: 20px;
}

.course-form .el-form-item {
  margin-bottom: 24px;
}

.course-form .el-form-item__label {
  font-weight: 500;
  color: #303133;
}

/* 课程封面上传容器 */
.cover-upload-container {
  width: 100%;
}

.cover-preview-area {
  width: 280px; /* 固定宽度，左对齐 */
  margin-bottom: 12px;
}

/* 图片预览包装器 */
.cover-image-wrapper {
  position: relative;
  width: 100%;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
}

/* 预览图片样式 */
.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cover-image:hover {
  transform: scale(1.02);
  filter: brightness(1.05);
}

/* 更换封面按钮 */
.change-cover-btn {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  padding: 4px 8px;
  height: 28px;
  border-radius: 14px;
  background: rgba(64, 158, 255, 0.9);
  border: none;
  color: white;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.change-cover-btn:hover {
  background: rgba(64, 158, 255, 1);
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.change-cover-btn .el-icon {
  margin-right: 4px;
  font-size: 12px;
}

/* 上传占位区域 */
.upload-placeholder {
  width: 100%;
  height: 160px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.upload-placeholder:hover {
  border-color: #409eff;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.upload-icon {
  font-size: 32px;
  color: #c0c4cc;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.upload-placeholder:hover .upload-icon {
  color: #409eff;
  transform: scale(1.1);
}

.upload-text {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.upload-placeholder:hover .upload-text {
  color: #409eff;
}

/* 隐藏的上传组件 */
.hidden-upload {
  display: none;
}

/* 上传提示 */
.upload-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 8px;
}

/* 表单项优化 */
.course-form .el-form-item {
  margin-bottom: 24px;
}

.course-form .el-form-item__label {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cover-preview-area {
    width: 240px;
  }
  
  .cover-image-wrapper {
    height: 135px;
  }
  
  .upload-placeholder {
    height: 135px;
  }
  
  .upload-icon {
    font-size: 28px;
  }
  
  .upload-text {
    font-size: 12px;
  }
  
  .change-cover-btn {
    font-size: 11px;
    padding: 3px 6px;
    height: 24px;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .cover-preview-area {
    width: 200px;
  }
  
  .cover-image-wrapper {
    height: 112px;
  }
  
  .upload-placeholder {
    height: 112px;
  }
  
  .course-dialog .el-dialog {
    width: 95% !important;
    margin: 5vh auto;
  }
}

/* 图片预览弹窗优化 */
.el-image-viewer__wrapper {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  /* 确保点击空白处可以关闭 */
  cursor: pointer;
}

/* 预览图片本身不应该触发关闭 */
.el-image-viewer__img {
  cursor: default;
  pointer-events: auto;
}

/* 预览工具栏样式 */
.el-image-viewer__actions {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px 12px;
}

/* 关闭按钮样式优化 */
.el-image-viewer__close {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.el-image-viewer__close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* 弹窗整体样式优化 */
.course-dialog .el-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.course-dialog .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.course-dialog .el-dialog__title {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.course-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 20px;
}

.course-dialog .el-dialog__body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
  background: #fafbfc;
}
</style>