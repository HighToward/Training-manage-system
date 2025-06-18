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
          <el-row :gutter="20">
            <el-col :span="8">
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
            </el-col>
            <el-col :span="5">
              <el-input 
                v-model="queryParams.teaName" 
                placeholder="搜索发布人..." 
                clearable 
                size="large"
                @keyup.enter="handleQuery"
                @clear="handleTeaNameClear">
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="5">
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
          <h2>资讯管理</h2>
          <p class="subtitle">共 {{ total }} 篇资讯</p>
        </div>
        <div class="action-buttons">
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
          <el-button type="primary" size="large" @click="handleAdd" class="add-btn">
            <el-icon><Plus /></el-icon>
            新建资讯
          </el-button>
        </div>
      </div>
    </div>

    <!-- 资讯卡片列表 -->
    <div class="information-grid" v-loading="loading" v-show="viewMode === 'card'">
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
            preview-teleported
            hide-on-click-modal
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
              <!-- 作者信息行 -->
              <div class="author-info">
                <el-avatar :size="36" :src="item.teaPic" class="author-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="author-name">{{ item.teaName }}</span>
              </div>
              <!-- 日期信息行 - 独立左对齐 -->
              <div class="date-info">
                <div class="comment-info">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>{{ item.infoComment || 0 }} 条评论</span>
                </div>
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(item.createTime) }}</span>
              </div>
            </div>
            
            <div class="info-content">
              <p>{{ truncateContent(item.infoMain, 15) }}</p>
            </div>
            
            <div class="card-actions" @click.stop>
              <el-button type="primary" plain @click="handleEdit(item)" class="action-btn">
                <el-icon><Edit /></el-icon>
                编辑
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

    <!-- 资讯列表视图 -->
    <div class="information-list-view" v-loading="loading" v-show="viewMode === 'list'">
      <el-table :data="informationList" style="width: 100%" class="information-table">
        <el-table-column prop="infoImage" label="封面" width="100" align="center">
          <template #default="scope">
            <div class="table-image-wrapper">
              <el-image
                v-if="scope.row.infoImage" 
                :src="scope.row.infoImage" 
                :preview-src-list="[scope.row.infoImage]"
                fit="cover"
                class="table-image"
                preview-teleported
                hide-on-click-modal
                @error="handleImageError"
              />
              <div v-else class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="infoTitle" label="标题" min-width="200">
          <template #default="scope">
            <div class="info-name-cell">
              <span class="info-title">{{ scope.row.infoTitle }}</span>
              <span class="info-summary">{{ truncateContent(scope.row.infoMain, 50) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="teaName" label="作者" width="120" align="center" />
        <el-table-column prop="infoComment" label="评论数" width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.infoComment || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" align="center">
          <template #default="scope">
            <span>{{ formatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button type="warning" size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
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
        :page-sizes="[8, 16, 24, 48]"
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
      width="1000px"
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
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, User, Calendar, Picture, ChatDotRound, Grid, List, View } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { informationApi, teacherApi } from '@/api'
import '@wangeditor/editor/dist/css/style.css'
import { createEditor, createToolbar } from '@wangeditor/editor'
import pinyin from 'js-pinyin'
import { useViewModeStore } from '@/stores/viewMode'

const router = useRouter()

// 视图模式
const viewModeStore = useViewModeStore()
const viewMode = computed({
  get: () => viewModeStore.getInformationListViewMode,
  set: (value) => viewModeStore.setInformationListViewMode(value)
})

// 查询参数
const queryParams = reactive({
  infoTitle: '',
  teaName: '',
  pageNum: 1,
  pageSize: 8
})

// 存储所有资讯数据
const allInformations = ref([])

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

// 拼音匹配函数
const matchWithPinyin = (text, searchTerm) => {
  if (!text || !searchTerm) return false
  
  // 直接文本匹配（不区分大小写）
  if (text.toLowerCase().includes(searchTerm)) {
    return true
  }
  
  // 拼音全拼匹配
  try {
    const fullPinyin = pinyin.getFullChars(text).toLowerCase()
    if (fullPinyin.includes(searchTerm)) {
      return true
    }
  } catch (e) {
    // 忽略拼音转换错误
  }
  
  // 拼音首字母匹配
  try {
    const firstLetters = pinyin.getCamelChars(text).toLowerCase()
    if (firstLetters.includes(searchTerm)) {
      return true
    }
  } catch (e) {
    // 忽略拼音转换错误
  }
  
  return false
}

// 获取资讯列表
const fetchInformationList = async () => {
  loading.value = true
  try {
    // 获取所有资讯数据
    const response = await informationApi.getInformationList()
    if (response && Array.isArray(response)) {
      // 先设置原始数据
      allInformations.value = response
      // 先补充教师名称信息
      await enrichInformationList()
      // 应用过滤
      applyFilters()
    } else {
      allInformations.value = []
      informationList.value = []
      total.value = 0
      pages.value = 0
    }
  } catch (error) {
    console.error('获取资讯列表失败:', error)
    ElMessage.error('获取资讯列表失败')
    allInformations.value = []
    informationList.value = []
    total.value = 0
    pages.value = 0
  } finally {
    loading.value = false
  }
}

// 应用过滤和分页
const applyFilters = () => {
  let filteredList = [...allInformations.value]
  
  // 根据资讯标题进行过滤（支持拼音匹配）
  if (queryParams.infoTitle && queryParams.infoTitle.trim()) {
    const searchTerm = queryParams.infoTitle.trim().toLowerCase()
    filteredList = filteredList.filter(item => {
      return matchWithPinyin(item.infoTitle, searchTerm)
    })
  }
  
  // 根据教师名称进行过滤（支持拼音匹配）
  if (queryParams.teaName && queryParams.teaName.trim()) {
    const searchTerm = queryParams.teaName.trim().toLowerCase()
    filteredList = filteredList.filter(item => {
      return matchWithPinyin(item.teaName, searchTerm)
    })
  }
  
  // 更新总数
  total.value = filteredList.length
  pages.value = Math.ceil(total.value / queryParams.pageSize)
  
  // 分页处理
  const startIndex = (queryParams.pageNum - 1) * queryParams.pageSize
  const endIndex = startIndex + queryParams.pageSize
  informationList.value = filteredList.slice(startIndex, endIndex)
}

// 补充资讯列表信息（教师名称和头像）
const enrichInformationList = async () => {
  try {
    const teachers = await teacherApi.getTeacherList()
    if (teachers && Array.isArray(teachers)) {
      allInformations.value.forEach(info => {
        if (info.teaId && !info.teaName) {
          const teacher = teachers.find(t => t.id === info.teaId)
          if (teacher) {
            info.teaName = teacher.teaName
            info.teaPic = teacher.pic  // 添加头像信息
          }
        }
      })
    }
    
    // 获取每个资讯的评论数
    for (const info of allInformations.value) {
      try {
        const comments = await informationApi.getCommentsByInfoId(info.id)
        info.commentCount = comments ? comments.length : 0
      } catch (error) {
        console.error(`获取资讯 ${info.id} 的评论数失败:`, error)
        info.commentCount = 0
      }
    }
  } catch (error) {
    console.error('补充资讯列表信息失败:', error)
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
  applyFilters()
}

// 处理资讯标题清除事件
const handleInfoTitleClear = () => {
  queryParams.infoTitle = ''
  applyFilters()
}

// 处理教师姓名清除事件
const handleTeaNameClear = () => {
  queryParams.teaName = ''
  applyFilters()
}

// 重置查询
const resetQuery = () => {
  queryParams.infoTitle = ''
  queryParams.teaName = ''
  queryParams.pageNum = 1
  applyFilters()
}

// 分页处理
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  queryParams.pageNum = 1
  applyFilters()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  applyFilters()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const seconds = String(dateObj.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 截取内容
const truncateContent = (content, length) => {
  if (!content) return ''
  
  // 创建临时DOM元素来去除HTML标签
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = content
  const textContent = tempDiv.textContent || tempDiv.innerText || ''
  
  return textContent.length > length ? textContent.substring(0, length) + '...' : textContent
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

// 删除资讯
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除资讯 "${row.infoTitle || '该资讯'}" 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await informationApi.deleteInformation(row.id)
    ElMessage.success('删除成功')
    await fetchInformationList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`Error in handleDelete for information ID=${row.id}:`, error)
      if (error.response && error.response.data && error.response.data.message) {
        ElMessage.error(`删除失败: ${error.response.data.message}`)
      } else if (error.message) {
        ElMessage.error(`删除失败: ${error.message}`)
      } else {
        ElMessage.error('删除失败: 未知错误')
      }
    }
  }
}

// 查看资讯详情
const handleViewDetail = (row) => {
  router.push(`/information/detail/${row.id}`)
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
.information-list-container {
  padding: 24px;
  min-height: calc(100vh - 60px);
  transition: all 0.3s ease;
}

/* 深夜模式背景 */
[data-theme="dark"] .information-list-container {
}

.search-section {
  margin-bottom: 32px;
}

.search-card {
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow: hidden;
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
  margin-bottom: 24px;
  padding: 24px 28px 0;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
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

.search-input {
  flex: 1;
  min-width: 300px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.search-input:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
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
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
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

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.add-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.add-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.add-btn:hover::before {
  left: 100%;
}

.information-grid {
  margin-bottom: 32px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  padding: 0 8px;
}

.information-card {
  cursor: pointer;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

[data-theme="dark"] .information-card {
  background: rgba(45, 55, 72, 0.9);
  border-color: rgba(74, 85, 104, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.information-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.information-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 48px rgba(102, 126, 234, 0.2);
}

.information-card:hover::before {
  transform: scaleX(1);
}

[data-theme="dark"] .information-card:hover {
  box-shadow: 0 16px 48px rgba(102, 126, 234, 0.3);
}

.information-card:hover .card-image .info-image {
  transform: scale(1.05);
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
  transition: transform 0.4s ease;
}

.information-card:hover .info-image {
  transform: scale(1.05);
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
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 50px;
}

.info-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  flex-shrink: 0;
  width: 36px !important;
  height: 36px !important;
}

.author-avatar .el-avatar {
  width: 36px !important;
  height: 36px !important;
}

.author-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #666;
  font-size: 14px;
  margin-top: 8px;
}

.comment-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
}

.comment-info .el-icon {
  font-size: 16px;
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
[data-theme="dark"] .info-title {
  color: #e2e8f0 !important; /* 或者 var(--text-color) */
}

[data-theme="dark"] .author-name {
  color: #e2e8f0 !important; 
}

[data-theme="dark"] .date-info {
  color: #e2e8f0 !important; 
}

[data-theme="dark"] .info-content p {
  color: #e2e8f0 !important; 
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .information-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .information-list-container {
    padding: 16px;
  }
  
  .search-card {
    border-radius: 16px;
    margin: 0 -8px;
  }
  
  .search-header {
    padding: 20px 24px 0;
  }
  
  .search-title {
    font-size: 18px;
  }
  
  .search-form {
    flex-direction: column;
    padding: 0 24px 24px;
  }
  
  .search-input {
    min-width: auto;
    border-radius: 12px;
  }
  
  .search-actions {
    gap: 12px;
  }
  
  .search-btn, .reset-btn {
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 14px;
  }
  
  .action-header {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
    padding: 20px 24px;
    border-radius: 16px;
    margin: 0 -8px;
  }
  
  .page-title h2 {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .add-btn {
    padding: 12px 24px;
    font-size: 14px;
    border-radius: 12px;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0;
  }
  
  .information-card {
    border-radius: 16px;
    margin: 0 -8px;
  }
  
  .card-content {
    padding: 20px;
  }
  
  .info-title {
    font-size: 18px;
  }
  
  .info-image {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .information-list-container {
    padding: 12px;
  }
  
  .search-header {
    padding: 16px 20px 0;
  }
  
  .search-form {
    padding: 0 20px 20px;
  }
  
  .action-header {
    padding: 16px 20px;
  }
  
  .page-title h2 {
    font-size: 20px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .info-title {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .info-meta {
    font-size: 12px;
    margin-bottom: 16px;
    padding: 8px 0;
  }
  
  .card-image {
    height: 160px;
  }
}

/* 加载动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.information-card {
  animation: fadeInUp 0.6s ease-out;
}

.information-card:nth-child(1) { animation-delay: 0.1s; }
.information-card:nth-child(2) { animation-delay: 0.2s; }
.information-card:nth-child(3) { animation-delay: 0.3s; }
.information-card:nth-child(4) { animation-delay: 0.4s; }
.information-card:nth-child(5) { animation-delay: 0.5s; }
.information-card:nth-child(6) { animation-delay: 0.6s; }

/* 列表视图样式 */
.information-list-view {
  margin-bottom: 32px;
}

.information-table {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .information-table {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.table-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-image {
  width: 60px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.image-slot {
  width: 60px;
  height: 40px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

[data-theme="dark"] .image-slot {
  background: #2d3748;
  color: #718096;
}

.info-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-summary {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.6;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.table-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.table-actions .el-button {
  border-radius: 8px;
  font-size: 12px;
  padding: 6px 12px;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

[data-theme="dark"] ::-webkit-scrollbar-track {
  background: #2d3748;
}

[data-theme="dark"] ::-webkit-scrollbar-thumb {
  background: #4a5568;
}

[data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
  background: #718096;
}

/* 滚动条美化 */
.information-list-container::-webkit-scrollbar {
  width: 8px;
}

.information-list-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.information-list-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

.information-list-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

[data-theme="dark"] .information-list-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

/* 深夜模式额外优化 */
[data-theme="dark"] .search-input:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

[data-theme="dark"] .information-card:hover {
  border-color: rgba(102, 126, 234, 0.3);
}
</style>