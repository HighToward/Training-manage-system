<template>
  <div class="class-list-container">
    <!-- 搜索区域 - 现代化卡片设计 -->
    <div class="search-section">
      <el-card class="search-card">
        <div class="search-header">
          <div class="search-title">
            <el-icon class="title-icon"><Search /></el-icon>
            <span>班级查询</span>
          </div>
        </div>
        <div class="search-form">
          <el-input 
            v-model="queryParams.className" 
            placeholder="搜索班级名称..." 
            clearable 
            size="large"
            class="search-input"
            @keyup.enter="handleQuery"
            @clear="handleClassNameClear">
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
          <h2>班级管理</h2>
          <p class="subtitle">共 {{ total }} 个班级</p>
        </div>
        <el-button type="primary" size="large" @click="handleAdd" class="add-btn">
          <el-icon><Plus /></el-icon>
          新建班级
        </el-button>
      </div>
    </div>

    <!-- 班级卡片列表 -->
    <div class="class-grid" v-loading="loading">
      <div v-for="(item, index) in classList" :key="item.id" class="class-card-wrapper">
        <el-card class="class-card" shadow="hover">
          <div class="card-header">
            <div class="class-info">
              <h3 class="class-name">{{ item.className }}</h3>
              <div class="class-meta">
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ item.classStuNum }} 名学生</span>
                </div>
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatDate(item.createTime) }}</span>
                </div>
              </div>
            </div>
            <div class="class-avatar">
              <el-avatar :size="60" class="avatar">
                {{ item.className.charAt(0) }}
              </el-avatar>
            </div>
          </div>
          
          <div class="card-actions">
            <el-button type="primary" plain @click="handleEdit(item)" class="action-btn">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" plain @click="handleManageStudents(item)" class="action-btn">
              <el-icon><User /></el-icon>
              学生
            </el-button>
            <el-button type="warning" plain @click="handleManageCourses(item)" class="action-btn">
              <el-icon><Reading /></el-icon>
              课程
            </el-button>
            <el-button type="danger" plain @click="handleDelete(item)" class="action-btn danger">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分页器 - 根据最新反馈优化 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[12, 24, 48, 96]"
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

    <!-- 对话框保持原样 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="resetForm" class="modern-dialog">
      <el-form ref="classFormRef" :model="classForm" :rules="classRules" label-width="100px">
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="classForm.className" placeholder="请输入班级名称" size="large" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" @click="submitForm" size="large">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { classApi } from '@/api'; // Ensure classApi is exported from your api/index.js

const router = useRouter();

// 修改分页大小默认值
// 查询参数 - 保持默认值为12
const queryParams = reactive({
  className: '',
  pageNum: 1,
  pageSize: 12, // 保持12个一页，适合卡片布局
});
const queryFormRef = ref(null);
const loading = ref(false);
const classList = ref([]);
const total = ref(0);

// Dialog
const dialogVisible = ref(false);
const dialogTitle = ref('');
const classFormRef = ref(null);
const classForm = reactive({
  id: undefined,
  className: '',
});
const classRules = {
  className: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
};

const fetchClassList = async () => {
  loading.value = true;
  try {
    const response = await classApi.getClassList(queryParams);
    classList.value = response.list || [];
    total.value = response.total || 0;
  } catch (error) {
    ElMessage.error('获取班级列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchClassList);

const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchClassList();
};

const handleClassNameClear = () => {
  resetQuery();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.className = ''; // Manual reset if resetFields doesn't cover it for non-prop items
  handleQuery();
};

const handleSizeChange = (val) => {
  queryParams.pageSize = val;
  fetchClassList();
};

const handleCurrentChange = (val) => {
  queryParams.pageNum = val;
  fetchClassList();
};

const resetForm = () => {
  classForm.id = undefined;
  classForm.className = '';
  classFormRef.value?.resetFields();
};

const handleAdd = () => {
  resetForm();
  dialogTitle.value = '新建班级';
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  resetForm();
  dialogTitle.value = '编辑班级';
  Object.assign(classForm, row); // Copy row data to form
  dialogVisible.value = true;
};

const submitForm = async () => {
  if (!classFormRef.value) return;
  await classFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (classForm.id) {
          await classApi.updateClass(classForm);
          ElMessage.success('更新成功');
        } else {
          await classApi.createClass(classForm);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        fetchClassList();
      } catch (error) {
        ElMessage.error(classForm.id ? '更新失败' : '创建失败');
        console.error(error);
      }
    }
  });
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除班级 "${row.className}" 吗?`, '提示', {
      type: 'warning',
    });
    await classApi.deleteClass(row.id);
    ElMessage.success('删除成功');
    fetchClassList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error(error);
    }
  }
};

const handleManageStudents = (row) => {
  router.push(`/class/students/${row.id}`);
};

const handleManageCourses = (row) => {
  router.push(`/class/courses/${row.id}`);
};

const formatDate = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  // Assuming dateTimeStr is in a format Date can parse, or use a library like date-fns
  return new Date(dateTimeStr).toLocaleString();
};
</script>

<style scoped>
.class-list-container {
  padding: 24px;
}

/* 搜索区域样式 */
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

/* 班级卡片网格 */
.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.class-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #ffffff;
}

.class-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px 20px 0 20px;
}

.class-info {
  flex: 1;
}

/* 在现有的 .class-name 样式后添加黑夜模式适配 */
.class-name {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  transition: color 0.3s ease; /* 添加过渡效果 */
}

/* 黑夜模式下班级标题颜色适配 */
[data-theme="dark"] .class-name {
  color: #e2e8f0 !important;
}

/* 同时确保其他相关标题也适配黑夜模式 */
[data-theme="dark"] .search-title,
[data-theme="dark"] .page-title h2,
[data-theme="dark"] .meta-item {
  color: var(--text-color) !important;
}

.class-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.class-avatar {
  margin-left: 16px;
}

.avatar {
  background: #409eff;
  color: white;
  font-weight: 600;
  font-size: 20px;
  width: 50px;
  height: 50px;
  border-radius: 8px;
}

.card-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 0 20px 20px 20px;
}

.action-btn {
  border-radius: 4px;
  padding: 6px 8px;
  font-weight: 500;
  font-size: 13px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn .el-icon {
  margin-right: 3px;
  font-size: 14px;
}

.action-btn:hover {
  transform: translateY(-1px);
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .class-list-container {
    padding: 16px;
  }
  
  .class-grid {
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
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .action-btn {
    height: 36px;
    font-size: 14px;
    padding: 8px 12px;
  }
  
  .action-btn .el-icon {
    margin-right: 4px;
  }
}

/* 搜索区域标题样式 - 支持黑夜模式 */
.search-title span,
.page-title h2,
.dialog-title-text {
  color: var(--text-color);
  transition: color 0.3s ease;
}

/* 卡片头部标题 - 支持黑夜模式 */
:deep(.el-card__header .card-header h3),
:deep(.el-card__header .clearfix span) {
  color: var(--text-color) !important;
  transition: color 0.3s ease;
}


/* 新增或修改：确保列表中的主要标题在黑夜模式下为浅色 */
/* 假设班级列表的标题类名为 .class-name-title */
[data-theme="dark"] .class-name-title { /* 请替换为实际的类名 */
  color: #e2e8f0 !important; /* 或者 var(--text-color) */
}

/* Element Plus 表格表头文字颜色 - 黑夜模式 */
:deep([data-theme="dark"] .el-table th.el-table__cell > .cell) {
  color: #e2e8f0 !important;
}

/* 分页器样式 - 支持黑夜模式 (与CourseList.vue一致，可提取为公共样式) */
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

:deep(.el-pagination .el-select .el-input__wrapper) {
  background: var(--card-bg);
  border-color: var(--border-color);
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

/* 响应式设计优化 */
@media (max-width: 768px) {
  .class-list-container {
    padding: 16px;
  }
  
  .class-grid {
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
    grid-template-columns: 1fr;
  }
}
</style>