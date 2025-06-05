<template>
  <div class="class-course-manage-container">
    <el-page-header @back="goBack" :content="pageTitle">
      <template #icon>
        <el-icon><ArrowLeft /></el-icon>
      </template>
      <template #title>
        <span>返回</span>
      </template>
    </el-page-header>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="clearfix">
              <span>已分配到班级 "{{ currentClass.className }}" 的课程 ({{ assignedCourses.length }})</span>
            </div>
          </template>
          <el-table :data="assignedCourses" v-loading="loadingAssigned" height="400px" border>
            <el-table-column prop="couName" label="课程名称" show-overflow-tooltip />
            <el-table-column prop="teaName" label="教师" width="120" />
            <el-table-column label="操作" width="100" align="center">
              <template #default="scope">
                <el-button type="danger" link @click="removeCourse(scope.row.id)">
                  <el-icon><CloseBold /></el-icon>移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="clearfix">
              <span>可选课程 ({{ filteredAvailableCourses.length }}/{{ availableCourses.length }})</span>
            </div>
          </template>
          <el-input
            v-model="courseSearch"
            placeholder="搜索课程名称或教师"
            clearable
            @input="filterAvailableCourses"
            style="margin-bottom: 10px;"
          >
            <template #prepend>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-table :data="filteredAvailableCourses" v-loading="loadingAvailable" height="360px" border>
            <el-table-column prop="couName" label="课程名称" show-overflow-tooltip />
            <el-table-column prop="teaName" label="教师" width="120" />
            <el-table-column label="操作" width="100" align="center">
              <template #default="scope">
                <el-button type="primary" link @click="addCourse(scope.row.id)">
                  <el-icon><Plus /></el-icon>添加
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus'; // ElMessageBox for confirm
import { classApi, courseApi } from '@/api'; // Assuming courseApi has method to get all courses

const route = useRoute();
const router = useRouter();
const classId = ref(route.params.classId); // 从路由参数获取班级ID

const currentClass = ref({ className: '' }); // 当前班级信息
const assignedCourses = ref([]); // 已分配给该班级的课程列表
const availableCourses = ref([]); // 所有可用的课程列表（用于筛选）
const filteredAvailableCourses = ref([]); // 筛选后的可用课程列表
const courseSearch = ref(''); // 课程搜索关键词

const loadingAssigned = ref(false); // 加载已分配课程的状态
const loadingAvailable = ref(false); // 加载可用课程的状态

const pageTitle = computed(() => `管理班级课程 - ${currentClass.value.className || '加载中...'}`);

const goBack = () => router.push('/class/list');

// 获取当前班级详情
const fetchClassDetails = async () => {
  if (!classId.value) return;
  try {
    const cls = await classApi.getClassById(classId.value);
    currentClass.value = cls || { className: '未知班级' };
  } catch (error) {
    console.error('获取班级信息失败:', error);
    ElMessage.error('获取班级信息失败');
  }
};

// 获取已分配给班级的课程列表
const fetchAssignedCourses = async () => {
  if (!classId.value) return;
  loadingAssigned.value = true;
  try {
    const response = await classApi.getCoursesByClassId(classId.value);
    assignedCourses.value = response || [];
  } catch (error) {
    console.error('获取班级课程列表失败:', error);
    ElMessage.error('获取班级课程列表失败');
    assignedCourses.value = [];
  } finally {
    loadingAssigned.value = false;
  }
};

// 获取所有可用的课程（用于从中选择分配给班级）
// 您可能需要一个更优化的API，比如后端直接返回未分配给该班级的课程
// 这里为了简单，先获取所有课程，然后在客户端过滤
const fetchAllAvailableCourses = async () => {
  loadingAvailable.value = true;
  try {
    // 假设 courseApi.getCourseList 支持无分页获取所有，或者调整参数
    const response = await courseApi.getCourseList({ pageNum: 1, pageSize: 10000 }); // 获取大量数据
    const allSystemCourses = response.list || [];
    
    const assignedCourseIds = assignedCourses.value.map(c => c.id);
    availableCourses.value = allSystemCourses.filter(course => !assignedCourseIds.includes(course.id));
    filterAvailableCourses(); // 初始化筛选结果
  } catch (error) {
    console.error('获取可用课程列表失败:', error);
    ElMessage.error('获取可用课程列表失败');
    availableCourses.value = [];
    filteredAvailableCourses.value = [];
  } finally {
    loadingAvailable.value = false;
  }
};

// 客户端筛选可用课程
const filterAvailableCourses = () => {
  if (!courseSearch.value) {
    filteredAvailableCourses.value = [...availableCourses.value];
  } else {
    const searchTerm = courseSearch.value.toLowerCase();
    filteredAvailableCourses.value = availableCourses.value.filter(course =>
      (course.couName && course.couName.toLowerCase().includes(searchTerm)) ||
      (course.teaName && course.teaName.toLowerCase().includes(searchTerm)) // 假设课程对象有教师名称
    );
  }
};

onMounted(async () => {
  await fetchClassDetails();
  await fetchAssignedCourses(); // 先获取已分配的
  await fetchAllAvailableCourses(); // 再获取所有可用的，并进行过滤
});

// 将课程添加到班级
const addCourse = async (courseIdToAdd) => {
  if (!classId.value || !courseIdToAdd) return;
  try {
    await classApi.addCourseToClass(classId.value, courseIdToAdd);
    ElMessage.success('课程添加成功');
    // 刷新列表
    await fetchAssignedCourses();
    await fetchAllAvailableCourses(); // 需要重新计算可用的
  } catch (error) {
    console.error('添加课程到班级失败:', error);
    ElMessage.error(error.message || '添加课程失败');
  }
};

// 从班级移除课程
const removeCourse = async (courseIdToRemove) => {
  if (!classId.value || !courseIdToRemove) return;
  try {
    await ElMessageBox.confirm(
      `确定要从班级 "${currentClass.value.className}" 移除该课程吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    await classApi.removeCourseFromClass(classId.value, courseIdToRemove);
    ElMessage.success('课程移除成功');
    // 刷新列表
    await fetchAssignedCourses();
    await fetchAllAvailableCourses(); // 需要重新计算可用的
  } catch (error) {
    if (error !== 'cancel') {
      console.error('从班级移除课程失败:', error);
      ElMessage.error(error.message || '移除课程失败');
    }
  }
};

/* // --- ElTransfer 相关逻辑 (如果选择使用) ---
const allCoursesForTransfer = ref([]); // { id, couName, teaName, disabled }
const assignedCourseIds = ref([]);

const loadDataForTransfer = async () => {
  loadingAvailable.value = true; // 或者一个新的loading状态
  try {
    // 1. 获取班级信息
    await fetchClassDetails();

    // 2. 获取所有课程作为穿梭框的data
    const courseListResponse = await courseApi.getCourseList({ pageNum: 1, pageSize: 10000 });
    allCoursesForTransfer.value = (courseListResponse.list || []).map(c => ({
      id: c.id, // 确保是数字或字符串，与v-model中id类型一致
      couName: c.couName,
      teaName: c.teaName, // 假设课程对象有教师名
      disabled: false
    }));

    // 3. 获取当前班级已分配的课程ID
    const assignedResponse = await classApi.getCoursesByClassId(classId.value);
    assignedCourseIds.value = (assignedResponse || []).map(c => c.id);

  } catch (error) {
    console.error("加载穿梭框数据失败:", error);
    ElMessage.error("数据加载失败");
  } finally {
    loadingAvailable.value = false;
  }
};
// onMounted(loadDataForTransfer); // 如果使用 Transfer，则替换原 onMounted 内容

const handleTransferChange = async (newAssignedIds, direction, movedKeys) => {
  loadingAssigned.value = true; // 可以共用一个loading或分别设置
  loadingAvailable.value = true;
  try {
    if (direction === 'right') { // 课程被添加到班级 (movedKeys 是本次添加的课程ID)
      for (const courseIdToAdd of movedKeys) {
        await classApi.addCourseToClass(classId.value, courseIdToAdd);
      }
      ElMessage.success(`${movedKeys.length}门课程已添加到班级`);
    } else if (direction === 'left') { // 课程从班级移除
      for (const courseIdToRemove of movedKeys) {
        await classApi.removeCourseFromClass(classId.value, courseIdToRemove);
      }
      ElMessage.success(`${movedKeys.length}门课程已从班级移除`);
    }
    // 成功后，通常穿梭框的v-model (assignedCourseIds) 已经更新了
    // 但为了确保数据同步，并更新其他依赖数据（如已分配列表），可以重新加载
    // await fetchAssignedCourses();
    // await fetchAllAvailableCourses(); // 如果不用穿梭框的data源做过滤
  } catch (error) {
    console.error("更新班级课程失败:", error);
    ElMessage.error("操作失败");
    // 如果操作失败，可能需要将穿梭框模型回滚到操作前状态
    // await loadDataForTransfer(); // 重新加载以恢复
  } finally {
    loadingAssigned.value = false;
    loadingAvailable.value = false;
  }
};

const transferFilterMethod = (query, item) => {
  const itemName = item.couName || '';
  const itemTeacher = item.teaName || '';
  return itemName.toLowerCase().includes(query.toLowerCase()) || 
         itemTeacher.toLowerCase().includes(query.toLowerCase());
};
*/

</script>

<style scoped>
.class-course-manage-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部样式 */
.el-page-header {
  background: #ffffff;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* 卡片样式优化 */
.el-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.el-card .el-card__header {
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.el-card .el-card__body {
  padding: 20px;
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

/* 搜索框样式 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .class-course-manage-container {
    padding: 16px;
  }
  
  .el-col {
    margin-bottom: 20px;
  }
  
  .el-page-header {
    padding: 12px 16px;
  }
}

/* 黑夜模式适配 */
[data-theme="dark"] .class-course-manage-container {
  background: var(--bg-color);
}

[data-theme="dark"] .el-page-header {
  background: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}

[data-theme="dark"] .el-card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

[data-theme="dark"] .el-card .el-card__header {
  background: var(--hover-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}

[data-theme="dark"] .el-table {
  background: var(--card-bg);
}

[data-theme="dark"] .el-table th {
  background: var(--hover-bg);
  color: var(--text-color);
}

[data-theme="dark"] .el-table td {
  background: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}

[data-theme="dark"] .el-input__wrapper {
  background: var(--card-bg) !important;
  border-color: var(--border-color) !important;
}

[data-theme="dark"] .el-input__inner {
  color: var(--text-color) !important;
}

[data-theme="dark"] .el-button {
  background: var(--hover-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}

[data-theme="dark"] .el-button:hover {
  background: var(--hover-bg);
  opacity: 0.8;
}
</style>