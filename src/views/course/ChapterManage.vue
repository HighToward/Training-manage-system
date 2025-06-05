<template>
  <div class="chapter-manage-container">
    <el-card class="chapter-card">
      <template #header>
        <div class="card-header">
          <h3>课程章节管理</h3>
          <div class="selected-course-display" v-if="courseInfo.id && selectedCourseId">
            当前课程：<el-tag type="primary" size="large">{{ courseInfo.couName }}</el-tag>
          </div>
        </div>
      </template>

      <!-- 合并选择课程和操作按钮到同一行 -->
      <div class="course-select-and-operations" v-if="courseOptions.length > 0">
        <el-form :inline="true" class="course-select-form">
          <el-form-item label="选择课程">
            <el-select style="width:250px;" v-model="selectedCourseId" placeholder="请选择课程（不选择将显示所有课程章节）" @change="handleCourseChange" clearable> 
              <el-option
                v-for="item in courseOptions"
                :key="item.id"
                :label="item.couName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        
        <!-- 操作按钮区域 -->
        <div class="operation-buttons" v-if="selectedCourseId && courseInfo.id">
          <el-button type="primary" @click="handleAddChapter">
            <el-icon><Plus /></el-icon>添加章节到 "{{ courseInfo.couName }}"
          </el-button>
          <el-button @click="handleBack">
            <el-icon><Back /></el-icon>返回课程列表
          </el-button>
        </div>
      </div>

      <!-- 显示所有章节或特定课程章节 -->
      <div class="chapter-list-container">
        <el-empty v-if="chapterList.length === 0 && !loadingChapters" :description="selectedCourseId ? '该课程下暂无章节数据，请添加章节。' : '暂无章节数据。'" />
        <el-table
          v-else
          v-loading="loadingChapters" 
          :data="chapterList"
          border
          row-key="id"
          style="width: 100%"
          :default-sort="getDefaultSort()"
        >
          <!-- 课程名称列 - 仅在显示所有章节时显示 -->
          <el-table-column v-if="!selectedCourseId" prop="courseName" label="课程名称" width="180" sortable />
          
          <!-- 序号列 - 仅在选择课程时显示 -->
          <el-table-column v-if="selectedCourseId" label="序号" width="80" align="center" prop="chaIndex" sortable>
            <template #default="scope">
              <span>{{ scope.row.chaIndex }}</span>
            </template>
          </el-table-column>
          
          <!-- 章节标题列 -->
          <el-table-column prop="chaTitle" label="章节标题" :min-width="selectedCourseId ? '160' : '140'" sortable />
          
          <!-- 章节创建时间列 -->
          <el-table-column prop="createTime" label="创建时间" width="120" align="center" sortable>
            <template #default="{ row }">
              <span>{{ formatDate(row.createTime) }}</span>
            </template>
          </el-table-column>
          
          <!-- 视频上传时间列 -->
          <el-table-column prop="videoUploadTime" label="视频上传时间" width="130" align="center" sortable>
            <template #default="{ row }">
              <span>{{ row.chaUrl ? formatDate(row.videoUploadTime || row.updateTime) : '-' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="videoStatus" label="视频状态" width="120" align="center" sortable :sort-method="sortVideoStatus">
            <template #default="{ row }">
              <span 
                :class="row.chaUrl ? 'video-status-uploaded' : 'video-status-not-uploaded'"
              >
                {{ row.chaUrl ? '已上传' : '未上传' }}
              </span>
            </template>
          </el-table-column>
          
          <!-- 操作列 -->
          <el-table-column label="操作" width="280" align="center">
            <template #default="scope">
              <el-button 
                type="primary" 
                link 
                @click="handleEditChapter(scope.row)"
                :disabled="!selectedCourseId"
              >
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button 
                type="primary" 
                link 
                @click="openVideoUploadDialog(scope.row)"
                :disabled="!selectedCourseId"
              >
                <el-icon><Upload /></el-icon>上传/更新视频
              </el-button>
              <el-button 
                type="danger" 
                link 
                @click="handleDeleteChapter(scope.row)"
                :disabled="!selectedCourseId"
              >
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <el-empty v-if="courseOptions.length === 0 && !loadingCourses" description="暂无可管理的课程。" />
      <div v-if="loadingCourses">正在加载课程列表...</div>
    </el-card>

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
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { chapterApi, courseApi, fileUploadApi } from '@/api' // <-- Import fileUploadApi

const route = useRoute()
const router = useRouter()

// 当前课程ID
const selectedCourseId = ref('')
const courseInfo = ref({})
const chapterList = ref([])

// 新增一个加载状态，避免在课程列表加载完成前显示 "暂无可管理的课程"
const loadingCourses = ref(false); 
// 用于章节列表的加载状态
const loadingChapters = ref(false);

// 章节表单相关
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
const currentChapterForUpload = ref(null); // 新增一个 ref 来存储完整的章节对象
const videoUrl = ref(''); // 这个保持不变，用于存储新上传的视频URL
const videoDialogVisible = ref(false); // 这个保持不变

// 获取课程列表
const courseOptions = ref([])
const fetchCourseList = async () => {
  loadingCourses.value = true;
  try {
    const response = await courseApi.getCourseList({ pageSize: 1000 }); // 获取所有课程用于下拉
    courseOptions.value = response.list || [];
  } catch (error) {
    console.error('获取课程列表失败:', error);
    ElMessage.error('获取课程列表失败');
    courseOptions.value = [];
  } finally {
    loadingCourses.value = false;
  }
};

// 获取课程信息
const fetchCourseInfo = async (courseId) => {
  try {
    const response = await chapterApi.getCourseInfo(courseId); // 假设此API返回 { id, couName, couTypeName, ... }
    courseInfo.value = response || {}; // 如果 response 为 null/undefined，则设为空对象
  } catch (error) {
    console.error('获取课程信息失败:', error);
    ElMessage.error('获取课程信息失败');
    courseInfo.value = {}; // 出错时也清空
  }
};


// 获取章节列表
const fetchChapterList = async (courseId) => {
  loadingChapters.value = true;
  try {
    const response = await chapterApi.getChapterList(courseId);
    chapterList.value = response || [];
  } catch (error) {
    console.error('获取章节列表失败:', error);
    ElMessage.error('获取章节列表失败');
    chapterList.value = [];
  } finally {
    loadingChapters.value = false;
  }
};

// 获取所有章节
const fetchAllChapters = async () => {
  loadingChapters.value = true;
  try {
    const response = await chapterApi.getAllChapters();
    // 为每个章节添加课程名称
    const chaptersWithCourseName = (response || []).map(chapter => {
      const course = courseOptions.value.find(c => c.id === chapter.couId);
      return {
        ...chapter,
        courseName: course ? course.couName : '未知课程'
      };
    });
    
    // 默认排序：只按创建时间逆序排序
    const sortedChapters = chaptersWithCourseName.sort((a, b) => {
      const timeA = new Date(a.createTime || 0).getTime();
      const timeB = new Date(b.createTime || 0).getTime();
      return timeB - timeA; // 逆序：新的在前
    });
    
    chapterList.value = sortedChapters;
  } catch (error) {
    console.error('获取所有章节失败:', error);
    ElMessage.error('获取所有章节失败');
    chapterList.value = [];
  } finally {
    loadingChapters.value = false;
  }
};


// 日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return '-';
  }
};

// 视频状态排序方法
const sortVideoStatus = (a, b) => {
  const statusA = a.chaUrl ? 1 : 0; // 已上传为1，未上传为0
  const statusB = b.chaUrl ? 1 : 0;
  return statusA - statusB;
};

// 课程选择变化
const handleCourseChange = () => {
  if (!selectedCourseId.value) {
    // 如果清空了选择，则显示所有章节
    courseInfo.value = {};
    fetchAllChapters();
    router.replace(`/course/chapter`); // 清空时，URL也应对应变化
    return;
  }
  fetchCourseInfo(selectedCourseId.value);
  fetchChapterList(selectedCourseId.value);
  router.replace(`/course/chapter/${selectedCourseId.value}`);
};

// 添加章节
const handleAddChapter = () => {
  dialogType.value = 'add'
  chapterForm.id = undefined
  chapterForm.couId = courseInfo.value.id
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
    fetchChapterList(chapterForm.couId)
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
    fetchChapterList(chapter.couId)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除章节失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 上传视频
const openVideoUploadDialog = (chapter) => {
  currentChapterForUpload.value = { ...chapter }; // 存储完整的章节对象
  if (chapter.chaUrl) {
    videoUrl.value = chapter.chaUrl; // 如果存在旧视频URL，则用于预览
    ElMessage.info('当前章节已有视频，您可以选择新视频进行覆盖。');
  } else {
    videoUrl.value = ''; // 否则清空预览
  }
  videoDialogVisible.value = true;
};

// 视频上传前检查
const beforeVideoUpload = (file) => {
  const isVideo = ['video/mp4', 'video/webm', 'video/ogg'].includes(file.type);
  const isLt500M = file.size / 1024 / 1024 < 500; // 500MB 限制

  if (!isVideo) {
    ElMessage.error('请上传视频文件 (MP4, WebM, Ogg)!');
  }
  if (!isLt500M) {
    ElMessage.error('视频大小不能超过 500MB!'); // 这是期望的提示
  }
  // 只有当文件类型正确且大小未超限时，才返回true允许上传
  return isVideo && isLt500M; 
};

// 处理视频上传
const handleVideoUpload = async (options) => { 
  const file = options.file;
  try {
    console.log('开始上传新视频文件:', file.name, '大小:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    
    const newUploadedUrl = await fileUploadApi.uploadVideo(file); // 调用API上传
    console.log('新视频上传成功，服务器返回URL:', newUploadedUrl);
    
    videoUrl.value = newUploadedUrl ? String(newUploadedUrl) : ''; // 更新预览URL为新视频的URL
    
    if (videoUrl.value) {
      ElMessage.success('新视频上传成功，请点击确定按钮保存更改。');
    } else {
      ElMessage.error('视频上传后未获取到有效URL。');
      // 保持对话框打开，但不更新 videoUrl，或根据需求清空
    }
  } catch (error) {
    console.error('上传新视频失败:', error);
    ElMessage.error('上传新视频失败: ' + (error.message || '未知错误'));
    // videoUrl.value = ''; // 上传失败，可以选择清空预览或保留旧视频（如果之前有）
                         // 当前逻辑是，如果上传新视频失败，videoUrl 仍可能是旧视频的URL
  }
};


// 提交视频上传
const submitVideoUpload = async () => {
  try {
    if (!videoUrl.value && currentChapterForUpload.value && currentChapterForUpload.value.chaUrl) {
      // 如果 videoUrl 为空，但之前章节有关联视频，用户可能是想清除视频
      // 这里可以添加一个确认步骤，或者不允许通过置空 videoUrl 来删除视频（推荐后者，删除应有专门操作）
      // 为简单起见，如果 videoUrl 为空，我们暂且认为不更新视频链接，除非您有特定需求要清空它
      ElMessage.info('没有新的视频被上传或指定。如需移除视频，请使用其他方式。');
      // videoDialogVisible.value = false; // 可以直接关闭对话框
      return;
    }
    if (!videoUrl.value && !(currentChapterForUpload.value && currentChapterForUpload.value.chaUrl) ){
        ElMessage.warning('请先上传视频或当前无视频可关联。');
        return;
    }


    if (!currentChapterForUpload.value || currentChapterForUpload.value.id === undefined ||
        currentChapterForUpload.value.couId === undefined || 
        currentChapterForUpload.value.chaIndex === undefined || 
        currentChapterForUpload.value.chaTitle === undefined) {
      ElMessage.error('章节信息不完整，无法保存。');
      console.error('currentChapterForUpload.value 缺失关键信息:', currentChapterForUpload.value);
      return;
    }
    
    console.log('准备更新章节的视频URL为:', videoUrl.value);
    console.log('操作的章节信息:', JSON.parse(JSON.stringify(currentChapterForUpload.value)));
    
    const updateData = {
      id: currentChapterForUpload.value.id,
      couId: currentChapterForUpload.value.couId,
      chaIndex: currentChapterForUpload.value.chaIndex,
      chaTitle: currentChapterForUpload.value.chaTitle,
      chaUrl: videoUrl.value // 使用当前 videoUrl (可能是新的，也可能是旧的)
    };
    
    console.log('提交给后端的更新数据:', updateData);

    await chapterApi.updateChapter(updateData);
    
    ElMessage.success('章节视频信息更新成功!');
    videoDialogVisible.value = false;
    
    if (currentChapterForUpload.value.couId) {
        await fetchChapterList(currentChapterForUpload.value.couId);
    } else if (courseInfo.value && courseInfo.value.id) {
        await fetchChapterList(courseInfo.value.id);
    }

  } catch (error) {
    console.error('保存章节视频URL失败:', error);
    const errorMsg = error.message || '保存失败，未知错误';
    ElMessage.error('保存章节视频URL失败: ' + errorMsg);
  }
};

// 返回课程列表
const handleBack = () => {
  router.push('/course/list')
}

onMounted(() => {
  loadingCourses.value = true;
  fetchCourseList().then(async () => {
    loadingCourses.value = false;

    const courseIdFromRoute = route.params.id;

    if (courseIdFromRoute) {
      const targetCourseIdStr = String(courseIdFromRoute);
      const courseExistsInOptions = courseOptions.value.find(
        course => String(course.id) === targetCourseIdStr
      );

      if (courseExistsInOptions) {
        selectedCourseId.value = courseExistsInOptions.id;
        await nextTick();
        handleCourseChange();
      } else if (courseOptions.value.length > 0) {
        ElMessage.warning('链接中的课程ID无效或已不存在，请重新选择课程。');
        router.replace('/course/chapter');
      } else {
        ElMessage.info('暂无课程可管理的课程，无法加载指定课程的章节。');
        router.replace('/course/chapter');
      }
    } else {
      // 没有从路由获取到课程ID，显示所有章节
      courseInfo.value = {};
      if (courseOptions.value.length > 0) {
        fetchAllChapters();
      } else {
        chapterList.value = [];
      }
    }
  }).catch(error => {
    loadingCourses.value = false;
    console.error('onMounted: Failed to fetch course list:', error);
    ElMessage.error('加载课程列表失败，请检查网络或联系管理员。');
  });
});
// 获取默认排序配置
const getDefaultSort = () => {
  if (!selectedCourseId.value) {
    // 未选择课程时：不设置表格默认排序，因为已经在数据层面排序了
    return undefined;
  } else {
    // 选择课程时：章节序号升序
    return { prop: 'chaIndex', order: 'ascending' };
  }
};
</script>

<style scoped>
/* 使用Element Plus自带的CSS变量 */
.chapter-manage-container {
  padding: 24px;
  min-height: 100vh;
  /* 移除背景颜色 */
}

/* 简化的卡片样式 - 只有抬起效果 */
.chapter-card {
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* 移除背景颜色 */
}

.chapter-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--el-box-shadow-light);
}

/* 标题样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.selected-course-display {
  font-size: 14px;
  color: var(--el-text-color-regular);
  padding: 8px 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 20px;
  border: 1px solid var(--el-border-color);
}

/* 视频状态标签 */
.video-status-uploaded {
  padding: 4px 12px;
  background-color: var(--el-color-success);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.video-status-not-uploaded {
  padding: 4px 12px;
  background-color: var(--el-color-info);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 返回按钮 */
:deep(.el-button--text) {
  color: var(--el-color-primary) !important;
}

/* 禁用状态的按钮样式 */
:deep(.el-button:disabled) {
  color: var(--el-text-color-disabled) !important;
  cursor: not-allowed;
}

/* 操作区域简化样式 */
.operation-container,
.course-select,
.chapter-list-container {
  /* 移除背景颜色 */
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.operation-container:hover,
.course-select:hover,
.chapter-list-container:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow-light);
}

:deep(.el-table th.el-table__cell) {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

:deep(.el-table td.el-table__cell) {
  /* 移除背景颜色 */
  color: var(--el-text-color-primary);
}

:deep(.el-table tr:hover td.el-table__cell) {
  background-color: var(--el-fill-color-light);
}

/* 表单样式 */
:deep(.el-form-item__label) {
  color: var(--el-text-color-primary);
}

:deep(.el-input__wrapper) {
  /* 移除背景颜色 */
  border-color: var(--el-border-color);
}

:deep(.el-input__inner) {
  color: var(--el-text-color-primary);
}

:deep(.el-dialog__header) {
  /* 移除背景颜色 */
  border-bottom: 1px solid var(--el-border-color);
}

:deep(.el-dialog__title) {
  color: var(--el-text-color-primary);
}

:deep(.el-dialog__body) {
  /* 移除背景颜色 */
  color: var(--el-text-color-primary);
}

/* 下拉菜单 */
:deep(.el-select-dropdown) {
  /* 移除背景颜色 */
  border-color: var(--el-border-color);
}

:deep(.el-select-dropdown__item) {
  color: var(--el-text-color-primary);
  /* 移除背景颜色 */
}

:deep(.el-select-dropdown__item:hover) {
  background-color: var(--el-fill-color-light);
}

:deep(.el-select-dropdown__item.selected) {
  background-color: var(--el-color-primary);
  color: white;
}

/* 上传组件 */
:deep(.el-upload) {
  border-color: var(--el-border-color);
  /* 移除背景颜色 */
}

:deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.upload-container {
  text-align: center;
}

.video-uploader-icon {
  font-size: 48px;
  color: var(--el-text-color-placeholder);
  width: 100%;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

:deep(.el-upload__text) {
  color: var(--el-text-color-regular);
  font-size: 14px;
  margin-top: 12px;
}

:deep(.el-upload__text em) {
  color: var(--el-color-primary);
  font-style: normal;
  font-weight: 500;
}

.upload-tip {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  margin-top: 12px;
  line-height: 1.5;
}

.video-preview {
  padding: 12px;
}

.video-preview video {
  border-radius: 8px;
}

/* 空状态 */
:deep(.el-empty__description) {
  color: var(--el-text-color-regular);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chapter-manage-container {
    padding: 16px;
  }
  
  .operation-container,
  .course-select,
  .chapter-list-container {
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-header h3 {
    font-size: 20px;
  }
}

/* 新增样式：课程选择和操作按钮布局 */
.course-select-and-operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.course-select-and-operations:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow-light);
}

.course-select-form {
  flex: 1;
}

.operation-buttons {
  display: flex;
  gap: 12px;
  margin-left: 20px;
}

</style>