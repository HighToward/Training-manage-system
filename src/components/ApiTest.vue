<template>
  <div class="api-test">
    <h3>API连接测试</h3>
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
    />
    <el-alert
      v-if="success"
      :title="success"
      type="success"
      :closable="false"
      show-icon
    />
    <div class="test-info" v-if="testInfo">
      <pre>{{ testInfo }}</pre>
    </div>
    <div class="actions">
      <el-button type="primary" @click="testApi" :loading="loading">测试API连接</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const error = ref('')
const success = ref('')
const loading = ref(false)
const testInfo = ref('')

const testApi = async () => {
  error.value = ''
  success.value = ''
  testInfo.value = ''
  loading.value = true
  
  try {
    // 创建一个新的axios实例用于测试，不使用拦截器
    const testAxios = axios.create({
      timeout: 10000
    })
    
    // 测试1: 直接访问API地址
    testInfo.value += '测试1: 直接访问API地址\n'
    try {
      const response1 = await testAxios.get('http://localhost:8080/api/course/types')
      testInfo.value += `✅ 直接访问成功: ${JSON.stringify(response1.data)}\n\n`
    } catch (err) {
      testInfo.value += `❌ 直接访问失败: ${err.message}\n`
      if (err.response) {
        testInfo.value += `状态码: ${err.response.status}\n`
      } else if (err.request) {
        testInfo.value += `未收到响应，API服务器可能未运行\n`
      }
      testInfo.value += '\n'
    }
    
    // 测试2: 通过相对路径访问
    testInfo.value += '测试2: 通过相对路径访问\n'
    try {
      const response2 = await testAxios.get('/api/course/types')
      testInfo.value += `✅ 相对路径访问成功: ${JSON.stringify(response2.data)}\n\n`
    } catch (err) {
      testInfo.value += `❌ 相对路径访问失败: ${err.message}\n`
      if (err.response) {
        testInfo.value += `状态码: ${err.response.status}\n`
      } else if (err.request) {
        testInfo.value += `未收到响应\n`
      }
      testInfo.value += '\n'
    }
    
    // 测试3: 使用项目配置的API
    testInfo.value += '测试3: 使用项目配置的API\n'
    try {
      const { courseApi } = await import('@/api')
      const response3 = await courseApi.getCourseTypeTree()
      testInfo.value += `✅ 项目API访问成功: ${JSON.stringify(response3)}\n`
      success.value = 'API连接测试成功！'
    } catch (err) {
      testInfo.value += `❌ 项目API访问失败: ${err.message}\n`
      if (err.response) {
        testInfo.value += `状态码: ${err.response.status}\n`
        testInfo.value += `错误数据: ${JSON.stringify(err.response.data)}\n`
      } else if (err.request) {
        testInfo.value += `未收到响应\n`
      }
      error.value = 'API连接测试失败，请查看详细信息'
    }
    
  } catch (err) {
    error.value = `测试过程出错: ${err.message}`
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.api-test {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.test-info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
  overflow: auto;
  max-height: 400px;
}

.actions {
  margin-top: 20px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>