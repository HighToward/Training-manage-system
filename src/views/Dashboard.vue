<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
      <p class="page-subtitle">欢迎回来，{{ userInfo?.teaName || '教师' }}！</p>
    </div>

    <!-- 快速统计卡片 -->
    <div class="quick-stats">
      <div class="quick-stat-item">
        <div class="quick-stat-icon">
          <el-icon size="20" color="#667eea"><Document /></el-icon>
        </div>
        <div class="quick-stat-info">
          <div class="quick-stat-number">{{ totalStats.informationCount }}</div>
          <div class="quick-stat-label">资讯文章</div>
        </div>
      </div>
      
      <div class="quick-stat-item">
        <div class="quick-stat-icon">
          <el-icon size="20" color="#f093fb"><School /></el-icon>
        </div>
        <div class="quick-stat-info">
          <div class="quick-stat-number">{{ totalStats.courseCount }}</div>
          <div class="quick-stat-label">课程数量</div>
        </div>
      </div>
      
      <div class="quick-stat-item">
        <div class="quick-stat-icon">
          <el-icon size="20" color="#4facfe"><ChatDotRound /></el-icon>
        </div>
        <div class="quick-stat-info">
          <div class="quick-stat-number">{{ totalStats.commentCount }}</div>
          <div class="quick-stat-label">评论数量</div>
        </div>
      </div>
      
      <div class="quick-stat-item">
        <div class="quick-stat-icon">
          <el-icon size="20" color="#43e97b"><User /></el-icon>
        </div>
        <div class="quick-stat-info">
          <div class="quick-stat-number">{{ totalStats.studentCount }}</div>
          <div class="quick-stat-label">学生数量</div>
        </div>
      </div>
    </div>
    
    <!-- 数据统计概览图表 -->
    <div class="chart-section">
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="chart-header">
            <h3 class="chart-title">
              <el-icon><TrendCharts /></el-icon>
              数据统计概览
            </h3>
          </div>
        </template>
        <div class="chart-container">
          <v-chart 
            class="chart" 
            :option="combinedChartOption" 
            autoresize
          />
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
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
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

// 注册ECharts组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

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

// 主题状态响应式监听
const isDarkMode = ref(false)

// 监听主题变化
const updateTheme = () => {
  isDarkMode.value = document.documentElement.getAttribute('data-theme') === 'dark'
}

// 综合图表配置（饼图+柱状图组合）
const combinedChartOption = computed(() => {
  const isDark = isDarkMode.value
  return {
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#e2e8f0' : '#303133'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        if (params.seriesType === 'pie') {
          return `${params.seriesName}<br/>${params.name}: ${params.value} (${params.percent}%)`
        } else {
          return `${params.seriesName}<br/>${params.name}: ${params.value}`
        }
      },
      backgroundColor: isDark ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#4a5568' : '#e6e6e6',
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#e2e8f0' : '#303133'
      },
      shadowBlur: 10,
      shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 15,
      textStyle: {
        color: isDark ? '#e2e8f0' : '#303133',
        fontSize: 12
      },
      itemGap: 20
    },
    grid: {
      left: '55%',
      right: '5%',
      top: '15%',
      bottom: '25%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: {
        show: true,
        lineStyle: {
          color: isDark ? '#4a5568' : '#e6e6e6'
        }
      },
      axisLabel: {
        color: isDark ? '#e2e8f0' : '#303133',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: isDark ? '#374151' : '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: ['学生数量', '评论数量', '课程数量', '资讯文章'],
      axisLine: {
        show: true,
        lineStyle: {
          color: isDark ? '#4a5568' : '#e6e6e6'
        }
      },
      axisLabel: {
        color: isDark ? '#e2e8f0' : '#303133',
        fontSize: 11
      }
    },
    series: [
      // 饼图系列
      {
        name: '数据分布',
        type: 'pie',
        radius: ['30%', '50%'],
        center: ['25%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: isDark ? '#2d3748' : '#fff',
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c}',
          fontSize: 11,
          color: isDark ? '#e2e8f0' : '#303133',
          fontWeight: 'bold'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)'
          },
          label: {
            fontSize: 13
          }
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: isDark ? '#4a5568' : '#d1d5db'
          }
        },
        data: [
          {
            value: totalStats.informationCount,
            name: '资讯文章',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 1,
                colorStops: [
                  { offset: 0, color: isDark ? '#818cf8' : '#667eea' },
                  { offset: 1, color: isDark ? '#a78bfa' : '#764ba2' }
                ]
              }
            }
          },
          {
            value: totalStats.courseCount,
            name: '课程数量',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 1,
                colorStops: [
                  { offset: 0, color: isDark ? '#fb7185' : '#f093fb' },
                  { offset: 1, color: isDark ? '#f87171' : '#f5576c' }
                ]
              }
            }
          },
          {
            value: totalStats.commentCount,
            name: '评论数量',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 1,
                colorStops: [
                  { offset: 0, color: isDark ? '#60a5fa' : '#4facfe' },
                  { offset: 1, color: isDark ? '#06b6d4' : '#00f2fe' }
                ]
              }
            }
          },
          {
            value: totalStats.studentCount,
            name: '学生数量',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 1,
                colorStops: [
                  { offset: 0, color: isDark ? '#34d399' : '#43e97b' },
                  { offset: 1, color: isDark ? '#10b981' : '#38f9d7' }
                ]
              }
            }
          }
        ]
      },
      // 柱状图系列
      {
        name: '数据对比',
        type: 'bar',
        data: [
          {
            value: totalStats.studentCount,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: isDark ? '#34d399' : '#43e97b' },
                  { offset: 1, color: isDark ? '#10b981' : '#38f9d7' }
                ]
              },
              borderRadius: [0, 4, 4, 0]
            }
          },
          {
            value: totalStats.commentCount,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: isDark ? '#60a5fa' : '#4facfe' },
                  { offset: 1, color: isDark ? '#06b6d4' : '#00f2fe' }
                ]
              },
              borderRadius: [0, 4, 4, 0]
            }
          },
          {
            value: totalStats.courseCount,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: isDark ? '#fb7185' : '#f093fb' },
                  { offset: 1, color: isDark ? '#f87171' : '#f5576c' }
                ]
              },
              borderRadius: [0, 4, 4, 0]
            }
          },
          {
            value: totalStats.informationCount,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: isDark ? '#818cf8' : '#667eea' },
                  { offset: 1, color: isDark ? '#a78bfa' : '#764ba2' }
                ]
              },
              borderRadius: [0, 4, 4, 0]
            }
          }
        ],
        barWidth: '50%',
        itemStyle: {
          shadowBlur: 5,
          shadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    ]
  }
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
  // 初始化主题状态
  updateTheme()
  
  // 监听主题变化
  const observer = new MutationObserver(() => {
    updateTheme()
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
  
  // 获取数据
  fetchLatestInformation()
  fetchLatestCourses()
  fetchLatestComments()
  fetchLatestPurchases()
  fetchStats()
  
  // 组件卸载时清理监听器
  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<style scoped>
/* 现代化仪表盘样式 */
.dashboard-container {
  padding: 16px;
  min-height: calc(100vh - 60px);
  transition: all 0.3s ease;
}

/* 页面头部 */
.page-header {
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

[data-theme="dark"] .page-title {
  background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 16px;
  font-weight: 400;
  opacity: 0.8;
  text-align: center;
}

[data-theme="dark"] .page-subtitle {
  color: #e0e0e0;
}

/* 图表区域 */
.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
}

.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

[data-theme="dark"] .chart-card {
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .chart-card::before {
  background: linear-gradient(90deg, #64b5f6 0%, #42a5f5 100%);
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .chart-card:hover {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

[data-theme="dark"] .chart-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.1) 0%, rgba(66, 165, 245, 0.1) 100%);
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

[data-theme="dark"] .chart-title {
  color: #ffffff;
}

.chart-container {
  padding: 20px;
  height: 350px;
}

.chart {
  width: 100%;
  height: 100%;
}

/* 快速统计卡片 */
.quick-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.quick-stats .quick-stat-item {
  flex: 1;
}

.quick-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .quick-stat-item {
  background: rgba(45, 55, 72, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

[data-theme="dark"] .quick-stat-item::before {
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.1) 0%, rgba(66, 165, 245, 0.1) 100%);
}

.quick-stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .quick-stat-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.quick-stat-item:hover::before {
  opacity: 1;
}

.quick-stat-icon {
  padding: 8px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

[data-theme="dark"] .quick-stat-icon {
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.2) 0%, rgba(66, 165, 245, 0.2) 100%);
}

.quick-stat-item:hover .quick-stat-icon {
  transform: scale(1.1);
}

.quick-stat-info {
  flex: 1;
}

.quick-stat-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-theme="dark"] .quick-stat-number {
  background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quick-stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

[data-theme="dark"] .quick-stat-label {
  color: #b0bec5;
}

/* 内容网格布局 - 一行四列 */
.content-grid {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.content-grid .content-card {
  flex: 1;
  min-width: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-grid {
    flex-wrap: wrap;
  }
  
  .content-grid .content-card {
    flex: 1 1 calc(50% - 8px);
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .quick-stats {
    flex-wrap: wrap;
  }
  
  .quick-stats .quick-stat-item {
    flex: 1 1 calc(50% - 8px);
    min-width: 140px;
  }
  
  .content-grid {
    flex-direction: column;
  }
  
  .content-grid .content-card {
    flex: none;
    min-width: auto;
  }
}

.content-card {
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

[data-theme="dark"] .content-card {
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .content-card:hover {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

[data-theme="dark"] .card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.1) 0%, rgba(66, 165, 245, 0.1) 100%);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

[data-theme="dark"] .card-title {
  color: #ffffff;
}

.card-content {
  min-height: 200px;
  padding: 20px 24px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  opacity: 0.6;
}

/* 列表项通用样式 - 现代化设计 */
.info-list,
.course-list,
.comment-list,
.purchase-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item,
.course-item,
.comment-item,
.purchase-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .info-item,
[data-theme="dark"] .course-item,
[data-theme="dark"] .comment-item,
[data-theme="dark"] .purchase-item {
  background: rgba(55, 65, 81, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item::before,
.course-item::before,
.comment-item::before,
.purchase-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

[data-theme="dark"] .info-item::before,
[data-theme="dark"] .course-item::before,
[data-theme="dark"] .comment-item::before,
[data-theme="dark"] .purchase-item::before {
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.1) 0%, rgba(66, 165, 245, 0.1) 100%);
}

.info-item:hover,
.course-item:hover,
.comment-item:hover,
.purchase-item:hover {
  transform: translateX(8px) translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .info-item:hover,
[data-theme="dark"] .course-item:hover,
[data-theme="dark"] .comment-item:hover,
[data-theme="dark"] .purchase-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.info-item:hover::before,
.course-item:hover::before,
.comment-item:hover::before,
.purchase-item:hover::before {
  opacity: 1;
}

/* 图片和头像样式 */
.info-image,
.course-image {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.info-item:hover .item-image,
.course-item:hover .item-image {
  transform: scale(1.1);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f2f5 0%, #e1e5e9 100%);
  color: var(--el-text-color-placeholder);
}

[data-theme="dark"] .no-image {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  color: #9ca3af;
}

.comment-avatar,
.purchase-avatar {
  flex-shrink: 0;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
}

/* 内容样式 */
.info-content,
.course-content,
.comment-content,
.purchase-content {
  flex: 1;
  min-width: 0;
}

.info-title,
.course-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

[data-theme="dark"] .info-title,
[data-theme="dark"] .course-title {
  color: #ffffff;
}

.info-author {
  font-size: 13px;
  color: #667eea;
  margin-bottom: 6px;
  font-weight: 500;
}

[data-theme="dark"] .info-author {
  color: #64b5f6;
}

.info-meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-regular);
  opacity: 0.8;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-top: 4px;
}

.course-meta .teacher {
  color: #667eea;
  font-weight: 500;
}

[data-theme="dark"] .course-meta .teacher {
  color: #64b5f6;
}

.price {
  color: #f56565;
  font-weight: 700;
  font-size: 16px;
}

[data-theme="dark"] .price {
  color: #fc8181;
}

/* 评论样式 */
.comment-header,
.purchase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.commenter,
.student-name {
  font-size: 15px;
  font-weight: 600;
  color: #667eea;
}

[data-theme="dark"] .commenter,
[data-theme="dark"] .student-name {
  color: #64b5f6;
}

.comment-date,
.purchase-date {
  font-size: 12px;
  color: var(--el-text-color-regular);
  opacity: 0.8;
}

.comment-text {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

[data-theme="dark"] .comment-text {
  color: #e2e8f0;
}

.comment-info,
.purchase-info {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  opacity: 0.7;
}

.course-name {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
}

[data-theme="dark"] .course-name {
  color: #e2e8f0;
}

/* 响应式设计 - 移动端优化 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .page-header {
    margin-bottom: 24px;
    padding: 16px 0;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .stat-content {
    padding: 20px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .card-header {
    padding: 16px 20px;
  }
  
  .card-title {
    font-size: 16px;
  }
  
  .card-content {
    padding: 16px 20px;
    min-height: 180px;
  }
  
  .info-item,
  .course-item,
  .comment-item,
  .purchase-item {
    padding: 12px;
    gap: 12px;
  }
  
  .info-image,
  .course-image {
    width: 48px;
    height: 48px;
  }
  
  .info-title,
  .course-title {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 12px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }
  
  .stat-content {
    padding: 16px;
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .content-grid {
    gap: 16px;
  }
  
  .card-header {
    padding: 12px 16px;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .card-content {
    padding: 12px 16px;
  }
  
  .info-item:hover,
  .course-item:hover,
  .comment-item:hover,
  .purchase-item:hover {
    transform: translateY(-2px);
  }
}

/* 动画效果 */
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

.stat-card,
.content-card {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.content-card:nth-child(1) { animation-delay: 0.5s; }
.content-card:nth-child(2) { animation-delay: 0.6s; }
</style>