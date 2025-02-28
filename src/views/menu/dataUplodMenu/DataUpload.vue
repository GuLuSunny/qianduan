<template>  
  <div class="container">  
    <!-- 表单和控制按钮 -->  
    <div class="head-controls">  
      <el-form :inline="true" class="demo-form-inline"> 
         <!-- 数据类型选择 -->  
         <el-form-item label="数据类型" style="width: 15%">  
          <el-select  
            v-model="dataType"  
            placeholder="选择数据类型"  
            @change="handleInputChange"  
          >  
            <el-option label="气象数据" value="03"></el-option>  
            <el-option label="理化数据" value="05"></el-option>  
            <el-option label="光谱数据" value="04"></el-option>  
            <el-option label="水位数据" value="02"></el-option>  
            <el-option label="径流数据" value="01"></el-option>  
            <el-option label="卫星遥感影像数据" value="06"></el-option>  
            <el-option label="无人机数据" value="07"></el-option>  
          </el-select>  
        </el-form-item>   
        <!-- 日期选择器 -->  
        <el-form-item label="观测日期">  
          <div class="date-picker-container">  
            <el-date-picker  
              v-model="searchInfo.startDate"  
              type="date"  
              placeholder="开始日期"  
              format="YYYY-MM-DD"  
              value-format="YYYY-MM-DD"  
              @change="handleStartDateChange"  
            />  
            <span class="date-separator">至</span>  
            <el-date-picker  
              v-model="searchInfo.endDate"  
              type="date"  
              placeholder="结束日期"  
              format="YYYY-MM-DD"  
              value-format="YYYY-MM-DD"  
              @change="handleEndDateChange"  
            />  
          </div>  
        </el-form-item>  

        <!-- 地点 -->  
        <el-form-item label="地点" style="width: 15%">  
          <template v-if="dataType === '06' || dataType === '07'">  
            <el-input  
              v-model="siteInput"  
              placeholder="请输入地点"  
              @change="handleInputChange"  
            ></el-input>  
          </template>  
          <template v-else>  
            <el-select  
              v-model="sitePicked"  
              placeholder="选择地点"  
              @change="handleInputChange"  
            >  
              <el-option  
                v-for="device in deviceOptions"  
                :key="device.id"  
                :label="device.deviceName"  
                :value="device.id"  
              />  
            </el-select>  
          </template>  
        </el-form-item>  

        <!-- 类型 -->  
        <template v-if="dataType === '06' || dataType === '07'">  
        <el-form-item label="类型" style="width: 15%">  
          <el-input  
            v-model="isPublic"  
            placeholder="请输入类型"  
            @change="handleInputChange"  
          ></el-input>  
        </el-form-item>  
      </template>  

        <!-- 文件名 -->  
        <el-form-item label="文件名" style="margin-left: 0px">  
          <el-input  
            v-model="searchInfo.filepath"  
            placeholder="请输入文件名"  
            @input="handleInputChange"  
          />  
        </el-form-item>  

        <!-- 操作按钮 -->  
        <el-form-item>  
          <el-button @click="searchButton" class="searchButton">  
            <el-icon><Search /></el-icon>搜索  
          </el-button>  
          <el-button  
            type="primary"  
            @click="handleBatchDownload"  
            :disabled="!isButtonDelDisabled"  
          >批量下载</el-button>  
        </el-form-item>  
      </el-form>  
    </div>  

    <!-- 表格数据展示 -->  
    <div>  
      <el-table  
        :data="tableData"  
        stripe  
        style="width: 100%"

        :header-align="'center'"  
        :align="'left'"  
        show-overflow-tooltip  
        @selection-change="handleSelectionChange"  
      >  
        <el-table-column type="selection" width="55" />  
        <el-table-column   
          prop="observationPeriod"   
          label="日期范围"   
          width="auto"   
        />  
        <el-table-column   
          prop="filepathLink"   
          label="文件路径"   
          width="auto"   
        />  
        <el-table-column fixed="right" label="数据操作" width="200">  
          <template #default="{ row }">  
            <el-button  
              type="plain"  
              size="small"  
              @click="handleSingleDownload(row)"  
            >下载</el-button>  
          </template>  
        </el-table-column>  
      </el-table>  

      <!-- 分页组件 -->  
      <el-pagination  
        @size-change="handleSizeChange"  
        @current-change="handleCurrentChange"  
        :current-page="currentPage"  
        :page-sizes="[10, 15, 30, 50, 100]"  
        :page-size="pageSize"  
        layout="total, sizes, prev, pager, next, jumper"  
        :total="totalItems"  
        class="el-pagination-pages"  
      />  
    </div>  
  </div>  
</template>  

<script setup>  
// Import necessary modules and functions  
import { ref, onMounted, getCurrentInstance, watch, computed } from 'vue';  
import { Search } from '@element-plus/icons-vue';  
import { dataManagePageQuery, queryDeviceByMultiWord, getFilepath, fileDownload } from '@/api/getData';  
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus';  

// Define necessary variables  
const isButtonDelDisabled = ref(false);  
const currentPage = ref(1);  
const pageSize = ref(10);  
const sitePicked = ref('');  
const siteInput = ref('');  
const isPublic = ref('');  
const dataType = ref('01');  
const selectedRows = ref([]);  
const tableData = ref([]);  
const totalItems = ref(0);  
const searchInfo = ref({  
  observationTime: '',  
  filepath: '',  
  type: '1',  
  startDate: '',  
  endDate: ''  
});  
const loadingOptions = {  
  target: '.layoutLoading',  
  background: 'rgba(0, 0, 0, 0.7)',  
  text: '数据加载中...'  
};  

// Map for data types  
const shujuguanliMap = {  
  '01': '02',  
  '02': '06',  
  '03': '03',  
  '04': '01',  
  '05': '01',  
  '06': '06',  
  '07': '07'  
};  

// Dynamic device options  
const deviceOptions = ref([]);  

// Compute the current shujuguanli value  
const shujuguanli = computed(() => shujuguanliMap[dataType.value] || '');  

function fetchDeviceOptions() {  
  if (!shujuguanli.value) return; // Ensure shujuguanli is valid  

  queryDeviceByMultiWord({ type: shujuguanli.value })  
    .then((res) => {  
      if (res.response.value.code === 'SUCCESS') {  
        deviceOptions.value = res.response.value.body;  
      } else {  
        ElMessage.error(res.response.value.msg);  
      }  
    })  
    .catch(() => {  
      ElMessage.error('获取设备数据失败，请稍后再试');  
    });  
}  

onMounted(() => {  
  fetchDeviceOptions();  
  const instance = getCurrentInstance();  
  if (instance) {  
    instance.proxy?.$nextTick(() => {  
      searchButton();  
    });  
  }  
});  

watch(  
  () => dataType.value,  
  () => {  
    fetchDeviceOptions(); // Fetch device options when data type changes  
  }  
);  

function handleInputChange() {  
  isButtonDelDisabled.value = false;  
}  

function fetchTableData() {  
  const loadingInstance = ElLoading.service(loadingOptions);  
  isButtonDelDisabled.value = true;  

  getFilepath({  
    currentPage: currentPage.value,  
    pageSize: pageSize.value,  
    filepath: searchInfo.value.filepath,  
    observationTimeBegin: searchInfo.value.startDate,  
    observationTimeEnd: searchInfo.value.endDate,  
    deviceId: sitePicked.value,  
    deviceName: siteInput.value,  
    typeDetail: isPublic.value,  
    className: dataType.value  
  })  
    .then((res) => {  
      loadingInstance.close();  
      const result = res.response.value;  
      
      if (result.code === 'SUCCESS' && result.body) {  
        tableData.value = result.body.records;
        console.log(tableData.value);
        currentPage.value = result.body.current;  
        totalItems.value = result.body.total;  
        pageSize.value = result.body.size;  
      } else {  
        ElMessage.error(result.msg || '未知错误');  
      }  
    })  
    .catch((error) => {  
      loadingInstance.close();  
      console.error('Error fetching data:', error); // Log the error for debugging  
      ElMessage.error('获取数据失败，请稍后再试');  
    });  
} 

function searchButton() {  
  currentPage.value = 1;  
  fetchTableData();  
}  

function handleSelectionChange(val) {  
  selectedRows.value = val.map((row) => row); // Store complete row objects  
}  

function handleSizeChange(val) {  
  pageSize.value = val;  
  fetchTableData();  
}  

function handleCurrentChange(val) {  
  currentPage.value = val;  
  fetchTableData();  
}  

function handleBatchDownload() {
  const loadingInstance = ElLoading.service(loadingOptions);  
  isButtonDelDisabled.value = true; 

  const ids = selectedRows.value.length > 0  
    ? selectedRows.value.map((row) => row.id).filter(Boolean)  
    : tableData.value.map((row) => row.id).filter(Boolean);  

  if (ids.length === 0) {  
    loadingInstance.close(); 
    ElMessage.warning('没有可下载的文件');  
    return;  
  }  

  ElMessageBox.confirm(  
    `此操作将下载选中的 ${selectedRows.value.length > 0 ? selectedRows.value.length : tableData.value.length} 条数据, 是否继续?`,  
    '提示',  
    {  
      confirmButtonText: '确定',  
      cancelButtonText: '取消',  
      type: 'warning',  
    }  
  )  
  .then(() => {  
    fileDownload({  
      ids: ids,  
      className: dataType.value,  
      observationTimeBegin: searchInfo.value.startDate,  
      observationTimeEnd: searchInfo.value.endDate,  
      currentPage: currentPage.value,  
      pageSize: pageSize.value,  
      deviceId: sitePicked.value,  
      typeDetail: isPublic.value,  
    }, { responseType: 'blob' })  
      .then((response) => {  
        loadingInstance.close();  
        const res = response.response.value;
        const contentType = res.type;
        if (contentType === 'application/json') {  
          ElMessage.error('下载失败，请稍后再试');  
          return;  
        }  

        const blob = new Blob([res]);
        const link = document.createElement('a');  
        const url = window.URL.createObjectURL(blob);  
        link.href = url;  

        if(selectedRows.value.length > 0 ? selectedRows.value.length : tableData.value.length===1){
          const fileRow = selectedRows.value.length > 0 ? selectedRows.value[0] : tableData.value[0];
          const fullFileName = `${fileRow.filename}${fileRow.fileType}`;
           link.setAttribute('download', fullFileName);
           }else{
           const fullFileName = `downloaded_files.zip`; 
          link.setAttribute('download', fullFileName); 
         }

        document.body.appendChild(link);  
        link.click();  
        link.parentNode.removeChild(link)
        window.URL.revokeObjectURL(url);
        ElMessage.success('下载成功');
        
        fetchTableData();  
      })  
      .catch(() => {  
        loadingInstance.close();
        ElMessage.error('下载失败，请稍后再试');  
      });  
  })  
  .catch(() => {  
    loadingInstance.close();
    ElMessage.info('已取消下载');  
  });  
}

function handleSingleDownload(row) {
  const loadingInstance = ElLoading.service(loadingOptions);  
  isButtonDelDisabled.value = true; 

  const id = row.id;

  ElMessageBox.confirm('此操作将下载该文件, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    fileDownload({ ids: [id], className: dataType.value })
      .then((response) => {
        loadingInstance.close();  

        const res = response.response.value;
        const contentType = res.type;
        if (contentType === 'application/json') {
          ElMessage.error('下载失败，请稍后再试');
          return;
        }
        const blob = new Blob([res]);
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        const fullFileName = row.filename + row.fileType;
        link.setAttribute('download', fullFileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link)
        window.URL.revokeObjectURL(url);
        ElMessage.success('下载成功');
        fetchTableData();
      })
      .catch(() => {
        loadingInstance.close();
        ElMessage.error('下载失败，请稍后再试');
      });
  }).catch(() => {
    loadingInstance.close();
    ElMessage.info('已取消下载');
  });
}
</script>

<style scoped>
.date-picker-container {  
  display: flex;  /* 使用 Flexbox 布局 */  
  align-items: center;  /* 垂直居中对齐 */  
}  

.date-separator {  
  margin: 0 10px;  /* 设置“至”字的左右间距 */  
  line-height: 32px;  /* 使其与选择框对齐 */  
}  
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
.el-table {
  margin-top: 20px;
}
.el-pagination-pages {
  margin-top: 20px;
  justify-content: center; /* 水平居中 */
}
</style>
