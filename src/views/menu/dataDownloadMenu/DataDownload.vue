<template>
  <div class="container">
    <!-- 表单和控制按钮（添加v-if判断，当显示数据详情时隐藏） -->
    <div class="head-controls" v-if="!showDetails">
      <el-form :inline="true" class="demo-form-inline">
        <!-- 数据类型选择 -->
        <el-form-item label="数据类型" style="width: 15%">
          <el-select v-model="selectedDataType" placeholder="选择数据类型">
            <el-option label="气象数据" value="03"></el-option>
            <el-option label="理化数据" value="05"></el-option>
            <el-option label="光谱数据" value="04"></el-option>
            <el-option label="水位数据" value="02"></el-option>
            <el-option label="径流数据" value="01"></el-option>
            <el-option label="卫星遥感影像数据" value="06"></el-option>
            <el-option label="无人机数据" value="07"></el-option>
          </el-select>
        </el-form-item>
        <!-- 文件名 -->
        <el-form-item label="文件名" style="margin-left: 0px;">
          <el-input v-model="searchInfo.filepath" placeholder="请输入文件名" />
        </el-form-item>
        <!-- 日期选择器和切换按钮 -->
        <el-form-item label="日期">
          <el-date-picker v-if="searchInfo.type === '2'" v-model="searchInfo.observationTime" type="month"
            placeholder="选择月份" format="YYYY-MM" value-format="YYYY-MM" 
            @visible-change="
              (visibility) =>
                handleVisibleChange(visibility, shujuguanli, 'month')
            "
            :disabled-date="(time) => disabledDate(time, shujuguanli, 'month')">
          </el-date-picker>
          <el-date-picker v-if="searchInfo.type === '1'" v-model="searchInfo.observationTime" type="year"
            placeholder="选择年份" format="YYYY" value-format="YYYY"
            @visible-change="
              (visibility) =>
                handleVisibleChange(visibility, shujuguanli, 'year')
            "
            :disabled-date="(time) => disabledDate(time, shujuguanli, 'year')">
          </el-date-picker>
          <el-button @click="changeWayButton">
            {{ curWay }}
          </el-button>
        </el-form-item>
        <!-- 操作按钮 -->
        <el-form-item>
          <el-button @click="searchButton" class="searchButton">
            <el-icon>
              <Search />
            </el-icon>搜索
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 数据展示区域 -->
    <div v-if="!showDetails" class="image-gallery">
      <template v-for="(item, index) in displayedData" :key="index">
        <div class="image-card">
          <img :src="getImageSrc(dataType)" />
          <div class="image-info">
            <p class="file-name" @click="showDetails = true; setDetailsData(item)">
              {{ item.filepath || '未命名文件' }}
            </p>
          </div>
        </div>
      </template>
    </div>
    <!-- 分页组件（添加v-if判断，当显示数据详情时隐藏） -->
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
      :page-sizes="[8, 16, 32]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
      :total="totalItems" class="el-pagination-pages" v-if="!showDetails" />
    <!-- 数据详情视图 -->
    <div v-if="showDetails" class="details-container">
      <div v-if="showDetails" class="details-container">
        <h1 class="data-details-title">数据详情</h1>
        <div class="details-container">
          <div class="details-content" style="display: flex; justify-content: space-between;">
            <!-- 图片展示部分 -->
            <div class="image-loader" :style="{ 'width': '400px', 'height': '240px', margin: 'auto  0 auto 0' }">
              <img v-if="(dataType === '06' || dataType === '07') && details.imageUrl" :src="details.imageUrl"
                alt="数据图片" style="max-width: 100%; max-height: 100%; object-fit: contain;">
              <img v-else if="dataType === '06' || dataType === '07'" :src="getImageSrc(dataType)" alt="示例图片"
                style="max-width: 100%; max-height: 100%; object-fit: contain;">
              <img v-else :src="getImageSrc(dataType)" alt="示例图片"
                style="max-width: 100%; max-height: 100%; object-fit: contain;">
              <p v-if="dataType === '06' || dataType === '07'" class="file-name-display" style="margin: 0 auto 0 auto">
                {{
                  details.filepath }}</p>
              <p v-else class="file-name-display">{{ details.filepath }}</p>
            </div>
            <!-- 数据信息展示部分 -->
            <div class="data-info-box"
              style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <div class="data-time" style="display: flex; width: 100%; justify-content: space-between;">
                <span style="display: inline-block; width: 30%; text-align: right; ">日期：</span>
                <div style="width: 70%; text-align: left;  font-weight: normal; ">
                  <span>{{ details.observationTime }}</span>
                </div>
              </div>
              <div class="data-type" style="display: flex; width: 100%; justify-content: space-between;">
                <span style="display: inline-block; width: 30%; text-align: right; ">数据类型：</span>
                <div style="width: 70%; text-align: left; font-weight: normal;">
                  <span>{{ getDataType(dataType) }}</span>
                </div>
              </div>
              <div class="data-name" style="display: flex; width: 100%; justify-content: space-between;">
                <span style="display: inline-block; width: 30%; text-align: right; ">文件名称：</span>
                <div style="width: 70%; text-align: left; font-weight: normal;">
                  <span>{{ details.filepath }}</span>
                </div>
              </div>
              <div class="data-introduction" style="display: flex; width: 100%; justify-content: space-between;">
                <span style="display: inline-block; width: 30%; text-align: right; ">数据简介：</span>
                <div style="width: 70%; text-align: left; font-weight: normal;">
                  <span>{{ details.dataIntroduction }}</span>
                </div>
              </div>
              <div class="data-publisher" style="display: flex; width: 100%; justify-content: space-between;">
                <span style="display: inline-block; width: 30%; text-align: right; ">发布人：</span>
                <div style="width: 70%; text-align: left; font-weight: normal;">
                  <span>{{ details.publisher }}</span>
                </div>
              </div>
              <div class="data-contact" style="display: flex; width: 100%; justify-content: space-between;">
                <span style="display: inline-block; width: 30%; text-align: right; ">e-mail：</span>
                <div style="width: 70%; text-align: left; font-weight: normal;">
                  <span>{{ details.contact }}</span>
                </div>
              </div>
              <div class="data-unit" style="display: flex; width: 100%; justify-content: space-between;">
                <span style="display: inline-block; width: 30%; text-align: right; ">发布单位：</span>
                <div style="width: 70%; text-align: left; font-weight: normal;">
                  <span>{{ details.publishingUnit }}</span>
                </div>
              </div>
            </div>
          </div>
          <el-button @click="hideDetails" class="back-button" style="">返回</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted, watch, computed } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { dataManagePageQuery, getTimesByType } from '@/api/getData';
import {
  ElMessage,
  ElLoading
} from 'element-plus';

// 页面数据相关的响应式数据
const currentPage = ref(1);
const pageSize = ref(8); // 默认显示两行四列，每行四个，共8个文件
const selectedDataType = ref('01'); // 用于存储选择框选择的数据类型，但不立即生效
const dataType = ref('01'); // 实际用于查询和页面数据展示的数据类型，初始值可根据需求调整
const tableData = ref([]);
const totalItems = ref(0);
const searchInfo = ref({
  filepath: "",
  observationTime: "",
  type: '1'
});
const displayedData = ref([]);
const curWay = ref('切换年');
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}
// 控制数据详情显示与否及详情数据
const showDetails = ref(false);
const details = ref({
  filepath: "",
  observationTime: "",
  dataIntroduction: "",
  publisher: "",
  contact: "",
  publishingUnit: "",
  imageUrl: "" // 新增用于存储图片链接的字段
});

// 图片映射
const imageMap = {
  '03': '/images/dataDownload/weather.png', // 气象数据
  '04': '/images/dataDownload/spectrum.png', // 光谱数据
  '02': '/images/dataDownload/waterlevel.png', // 水位数据
  '01': '/images/dataDownload/runoff.png', // 径流数据
  '06': '/images/dataDownload/satellite.jpg', // 卫星遥感影像数据
  '07': '/images/dataDownload/uav.png', // 无人机数据
  '05': '/images/dataDownload/physicochemistry.png' // 理化数据
};
// 新增数据类型名称和编码的映射对象
const dataTypeMap = {
  '01': '径流数据',
  '02': '水位数据',
  '03': '气象数据',
  '04': '光谱数据',
  '05': '理化数据',
  '06': '卫星遥感影像数据',
  '07': '无人机数据'
};

// 数据映射表
const shujuguanliMap = {
  '01': 'jingliu',
  '02': 'shuiwei',
  '03': 'qixiang',
  '04': 'guangpu',
  '05': 'shuitilihua',
  '06': 'weixing',
  '07': 'wurenji'
}

// 通过 computed 动态计算 shujuguanli 的值
const shujuguanli = computed(() => shujuguanliMap[selectedDataType.value] || '')

const showDateArr = ref([])
// 可用日期
function disabledDate (time, type, searchTimeType) {
  if (showDateArr.value == null || showDateArr.value.length === 0) {
    return true
  }
  let customString = `${time.getFullYear()}-${(time.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}`
  if (searchTimeType === 'year') {
    // year
    customString = `${time.getFullYear()}`
  } else if (searchTimeType === 'month') {
    // month
    customString = `${time.getFullYear()}-${(time.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`
  }
  const isTimeInArray = showDateArr.value.includes(customString)
  return !isTimeInArray
}
// 请求日期
function handleVisibleChange (visibility, type, searchTimeType) {
  if (visibility) {
    // 开启时
    const searchType = searchTimeType
    getTimesByType({
      type: type,
      searchTimeType: searchType,
      filepath: 'true'
    })
      .then((res) => {
        const result = res.response.value
        if (result.code === 'SUCCESS') {
          const type = result.body.type
          const date = result.body.date
          showDateArr.value = date
        } else {
          // 处理失败的响应
          ElMessage({
            showClose: true,
            message: result.msg,
            center: true
          })
        }
      })
      .catch((error) => {
        ElMessage({
          showClose: true,
          message: '获取数据失败，请稍后再试',
          center: true,
          type: 'error'
        })
      })
  }
}

// 获取表格数据的函数
const fetchTableData = () => {
  const loadingInstance = ElLoading.service(loadingoptions)
  dataManagePageQuery({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    filepath: searchInfo.value.filepath,
    time: searchInfo.value.observationTime,
    type: dataType.value,
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value;
      if (result.code === 'SUCCESS') {
        tableData.value = result.body.records.map((item) => ({
          ...item,
          dataType: dataTypeMap[item.dataType] || "",
          src: getImageSrc(item.dataType),
          dataIntroduction: item.dataIntroduction || "",
          publisher: item.userName || "",
          contact: item.contactPhone || "",
          publishingUnit: item.productionUnit || "",
          imageUrl: item.imageUrl || "" // 假设后端返回的数据中包含图片链接字段imageUrl

        }));
        currentPage.value = result.body.current;
        totalItems.value = result.body.total;
        pageSize.value = result.body.size;
        displayedData.value = tableData.value;
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true,
          type: 'error'
        });
      }
    })
    .catch(() => {
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      });
    });
}

// 搜索按钮点击事件处理函数
const searchButton = () => {
  currentPage.value = 1;
  // 将选择框选择的数据类型赋给实际用于查询的数据类型
  dataType.value = selectedDataType.value;
  fetchTableData();
};

// 处理分页大小改变事件
const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchTableData();
};

// 处理当前页改变事件
const handleCurrentChange = val => {
  currentPage.value = val;
  fetchTableData();
};

// 切换日期选择方式按钮点击事件处理函数
const changeWayButton = () => {
  if (curWay.value === '切换年') {
    curWay.value = '切换月';
    searchInfo.value.type = '1';
  } else {
    curWay.value = '切换年';
    searchInfo.value.type = '2';
  }
};

const setDetailsData = (item) => {
  details.value = {
    dataType: item.dataType || "",
    filepath: item.filepath || "",
    observationTime: item.observationTime || "",
    dataIntroduction: item.dataIntroduction || "",
    publisher: item.userName || "",
    contact: item.contactPhone || "",
    publishingUnit: item.productionUnit || "",
    imageUrl: item.imageUrl || "" // 设置图片链接字段
  };
};

const getImageSrc = (imageType) => {
  if (imageType === undefined) {
    console.error('No dataType provided for image source.');
    return '/images/dataDownload/waterlevel.png';
  }
  let src = imageMap[imageType] || '/images/dataDownload/waterlevel.png';
  return src;
};
const getDataType = (dataType) => {

  let type = dataTypeMap[dataType];
  return type;
};

const instance = getCurrentInstance();
if (instance) {
  instance.proxy.$nextTick(() => {
    searchButton();
  });
}

const hideDetails = () => {
  showDetails.value = false;
};

watch([searchInfo, dataType], () => {
  currentPage.value = 1;
  fetchTableData();
});
</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  padding: 0;
  background-color: white;
}

.head-controls {
  margin-left: 1%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.demo-form-inline {
  margin-top: 20px;
  text-align: left;
  width: 100%;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 -10px;
  padding-Top: 30px;
}

.image-card {
  margin: 10px;
  border: 1% solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  width: calc(25% - 20px);
  /* 修改为每行显示4个，宽度相应调整 */
  border: 1px soient;
}

.image-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  /* 保持长宽比例并裁剪多余部分 */
}

.image-info {
  padding: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.el-pagination-pages {
  margin-top: 50px;
  justify-content: center;
}

.details-container {
  padding: 20px;
  border-Radius: 10px;
}

.data-details-title {
  font-size: 30px;
  /* 增大标题字体大小 */
  margin-bottom: 20px;
  color: 333;
}

.details-content {
  font-size: 20px;
  width: 80%;
  margin: 0 auto;
}

.head-controls.el-form.el-form-item.form-item p.data-item {
  align-items: baseline;
}

.demo-form-inline {
  margin-top: 20px;
  text-align: 100%;
}

.form-item {
  margin-right: 20px;
}

.data-time,
.data-type,
.data-name,
.data-unit,
.data-introduction,
.data-publisher,
.data-contact,
.data-unit {
  margin-top: 10px;
  font-weight: bold;
}

.back-button {
  background-color: #ccc;
  color: #333;
  border: none;
  border-Radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  margin-top: 20px;
}

.data-info-box {
  width: 50%;
  height: 400px;
  background-color: 0;
  border: none;
}

.image-loader {
  margin-right: 150px;
}

.example-image-text {
  text-align: center;
  color: 666;
  font-size: 14px;
  margin-top: 5px;
}
</style>