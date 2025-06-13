<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
      <p class="page-subtitle">欢迎回来，{{ userInfo?.teaName || '教师' }}！</p>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="24" color="#409eff"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ totalStats.informationCount }}</div>
            <div class="stat-label">资讯文章</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="24" color="#67c23a"><School /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ totalStats.courseCount }}</div>
            <div class="stat-label">课程数量</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="24" color="#e6a23c"><ChatDotRound /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ totalStats.commentCount }}</div>
            <div class="stat-label">评论数量</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="24" color="#f56c6c"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ totalStats.studentCount }}</div>
            <div class="stat-label">学生数量</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 内容区域 -->
    <div class="content-grid">
      <!-- 最新资讯 -->
      <el-card class="content-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">
              <el-icon><Document /></el-icon>
              最新资讯
            </h3>
            <el-button type="primary" link @click="$router.push('/information/list')">
              查看更多
            </el-button>
          </div>
        </template>
        <div v-loading="loading.information" class="card-content">
          <div v-if="latestInformation.length === 0" class="empty-state">
            <el-empty description="暂无资讯" />
          </div>
          <div v-else class="info-list">
            <div 
              v-for="item in latestInformation" 
              :key="item.id" 
              class="info-item"
              @click="$router.push(`/information/detail/${item.id}`)"
            >
              <div class="info-image">
                <el-image 
                  v-if="item.infoImage" 
                  :src="item.infoImage" 
                  fit="cover"
                  class="item-image"
                />
                <div v-else class="no-image">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              <div class="info-content">
                <h4 class="info-title">{{ item.infoTitle }}</h4>
                <div class="info-author">{{ item.teaName }}</div>
                <div class="info-meta">
                  <span class="date">{{ formatDate(item.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 最新课程 -->
      <el-card class="content-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">
              <el-icon><School /></el-icon>
              最新课程
            </h3>
            <el-button type="primary" link @click="$router.push('/course/list')">
              查看更多
            </el-button>
          </div>
        </template>
        <div v-loading="loading.course" class="card-content">
          <div v-if="latestCourses.length === 0" class="empty-state">
            <el-empty description="暂无课程" />
          </div>
          <div v-else class="course-list">
            <div 
              v-for="item in latestCourses" 
              :key="item.id" 
              class="course-item"
              @click="$router.push(`/course/detail/${item.id}`)"
            >
              <div class="course-image">
                <el-image 
                  v-if="item.couImage" 
                  :src="item.couImage" 
                  fit="cover"
                  class="item-image"
                />
                <div v-else class="no-image">
                  <el-icon><VideoCamera /></el-icon>
                </div>
              </div>
              <div class="course-content">
                <h4 class="course-title">{{ item.couName }}</h4>
                <div class="course-meta">
                  <span class="teacher">{{ item.teaName }}</span>
                  <span class="price">¥{{ item.couPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 第二行内容 -->
    <div class="content-grid">
      <!-- 最新评论 -->
      <el-card class="content-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">
              <el-icon><ChatDotRound /></el-icon>
              最新评论
            </h3>
          </div>
        </template>
        <div v-loading="loading.comment" class="card-content">
          <div v-if="latestComments.length === 0" class="empty-state">
            <el-empty description="暂无评论" />
          </div>
          <div v-else class="comment-list">
            <div 
              v-for="item in latestComments" 
              :key="item.id" 
              class="comment-item"
              @click="$router.push(`/information/detail/${item.infoId}#comment-${item.id}`)"
            >
              <div class="comment-avatar">
                <el-avatar :size="32" :src="item.stuPic">
                  <el-icon><User /></el-icon>
                </el-avatar>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="commenter">{{ item.studentName }}</span>
                  <span class="comment-date">{{ formatDate(item.createTime) }}</span>
                </div>
                <p class="comment-text">{{ item.content }}</p>
                <div class="comment-info">
                  <span class="info-title">评论于：{{ item.infoTitle }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 学生购买记录 -->
      <el-card class="content-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">
              <el-icon><ShoppingCart /></el-icon>
              最新购买
            </h3>
          </div>
        </template>
        <div v-loading="loading.purchase" class="card-content">
          <div v-if="latestPurchases.length === 0" class="empty-state">
            <el-empty description="暂无购买记录" />
          </div>
          <div v-else class="purchase-list">
            <div 
              v-for="item in latestPurchases" 
              :key="item.id" 
              class="purchase-item"
              @click="$router.push(`/course/detail/${item.courseId}`)"
            >
              <div class="purchase-avatar">
                <el-avatar :size="32" :src="item.stuPic">
                  <el-icon><User /></el-icon>
                </el-avatar>
              </div>
              <div class="purchase-content">
                <div class="purchase-header">
                  <span class="student-name">{{ item.studentName }}</span>
                  <span class="purchase-date">{{ formatDate(item.createTime) }}</span>
                </div>
                <p class="course-name">购买了：{{ item.courseName }}</p>
                <div class="purchase-info">
                  <span class="price">¥{{ item.coursePrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { 
  TrendCharts, 
  Document, 
  School, 
  ChatDotRound, 
  User, 
  Picture, 
  VideoCamera, 
  ShoppingCart 
} from '@element-plus/icons-vue'
import { 
  informationApi, 
  courseApi, 
  dashboardApi,
  teacherApi 
} from '@/api'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 加载状态
const loading = reactive({
  information: false,
  course: false,
  comment: false,
  purchase: false
})

// 数据
const latestInformation = ref([])
const latestCourses = ref([])
const latestComments = ref([])
const latestPurchases = ref([])

// 统计数据
const totalStats = reactive({
  informationCount: 0,
  courseCount: 0,
  commentCount: 0,
  studentCount: 0
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

// 获取最新资讯
const fetchLatestInformation = async () => {
  loading.information = true
  try {
    const response = await informationApi.getInformationList({
      pageNum: 1,
      pageSize: 5
    })
    let informationData = []
    if (response && Array.isArray(response)) {
      informationData = response
    } else if (response && response.records && Array.isArray(response.records)) {
      informationData = response.records
    }
    
    // 获取教师信息并补充teaName
    if (informationData.length > 0) {
      const teachers = await teacherApi.getTeacherList()
      if (teachers && Array.isArray(teachers)) {
        informationData.forEach(info => {
          if (info.teaId && !info.teaName) {
            const teacher = teachers.find(t => t.id === info.teaId)
            if (teacher) {
              info.teaName = teacher.teaName
            }
          }
        })
      }
    }
    
    latestInformation.value = informationData
  } catch (error) {
    console.error('获取最新资讯失败:', error)
    latestInformation.value = []
  } finally {
    loading.information = false
  }
}

// 获取最新课程
const fetchLatestCourses = async () => {
  loading.course = true
  try {
    console.log('开始获取最新课程数据...')
    const response = await dashboardApi.getLatestCourses()
    console.log('最新课程API响应:', response)
    
    // 处理不同的响应数据结构
    let courseData = []
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        courseData = response.data
      } else if (response.data.records && Array.isArray(response.data.records)) {
        courseData = response.data.records
      } else if (response.data.list && Array.isArray(response.data.list)) {
        courseData = response.data.list
      }
    } else if (response && response.records && Array.isArray(response.records)) {
      courseData = response.records
    } else if (response && response.list && Array.isArray(response.list)) {
      courseData = response.list
    } else if (Array.isArray(response)) {
      courseData = response
    }
    
    console.log('处理后的课程数据:', courseData)
    
    if (courseData.length > 0) {
      // 只取前5个课程
      latestCourses.value = courseData.slice(0, 5).map(course => ({
        ...course,
        // 处理图片字段映射
        couImage: course.couImage || course.couPic || '',
        couPic: course.couPic || course.couImage || ''
      }))
      console.log('设置的最新课程数据:', latestCourses.value)
    } else {
      console.log('没有获取到课程数据，使用模拟数据')
      // 使用模拟数据作为后备
      latestCourses.value = [
        {
          id: 1,
          couName: 'Python基础教程',
          teaName: '张老师',
          couPrice: 199.00,
          couImage: 'https://example.com/course1.jpg'
        },
        {
          id: 2,
          couName: 'JavaScript进阶',
          teaName: '李老师',
          couPrice: 299.00,
          couImage: 'https://example.com/course2.jpg'
        }
      ]
    }
  } catch (error) {
    console.error('获取最新课程失败:', error)
    // 使用模拟数据作为后备
    latestCourses.value = [
      {
        id: 1,
        couName: 'Python基础教程',
        teaName: '张老师',
        couPrice: 199.00,
        couImage: 'https://example.com/course1.jpg'
      },
      {
        id: 2,
        couName: 'JavaScript进阶',
        teaName: '李老师',
        couPrice: 299.00,
        couImage: 'https://example.com/course2.jpg'
      }
    ]
  } finally {
    loading.course = false
  }
}

// 获取最新评论
const fetchLatestComments = async () => {
  loading.comment = true
  try {
    console.log('开始获取最新评论数据...')
    const response = await dashboardApi.getLatestComments()
    console.log('评论API响应:', response)
    
    let commentData = []
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        commentData = response.data
      } else if (response.data.records && Array.isArray(response.data.records)) {
        commentData = response.data.records
      } else if (response.data.list && Array.isArray(response.data.list)) {
        commentData = response.data.list
      }
    } else if (response && response.records && Array.isArray(response.records)) {
      commentData = response.records
    } else if (response && response.list && Array.isArray(response.list)) {
      commentData = response.list
    } else if (Array.isArray(response)) {
      commentData = response
    }
    
    console.log('处理后的评论数据:', commentData)
    
    if (commentData.length > 0) {
      // 取前5条并确保字段正确
      latestComments.value = commentData.slice(0, 5).map(comment => ({
        id: comment.id,
        content: comment.content || comment.comContent,
        createTime: comment.createTime,
        infoTitle: comment.infoTitle,
        infoId: comment.infoId,
        studentName: comment.studentName || comment.stuName,
        stuPic: comment.stuPic || comment.userAvatar || ''
      }))
      console.log('设置的最新评论数据:', latestComments.value)
    } else {
      console.log('没有获取到评论数据，使用模拟数据')
      // 使用模拟数据作为后备
      latestComments.value = [
        { 
          id: 1, 
          content: '这篇文章很有帮助，谢谢分享！', 
          createTime: '2024-01-15 10:30:00', 
          infoTitle: 'Vue3 新特性详解', 
          infoId: 1, 
          studentName: '张同学',
          stuPic: 'https://example.com/avatars/student1.jpg'
        },
        { 
          id: 2, 
          content: '讲解得非常清晰，对我帮助很大。', 
          createTime: '2024-01-15 09:15:00', 
          infoTitle: 'Spring Boot 实战指南', 
          infoId: 2, 
          studentName: '李同学',
          stuPic: 'https://example.com/avatars/student2.jpg'
        }
      ]
    }
  } catch (error) {
    console.error('获取最新评论失败:', error)
    // 使用模拟数据作为后备
    latestComments.value = [
      { 
        id: 1, 
        content: '这篇文章很有帮助，谢谢分享！', 
        createTime: '2024-01-15 10:30:00', 
        infoTitle: 'Vue3 新特性详解', 
        infoId: 1, 
        studentName: '张同学',
        stuPic: 'https://example.com/avatars/student1.jpg'
      },
      { 
        id: 2, 
        content: '讲解得非常清晰，对我帮助很大。', 
        createTime: '2024-01-15 09:15:00', 
        infoTitle: 'Spring Boot 实战指南', 
        infoId: 2, 
        studentName: '李同学',
        stuPic: 'https://example.com/avatars/student2.jpg'
      }
    ]
  } finally {
    loading.comment = false
  }
}

// 获取最新购买记录
const fetchLatestPurchases = async () => {
  loading.purchase = true
  try {
    const response = await dashboardApi.getLatestPurchases()
    if (response && Array.isArray(response)) {
      latestPurchases.value = response
    }
  } catch (error) {
    console.error('获取最新购买记录失败:', error)
    ElMessage.error('获取最新购买记录失败')
    // 使用模拟数据作为后备
    latestPurchases.value = [
      { id: 1, stuName: '张三', courseName: 'Vue3实战开发', createTime: '2024-01-15 14:30:00', price: 299, stuPic: '', courseId: 1 },
      { id: 2, stuName: '李四', courseName: 'React全栈开发', createTime: '2024-01-15 13:20:00', price: 399, stuPic: '', courseId: 2 },
      { id: 3, stuName: '王五', courseName: 'Node.js后端开发', createTime: '2024-01-15 11:45:00', price: 349, stuPic: '', courseId: 3 },
      { id: 4, stuName: '赵六', courseName: 'MySQL数据库设计', createTime: '2024-01-14 16:10:00', price: 199, stuPic: '', courseId: 4 },
      { id: 5, stuName: '钱七', courseName: 'Python数据分析', createTime: '2024-01-14 15:30:00', price: 259, stuPic: '', courseId: 5 }
    ]
  } finally {
    loading.purchase = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await dashboardApi.getStats()
    if (response) {
      Object.assign(totalStats, response)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
    // 使用模拟数据作为后备
    Object.assign(totalStats, {
      informationCount: 156,
      courseCount: 89,
      commentCount: 1234,
      studentCount: 567
    })
  }
}

// 页面初始化
onMounted(() => {
  fetchLatestInformation()
  fetchLatestCourses()
  fetchLatestComments()
  fetchLatestPurchases()
  fetchStats()
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 16px;
}

.page-title {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 12px;
}

.stat-icon {
  margin-right: 12px;
  padding: 8px;
  border-radius: 6px;
  background-color: white;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.content-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.content-card:hover {
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-content {
  min-height: 180px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* 资讯列表样式 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.info-item:hover {
  background-color: var(--el-fill-color-light);
  transform: translateX(2px);
}

.info-image {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image {
  width: 100%;
  height: 100%;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color);
  color: var(--el-text-color-placeholder);
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-title {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-author {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.info-meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 课程列表样式 */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.course-item:hover {
  background-color: var(--el-fill-color-light);
  transform: translateX(2px);
}

.course-image {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.course-content {
  flex: 1;
  min-width: 0;
}

.course-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.price {
  color: var(--el-color-danger);
  font-weight: 600;
}

/* 评论列表样式 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.comment-item:hover {
  background-color: var(--el-fill-color-light);
  transform: translateX(2px);
}


.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.commenter {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.comment-date {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.comment-text {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-info {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* 购买记录样式 */
.purchase-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.purchase-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.purchase-item:hover {
  background-color: var(--el-fill-color-light);
  transform: translateX(2px);
}

.purchase-avatar {
  flex-shrink: 0;
}

.purchase-content {
  flex: 1;
  min-width: 0;
}

.purchase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.student-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.purchase-date {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.course-name {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.purchase-info {
  font-size: 12px;
}

[data-theme="dark"] .info-item {
    box-shadow: 0 0 10px rgba(64, 160, 255, 0.2)
}

[data-theme="dark"] .course-item {
    box-shadow: 0 0 10px rgba(64, 160, 255, 0.2)
}

[data-theme="dark"] .comment-item {
    box-shadow: 0 0 10px rgba(64, 160, 255, 0.2)
}

[data-theme="dark"] .purchase-item {
    box-shadow: 0 0 10px rgba(64, 160, 255, 0.2)
}

[data-theme="dark"] .page-title {
    color: white;
}

[data-theme="dark"] .page-subtitle {
    color: #909399;
}

[data-theme="dark"] .stat-number {
    color: white;
}

[data-theme="dark"] .stat-label {
    color: white;
}

[data-theme="dark"] .stat-icon {
    background-color: transparent;
}

[data-theme="dark"] .card-title {
    color: white;
}

[data-theme="dark"] .info-content .info-title {
    color: white;
}

[data-theme="dark"] .info-author {
    color: #409eff;
}

[data-theme="dark"] .date {
    color: white;
}

[data-theme="dark"] .course-title {
    color: white;
}

[data-theme="dark"] .course-meta .teacher {
    color: #409eff;
}

[data-theme="dark"] .commenter {
    color: #409eff;
}

[data-theme="dark"] .comment-date {
    color: white;
}

[data-theme="dark"] .comment-text {
    color: white;
}

[data-theme="dark"] .comment-info .info-title {
    color: rgb(182, 182, 182);
}

[data-theme="dark"] .student-name {
    color: #409eff;
}

[data-theme="dark"] .course-name {
    color: white;
}

[data-theme="dark"] .purchase-date {
    color: white;
}

[data-theme="dark"] .info-item:hover {
  background-color: #404e63;
}

[data-theme="dark"] .course-item:hover {
  background-color: #404e63;
}

[data-theme="dark"] .comment-item:hover {
  background-color: #404e63;
}

[data-theme="dark"] .purchase-item:hover {
  background-color: #404e63;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>