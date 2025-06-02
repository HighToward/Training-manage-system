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

      <div class="operation-container" v-if="selectedCourseId && courseInfo.id">
        <el-button type="primary" @click="handleAddChapter">
          <el-icon><Plus /></el-icon>添加章节到 "{{ courseInfo.couName }}"
        </el-button>
        <el-button @click="handleBack">
          <el-icon><Back /></el-icon>返回课程列表
        </el-button>
      </div>

      <div class="course-select" v-if="courseOptions.length > 0">  <el-form :inline="true">
          <el-form-item label="选择课程">
            <el-select style="width:250px;" v-model="selectedCourseId" placeholder="请选择课程" @change="handleCourseChange" clearable> <el-option
                v-for="item in courseOptions"
                :key="item.id"
                :label="item.couName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          </el-form>
      </div>

      <div v-if="selectedCourseId && courseInfo.id" class="chapter-list-container">
        <el-empty v-if="chapterList.length === 0 && !loadingChapters" description="该课程下暂无章节数据，请添加章节。" />
        <el-table
          v-else
          v-loading="loadingChapters" :data="chapterList"
          border
          row-key="id"
          style="width: 100%"
        >
          <el-table-column label="序号" width="80" align="center">
            <template #default="scope">
              <span>{{ scope.row.chaIndex }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="chaTitle" label="章节标题" min-width="200" />
          <el-table-column label="视频" width="120" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.chaUrl" type="success" size="small">已上传</el-tag>
              <el-tag v-else type="info" size="small">未上传</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" align="center">
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
      </div>
      <el-empty v-else-if="!selectedCourseId && courseOptions.length > 0 && !loadingCourses" description="请先从上方选择一个课程来管理其章节。" />
      <el-empty v-else-if="courseOptions.length === 0 && !loadingCourses" description="暂无可管理的课程。" />
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
// const fetchAllChapters = async () => {
//   try {
//     const response = await chapterApi.getAllChapters()
//     chapterList.value = response
//   } catch (error) {
//     console.error('获取所有章节失败:', error)
//     ElMessage.error('获取所有章节失败')
//   }
// }

// 课程选择变化
const handleCourseChange = () => {
  if (!selectedCourseId.value) {
    // 如果清空了选择，则清空章节列表和课程信息
    chapterList.value = [];
    courseInfo.value = {};
    // ElMessage.warning('请选择课程'); // 移除或修改提示，因为允许清空
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
  fetchCourseList().then(async () => { // 将回调函数标记为 async
    loadingCourses.value = false;
    // console.log('onMounted: courseOptions after fetch:', JSON.parse(JSON.stringify(courseOptions.value)));

    const courseIdFromRoute = route.params.id; // 从路由获取课程ID
    // console.log('onMounted: courseIdFromRoute from route.params.id:', courseIdFromRoute);

    if (courseIdFromRoute) {
      const targetCourseIdStr = String(courseIdFromRoute); // 统一将路由参数ID转为字符串

      // 查找 courseOptions 中是否存在这个ID，并确保比较时类型一致
      const courseExistsInOptions = courseOptions.value.find(
        course => String(course.id) === targetCourseIdStr
      );

      // console.log('onMounted: courseExistsInOptions:', courseExistsInOptions);

      if (courseExistsInOptions) {
        // selectedCourseId.value = targetCourseIdStr; // 将 el-select 的 v-model 也设置为字符串ID
        selectedCourseId.value = courseExistsInOptions.id; // 修改此行：使用 courseExistsInOptions.id 来保持类型一致

        // 非常关键：等待Vue完成当前的DOM更新队列
        // 这确保了 el-select 组件有时间去处理 v-model 的变化并基于新的 courseOptions 进行渲染
        await nextTick();

        // console.log('onMounted: selectedCourseId is now:', selectedCourseId.value);
        // console.log('onMounted: Corresponding option label should be:', courseExistsInOptions.couName);

        // 在 selectedCourseId 更新且 el-select 应该已经正确显示后，再调用 handleCourseChange
        // handleCourseChange 内部会做 fetchCourseInfo 和 fetchChapterList
        handleCourseChange();
      } else if (courseOptions.value.length > 0) {
        // 路由中的ID在当前课程列表中找不到，但列表不为空
        ElMessage.warning('链接中的课程ID无效或已不存在，请重新选择课程。');
        router.replace('/course/chapter'); // 跳转到无特定课程的章节管理页
      } else {
        // 课程列表为空，且路由中有ID
        ElMessage.info('暂无课程可管理的课程，无法加载指定课程的章节。');
        router.replace('/course/chapter');
      }
    } else {
      // 没有从路由获取到课程ID，正常初始化
      chapterList.value = [];
      courseInfo.value = {}; // 清空课程信息
      if (courseOptions.value.length === 0 && !loadingCourses.value) {
        ElMessage.info('暂无课程可管理的课程。');
      }
      // 如果希望在没有路由参数时默认选中列表的第一个课程（如果列表不为空）
      // else if (courseOptions.value.length > 0) {
      //   selectedCourseId.value = String(courseOptions.value[0].id);
      //   await nextTick();
      //   handleCourseChange();
      // }
    }
  }).catch(error => {
    loadingCourses.value = false;
    console.error('onMounted: Failed to fetch course list:', error);
    ElMessage.error('加载课程列表失败，请检查网络或联系管理员。');
  });
});
</script>

<style scoped>
.chapter-manage-container {
  padding: 24px;
  min-height: 100vh;
}

/* 主卡片样式 */
.chapter-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chapter-card .el-card__header {
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
  padding: 20px 24px;
}

.chapter-card .el-card__body {
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.selected-course-display {
  font-size: 14px;
  color: #606266;
}

/* 操作区域样式 */
.operation-container {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.operation-container .el-button {
  margin-right: 12px;
  margin-bottom: 8px;
}

/* 课程选择区域 */
.course-select {
  margin-bottom: 24px;
  padding: 16px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

/* 章节列表容器 */
.chapter-list-container {
  background: #ffffff;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #ebeef5;
}

/* 表格样式 */
.el-table {
  border-radius: 6px;
  overflow: hidden;
}

.el-table th {
  background: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.el-table td {
  border-bottom: 1px solid #ebeef5;
}

.el-table--border {
  border: 1px solid #ebeef5;
}

/* 表单样式 */
.el-form {
  background: #ffffff;
}

.el-select {
  border-radius: 6px;
}

.el-input {
  border-radius: 6px;
}

.el-input__wrapper {
  border-radius: 6px;
}

/* 按钮样式 */
.el-button {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.el-button:hover {
  transform: translateY(-1px);
}

.el-button--link {
  border-radius: 4px;
  padding: 4px 8px;
}

/* 对话框样式 */
.el-dialog {
  border-radius: 8px;
}

.el-dialog__header {
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
  border-radius: 8px 8px 0 0;
}

/* 空状态样式 */
.el-empty {
  padding: 40px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chapter-manage-container {
    padding: 16px;
  }
  
  .chapter-card .el-card__body {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .operation-container .el-button {
    width: 100%;
    margin-right: 0;
  }
}
</style>