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
            新建班级
          </el-button>
        </div>
      </div>
    </div>

    <!-- 班级卡片列表 -->
    <div class="class-grid" v-loading="loading" v-show="viewMode === 'card'">
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

    <!-- 班级列表视图 -->
    <div class="class-list-view" v-loading="loading" v-show="viewMode === 'list'">
      <el-table :data="classList" style="width: 100%" class="class-table">
        <el-table-column prop="className" label="班级名称" min-width="200">
          <template #default="scope">
            <div class="class-name-cell">
              <span class="class-title">{{ scope.row.className }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="classStuNum" label="学生人数" width="120" align="center">
          <template #default="scope">
            <span>{{ scope.row.classStuNum || 0 }} 名学生</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template #default="scope">
            <span>{{ formatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="400" align="center" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button type="primary" size="small" @click="handleManageStudents(scope.row)">
                <el-icon><User /></el-icon>
                学生管理
              </el-button>
              <el-button type="success" size="small" @click="handleManageCourses(scope.row)">
                <el-icon><Reading /></el-icon>
                课程管理
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Grid, List, Plus, User, Reading, Edit, Delete } from '@element-plus/icons-vue';
import { classApi } from '@/api'; // Ensure classApi is exported from your api/index.js
import pinyin from 'js-pinyin';
import { useViewModeStore } from '@/stores/viewMode';

const router = useRouter();

// 视图模式
const viewModeStore = useViewModeStore();
const viewMode = computed({
  get: () => viewModeStore.getClassListViewMode,
  set: (value) => viewModeStore.setClassListViewMode(value)
});

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

// 存储所有班级数据用于前端筛选
const allClasses = ref([]);

const fetchClassList = async () => {
  loading.value = true;
  try {
    const response = await classApi.getClassList({ pageNum: 1, pageSize: 1000 }); // 获取所有数据
    allClasses.value = response.list || [];
    applyFilters();
  } catch (error) {
    ElMessage.error('获取班级列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 应用筛选和分页
const applyFilters = () => {
  let filteredData = [...allClasses.value];
  
  // 班级名称搜索（支持拼音）
  if (queryParams.className.trim()) {
    const searchTerm = queryParams.className.toLowerCase();
    filteredData = filteredData.filter(item => {
      const className = item.className || '';
      // 中文匹配
      if (className.toLowerCase().includes(searchTerm)) {
        return true;
      }
      // 拼音匹配
      const pinyinStr = pinyin.getFullChars(className).toLowerCase();
      const pinyinAbbr = pinyin.getCamelChars(className).toLowerCase();
      return pinyinStr.includes(searchTerm) || pinyinAbbr.includes(searchTerm);
    });
  }
  
  // 分页处理
  total.value = filteredData.length;
  const startIndex = (queryParams.pageNum - 1) * queryParams.pageSize;
  const endIndex = startIndex + queryParams.pageSize;
  classList.value = filteredData.slice(startIndex, endIndex);
};

onMounted(fetchClassList);

const handleQuery = () => {
  queryParams.pageNum = 1;
  applyFilters();
};

const handleClassNameClear = () => {
  resetQuery();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.className = ''; // Manual reset if resetFields doesn't cover it for non-prop items
  queryParams.pageNum = 1;
  applyFilters();
};

const handleSizeChange = (val) => {
  queryParams.pageSize = val;
  queryParams.pageNum = 1;
  applyFilters();
};

const handleCurrentChange = (val) => {
  queryParams.pageNum = val;
  applyFilters();
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
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* 深夜模式背景 */
[data-theme="dark"] .class-list-container {
}

/* 搜索区域样式 - 现代化设计 */
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

.search-header {
  padding: 24px 28px 0;
  border-bottom: none;
  margin-bottom: 0;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 24px;
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
  padding: 0 28px 28px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
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

/* 操作区域样式 */
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
  opacity: 0.8;
  font-size: 16px;
  margin: 8px 0 0 0;
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

/* 班级卡片网格 */
.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  padding: 0 8px;
}

.class-card-wrapper {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.class-card {
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

[data-theme="dark"] .class-card {
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.class-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.class-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
}

[data-theme="dark"] .class-card:hover {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.class-card:hover::before {
  opacity: 1;
}

.card-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
  position: relative;
  z-index: 1;
}

[data-theme="dark"] .card-header {
  border-bottom-color: rgba(226, 232, 240, 0.1);
}

.class-info {
  flex: 1;
}

/* 在现有的 .class-name 样式后添加黑夜模式适配 */
.class-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 12px;
  line-height: 1.4;
  transition: color 0.3s ease;
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
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-size: 14px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.meta-item .el-icon {
  font-size: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.class-avatar {
  margin-left: 20px;
}

.avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 800;
  font-size: 24px;
  width: 60px;
  height: 60px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.class-card:hover .avatar {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.card-actions {
  padding: 16px 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  position: relative;
  z-index: 1;
}

.action-btn {
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  transition: left 0.5s;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn.danger:hover {
  background-color: #f56565 !important;
  border-color: #f56565 !important;
  box-shadow: 0 4px 15px rgba(245, 101, 101, 0.4);
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
    gap: 12px;
  }
  
  .action-btn {
    height: 40px;
    font-size: 14px;
    padding: 10px 16px;
  }
  
  .action-btn .el-icon {
    margin-right: 6px;
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

/* 列表视图样式 */
.class-list-view {
  margin-bottom: 32px;
}

.class-table {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .class-table {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.class-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.class-title {
  font-weight: 600;
  color: var(--text-color);
  font-size: 14px;
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
    gap: 12px;
  }
  
  .action-btn {
    height: 40px;
    font-size: 14px;
    padding: 10px 16px;
  }
}

/* 响应式设计 - 小屏幕优化 */
@media (max-width: 480px) {
  .class-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .class-card {
    margin: 0;
  }
  
  .card-header {
    padding: 16px;
  }
  
  .class-name {
    font-size: 16px;
  }
  
  .card-actions {
    padding: 12px 16px;
    gap: 8px;
  }
  
  .card-actions .el-button {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .table-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .table-actions .el-button {
    width: 100%;
    margin: 0;
  }
}
</style>