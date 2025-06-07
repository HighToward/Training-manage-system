<template>
  <div class="course-detail-container">
    <el-card class="detail-card" v-loading="loading">
      <!-- 页面头部 -->
      <template #header>
        <div class="detail-header">
          <h2 class="course-title">{{ courseDetail.couName || '课程详情' }}</h2>
          <div class="header-actions">
            <el-button type="primary" @click="handleEdit">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <!-- 删除章节按钮 -->
            <el-button type="danger" @click="handleDelete">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button @click="handleBack">
              <el-icon><Back /></el-icon>
              返回课程列表
            </el-button>
          </div>
        </div>
      </template>

      <!-- 课程详情内容 -->
      <div class="detail-content">
        <el-row :gutter="24">
          <!-- 左侧信息 -->
          <el-col :span="16">
            <div class="course-info">
              <div class="info-item">
                <label>课程价格：</label>
                <span class="price">¥{{ (courseDetail.couPrice / 100).toFixed(2) }}</span>
              </div>
              <div class="info-item">
                <label>创建时间：</label>
                <span>{{ formatDate(courseDetail.createTime) }}</span>
              </div>
              <div class="info-item">
                <label>课程类别：</label>
                <span>{{ courseDetail.typeName }}</span>
              </div>
              <div class="info-item">
                <label>授课教师：</label>
                <span>{{ courseDetail.teaName }}</span>
              </div>
              <div class="info-item">
                <label>收藏量：</label>
                <span>{{ courseDetail.couCollNum }}</span>
              </div>
              <div class="info-item">
                <label>点赞数：</label>
                <span>{{ courseDetail.couLikeNum }}</span>
              </div>
              <div class="info-item">
                <label>章节数：</label>
                <span>{{ courseDetail.couCataNum }}</span>
              </div>
              <div class="info-item full-width">
                <label>课程简介：</label>
                <div class="introduction">
                  {{ courseDetail.couIntroduction }}
                </div>
              </div>
            </div>
          </el-col>
          
          <!-- 右侧封面图片 -->
          <el-col :span="8">
            <div class="course-cover">
              <el-image
                v-if="courseDetail.couPic"
                :src="courseDetail.couPic"
                :preview-src-list="[courseDetail.couPic]"
                fit="cover"
                class="cover-image"
                preview-teleported="true"
                hide-on-click-modal="true"
              />
              <el-image
                v-else
                src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
                fit="cover"
                class="cover-image"
              />
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 章节管理部分 -->
      <div class="chapter-section">
        <div class="section-header">
          <h3 class="section-title">课程章节管理</h3>
          <el-button type="primary" @click="handleAddChapter" v-if="courseDetail.id">
            <el-icon><Plus /></el-icon>
            添加章节
          </el-button>
        </div>
        
        <el-table
          :data="chapterList"
          border
          style="width: 100%"
          v-loading="chapterLoading"
          row-key="id"
          :default-sort="{ prop: 'chaIndex', order: 'ascending' }"
        >
          <el-table-column label="序号" width="80" align="center" prop="chaIndex" sortable>
            <template #default="scope">
              <span>{{ scope.row.chaIndex }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="chaTitle" label="章节标题" min-width="200" sortable />
          
          <el-table-column prop="createTime" label="创建时间" width="150" align="center" sortable>
            <template #default="{ row }">
              <span>{{ formatDate(row.createTime) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="videoUploadTime" label="视频上传时间" width="150" align="center" sortable>
            <template #default="{ row }">
              <span>{{ row.chaUrl ? formatDate(row.videoUploadTime || row.updateTime) : '-' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="videoStatus" label="视频状态" width="120" align="center" sortable>
            <template #default="{ row }">
              <el-tag 
                :type="row.chaUrl ? 'success' : 'info'"
                size="small"
              >
                {{ row.chaUrl ? '已上传' : '未上传' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="280" align="center">
            <template #default="scope">
              <el-button type="primary" link @click="handleEditChapter(scope.row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button type="primary" link @click="openVideoUploadDialog(scope.row)">
                <el-icon><Upload /></el-icon>上传/更新视频
              </el-button>
              <el-button type="danger" link @click="handleDeleteChapter(scope.row)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty v-if="chapterList.length === 0 && !chapterLoading" description="该课程暂无章节" />
      </div>
    </el-card>

    <!-- 编辑课程对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑课程"
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
              
              <div class="upload-placeholder" v-else @click="triggerUpload">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传课程封面</div>
              </div>
            </div>
            
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

    <!-- 章节表单对话框 -->
    <el-dialog
      v-model="chapterDialogVisible"
      :title="dialogType === 'add' ? '添加章节' : '编辑章节'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="chapterFormRef"
        :model="chapterForm"
        :rules="chapterRules"
        label-width="100px"
      >
        <el-form-item label="章节序号" prop="chaIndex">
          <el-input-number
            v-model="chapterForm.chaIndex"
            :min="1"
            :max="999"
            style="width: 100%"
            disabled
          />
        </el-form-item>
        <el-form-item label="章节标题" prop="chaTitle">
          <el-input v-model="chapterForm.chaTitle" placeholder="请输入章节标题" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="chapterDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitChapterForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 视频上传对话框 -->
    <el-dialog
      v-model="videoDialogVisible"
      title="上传视频"
      width="500px"
      destroy-on-close
    >
      <div class="upload-container">
        <el-upload
          class="video-uploader"
          action="#"
          :http-request="handleVideoUpload"
          :show-file-list="false"
          :before-upload="beforeVideoUpload"
          accept=".mp4,.webm,.ogg"
        >
          <div v-if="videoUrl" class="video-preview">
            <video :src="videoUrl" controls style="width: 100%; max-height: 200px;"></video>
          </div>
          <el-icon v-else class="video-uploader-icon"><Upload /></el-icon>
          <div class="el-upload__text" v-if="!videoUrl">
            拖拽文件到此处或 <em>点击上传</em>
          </div>
        </el-upload>
        <div class="upload-tip">
          支持MP4、WebM、Ogg格式，单个文件不超过500MB
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="videoDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitVideoUpload" :disabled="!videoUrl">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { courseApi, chapterApi, teacherApi, fileUploadApi } from '@/api'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const chapterLoading = ref(false)
const courseDetail = ref({})
const chapterList = ref([])

// 编辑相关数据
const dialogVisible = ref(false)
const formLoading = ref(false)
const formRef = ref(null)
const uploadRef = ref(null)
const courseTypeOptions = ref([])
const teacherOptions = ref([])

// 章节管理相关数据
const chapterDialogVisible = ref(false)
const dialogType = ref('add')
const chapterFormRef = ref(null)
const chapterForm = reactive({
  id: undefined,
  couId: '',
  chaIndex: 1,
  chaTitle: '',
  chaUrl: ''
})
const chapterRules = {
  chaIndex: [
    { required: true, message: '请输入章节序号', trigger: 'blur' }
  ],
  chaTitle: [
    { required: true, message: '请输入章节标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 视频上传相关
const currentChapterForUpload = ref(null)
const videoUrl = ref('')
const videoDialogVisible = ref(false)

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

const enrichCourseDetail = async () => {
  try {
    // 获取课程类型树和教师列表
    const [courseTypes, teachers] = await Promise.all([
      courseApi.getCourseTypeTree(),
      teacherApi.getTeacherList()
    ])
    
    // 查找对应的类型名称
    if (courseDetail.value.couTypeId && courseTypes) {
      const findTypeName = (types, targetId) => {
        for (const type of types) {
          if (type.id === targetId) {
            return type.typeName
          }
          if (type.children && type.children.length > 0) {
            const childResult = findTypeName(type.children, targetId)
            if (childResult) return childResult
          }
        }
        return null
      }
      
      const typeName = findTypeName(courseTypes, courseDetail.value.couTypeId)
      if (typeName) {
        courseDetail.value.typeName = typeName
      }
    }
    
    // 查找对应的教师名称
    if (courseDetail.value.teaId && teachers) {
      const teacher = teachers.find(t => t.id === courseDetail.value.teaId)
      if (teacher) {
        courseDetail.value.teaName = teacher.teaName
      }
    }
  } catch (error) {
    console.error('补充课程详情信息失败:', error)
  }
}

// 获取课程详情
const fetchCourseDetail = async () => {
  loading.value = true
  try {
    const response = await courseApi.getCourseById(route.params.id)
    if (response) {
      courseDetail.value = response
      console.log('课程详情数据:', response)
      
      // 如果缺少typeName和teaName，则补充获取
      if (!response.typeName || !response.teaName) {
        await enrichCourseDetail()
      }
    } else {
      ElMessage.error('获取课程详情失败')
    }
  } catch (error) {
    console.error('获取课程详情失败:', error)
    ElMessage.error('获取课程详情失败')
  } finally {
    loading.value = false
  }
}

// 获取章节列表
const fetchChapterList = async () => {
  chapterLoading.value = true
  try {
    const response = await chapterApi.getChapterList(route.params.id)
    if (response && Array.isArray(response)) {
      chapterList.value = response.sort((a, b) => a.chaIndex - b.chaIndex)
    } else {
      chapterList.value = []
    }
  } catch (error) {
    console.error('获取章节列表失败:', error)
    chapterList.value = []
  } finally {
    chapterLoading.value = false
  }
}

// 获取课程类型树
const fetchCourseTypeTree = async () => {
  try {
    const response = await courseApi.getCourseTypeTree()
    if (response && Array.isArray(response)) {
      courseTypeOptions.value = response
    }
  } catch (error) {
    console.error('获取课程类型树失败:', error)
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

// 编辑课程
const handleEdit = async () => {
  try {
    await Promise.all([
      fetchCourseTypeTree(),
      fetchTeacherList()
    ])
    
    const course = courseDetail.value
    formData.id = course.id
    formData.couName = course.couName
    formData.couTypeIds = [course.couParTypeId, course.couTypeId].filter(id => id !== null && id !== undefined && id !== '')
    formData.teaId = course.teaId
    formData.couPrice = course.couPrice
    formData.couPic = course.couPic ? course.couPic.trim() : ''
    formData.couIntroduction = course.couIntroduction
    
    dialogVisible.value = true
  } catch (error) {
    console.error('准备编辑数据失败:', error)
    ElMessage.error('准备编辑数据失败')
  }
}

// 删除课程
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程 "${courseDetail.value.couName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await courseApi.deleteCourse(route.params.id)
    ElMessage.success('删除成功')
    router.push('/course/list')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除课程失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 返回课程列表
const handleBack = () => {
  router.push('/course/list')
}

// 添加章节
const handleAddChapter = () => {
  dialogType.value = 'add'
  chapterForm.id = undefined
  chapterForm.couId = courseDetail.value.id
  chapterForm.chaIndex = chapterList.value.length + 1
  chapterForm.chaTitle = ''
  chapterForm.chaUrl = ''
  chapterDialogVisible.value = true
}

// 编辑章节
const handleEditChapter = (chapter) => {
  dialogType.value = 'edit'
  Object.assign(chapterForm, chapter)
  chapterDialogVisible.value = true
}

// 提交章节表单
const submitChapterForm = async () => {
  try {
    await chapterFormRef.value.validate()
    
    if (dialogType.value === 'add') {
      await chapterApi.createChapter(chapterForm)
      ElMessage.success('添加成功')
    } else {
      await chapterApi.updateChapter(chapterForm)
      ElMessage.success('更新成功')
    }
    
    chapterDialogVisible.value = false
    fetchChapterList()
  } catch (error) {
    console.error('保存章节失败:', error)
    ElMessage.error('保存失败')
  }
}

// 删除章节
const handleDeleteChapter = async (chapter) => {
  try {
    await ElMessageBox.confirm('确定要删除该章节吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await chapterApi.deleteChapter(chapter.id)
    ElMessage.success('删除成功')
    fetchChapterList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除章节失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 上传视频
const openVideoUploadDialog = (chapter) => {
  currentChapterForUpload.value = { ...chapter }
  if (chapter.chaUrl) {
    videoUrl.value = chapter.chaUrl
    ElMessage.info('当前章节已有视频，您可以选择新视频进行覆盖。')
  } else {
    videoUrl.value = ''
  }
  videoDialogVisible.value = true
}

// 视频上传前检查
const beforeVideoUpload = (file) => {
  const isVideo = ['video/mp4', 'video/webm', 'video/ogg'].includes(file.type)
  const isLt500M = file.size / 1024 / 1024 < 500

  if (!isVideo) {
    ElMessage.error('请上传视频文件 (MP4, WebM, Ogg)!')
  }
  if (!isLt500M) {
    ElMessage.error('视频大小不能超过 500MB!')
  }
  return isVideo && isLt500M
}

// 处理视频上传
const handleVideoUpload = async (options) => {
  const file = options.file
  try {
    console.log('开始上传新视频文件:', file.name, '大小:', (file.size / 1024 / 1024).toFixed(2) + 'MB')
    
    const newUploadedUrl = await fileUploadApi.uploadVideo(file)
    console.log('新视频上传成功，服务器返回URL:', newUploadedUrl)
    
    videoUrl.value = newUploadedUrl ? String(newUploadedUrl) : ''
    
    if (videoUrl.value) {
      ElMessage.success('新视频上传成功，请点击确定按钮保存更改。')
    } else {
      ElMessage.error('视频上传后未获取到有效URL。')
    }
  } catch (error) {
    console.error('上传新视频失败:', error)
    ElMessage.error('上传新视频失败: ' + (error.message || '未知错误'))
  }
}

// 提交视频上传
const submitVideoUpload = async () => {
  try {
    if (!videoUrl.value) {
      ElMessage.warning('请先上传视频。')
      return
    }

    if (!currentChapterForUpload.value || !currentChapterForUpload.value.id) {
      ElMessage.error('章节信息不完整，无法保存。')
      return
    }
    
    const updateData = {
      id: currentChapterForUpload.value.id,
      couId: currentChapterForUpload.value.couId,
      chaIndex: currentChapterForUpload.value.chaIndex,
      chaTitle: currentChapterForUpload.value.chaTitle,
      chaUrl: videoUrl.value
    }
    
    await chapterApi.updateChapter(updateData)
    
    ElMessage.success('章节视频信息更新成功!')
    videoDialogVisible.value = false
    fetchChapterList()
  } catch (error) {
    console.error('保存章节视频URL失败:', error)
    ElMessage.error('保存章节视频URL失败: ' + (error.message || '未知错误'))
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
    
    await courseApi.updateCourse(submitData)
    ElMessage.success('更新成功')
    
    dialogVisible.value = false
    fetchCourseDetail()
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
}

// 上传封面
const handleUpload = async (options) => {
  const file = options.file
  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.couPic = e.target.result
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

// 处理图片加载错误
const handleImageError = () => {
  console.log('图片加载失败')
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const dateObj = new Date(dateStr)
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const seconds = String(dateObj.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 页面挂载时获取数据
onMounted(() => {
  fetchCourseDetail()
  fetchChapterList()
})
</script>

<style scoped>
.course-detail-container {
  padding: 24px;
  min-height: 100vh;
}

.detail-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.course-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.detail-content {
  margin-bottom: 32px;
}

.course-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
  align-items: flex-start;
}

.info-item label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
  flex-shrink: 0;
}

.info-item span {
  color: #303133;
}

.price {
  font-size: 18px;
  font-weight: 600;
  color: #e6a23c;
}

.introduction {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  line-height: 1.6;
  color: #606266;
  margin-top: 8px;
  width: 100%;
}

.course-cover {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.cover-image {
  width: 100%;
  max-width: 300px;
  height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chapter-section {
  margin-top: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.upload-container {
  text-align: center;
}

.video-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.video-uploader:hover {
  border-color: #409eff;
}

.video-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.video-preview {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-tip {
  margin-top: 8px;
  color: #606266;
  font-size: 12px;
}
</style>