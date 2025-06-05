<template>
  <div class="class-student-manage-container">
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
          <template #header>已在班级 "{{ currentClass.className }}" 的学生 ({{ assignedStudents.length }})</template>
          <el-table :data="assignedStudents" v-loading="loadingAssigned" height="400px">
            <el-table-column prop="stuName" label="学生姓名"></el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="danger" link @click="removeStudent(scope.row.id)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>可添加的学生 ({{ availableStudents.length }})</template>
          <el-input v-model="studentSearch" placeholder="搜索学生名称" clearable @input="filterAvailableStudents" style="margin-bottom:10px;"/>
          <el-table :data="filteredAvailableStudents" v-loading="loadingAvailable" height="360px">
            <el-table-column prop="stuName" label="学生姓名"></el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" link @click="addStudent(scope.row.id)">添加</el-button>
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
import { ElMessage } from 'element-plus';
import { classApi, studentApi } from '@/api'; // studentApi for fetching all students

const route = useRoute();
const router = useRouter();
const classId = ref(route.params.classId);

const currentClass = ref({ className: '' });
const assignedStudents = ref([]);
const allStudents = ref([]); // For manual filtering or transfer component
const availableStudents = ref([]); // For two-list display
const filteredAvailableStudents = ref([]);
const studentSearch = ref('');


const loadingAssigned = ref(false);
const loadingAvailable = ref(false); // or loadingAll

const pageTitle = computed(() => `管理班级学生 - ${currentClass.value.className || '加载中...'}`);

const goBack = () => router.push('/class/list');

const fetchClassDetails = async () => {
  if (!classId.value) return;
  try {
    const cls = await classApi.getClassById(classId.value);
    currentClass.value = cls || { className: '未知班级' };
  } catch (e) { console.error(e); ElMessage.error("获取班级信息失败"); }
};

const fetchAssignedStudents = async () => {
  if (!classId.value) return;
  loadingAssigned.value = true;
  try {
    assignedStudents.value = await classApi.getStudentsByClassId(classId.value) || [];
  } catch (e) { console.error(e); ElMessage.error("获取班级学生列表失败"); }
  finally { loadingAssigned.value = false; }
};

const fetchAvailableStudents = async () => {
  if (!classId.value) return;
  loadingAvailable.value = true;
  try {
    // Option 1: Backend provides available students directly
    // availableStudents.value = await classApi.getAvailableStudentsForClass(classId.value) || [];
    // filteredAvailableStudents.value = availableStudents.value;

    // Option 2: Fetch all students and filter client-side (simpler if student list isn't huge)
    const all = await studentApi.getAllStudents(); // Assuming studentApi.getAllStudents() exists
    const assignedIds = assignedStudents.value.map(s => s.id);
    availableStudents.value = all.filter(s => !assignedIds.includes(s.id));
    filterAvailableStudents(); // apply current search
  } catch (e) { console.error(e); ElMessage.error("获取可用学生列表失败"); }
  finally { loadingAvailable.value = false; }
};

const filterAvailableStudents = () => {
  if(!studentSearch.value) {
    filteredAvailableStudents.value = [...availableStudents.value];
  } else {
    filteredAvailableStudents.value = availableStudents.value.filter(s =>
      s.stuName.toLowerCase().includes(studentSearch.value.toLowerCase())
    );
  }
};


onMounted(async () => {
  await fetchClassDetails();
  await fetchAssignedStudents();
  await fetchAvailableStudents();
});

const addStudent = async (studentId) => {
  try {
    await classApi.addStudentToClass(classId.value, studentId);
    ElMessage.success('学生添加成功');
    // Refresh lists
    await fetchAssignedStudents();
    await fetchAvailableStudents(); // Re-filter available
  } catch (e) { console.error(e); ElMessage.error('添加学生失败');}
};

const removeStudent = async (studentId) => {
  try {
    await classApi.removeStudentFromClass(classId.value, studentId);
    ElMessage.success('学生移除成功');
    // Refresh lists
    await fetchAssignedStudents();
    await fetchAvailableStudents(); // Re-filter available
  } catch (e) { console.error(e); ElMessage.error('移除学生失败');}
};

// If using ElTransfer:
// const allStudentsForTransfer = ref([]);
// const assignedStudentIds = ref([]);
// onMounted(async () => {
//   await fetchClassDetails();
//   // Fetch all students for transfer
//   const all = await studentApi.getAllStudents();
//   allStudentsForTransfer.value = all.map(s => ({ id: s.id, stuName: s.stuName, disabled: false }));
//   // Fetch assigned and set v-model
//   const assigned = await classApi.getStudentsByClassId(classId.value);
//   assignedStudentIds.value = assigned.map(s => s.id);
// });
// const handleTransferChange = async (newAssignedIds, direction, movedKeys) => {
//   if (direction === 'right') { // Added to class
//     for (const studentId of movedKeys) {
//       await classApi.addStudentToClass(classId.value, studentId);
//     }
//   } else if (direction === 'left') { // Removed from class
//     for (const studentId of movedKeys) {
//       await classApi.removeStudentFromClass(classId.value, studentId);
//     }
//   }
//   ElMessage.success("操作成功");
//   // Potentially update student count in currentClass.value if not done by backend automatically
// };

</script>

<style scoped>
.class-student-manage-container {
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
  .class-student-manage-container {
    padding: 16px;
  }
  
  .el-col {
    margin-bottom: 20px;
  }
  
  .el-page-header {
    padding: 12px 16px;
  }
}

/* 在现有样式后添加黑夜模式适配 */

/* 黑夜模式适配 */
[data-theme="dark"] .class-student-manage-container {
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