<template>
  <div class="information-list-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card class="search-card">
        <div class="search-header">
          <div class="search-title">
            <el-icon class="title-icon"><Search /></el-icon>
            <span>资讯查询</span>
          </div>
        </div>
        <div class="search-form">
          <el-input 
            v-model="queryParams.infoTitle" 
            placeholder="搜索资讯标题..." 
            clearable 
            size="large"
            class="search-input"
            @keyup.enter="handleQuery"
            @clear="handleInfoTitleClear">
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
          <h2>资讯管理</h2>
          <p class="subtitle">共 {{ total }} 篇资讯</p>
        </div>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="handleAdd" class="add-btn">
            <el-icon><Plus /></el-icon>
            新建资讯
          </el-button>
        </div>
      </div>
    </div>

    <!-- 资讯卡片列表 -->
    <div class="information-grid" v-loading="loading">
      <div class="grid-container">
        <el-card 
          v-for="item in informationList" 
          :key="item.id" 
          class="information-card"
          shadow="hover"
          @click="handleViewDetail(item)"
        >
          <div class="card-image" @click.stop>
            <el-image
              v-if="item.infoImage"
              :src="item.infoImage"
              fit="cover"
              class="info-image"
              :preview-src-list="[item.infoImage]"
              @error="imageLoadError = true"
            />
            <div v-else class="no-image">
              <el-icon class="no-image-icon"><Picture /></el-icon>
              <span>暂无封面</span>
            </div>
          </div>
          
          <div class="card-content">
            <div class="info-header">
              <h3 class="info-title">{{ item.infoTitle }}</h3>
            </div>
            
            <div class="info-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ item.teaName || '未知作者' }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(item.createTime) }}</span>
              </div>
            </div>
            
            <div class="info-content">
              <p>{{ truncateContent(item.infoMain, 10) }}</p>
            </div>
            
            <div class="card-actions" @click.stop>
              <el-button type="primary" plain @click="handleEdit(item)" class="action-btn">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分页器 -->
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
      />
    </div>

    <!-- 资讯表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑资讯' : '新建资讯'"
      width="900px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="information-dialog"
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
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, User, Calendar, Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { informationApi, teacherApi } from '@/api'
import '@wangeditor/editor/dist/css/style.css'
import { createEditor, createToolbar } from '@wangeditor/editor'

const router = useRouter()

// 查询参数
const queryParams = reactive({
  infoTitle: '',
  pageNum: 1,
  pageSize: 12
})

// 表格数据
const loading = ref(false)
const informationList = ref([])
const total = ref(0)
const pages = ref(0)

// 下拉选项数据
const teacherOptions = ref([])

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formLoading = ref(false)
const formRef = ref(null)
const imageLoadError = ref(false)
const uploadRef = ref(null)
const editorRef = ref(null)
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

// 获取token
const getToken = () => {
  return localStorage.getItem('token')
}

// 获取资讯列表
const fetchInformationList = async () => {
  loading.value = true
  try {
    const response = await informationApi.getInformationList(queryParams)
    if (response && Array.isArray(response)) {
      informationList.value = response
      total.value = response.length
      pages.value = Math.ceil(total.value / queryParams.pageSize)
    } else {
      informationList.value = []
      total.value = 0
      pages.value = 0
    }
  } catch (error) {
    console.error('获取资讯列表失败:', error)
    ElMessage.error('获取资讯列表失败')
    informationList.value = []
    total.value = 0
    pages.value = 0
  } finally {
    loading.value = false
  }
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

// 查询处理
const handleQuery = () => {
  queryParams.pageNum = 1
  fetchInformationList()
}

// 处理资讯标题清除事件
const handleInfoTitleClear = () => {
  resetQuery()
}

// 重置查询
const resetQuery = () => {
  queryParams.infoTitle = ''
  queryParams.pageNum = 1
  fetchInformationList()
}

// 分页处理
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  queryParams.pageNum = 1
  fetchInformationList()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  fetchInformationList()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 截取内容
const truncateContent = (content, length) => {
  if (!content) return ''
  return content.length > length ? content.substring(0, length) + '...' : content
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

// 新增资讯
const handleAdd = async () => {
  await fetchTeacherList()
  isEdit.value = false
  formData.id = undefined
  formData.infoTitle = ''
  formData.teaId = undefined
  formData.infoMain = ''
  formData.infoImage = ''
  dialogVisible.value = true
  await initEditor()
}

// 编辑资讯
const handleEdit = async (row) => {
  await fetchTeacherList()
  isEdit.value = true
  formData.id = row.id
  formData.infoTitle = row.infoTitle
  formData.teaId = row.teaId
  formData.infoMain = row.infoMain
  formData.infoImage = row.infoImage
  dialogVisible.value = true
  await initEditor()
  if (editor) {
    editor.setHtml(row.infoMain || '')
  }
}

// 查看资讯详情
const handleViewDetail = (row) => {
  router.push(`/information/detail/${row.id}`)
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
    
    if (isEdit.value) {
      await informationApi.updateInformation(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await informationApi.createInformation(formData)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    destroyEditor()
    fetchInformationList()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    formLoading.value = false
  }
}

// 监听弹窗关闭
const handleDialogClose = () => {
  destroyEditor()
}

onMounted(() => {
  fetchInformationList()
})
</script>

<style scoped>
/* 复用课程列表的样式，并做适当调整 */
.information-list-container {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 60px);
}

.search-section {
  margin-bottom: 20px;
}

.search-card {
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.search-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow);
}

.search-header {
  margin-bottom: 20px;
}

.search-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.title-icon {
  margin-right: 8px;
  color: var(--el-color-primary);
}

.search-form {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.search-actions {
  display: flex;
  gap: 12px;
}

.search-btn, .reset-btn {
  min-width: 100px;
}

.action-section {
  margin-bottom: 20px;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
}

.page-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.subtitle {
  margin: 4px 0 0 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.add-btn {
  min-width: 120px;
}

.information-grid {
  margin-bottom: 20px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.information-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.information-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--el-box-shadow);
}

.card-image {
  height: 200px;
  overflow: hidden;
  background-color: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-image {
  width: 100%;
  height: 100%;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--el-text-color-placeholder);
}

.no-image-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.card-content {
  padding: 20px;
}

.info-header {
  margin-bottom: 12px;
}

.info-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.meta-item .el-icon {
  font-size: 16px;
}

.info-content {
  margin-bottom: 16px;
}

.info-content p {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  font-size: 14px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
}

.modern-pagination {
  --el-pagination-font-size: 14px;
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: var(--el-text-color-regular);
  --el-pagination-border-radius: 6px;
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
  .information-list-container {
    padding: 16px;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-actions {
    justify-content: center;
  }
  
  .action-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>