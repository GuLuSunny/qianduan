<template>
  <div class="container">
    <!-- 表单部分 -->
    <div class="row">
      <el-form-item label="产品名称:">
        <el-input v-model="filename" placeholder="请输入产品名称" clearable style="width: 150px;"/>
      </el-form-item>
      <el-form-item label="所有者:" style="min-width: 0px;">
        <el-input v-model="owner" placeholder="请输入所有者" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="产品分类:">
        <el-select v-model="selectedClass" placeholder="请选择" clearable style="width: 130px;">
          <el-option v-for="classItem in classOptions" :key="classItem.value" 
            :value="classItem.value" :label="classItem.label" />
        </el-select>
      </el-form-item>
      <!-- 日期选择器 -->
      <el-form-item label="观测时间:">
        <div style="display: flex; gap: 10px; align-items: center;">
          <el-select 
            v-model="observationTimeType" 
            @change="handleObservationTimeTypeChange"
            style="width: 70px">
            <el-option label="年" value="year"></el-option>
            <el-option label="月" value="month"></el-option>
            <el-option label="日" value="day"></el-option>
          </el-select>
          <!-- 改为日期选择器 -->
          <el-date-picker
            v-model="observationTime"
            :type="getObservationTimePickerType()"
            :format="getObservationTimeFormat()"
            :value-format="getObservationTimeFormat()"
            placeholder="选择观测时间"
            clearable
            :disabled-date="disabledDate"
            style="width: 150px"
          />
        </div>
      </el-form-item>
      <!-- 开始时间（新增） -->
      <el-form-item label="开始时间:">
        <el-input 
          v-model="startTime" 
          placeholder="yyyy-mm-dd" 
          clearable
          style="width: 120px" />
      </el-form-item>
      <!-- 结束时间（新增） -->
      <el-form-item label="结束时间:">
        <el-input 
          v-model="endTime" 
          placeholder="yyyy-mm-dd" 
          clearable
          style="width: 120px" />
      </el-form-item>
      <!-- 搜索按钮 -->
      <el-form-item style="min-width: 100px;">
        <el-button @click="searchProducts" class="searchButton" type="primary">
          <el-icon>
            <Search />
          </el-icon>
          搜索
        </el-button>
      </el-form-item>
    </div>
    <!-- 图片展示部分 -->
    <div class="image-grid" v-if="currentImageIndex === null">
      <div class="image-item" v-for="(product, index) in productList" :key="index">
        <!-- 修复：使用缓存的图片URL，避免递归 -->
        <img v-if="isImage(product.type) && imageUrlCache[product.id]" 
             :src="imageUrlCache[product.id]" 
             alt="产品图片" 
             @click="showDetail(index)" />
        <div v-else-if="isImage(product.type)" class="image-placeholder">
          <el-icon size="60"><Picture /></el-icon>
          <p>加载中...</p>
        </div>
        <div v-else class="file-icon" @click="showDetail(index)">
          <el-icon size="80"><Document /></el-icon>
          <p>{{ product.type }} 文件</p>
        </div>
        <p>{{ product.filename }}</p>
        <el-button @click="showDetail(index)">详情</el-button>
        <el-button @click="downloadFile(product)" type="primary">下载</el-button>
      </div>
    </div>

    <!-- 分页控件 -->
    <div v-if="currentImageIndex === null" class="pagination">
      <el-pagination :current-page="currentPage" :page-size="itemsPerPage" :total="totalItems" :page-sizes="[10, 20, 30]"
        layout="total, sizes, prev, pager, next, jumper" @current-change="goToPage" @size-change="changePageSize"
        class="pagination" />
    </div>

   <!-- 详情视图 - 优化布局 -->
    <div v-if="currentImageIndex !== null" class="detail-view">
      <h2 class="title">{{ productDetail.filename }}</h2>
      <div class="detail-content">
        <div class="image-section">
          <!-- 修复：详情页也使用缓存 -->
          <el-image v-if="isImage(productDetail.type) && imageUrlCache[productDetail.id]"
            :src="imageUrlCache[productDetail.id]" 
            alt="产品图片" 
            class="product-image" 
            lazy />
          <div v-else-if="isImage(productDetail.type)" class="image-placeholder-large">
            <el-icon size="120"><Picture /></el-icon>
            <p>加载中...</p>
          </div>
          <div v-else class="file-icon-large">
            <el-icon size="120"><Document /></el-icon>
            <p>{{ productDetail.type }} 文件</p>
          </div>
        </div>
        <div class="info-section">
          <h3>基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">文件名称:</span>
              <span class="info-value">{{ productDetail.filename }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所有者:</span>
              <span class="info-value">{{ productDetail.owner }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">产品分类:</span>
              <span class="info-value">{{ productDetail.className }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">文件类型:</span>
              <span class="info-value">{{ productDetail.type }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">观测时间:</span>
              <span class="info-value">{{ productDetail.observationTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">开始时间:</span>
              <span class="info-value">{{ productDetail.startTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">结束时间:</span>
              <span class="info-value">{{ productDetail.endTime }}</span>
            </div>
          </div>
          <div class="actions">
            <el-button @click="downloadFile(productDetail)" type="primary" size="large">下载文件</el-button>
            <el-button @click="goBack" class="return-button">返回</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProductPageData, getModelClassName, getFilesByConditions, getTimesByType } from '@/api/getData'
import { Search, Document, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'

// 基本数据
const filename = ref('')
const owner = ref('')
const selectedClass = ref('')
const observationTime = ref('')  // 改为 observationTime
const observationTimeType = ref('day')  // 新增：观测时间类型
const startTime = ref('')  // 新增：开始时间
const endTime = ref('')    // 新增：结束时间
const currentImageIndex = ref(null)
// 分类数据
const classNames = ref([])
const showDateArr = ref([])

// 修复：计算分类选项，正确处理"所有"选项
const classOptions = computed(() => [
  { label: '所有', value: '' },
  ...classNames.value.map(item => ({ label: item, value: item }))
])

// 分页数据
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)

// 产品列表数据
const productList = ref([])
const productDetail = ref({})

// 修复：图片URL缓存 - 使用对象存储，避免递归
const imageUrlCache = ref({})
// 正在加载的图片ID集合，避免重复请求
const loadingImages = ref(new Set())

const loadingOptions = {
  lock: true,
  text: '数据加载中...',
  background: 'rgba(0, 0, 0, 0.7)'
}

// 判断是否为图片文件
const isImage = (fileType) => {
  const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
  return imageTypes.includes(fileType?.toLowerCase())
}

// 新增方法：观测时间类型变化时重新获取数据
const handleObservationTimeTypeChange = (type) => {
  observationTimeType.value = type
  observationTime.value = ''
}

// 新增：根据观测时间类型获取日期格式
const getObservationTimeFormat = () => {
  switch(observationTimeType.value) {
    case 'year':
      return 'YYYY'
    case 'month':
      return 'YYYY-MM'
    case 'day':
      return 'YYYY-MM-DD'
    default:
      return 'YYYY-MM-DD'
  }
}

// 新增：根据观测时间类型获取日期选择器类型
const getObservationTimePickerType = () => {
  switch(observationTimeType.value) {
    case 'year':
      return 'year'
    case 'month':
      return 'month'
    case 'day':
      return 'date'
    default:
      return 'date'
  }
}

// 修复：预加载图片，避免在模板中递归调用
const preloadImages = (products) => {
  products.forEach(product => {
    if (isImage(product.type) && product.id && !imageUrlCache.value[product.id] && !loadingImages.value.has(product.id)) {
      loadingImages.value.add(product.id)
      fetchImageFromApi(product)
    }
  })
}

// 通过接口获取图片
const fetchImageFromApi = (product) => {
  getFilesByConditions({
    ids: [product.id]
  })
    .then((res) => {
      const blob = new Blob([res.response?.value || res])
      const url = window.URL.createObjectURL(blob)
      // 直接更新缓存，不触发响应式更新
      imageUrlCache.value[product.id] = url
      loadingImages.value.delete(product.id)
    })
    .catch((error) => {
      console.error('获取图片失败:', error)
      loadingImages.value.delete(product.id)
    })
}

// 可用日期处理
function disabledDate(time) {
  if (!showDateArr.value || showDateArr.value.length === 0) {
    return false
  }
  
  const year = time.getFullYear()
  const month = (time.getMonth() + 1).toString().padStart(2, '0')
  const day = time.getDate().toString().padStart(2, '0')
  
    // 根据当前选择的观测时间类型检查对应的格式
  if (observationTimeType.value === 'year') {
    const yearStr = `${year}`
    return !showDateArr.value.some(dateStr => dateStr.length === 4 && dateStr === yearStr)
  } else if (observationTimeType.value === 'month') {
    const monthStr = `${year}-${month}`
    return !showDateArr.value.some(dateStr => dateStr.length === 7 && dateStr === monthStr)
  } else {
    // day
    const dayStr = `${year}-${month}-${day}`
    return !showDateArr.value.some(dateStr => dateStr.length === 10 && dateStr === dayStr)
  }
}

// 修改：获取可用日期（现在获取三种格式）
function fetchAvailableDates() {
  // 获取所有三种格式的时间
  Promise.all([
    getTimesByType({ type: 'modelproducts', searchTimeType: 'year' }),
    getTimesByType({ type: 'modelproducts', searchTimeType: 'month' }),
    getTimesByType({ type: 'modelproducts', searchTimeType: 'day' })
  ])
    .then(([yearRes, monthRes, dayRes]) => {
      const yearResult = yearRes.response?.value || yearRes
      const monthResult = monthRes.response?.value || monthRes
      const dayResult = dayRes.response?.value || dayRes
      
      const dates = []
      
      if (yearResult.code === 'SUCCESS') {
        dates.push(...(yearResult.body?.date || []))
      }
      if (monthResult.code === 'SUCCESS') {
        dates.push(...(monthResult.body?.date || []))
      }
      if (dayResult.code === 'SUCCESS') {
        dates.push(...(dayResult.body?.date || []))
      }
      
      showDateArr.value = [...new Set(dates)]  // 去重
    })
    .catch((error) => {
      console.error('获取日期数据失败:', error)
    })
}

// 修改：获取所有产品数据
function fetchAllProducts() {
  const loadingInstance = ElLoading.service(loadingOptions)
  
  const params = {
    filename: filename.value,
    owner: owner.value,
    className: selectedClass.value === '' ? null : selectedClass.value,
    observationTime: observationTime.value || null,  // 改为 observationTime
    startTime: startTime.value || null,  // 新增：开始时间
    endTime: endTime.value || null,      // 新增：结束时间
    currentPage: currentPage.value,
    pageSize: itemsPerPage.value
  }

  // 清理空值参数
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === undefined || params[key] === '') {
      delete params[key]
    }
  })
  
  getProductPageData(params)
    .then((res) => {
      loadingInstance.close()
      const response = res.response?.value || res
      if (response.code === 'SUCCESS') {
        const body = response.body
        productList.value = body.records || []
        totalItems.value = body.total || 0
        
        // 修复：预加载图片，避免在模板中递归调用
        preloadImages(productList.value)
      } else {
        ElMessage.warning(response.msg || '获取产品数据失败')
      }
    })
    .catch((error) => {
      loadingInstance.close()
      console.error('获取产品数据失败:', error)
      ElMessage.error('获取产品数据失败，请稍后再试')
    })
}
// 显示详情
function showDetail(index) {
  currentImageIndex.value = index
  productDetail.value = productList.value[index]
  
  // 确保详情图片已加载
  if (isImage(productDetail.value.type) && productDetail.value.id && 
      !imageUrlCache.value[productDetail.value.id] && 
      !loadingImages.value.has(productDetail.value.id)) {
    loadingImages.value.add(productDetail.value.id)
    fetchImageFromApi(productDetail.value)
  }
}

// 返回列表
function goBack() {
  currentImageIndex.value = null
}

// 搜索时重置分页但不强制返回
function searchProducts() {
  currentPage.value = 1
  fetchAllProducts()
}

// 分页功能
function goToPage(page) {
  currentPage.value = page
  fetchAllProducts()
}

// 修改每页显示记录数
function changePageSize(newSize) {
  itemsPerPage.value = newSize
  currentPage.value = 1
  fetchAllProducts()
}

// 下载文件 - 修复跨平台兼容性
function downloadFile(product) {
  const loadingInstance = ElLoading.service(loadingOptions)
  getFilesByConditions({
    ids: [product.id]
  })
    .then((res) => {
      loadingInstance.close()
      
      // 创建 Blob 对象，设置正确的 MIME 类型
      const blob = new Blob([res], { 
        type: getMimeType(product.filename) 
      })
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 设置下载文件名 - 兼容 Linux 和 Windows
      const fileName = product.filename || `download_${product.id}`
      link.setAttribute('download', fileName)
      
      // 兼容不同平台的下载方式
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 释放 URL 对象
      window.URL.revokeObjectURL(url)
      
      ElMessage({
        showClose: true,
        message: '下载成功',
        center: true,
        type: 'success'
      })
    })
    .catch((error) => {
      loadingInstance.close()
      console.error('下载失败:', error)
      ElMessage.error('下载失败，请稍后再试')
    })
}

// 根据文件名获取 MIME 类型
function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const mimeTypes = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'zip': 'application/zip'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// 修改：获取产品分类数据
function fetchClassNames() {
  getModelClassName()
    .then((res) => {
      const response = res.response?.value || res
      if (response.code === 'SUCCESS') {
        classNames.value = response.body || []
        fetchAvailableDates()  // 获取可用日期
        fetchAllProducts()
      } else {
        ElMessage.error('获取分类数据失败: ' + (response.msg || '未知错误'))
      }
    })
    .catch((error) => {
      console.error('请求失败:', error)
      ElMessage.error('请求失败: ' + error.message)
    })
}

onMounted(() => {
  fetchClassNames()
})
</script>

<style scoped>
/* 优化样式 */
.container {
  position: relative;
  width: 100%;
  min-height: 500px;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f5f7fa;
}

.row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 20px;
  gap: 16px;  /* 调整间隙，避免重叠 */
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-form-item {
  margin-bottom: 0;
  width: auto;
  min-width: 200px;
}

/* 修复：观测时间表单项宽度调整 */
:deep(.el-form-item[data-v-][data-v-]:nth-child(4) .el-form-item__content) {
  min-width: 230px; /* 观测时间类型选择器+日期选择器的总宽度 */
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.image-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  padding: 16px;
  background: #fff;
  transition: all 0.3s ease;
}

.image-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
  border-radius: 4px;
}

.file-icon {
  padding: 20px;
  cursor: pointer;
  color: #909399;
}

.file-icon-large {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.image-placeholder {
  padding: 40px 20px;
  text-align: center;
  color: #c0c4cc;
}

.image-placeholder-large {
  text-align: center;
  padding: 60px 40px;
  color: #c0c4cc;
}

/* 详情视图样式优化 */
.detail-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 20px;
  margin-bottom: 20px;
}

.image-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.product-image {
  width: 400px;
  height: auto;
  max-height: 400px;
  border-radius: 8px;
  object-fit: contain;
}

.info-section {
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.info-section h3 {
  color: #303133;
  margin-bottom: 20px;
  font-size: 20px;
  text-align: center;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  font-weight: 600;
  color: #606266;
  text-align: left;
}

.info-value {
  color: #303133;
  text-align: right;
}

/* 修改 actions 样式 */
.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  width: 100%;
}

.title {
  margin: 0 0 20px 0;
  font-size: 24px;
  text-align: center;
  width: 100%;
  color: #303133;
}


.return-button {
  /* 移除原来的 margin-top 和 padding 设置 */
  padding: 12px 24px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.searchButton:hover {
  background-color: #66b1ff;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .detail-content {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 40px;
  }
  
  .info-section {
    text-align: left;
  }
  
  .info-section h3 {
    text-align: left;
  }
  
  .actions {
    justify-content: flex-start;
  }
}

@media (max-width: 767px) {
  .product-image {
    width: 100%;
    max-width: 300px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-value {
    text-align: left;
  }
}
</style>