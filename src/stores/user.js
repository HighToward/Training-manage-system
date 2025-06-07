import { defineStore } from 'pinia'
import { userApi, authApi } from '@/api'  // 同时导入 authApi

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: localStorage.getItem('token') || null,
    tokenExpiry: localStorage.getItem('tokenExpiry') || null
  }),

  getters: {
    isAuthenticated: (state) => {
      if (!state.token || !state.tokenExpiry) return false
      return new Date().getTime() < parseInt(state.tokenExpiry)
    },
    
    userName: (state) => state.userInfo?.teaName || '教师',
    
    userAvatar: (state) => state.userInfo?.pic || null,
    
    userId: (state) => state.userInfo?.id || null
  },

  actions: {
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },

    // 设置token
    setToken(token, expiry) {
      this.token = token
      this.tokenExpiry = expiry
      localStorage.setItem('token', token)
      localStorage.setItem('tokenExpiry', expiry.toString())
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const response = await userApi.getCurrentUserInfo()
        this.setUserInfo(response)
        return response
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },

    // 更新用户资料
    async updateProfile(profileData) {
      try {
        await userApi.updateProfile(profileData)
        // 更新成功后重新获取用户信息
        await this.fetchUserInfo()
        return true
      } catch (error) {
        console.error('更新用户资料失败:', error)
        throw error
      }
    },

    // 上传头像
    async uploadAvatar(formData) {
      try {
        const response = await userApi.uploadAvatar(formData)
        // 上传成功后更新用户信息中的头像
        if (this.userInfo) {
          this.userInfo.pic = response.url
          this.setUserInfo(this.userInfo)
        }
        return response
      } catch (error) {
        console.error('上传头像失败:', error)
        throw error
      }
    },

    // 登录 - 修改为使用 authApi
    async login(loginData) {
      try {
        const response = await authApi.login(loginData)  // 使用 authApi 而不是 userApi
        
        // 处理登录响应，设置token和过期时间
        const token = response.token || response.access_token
        const expiry = response.expiry || (new Date().getTime() + 24 * 60 * 60 * 1000) // 默认24小时
        
        this.setToken(token, expiry)
        
        // 登录成功后获取用户信息
        await this.fetchUserInfo()
        
        return response
      } catch (error) {
        throw error
      }
    },

    // 登出
    logout() {
      this.userInfo = null
      this.token = null
      this.tokenExpiry = null
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpiry')
      localStorage.removeItem('userInfo')
    },

    // 初始化用户状态
    initializeUser() {
      const savedUserInfo = localStorage.getItem('userInfo')
      if (savedUserInfo) {
        this.userInfo = JSON.parse(savedUserInfo)
      }
      
      // 如果有token且未过期，获取最新用户信息
      if (this.isAuthenticated) {
        this.fetchUserInfo().catch(() => {
          // 如果获取失败，清除本地状态
          this.logout()
        })
      }
    }
  }
})