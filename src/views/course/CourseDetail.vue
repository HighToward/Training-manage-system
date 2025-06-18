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
                <span class="price">¥{{ courseDetail.couPrice }}</span>
              </div>
              <div class="info-item">
                <label>创建时间：</label>
                <span style="font-size: 14px;">{{ formatDate(courseDetail.createTime) }}</span>
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
        
        <div class="chapter-table-container" v-loading="chapterLoading">
          <!-- 表格头部 -->
          <div class="table-header">
            <div class="header-cell" style="width: 100px;">拖拽排序</div>
            <div class="header-cell" style="width: 80px;">序号</div>
            <div class="header-cell" style="flex: 1; min-width: 200px;">章节标题</div>
            <div class="header-cell" style="width: 150px;">创建时间</div>
            <div class="header-cell" style="width: 150px;">视频上传时间</div>
            <div class="header-cell" style="width: 120px;">视频状态</div>
            <div class="header-cell" style="width: 320px;">操作</div>
          </div>
          
          <!-- 可拖拽的章节列表 -->
          <draggable 
            v-model="chapterList" 
            @end="onDragEnd"
            item-key="id"
            class="chapter-list"
            handle=".drag-handle"
            :animation="200"
            ghost-class="ghost-item"
            chosen-class="chosen-item"
          >
            <template #item="{ element: row, index }">
              <div class="table-row">
                <div class="table-cell drag-cell">
                  <el-icon class="drag-handle"><svg viewBox="0 0 1024 1024"><path d="M384 256h256v128H384V256zm0 384h256v128H384V640zM256 256h128v128H256V256zm0 384h128v128H256V640z"></path></svg></el-icon>
                </div>
                <div class="table-cell index-cell">{{ index + 1 }}</div>
                <div class="table-cell title-cell">{{ row.chaTitle }}</div>
                <div class="table-cell time-cell">{{ formatDate(row.createTime) }}</div>
                <div class="table-cell time-cell">{{ row.chaUrl ? formatDate(row.videoUploadTime || row.updateTime) : '-' }}</div>
                <div class="table-cell status-cell">
                  <el-tag 
                    :type="row.chaUrl ? 'success' : 'info'"
                    size="small"
                  >
                    {{ row.chaUrl ? '已上传' : '未上传' }}
                  </el-tag>
                </div>
                <div class="table-cell action-cell">
                  <div class="action-buttons">
                    <el-button 
                      type="primary" 
                      size="small" 
                      class="action-btn edit-btn"
                      @click="handleEditChapter(row)"
                    >
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-button>
                    <el-button 
                      type="success" 
                      size="small" 
                      class="action-btn upload-btn"
                      @click="openVideoUploadDialog(row)"
                    >
                      <el-icon><Upload /></el-icon>
                      {{ row.chaUrl ? '更新视频' : '上传视频' }}
                    </el-button>
                    <el-button 
                      type="danger" 
                      size="small" 
                      class="action-btn delete-btn"
                      @click="handleDeleteChapter(row)"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>
        
        <el-empty v-if="chapterList.length === 0 && !chapterLoading" description="该课程暂无章节" />
      </div>

      <!-- 实践管理部分 -->
      <div class="practice-section">
        <div class="section-header">
          <h3 class="section-title">课程实践管理</h3>
          <el-button type="primary" @click="handleAddPractice" v-if="courseDetail.id">
            <el-icon><Plus /></el-icon>
            添加实践
          </el-button>
        </div>
        
        <div class="practice-table-container" v-loading="practiceLoading">
          <!-- 表格头部 -->
          <div class="table-header">
            <div class="header-cell" style="width: 80px;">序号</div>
            <div class="header-cell" style="flex: 1; min-width: 200px;">实践名称</div>
            <div class="header-cell" style="width: 150px;">实践地点</div>
            <div class="header-cell" style="width: 150px;">开始时间</div>
            <div class="header-cell" style="width: 150px;">结束时间</div>
            <div class="header-cell" style="width: 120px;">状态</div>
            <div class="header-cell" style="width: 320px;">操作</div>
          </div>
          
          <!-- 实践列表 -->
          <div class="practice-list">
            <div v-for="(row, index) in practiceList" :key="row.id" class="table-row">
              <div class="table-cell index-cell">{{ index + 1 }}</div>
              <div class="table-cell title-cell">{{ row.praName }}</div>
              <div class="table-cell site-cell">{{ row.praSite }}</div>
              <div class="table-cell time-cell">{{ formatDate(row.startTime) }}</div>
              <div class="table-cell time-cell">{{ formatDate(row.endTime) }}</div>
              <div class="table-cell status-cell">
                <el-tag 
                  :type="getPracticeStatusType(row.status)"
                  size="small"
                >
                  {{ getPracticeStatusText(row.status) }}
                </el-tag>
              </div>
              <div class="table-cell action-cell">
                <div class="action-buttons">
                  <el-button 
                    type="primary" 
                    size="small" 
                    class="action-btn edit-btn"
                    @click="handleEditPractice(row)"
                  >
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    class="action-btn delete-btn"
                    @click="handleDeletePractice(row)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <el-empty v-if="practiceList.length === 0 && !practiceLoading" description="该课程暂无实践" />
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

    <!-- 实践表单对话框 -->
    <el-dialog
      v-model="practiceDialogVisible"
      :title="practiceDialogType === 'add' ? '添加实践' : '编辑实践'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="practiceFormRef"
        :model="practiceForm"
        :rules="practiceRules"
        label-width="100px"
      >
        <el-form-item label="实践名称" prop="praName">
          <el-input v-model="practiceForm.praName" placeholder="请输入实践名称" />
        </el-form-item>
        <el-form-item label="实践地点" prop="praSite">
          <el-input v-model="practiceForm.praSite" placeholder="请输入实践地点" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="practiceForm.startTime"
            type="datetime"
            placeholder="请选择开始时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="practiceForm.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="实践内容" prop="praMain">
          <el-input 
            v-model="practiceForm.praMain" 
            type="textarea" 
            :rows="4"
            placeholder="请输入实践内容" 
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="practiceForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="未开始" :value="1" />
            <el-option label="进行中" :value="2" />
            <el-option label="已结束" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="practiceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPracticeForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { courseApi, chapterApi, teacherApi, fileUploadApi, practiceApi } from '@/api'
import draggable from 'vuedraggable'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const chapterLoading = ref(false)
const practiceLoading = ref(false)
const courseDetail = ref({})
const chapterList = ref([])
const practiceList = ref([])

// 编辑相关数据
// 在现有的变量定义部分添加（大约在第370-380行附近）
const dialogVisible = ref(false)
const formLoading = ref(false)
const formRef = ref(null)
const uploadRef = ref(null)
const imageLoadError = ref(false)  // 添加这一行
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

// 实践管理相关数据
const practiceDialogVisible = ref(false)
const practiceDialogType = ref('add')
const practiceFormRef = ref(null)
const practiceForm = reactive({
  id: undefined,
  teaId: '',
  couId: '',
  praName: '',
  praSite: '',
  praMain: '',
  startTime: '',
  endTime: '',
  status: 0
})
const practiceRules = {
  praName: [
    { required: true, message: '请输入实践名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  praSite: [
    { required: true, message: '请输入实践地点', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  praMain: [
    { required: true, message: '请输入实践内容', trigger: 'blur' }
  ]
}

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

// 获取实践列表
const fetchPracticeList = async () => {
  practiceLoading.value = true
  try {
    const response = await practiceApi.getPracticeList(route.params.id)
    if (response && Array.isArray(response)) {
      practiceList.value = response
    } else {
      practiceList.value = []
    }
  } catch (error) {
    console.error('获取实践列表失败:', error)
    practiceList.value = []
  } finally {
    practiceLoading.value = false
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

// 添加实践
const handleAddPractice = () => {
  practiceDialogType.value = 'add'
  practiceForm.id = undefined
  practiceForm.couId = courseDetail.value.id
  practiceForm.practiceName = ''
  practiceForm.practiceLocation = ''
  practiceForm.startTime = ''
  practiceForm.endTime = ''
  practiceForm.status = 1
  practiceDialogVisible.value = true
}

// 编辑实践
const handleEditPractice = (practice) => {
  practiceDialogType.value = 'edit'
  Object.assign(practiceForm, practice)
  practiceDialogVisible.value = true
}

// 提交实践表单
const submitPracticeForm = async () => {
  try {
    await practiceFormRef.value.validate()
    
    if (practiceDialogType.value === 'add') {
      await practiceApi.createPractice(practiceForm)
      ElMessage.success('添加实践成功')
    } else {
      await practiceApi.updatePractice(practiceForm)
      ElMessage.success('更新实践成功')
    }
    
    practiceDialogVisible.value = false
    fetchPracticeList()
  } catch (error) {
    console.error('保存实践失败:', error)
    ElMessage.error('保存实践失败')
  }
}

// 删除实践
const handleDeletePractice = async (practice) => {
  try {
    await ElMessageBox.confirm('确定要删除该实践吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await practiceApi.deletePractice(practice.id)
    ElMessage.success('删除实践成功')
    fetchPracticeList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除实践失败:', error)
      ElMessage.error('删除实践失败')
    }
  }
}

// 拖拽结束处理
const onDragEnd = async (evt) => {
  try {
    // 更新章节序号
    const updatedChapters = chapterList.value.map((chapter, index) => ({
      ...chapter,
      chaIndex: index + 1
    }))
    
    // 批量更新章节序号
    const updatePromises = updatedChapters.map(chapter => 
      chapterApi.updateChapter({
        id: chapter.id,
        couId: chapter.couId,
        chaIndex: chapter.chaIndex,
        chaTitle: chapter.chaTitle,
        chaUrl: chapter.chaUrl
      })
    )
    
    await Promise.all(updatePromises)
    
    // 更新本地数据
    chapterList.value = updatedChapters
    
    ElMessage.success('章节排序更新成功')
  } catch (error) {
    console.error('更新章节排序失败:', error)
    ElMessage.error('更新章节排序失败')
    // 重新获取数据以恢复原始状态
    fetchChapterList()
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
// 修改 handleUpload 函数
const handleUpload = async (options) => {
  const file = options.file
  try {
    // 显示上传中状态
    formLoading.value = true
    ElMessage.info('正在上传课程封面...')
    
    // 调用后端上传接口
    const fileUrl = await fileUploadApi.uploadImage(file)
    
    // 设置表单数据为服务器返回的URL
    formData.couPic = fileUrl
    imageLoadError.value = false
    
    ElMessage.success('课程封面上传成功')
  } catch (error) {
    console.error('上传封面失败:', error)
    ElMessage.error('上传封面失败: ' + (error.message || '未知错误'))
  } finally {
    formLoading.value = false
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

// 获取实践状态类型
const getPracticeStatusType = (status) => {
  const statusMap = {
    1: 'info',     // 未开始
    2: 'success',  // 进行中
    3: 'warning',  // 已结束
    4: 'danger'    // 已取消
  }
  return statusMap[status] || 'info'
}

// 获取实践状态文本
const getPracticeStatusText = (status) => {
  const statusMap = {
    1: '未开始',
    2: '进行中',
    3: '已结束',
    4: '已取消'
  }
  return statusMap[status] || '未知'
}

// 页面挂载时获取数据
onMounted(() => {
  fetchCourseDetail()
  fetchChapterList()
  fetchPracticeList()
})
</script>

<style scoped>
.course-detail-container {
  padding: 24px;
  min-height: 100vh;
}

[data-theme="dark"] .course-detail-container {
}

.detail-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: none;
  overflow: hidden;
  background: white;
  transition: all 0.3s ease;
}

[data-theme="dark"] .detail-card {
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  margin: -20px -20px 20px -20px;
}

.course-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.header-actions .el-button {
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.header-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.detail-content {
  margin-bottom: 32px;
  padding: 20px;
}

.course-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e8eaff;
}

[data-theme="dark"] .course-info {
  background: linear-gradient(135deg, rgba(74, 85, 104, 0.8) 0%, rgba(113, 128, 150, 0.6) 100%);
  border: 1px solid rgba(113, 128, 150, 0.3);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 0 -12px;
}

.info-item.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
  align-items: flex-start;
  border-bottom: none;
  margin-top: 12px;
}

.info-item label {
  font-weight: 600;
  color: #667eea;
  min-width: 90px;
  flex-shrink: 0;
  font-size: 14px;
  position: relative;
}

.info-item label::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.info-item:hover label::after {
  width: 100%;
}

.info-item span {
  color: #303133;
  font-weight: 500;
}

[data-theme="dark"] .info-item span {
  color: #e2e8f0;
}

.price {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff6b6b, #ffa500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(255, 107, 107, 0.3);
}

.introduction {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  padding: 20px;
  border-radius: 12px;
  line-height: 1.8;
  color: #555;
  margin-top: 12px;
  width: 100%;
  border: 1px solid #e8eaff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  font-size: 15px;
}

[data-theme="dark"] .introduction {
  background: linear-gradient(135deg, rgba(45, 55, 72, 0.8) 0%, rgba(74, 85, 104, 0.6) 100%);
  color: #cbd5e0;
  border: 1px solid rgba(113, 128, 150, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.course-cover {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
}

.cover-image {
  width: 100%;
  max-width: 320px;
  height: 240px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 3px solid white;
}

.cover-image:hover {
  transform: scale(1.05) rotate(1deg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.chapter-section {
  margin-top: 40px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2ff;
}

[data-theme="dark"] .chapter-section {
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(113, 128, 150, 0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2ff;
}

.section-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.upload-container {
  text-align: center;
}

.video-uploader {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
}

[data-theme="dark"] .video-uploader {
  border: 2px dashed rgba(113, 128, 150, 0.5);
  background: linear-gradient(135deg, rgba(74, 85, 104, 0.6) 0%, rgba(45, 55, 72, 0.8) 100%);
}

[data-theme="dark"] .video-uploader:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(45, 55, 72, 0.9) 100%);
}

.video-uploader:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f2ff 0%, #ffffff 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.video-uploader-icon {
  font-size: 32px;
  color: #667eea;
  width: 200px;
  height: 200px;
  line-height: 200px;
  text-align: center;
  transition: all 0.3s ease;
}

.video-uploader:hover .video-uploader-icon {
  color: #764ba2;
  transform: scale(1.1);
}

.video-preview {
  width: 100%;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
}

.upload-tip {
  margin-top: 12px;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] :deep(.el-table) {
  background-color: rgba(45, 55, 72, 0.8);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

:deep(.el-table__header) {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
}

[data-theme="dark"] :deep(.el-table__header) {
  background: linear-gradient(135deg, rgba(74, 85, 104, 0.8) 0%, rgba(113, 128, 150, 0.6) 100%);
}

:deep(.el-table__header th) {
  background: transparent;
  color: #667eea;
  font-weight: 600;
  border-bottom: 2px solid #e8eaff;
}

[data-theme="dark"] :deep(.el-table__header th) {
  color: #60a5fa;
  border-bottom: 2px solid rgba(113, 128, 150, 0.3);
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
}

[data-theme="dark"] :deep(.el-table__row) {
  background-color: rgba(45, 55, 72, 0.6);
  color: #e2e8f0;
}

:deep(.el-table__row:hover) {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
}

[data-theme="dark"] :deep(.el-table__row:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(45, 55, 72, 0.8) 100%);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 20px;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  border: none;
  border-radius: 20px;
  transition: all 0.3s ease;
}

:deep(.el-button--danger:hover) {
  background: linear-gradient(135deg, #ff5252 0%, #f44336 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

:deep(.el-tag) {
  border-radius: 12px;
  font-weight: 500;
  padding: 4px 12px;
}

:deep(.el-tag--success) {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
  border: none;
  color: white;
}

:deep(.el-tag--info) {
  background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
  border: none;
  color: white;
}

/* 拖拽表格样式 */
.chapter-table-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2ff;
}

[data-theme="dark"] .chapter-table-container {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(113, 128, 150, 0.3);
}

.table-header {
  display: flex;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border-bottom: 2px solid #e8eaff;
}

[data-theme="dark"] .table-header {
  background: linear-gradient(135deg, rgba(74, 85, 104, 0.8) 0%, rgba(113, 128, 150, 0.6) 100%);
  border-bottom: 2px solid rgba(113, 128, 150, 0.3);
}

.header-cell {
  padding: 16px 12px;
  font-weight: 600;
  color: #667eea;
  text-align: center;
  border-right: 1px solid #e8eaff;
  display: flex;
  align-items: center;
  justify-content: center;
}

[data-theme="dark"] .header-cell {
  color: #60a5fa;
  border-right: 1px solid rgba(113, 128, 150, 0.3);
}

.header-cell:last-child {
  border-right: none;
}

.chapter-list {
  background: white;
}

[data-theme="dark"] .chapter-list {
  background: rgba(45, 55, 72, 0.8);
}

/* 实践管理样式 */
.practice-section {
  margin-top: 40px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2ff;
}

[data-theme="dark"] .practice-section {
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(113, 128, 150, 0.3);
}

.practice-table-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2ff;
}

[data-theme="dark"] .practice-table-container {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(113, 128, 150, 0.3);
}

.practice-list {
}

[data-theme="dark"] .practice-list {
  background: rgba(45, 55, 72, 0.8);
}

.table-row {
  display: flex;
  border-bottom: 1px solid #f0f2ff;
  transition: all 0.3s ease;
}

[data-theme="dark"] .table-row {
  background: rgba(45, 55, 72, 0.6);
  border-bottom: 1px solid rgba(113, 128, 150, 0.3);
  color: #e2e8f0;
}

.table-row:hover {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
}

[data-theme="dark"] .table-row:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(45, 55, 72, 0.8) 100%);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 12px;
  display: flex;
  align-items: center;
  border-right: 1px solid #f0f2ff;
  font-size: 14px;
}

[data-theme="dark"] .table-cell {
  border-right: 1px solid rgba(113, 128, 150, 0.3);
}

.table-cell:last-child {
  border-right: none;
}

.drag-cell {
  width: 100px;
  justify-content: center;
}

.drag-handle {
  cursor: grab;
  color: #909399;
  font-size: 16px;
  transition: all 0.3s ease;
}

.drag-handle:hover {
  color: #667eea;
  transform: scale(1.1);
}

.drag-handle:active {
  cursor: grabbing;
}

.index-cell {
  width: 80px;
  justify-content: center;
  font-weight: 600;
  color: #667eea;
}

.title-cell {
  flex: 1;
  min-width: 200px;
  font-weight: 500;
}

.site-cell {
  width: 150px;
  justify-content: center;
  color: #606266;
}

.time-cell {
  width: 150px;
  justify-content: center;
  color: #606266;
}

[data-theme="dark"] .site-cell {
  color: #a0aec0;
}

[data-theme="dark"] .time-cell {
  color: #a0aec0;
}

/* 深色主题模态框样式 */
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

[data-theme="dark"] :deep(.el-form-item__label) {
  color: #e2e8f0;
}

[data-theme="dark"] :deep(.el-input__wrapper) {
  background: rgba(74, 85, 104, 0.8);
  border: 1px solid rgba(113, 128, 150, 0.3);
}

[data-theme="dark"] :deep(.el-input__inner) {
  color: #e2e8f0;
  background: transparent;
}

[data-theme="dark"] :deep(.el-input__inner::placeholder) {
  color: #a0aec0;
}

[data-theme="dark"] :deep(.el-select .el-input__wrapper) {
  background: rgba(74, 85, 104, 0.8);
  border: 1px solid rgba(113, 128, 150, 0.3);
}

[data-theme="dark"] :deep(.el-select-dropdown) {
  background: rgba(45, 55, 72, 0.95);
  border: 1px solid rgba(113, 128, 150, 0.3);
}

[data-theme="dark"] :deep(.el-select-dropdown__item) {
  color: #e2e8f0;
}

[data-theme="dark"] :deep(.el-select-dropdown__item:hover) {
  background: rgba(113, 128, 150, 0.3);
}

[data-theme="dark"] :deep(.el-date-editor .el-input__wrapper) {
  background: rgba(74, 85, 104, 0.8);
  border: 1px solid rgba(113, 128, 150, 0.3);
}

[data-theme="dark"] :deep(.el-date-editor .el-input__inner) {
  color: #e2e8f0;
}

[data-theme="dark"] :deep(.el-input-number .el-input__wrapper) {
  background: rgba(74, 85, 104, 0.8);
  border: 1px solid rgba(113, 128, 150, 0.3);
}

[data-theme="dark"] :deep(.el-input-number .el-input__inner) {
  color: #e2e8f0;
}

[data-theme="dark"] .dialog-footer {
  color: #e2e8f0;
}

.status-cell {
  width: 120px;
  justify-content: center;
}

.action-cell {
  width: 320px;
  justify-content: center;
}

/* 拖拽状态样式 */
.ghost-item {
  opacity: 0.5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: rotate(2deg);
}

.chosen-item {
  background: linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transform: scale(1.02);
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  border-radius: 16px;
  font-weight: 500;
  font-size: 12px;
  padding: 6px 12px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.edit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.upload-btn {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
  color: white;
}

.upload-btn:hover {
  background: linear-gradient(135deg, #43a047 0%, #7cb342 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  color: white;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #ff5252 0%, #f44336 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
}

.action-btn .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-detail-container {
    padding: 16px;
  }
  
  .course-title {
    font-size: 24px;
  }
  
  .course-info {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-btn {
    font-size: 11px;
    padding: 4px 8px;
  }
  
  /* 拖拽表格移动端适配 */
  .table-header {
    font-size: 12px;
  }
  
  .header-cell {
    padding: 12px 8px;
  }
  
  .table-cell {
    padding: 8px 6px;
    font-size: 12px;
  }
  
  .drag-cell {
    width: 40px;
  }
  
  .index-cell {
    width: 60px;
  }
  
  .site-cell {
    width: 120px;
  }
  
  .time-cell {
    width: 120px;
  }
  
  .status-cell {
    width: 80px;
  }
  
  .action-cell {
    width: 280px;
  }
  
  .title-cell {
    min-width: 150px;
  }
}
</style>