import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api/', // 添加斜杠确保路径正确，Vite代理会将/api替换为空，所以这里需要保留斜杠
  timeout: 10000,
  withCredentials: true // 如果需要携带cookie
})

// 请求拦截器 - 添加token到请求头
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    // 不需要token验证的接口白名单
    const publicApis = ['/auth/login', '/auth/register'];
    const isPublicApi = publicApis.some(api => config.url && config.url.includes(api));
    
    // 检查token是否过期（排除公共接口）
    if (!isPublicApi && token && tokenExpiry) {
      const now = new Date().getTime();
      if (now > parseInt(tokenExpiry)) {
        // token已过期，清除本地存储
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userInfo');
        // 不要强制跳转，让路由守卫处理
        return Promise.reject(new Error('TOKEN_EXPIRED'));
      }
    }
    
    // 添加token到请求头（排除公共接口）
    if (!isPublicApi && token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    const data = response.data;
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === 200) {
        return data.data;
      } else {
        return Promise.reject(new Error(data.message || '请求失败'));
      }
    } else {
      return Promise.reject(new Error('服务器响应格式错误'));
    }
  },
  error => {
    let errorMessage = '网络请求异常，请稍后再试';
    
    if (error.response) {
      // 处理401未授权错误
      if (error.response.status === 401) {
        // 检查是否是登录接口的401错误
        const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
        
        if (isLoginRequest) {
          // 登录接口的401错误，说明账号密码错误，不清除token，不跳转
          const errorData = error.response.data;
          if (errorData && errorData.message) {
            errorMessage = errorData.message; // 使用后端返回的具体错误信息
          } else {
            errorMessage = '账号或密码错误';
          }
        } else {
          // 非登录接口的401错误，说明token过期，清除token并跳转
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
          return Promise.reject(new Error('登录已过期，请重新登录'));
        }
      } else {
        // 处理其他HTTP错误
        const errorData = error.response.data;
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string' && errorData.length > 0 && errorData.length < 200) {
          errorMessage = errorData;
        } else if (error.response.statusText) {
          errorMessage = `服务器错误 (${error.response.status}: ${error.response.statusText})`;
        }
      }
    } else if (error.request) {
      errorMessage = '无法连接到服务器，请检查网络连接或API服务是否运行';
    } else {
      errorMessage = error.message || '请求发送失败';
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

// 课程相关API
export const courseApi = {
  // 获取课程列表
  getCourseList(params) {
    // 处理数组参数
    const requestParams = {
      ...params,
      couTypeIds: params.couTypeIds?.join(',') // 将数组转换为逗号分隔的字符串
    }
    
    return api.get('/course/list', { 
      params: requestParams // Use the processed params
    });
  },
  // 获取课程详情
  getCourseById(id) {
    return api.get(`/course/${id}`);
  },
  // 创建课程 (对应后端 saveCourse)
  createCourse(data) {
    return api.post('/course', data);
  },
  // 更新课程
  updateCourse(data) {
    return api.put('/course', data);
  },
  // 删除课程
  deleteCourse(id) {
    return api.delete(`/course/${id}`);
  },
  // 获取课程类型树
  getCourseTypeTree() {
    return api.get('/course/types'); // Corrected endpoint
  }
};

// 章节相关API
export const chapterApi = {
  // 获取章节列表
  getChapterList(courseId) {
    return api.get(`/chapter/list/${courseId}`)
  },
  // 获取所有章节
  getAllChapters() {
    return api.get('/chapter/all')
  },
  // 获取课程信息
  getCourseInfo(courseId) {
    return api.get(`/chapter/course/${courseId}`)
  },
  // 创建章节
  createChapter(data) {
    return api.post('/chapter', data)
  },
  // 更新章节
  updateChapter(data) {
    return api.put('/chapter', data)
  },
  // 删除章节
  deleteChapter(id) {
    return api.delete(`/chapter/${id}`)
  },
  // 批量保存章节
  batchSaveChapters(data) {
    return api.post('/chapter/batch', data)
  }
}

// 文件上传相关API
export const fileUploadApi = {
  // 上传视频文件
  uploadVideo(file) {
    const formData = new FormData();
    formData.append('file', file);
    // api 实例上的全局请求拦截器会自动添加 token (如果 localStorage 中有)
    // 全局响应拦截器会处理后端返回的 Result<T> 对象:
    // - 如果后端 code === 200, 拦截器会直接返回 Result.data (即后端生成的 fileUrl 字符串)
    // - 如果后端 code !== 200 或发生网络错误, 拦截器会返回一个 Promise.reject(new Error(...))
    return api.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    // 这里不再需要 .then() 和 .catch()，具体的 Promise 处理交给调用它的组件 (ChapterManage.vue)
  }
};



// 教师相关API
export const teacherApi = {
  // 获取教师列表
  getTeacherList() {
    return api.get('/teacher/list')
  }
}

// 课程类型相关API
export const courseTypeApi = {
  // getCourseTypeTree() { // MOVED to courseApi
  //   return api.get('/course-type/tree')
  // },
  // 根据父类型ID获取子类型
  getChildrenByParentId(parentId) {
    return api.get(`/course/type/children/${parentId}`); // 更新为与后端控制器匹配的路径
  },
  // 根据ID获取类型详情
  getTypeById(id) {
    return api.get(`/course/type/${id}`); // 更新为与后端控制器匹配的路径
  }
}

// 班级管理相关API
export const classApi = {
  // --- 班级信息维护 ---
  getClassList: (params) => api.get('/class/list', { params }),
  getAllClasses: () => api.get('/class/all'),
  getClassById: (id) => api.get(`/class/${id}`),
  createClass: (data) => api.post('/class', data),
  updateClass: (data) => api.put('/class', data),
  deleteClass: (id) => api.delete(`/class/${id}`),

  // --- 班级学生管理 ---
  getStudentsByClassId: (classId) => api.get(`/class/${classId}/students`), // <--- 您需要这个
  getAvailableStudentsForClass: (classId) => api.get(`/class/${classId}/available-students`),
  addStudentToClass: (classId, studentId) => api.post(`/class/${classId}/students/${studentId}`),
  removeStudentFromClass: (classId, studentId) => api.delete(`/class/${classId}/students/${studentId}`),

  // --- 班级课程管理 ---
  getCoursesByClassId: (classId) => api.get(`/class/${classId}/courses`), // <--- 您需要这个
  getAvailableCoursesForClass: (classId) => api.get(`/class/${classId}/available-courses`),
  addCourseToClass: (classId, courseId) => api.post(`/class/${classId}/courses/${courseId}`),
  removeCourseFromClass: (classId, courseId) => api.delete(`/class/${classId}/courses/${courseId}`),
};

export const studentApi = {
  // Method needed by ClassStudentManage.vue to get all students for selection
  getAllStudents: () => api.get('/student/all-active'), // Example endpoint, create in backend

  // If you build a full student management CRUD:
  // getStudentList: (params) => api.get('/student/list', { params }),
  // getStudentById: (id) => api.get(`/student/${id}`),
  // createStudent: (data) => api.post('/student', data),
  // updateStudent: (data) => api.put('/student', data),
  // deleteStudent: (id) => api.delete(`/student/${id}`),
};

// 认证相关API
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  // logout: () => api.post('/auth/logout'), // 如果需要登出接口
  // getCurrentUser: () => api.get('/auth/me'), // 如果需要获取当前用户信息接口
};

export default api;