import { defineStore } from 'pinia'

export const useViewModeStore = defineStore('viewMode', {
  state: () => ({
    // 各个页面的视图模式偏好
    courseListViewMode: localStorage.getItem('courseListViewMode') || 'card',
    classListViewMode: localStorage.getItem('classListViewMode') || 'card',
    informationListViewMode: localStorage.getItem('informationListViewMode') || 'card',
    questionListViewMode: localStorage.getItem('questionListViewMode') || 'list',
    // 导航栏布局模式：'sidebar' 或 'topbar'
    navigationLayout: localStorage.getItem('navigationLayout') || 'sidebar',
    // 侧边栏折叠状态
    sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true' || false
  }),

  getters: {
    // 获取课程列表视图模式
    getCourseListViewMode: (state) => state.courseListViewMode,
    
    // 获取班级列表视图模式
    getClassListViewMode: (state) => state.classListViewMode,
    
    // 获取资讯列表视图模式
    getInformationListViewMode: (state) => state.informationListViewMode,
    
    // 获取问题列表视图模式
    getQuestionListViewMode: (state) => state.questionListViewMode,
    
    // 获取导航栏布局模式
    getNavigationLayout: (state) => state.navigationLayout,
    
    // 判断是否为侧边栏模式
    isSidebarLayout: (state) => state.navigationLayout === 'sidebar',
    
    // 判断是否为顶部导航栏模式
    isTopbarLayout: (state) => state.navigationLayout === 'topbar',
    
    // 获取侧边栏折叠状态
    getSidebarCollapsed: (state) => state.sidebarCollapsed
  },

  actions: {
    // 设置课程列表视图模式
    setCourseListViewMode(mode) {
      this.courseListViewMode = mode
      localStorage.setItem('courseListViewMode', mode)
    },

    // 设置班级列表视图模式
    setClassListViewMode(mode) {
      this.classListViewMode = mode
      localStorage.setItem('classListViewMode', mode)
    },

    // 设置资讯列表视图模式
    setInformationListViewMode(mode) {
      this.informationListViewMode = mode
      localStorage.setItem('informationListViewMode', mode)
    },

    // 设置问题列表视图模式
    setQuestionListViewMode(mode) {
      this.questionListViewMode = mode
      localStorage.setItem('questionListViewMode', mode)
    },

    // 设置导航栏布局模式
    setNavigationLayout(layout) {
      this.navigationLayout = layout
      localStorage.setItem('navigationLayout', layout)
    },

    // 切换导航栏布局模式
    toggleNavigationLayout() {
      const newLayout = this.navigationLayout === 'sidebar' ? 'topbar' : 'sidebar'
      this.setNavigationLayout(newLayout)
    },

    // 设置侧边栏折叠状态
    setSidebarCollapsed(collapsed) {
      this.sidebarCollapsed = collapsed
      localStorage.setItem('sidebarCollapsed', collapsed.toString())
    },

    // 切换侧边栏折叠状态
    toggleSidebarCollapsed() {
      this.setSidebarCollapsed(!this.sidebarCollapsed)
    },

    // 通用方法：根据页面类型设置视图模式
    setViewMode(pageType, mode) {
      switch (pageType) {
        case 'course':
          this.setCourseListViewMode(mode)
          break
        case 'class':
          this.setClassListViewMode(mode)
          break
        case 'information':
          this.setInformationListViewMode(mode)
          break
        case 'question':
          this.setQuestionListViewMode(mode)
          break
        default:
          console.warn('未知的页面类型:', pageType)
      }
    },

    // 通用方法：根据页面类型获取视图模式
    getViewMode(pageType) {
      switch (pageType) {
        case 'course':
          return this.getCourseListViewMode
        case 'class':
          return this.getClassListViewMode
        case 'information':
          return this.getInformationListViewMode
        case 'question':
          return this.getQuestionListViewMode
        default:
          console.warn('未知的页面类型:', pageType)
          return 'card'
      }
    }
  }
})