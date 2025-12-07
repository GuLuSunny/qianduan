<template>
  <div class="CesiumapView">
    <!-- 顶部标题 -->
    <transition name="fade">
      <div class="headView">
        <div class="headTime">2025-4-16 16:52:36</div>
        <div class="headTitle">地表水资源水资源综合信息遥感监测系统</div>
        <div class="headWeather">开封 34℃ 浮尘</div>
      </div>
    </transition>

    <!-- 新增：数据菜单按钮（在标题下方右侧） -->
    <div class="data-menu-btn" @click="goToModelView">
      <i class="el-icon-menu"></i>
      <span>数据菜单</span>
    </div>

    <!-- ====================== 旧模块组（原6个模块）====================== -->
    <div v-if="currentModuleGroup === 'old'">
      <!-- 旧左1：水位 -->
      <div class="dataBoxView" :class="{ 'slide-in': dataBoxShow, 'slide-out-left': !dataBoxShow }">
        <div class="titleIcon"></div>
        <div class="boxTitle">水位</div>
        <div class="dataCenter">
          <HydrographView />
        </div>
      </div>
      <!-- 旧左2：径流 -->
      <div class="dataBoxView" style="top: 37%" :class="{ 'slide-in': dataBoxShow, 'slide-out-left': !dataBoxShow }">
        <div class="titleIcon"></div>
        <div class="boxTitle">径流</div>
        <div class="dataCenter">
          <RunOff />
        </div>
      </div>
      <!-- 旧左3：气象 -->
      <div class="dataBoxView" style="top: 67%" :class="{ 'slide-in': dataBoxShow, 'slide-out-left': !dataBoxShow }">
        <div class="titleIcon"></div>
        <div class="boxTitle">气象</div>
        <div class="dataCenter">
          <Atmosphere />
        </div>
      </div>

      <!-- 旧右1：水质 -->
      <div class="dataBoxView" style="right: 20px; left: auto"
        :class="{ 'slide-in': dataBoxShow, 'slide-out-right': !dataBoxShow }">
        <div class="titleIcon"></div>
        <div class="boxTitle">水质</div>
        <div class="dataCenter">
          <WaterPhysicochemistry />
        </div>
      </div>
      <!-- 旧右2：光谱反射率 -->
      <div class="dataBoxView" style="right: 20px; left: auto; top: 37%"
        :class="{ 'slide-in': dataBoxShow, 'slide-out-right': !dataBoxShow }">
        <div class="titleIcon"></div>
        <div class="boxTitle">光谱反射率</div>
        <div class="dataCenter">
          <SpectralReflectance />
        </div>
      </div>
      <!-- 旧右3：土壤 -->
      <div class="dataBoxView" style="right: 20px; left: auto; top: 67%"
        :class="{ 'slide-in': dataBoxShow, 'slide-out-right': !dataBoxShow }">
        <div class="titleIcon"></div>
        <div class="boxTitle">土壤</div>
        <div class="dataCenter">
          <WetLandView />
        </div>
      </div>
    </div>

    <!-- ====================== 新模块组（修改后：左2+右2）====================== -->
    <div v-else-if="currentModuleGroup === 'new'">
      <!-- 新左1：各月份水体（保留） -->
      <div class="dataBoxView" :class="{
        'slide-in': newDataBoxShow,
        'slide-out-left': !newDataBoxShow,
      }">
        <div class="titleIcon"></div>
        <div class="boxTitle">各月份水体</div>
        <div class="dataCenter">
          <div class="custom-border-box" style="margin-bottom: 10px">
            <div class="new-module-controls">
              <el-date-picker v-model="monthlyWaterDate" placeholder="选择年月日" :clearable="false" type="date"
                :format="datePickerFormat.format" :value-format="datePickerFormat.valueFormat"
                @change="updateMonthlyWaterImg" />
            </div>
          </div>
          <div class="custom-border-box">
            <div class="img-container">
              <img v-if="monthlyWaterImgSrc" :src="monthlyWaterImgSrc" alt="各月份水体图片" @error="handleImgError('monthly')"
                @click="enlargeImg(monthlyWaterImgSrc)" />
              <div v-else class="img-placeholder">请选择日期加载图片</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 新左2：年间水体变化（保留原左2） -->
      <div class="dataBoxView" style="top: 37%" :class="{
        'slide-in': newDataBoxShow,
        'slide-out-left': !newDataBoxShow,
      }">
        <div class="titleIcon"></div>
        <div class="boxTitle">年间水体变化</div>
        <div class="dataCenter">
          <div class="custom-border-box" style="margin-bottom: 10px">
            <div class="new-module-controls yearly-controls">
              <el-date-picker v-model="yearlyChangeStartYear" placeholder="开始年" :clearable="false" type="year"
                format="YYYY" value-format="YYYY" @change="handleYearChange" />
              <span style="margin: 0 10px">-</span>
              <el-date-picker v-model="yearlyChangeEndYear" placeholder="结束年" :clearable="false" type="year"
                format="YYYY" value-format="YYYY" @change="handleYearChange" :disabled="!yearlyChangeStartYear" />
              <el-tooltip v-if="yearError" content="仅支持相邻两年" placement="top">
                <i class="el-icon-warning" style="color: #ff4d4f; margin-left: 10px"></i>
              </el-tooltip>
            </div>
          </div>
          <div class="custom-border-box">
            <div class="img-container">
              <img v-if="yearlyChangeImgSrc && !yearError" :src="yearlyChangeImgSrc" alt="年间水体变化图片"
                @error="handleImgError('yearly')" @click="enlargeImg(yearlyChangeImgSrc)" />
              <div v-else class="img-placeholder">
                {{ yearError ? "请选择相邻两年" : "请选择年份范围加载图片" }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 新右1：水体面积折线图（从原左3移动） -->
      <div class="dataBoxView" style="right: 20px; left: auto" :class="{
        'slide-in': newDataBoxShow,
        'slide-out-right': !newDataBoxShow,
      }">
        <div class="titleIcon"></div>
        <div class="boxTitle">水体面积折线图</div>
        <div class="dataCenter">
          <div class="custom-border-box" style="margin-bottom: 10px">
            <div class="new-module-controls">
              <el-select v-model="areaChartType" placeholder="选择类型" @change="updateAreaChartImg">
                <el-option label="时序" value="时序" />
                <el-option label="月份" value="月份" />
              </el-select>
            </div>
          </div>
          <div class="custom-border-box">
            <div class="img-container2">
              <img v-if="areaChartImgSrc" :src="areaChartImgSrc" alt="水体面积折线图" @error="handleImgError('area')"
                @click="enlargeImg(areaChartImgSrc)" />
              <div v-else class="img-placeholder">请选择类型加载图片</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 新增：新右2：各月份地物（添加feature-img-container类名缩小图片） -->
      <div class="dataBoxView" style="right: 20px; left: auto; top: 37%" :class="{
        'slide-in': newDataBoxShow,
        'slide-out-right': !newDataBoxShow,
      }">
        <div class="titleIcon"></div>
        <div class="boxTitle">各月份地物</div>
        <div class="dataCenter">
          <div class="custom-border-box" style="margin-bottom: 10px">
            <div class="new-module-controls">
              <el-date-picker v-model="monthlyFeatureDate" placeholder="选择年月日" :clearable="false" type="date"
                :format="datePickerFormat.format" :value-format="datePickerFormat.valueFormat"
                @change="updateMonthlyFeatureImg" />
            </div>
          </div>
          <div class="custom-border-box">
            <!-- 关键：添加feature-img-container类名，用于单独控制地物图片大小 -->
            <div class="img-container feature-img-container">
              <img v-if="monthlyFeatureImgSrc" :src="monthlyFeatureImgSrc" alt="各月份地物图片"
                @error="handleImgError('feature')" @click="enlargeImg(monthlyFeatureImgSrc)" />
              <div v-else class="img-placeholder">请选择日期加载图片</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 底部功能按钮 -->
    <div class="boxMenuView">
      <ul>
        <li @click="moduleswitch">
          {{ currentModuleGroup === "old" ? "产品显示" : "切换模块" }}
        </li>
        <li @click="initializeBuildings">智慧建筑</li>
        <li @click="toggleWaterFeatures">智慧水体</li>
        <li @click="toggleForest">
                  {{loadedForest ? "隐藏林地" : "智慧林地"}}
                </li>
        <li @click="FarmLandChange">智能农田</li>
        <li @click="goToModelView">数据菜单</li>
        <li @click="initializeterrain">地形加载</li>
      </ul>
    </div>

    <!-- 地图 -->
    <div id="cesiumContainer">
    </div>

    <!-- 鼠标缩放控件 -->
    <div class="MouseZoom" id="MouseZoom"></div>


    <transition name="fade">
      <div v-if="loadingShow" class="loading-box" id="loadingBox">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
    </transition>



    <!-- 鼠标点击窗口 -->
    <transition name="fade">
      <div v-show="clickPopupShowRight">
        <div class="clickModal-content" id="clickPopup">
          <span class="close" @click="closeModal">&times;</span>
          <div class="clickPopup-title" id="clickPopup-title">
            <div class="clickPopupTitleText">我是窗口标题</div>
          </div>
          <p id="clickPopup-p">这是一个漂亮的弹窗，带有关闭按钮。</p>
        </div>
      </div>
    </transition>


    <!-- 鼠标悬浮窗口 -->
    <transition name="fade">
      <div v-show="hoverPopupShow">
        <div class="hoverModal-content" id="hoverPopup">
          <p id="hoverPopup-p">我悬浮窗口哦</p>
        </div>
      </div>
    </transition>

    <!-- 图片放大模态框 -->
    <transition name="fade">
      <div v-if="showEnlargeModal" class="enlarge-modal">
        <div class="modal-content">
          <span class="close" @click="closeEnlargeModal">&times;</span>
          <img :src="enlargedImgSrc" alt="Enlarged Image" class="enlarged-img" />
        </div>
      </div>
    </transition>


    <!-- <div class="mars3d-animation-point" id="htmlElement">
      <p></p>
    </div> -->

  </div>
</template>
<script setup>
import { ref, watch, getCurrentInstance, onMounted, onUnmounted } from 'vue';
//导入cesium
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import marker from '../../../public/images/cesiumMap/marker.png';
import { dialogEmits } from 'element-plus';
import RunOff from './charts/RunOff.vue' /* 径流 */
import HydrographView from './charts/HydrographView.vue' /* 水位 */
import SpectralReflectance from './charts/SpectralReflectance.vue' /* 光谱反射率 */
import WaterPhysicochemistry from './charts/WaterPhysicochemistry.vue' /* 水质 */
import Atmosphere from './charts/AtmosphereView.vue' /* 气象 */
import WetLandView from './charts/WetLandView.vue' /* 土壤 */
import { selectAllSluicesByConditions,getFarmlandgeojson } from '@/api/getData';
import { selectAllPumpingStationByConditions } from '@/api/getData'
import router from '@/router';
import { resolve } from 'path';


// 绿色水滴   http://mars3d.cn/project/vue/img/marker/mark-green.png
// 红色公司   http://mars3d.cn/project/vue/img/marker/mark-red.png
// 蓝色标志   http://mars3d.cn/project/vue/img/marker/mark-blue.png
const sluiceDatas = ref();
const pumpDatas = ref();
// lading
const loadingShow = ref(true);
const cesiumLoaded = ref(false);
const clickPopupShowRight = ref(true); // 控制弹窗显示与隐藏

//是否加载水体
const loadedWater = ref(false);
// 存储水闸和泵站实体的引用，便于后续删除
const sluiceEntities = ref([]);
const pumpEntities = ref([]);
//存储水闸+泵站所有点位
const waterPoints = ref([]); 

//是否加载建筑物
const loadedBuildings = ref(false);

//是否加载了林地
const loadedForest = ref(false);
let treeLoader = null;
const forestLoading = ref(false); // 加载状态

//是否加载了农田
const loadedFarmLand = ref(false);

// 悬浮弹窗
const hoverPopupShow = ref(true);
// 内容盒子
const dataBoxShow = ref(true);
// 记录标记为
var lastClickedEntityPosition;
// 旋转函数

var viewer;

// 给定的坐标
var position = Cesium.Cartesian3.fromDegrees(114.3472038, 34.7961106);
// 初始朝向角度
var heading = 0;
// 初始俯仰角度
var pitch = 90;
// 初始距离
var distance = 10000;
// 初始偏移量
var offset = new Cesium.HeadingPitchRange(Cesium.Math.toRadians(heading), -Cesium.Math.toRadians(pitch), distance);
// 控制heading增减的标志位
var increasing = true;
window.CESIUM_BASE_URL = "/static/Cesium";

// ====================== 新增：新模块状态======================
// 1. 模块组切换状态（old：旧模块，new：新模块）
const currentModuleGroup = ref("old");
// 2. 新模块滑入/滑出控制
const newDataBoxShow = ref(false);
// 3. 新模块1：各月份水体 
const monthlyWaterDate = ref("2025-06-24");
const monthlyWaterImgSrc = ref("/images/各月份水体/25-0624.png");
const datePickerFormat = {
  format: "YYYY-MM-DD",
  valueFormat: "YYYY-MM-DD",
};
// 4. 新模块2：年间水体变化 - 默认值为2024-2025以匹配2425.png
const yearlyChangeStartYear = ref("2024");
const yearlyChangeEndYear = ref("2025");
const yearlyChangeImgSrc = ref("/images/年间水体变化/2425.png");
const yearError = ref(false);
// 5. 新模块3：水体面积折线图 - 默认选择“时序”
const areaChartType = ref("时序");
const areaChartImgSrc = ref("/images/水体面积折线图/水域面积时序.png");
// 6. 新模块4：各月份地物（新增）
const monthlyFeatureDate = ref("2025-06-15");
const monthlyFeatureImgSrc = ref("/images/地物/25-0615.png"); // 对应本地F盘路径
// 7. 图片放大功能
const enlargedImgSrc = ref("");
const showEnlargeModal = ref(false);
let farmlandDataSource = null;

// 智慧林地坐标
const smartForestPosition = Cesium.Cartesian3.fromDegrees(114.3547, 34.81422, 1500);



onMounted(async () => {
  const instance = getCurrentInstance();
  if (instance) {
    instance.proxy.$nextTick(() => {
      console.log("实体化完成。");
      checkCesiumLoaded();
      updateAreaChartImg(); // 初始化水体面积折线图（默认时序）
      updateMonthlyFeatureImg(); // 初始化各月份地物图片
    })
  }
})
onUnmounted(() => {
    if (treeLoader) {
        treeLoader.destroy();
        treeLoader = null;
    }
});

function goToModelView() {
  console.log(localStorage);
  setTimeout(resolve, 10000);
  router.push('/mainMenu')
}


// 原有：模块切换函数
function moduleswitch() {
  if (currentModuleGroup.value === "old") {
    // 旧模块滑出
    dataBoxShow.value = false;
    // 延迟后显示新模块并滑入
    setTimeout(() => {
      currentModuleGroup.value = "new";
      newDataBoxShow.value = true;
    }, 1000);
  } else {
    // 新模块滑出
    newDataBoxShow.value = false;
    // 延迟后显示旧模块并滑入
    setTimeout(() => {
      currentModuleGroup.value = "old";
      dataBoxShow.value = true;
    }, 1000);
  }
}

// ====================== 新增：新模块逻辑======================
/**
 * 1. 新模块1：更新各月份水体图片路径（日期补零处理）
 * 日期格式：2028-06-24 → 图片名：28-0624.png
 * 路径：/images/各月份水体/28-0624.png
 */

function updateMonthlyWaterImg() {
  if (!monthlyWaterDate.value) {
    monthlyWaterImgSrc.value = "/images/各月份水体/25-0624.png"; // 回退默认图
    return;
  }

  // 确保日期格式正确（处理可能的不同格式输入）
  const dateParts = monthlyWaterDate.value.split("-");
  if (dateParts.length !== 3) {
    console.error("无效日期格式，需为 YYYY-MM-DD");
    return;
  }

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  // 验证日期组件
  if (
    !year ||
    !month ||
    !day ||
    year.length !== 4 ||
    month.length !== 2 ||
    day.length !== 2
  ) {
    console.error("日期组件格式不正确");
    return;
  }

  // 生成图片路径
  const shortYear = year.slice(2); // 2025 → "25"
  monthlyWaterImgSrc.value = `/images/各月份水体/${shortYear}-${month}${day}.png`;

  console.log("更新各月份水体图片:", monthlyWaterImgSrc.value);
}

/**
 * 2. 新模块2：处理年份选择（限制相邻两年）
 * 年份格式：2024-2025 → 图片名：2425.png
 * 路径：/images/年间水体变化/2425.png
 */
function handleYearChange() {
  // 获取当前起始和结束年份（转为数字）
  const start = Number(yearlyChangeStartYear.value || 0);
  const end = Number(yearlyChangeEndYear.value || 0);

  // 情况1：仅修改了起始年，自动设置结束年为下一年
  if (start && !end) {
    yearlyChangeEndYear.value = (start + 1).toString();
  }
  // 情况2：仅修改了结束年，自动设置起始年为前一年
  else if (!start && end) {
    yearlyChangeStartYear.value = (end - 1).toString();
  }

  // 重新获取最新值验证
  const validatedStart = Number(yearlyChangeStartYear.value);
  const validatedEnd = Number(yearlyChangeEndYear.value);

  // 验证相邻逻辑
  if (validatedEnd === validatedStart + 1) {
    yearError.value = false;
    // 生成路径（如2024→24，2025→25）
    const shortStart = validatedStart.toString().slice(-2);
    const shortEnd = validatedEnd.toString().slice(-2);
    yearlyChangeImgSrc.value = `/images/年间水体变化/${shortStart}${shortEnd}.png`;
  } else {
    yearError.value = true;
    yearlyChangeImgSrc.value = ""; // 清空错误状态
  }
}

/**
 * 3. 新模块3：更新水体面积折线图图片路径
 */
function updateAreaChartImg() {
  areaChartImgSrc.value = `/images/水体面积折线图/水域面积${areaChartType.value}.png`;
  console.log("生成水体面积折线图路径:", areaChartImgSrc.value);
}

/**
 * 4. 新模块4：更新各月份地物图片路径（新增）
 */
function updateMonthlyFeatureImg() {
  if (!monthlyFeatureDate.value) {
    monthlyFeatureImgSrc.value = "/images/地物/25-0615.jpg";
    return;
  }

  const dateParts = monthlyFeatureDate.value.split("-");
  if (dateParts.length !== 3) {
    console.error("无效日期格式，需为 YYYY-MM-DD");
    return;
  }

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  if (
    !year ||
    !month ||
    !day ||
    year.length !== 4 ||
    month.length !== 2 ||
    day.length !== 2
  ) {
    console.error("日期组件格式不正确");
    return;
  }

  const shortYear = year.slice(2);
  monthlyFeatureImgSrc.value = `/images/地物/${shortYear}-${month}${day}.jpg`;
  console.log("更新各月份地物图片:", monthlyFeatureImgSrc.value);
}

/**
 * 5. 图片加载失败处理（补充地物类型）
 */
function handleImgError(type) {
  if (type === "monthly") {
    monthlyWaterImgSrc.value = "/images/各月份水体/25-0624.png";
    monthlyWaterDate.value = "2025-06-24";
  }
  if (type === "yearly") {
    yearlyChangeImgSrc.value = "/images/年间水体变化/2425.png";
    yearlyChangeStartYear.value = "2024";
    yearlyChangeEndYear.value = "2025";
    yearError.value = false;
  }
  if (type === "area") {
    areaChartImgSrc.value = "/images/水体面积折线图/水域面积时序.png";
    areaChartType.value = "时序";
  }
  // 地物图片错误处理
  if (type === "feature") {
    monthlyFeatureImgSrc.value = "/images/地物/25-0615.png";
    monthlyFeatureDate.value = "2025-06-15";
  }
}

/**
 * 6. 图片点击放大功能
 */
function enlargeImg(src) {
  enlargedImgSrc.value = src;
  showEnlargeModal.value = true;
}

function closeEnlargeModal() {
  showEnlargeModal.value = false;
}

// 监听年份变化，确保联动更新
watch([yearlyChangeStartYear, yearlyChangeEndYear], handleYearChange);
// 监听月份变化，确保联动更新
watch(monthlyWaterDate, updateMonthlyWaterImg);
// 监听折线图类型变化，确保联动更新
watch(areaChartType, updateAreaChartImg);
watch(monthlyFeatureDate, updateMonthlyFeatureImg); // 新增地物监听

function toggleWaterFeatures() {
  if (loadedWater.value === false) {
    // 加载水体
    selectAllSluicesDatas();
    selectAllPumpDatas();
    initializeWater();
    loadedWater.value = true;

    // 飞行到便于观察效果的坐标
    const targetPosition = Cesium.Cartesian3.fromDegrees(
      114.27387879, 
      34.786476669,
      15000
    );

    viewer.camera.flyTo({
      destination: targetPosition,
      duration: 3, // 飞行时间
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
      complete: () => {
        console.log("已飞行到智慧水体目标坐标");
      }
    });
  } else {
    // 只清除水闸和泵站模型
    clearSluiceAndPumpModels();
    loadedWater.value = false;
  }
}
function selectAllSluicesDatas() {
  // 先清除已有的水闸模型，避免重复加载
  sluiceEntities.value.forEach(entity => {
    viewer.entities.remove(entity);
  });
  sluiceEntities.value = [];

  selectAllSluicesByConditions({})
    .then((res) => {
      const result = res.response.value;
      console.log(result);
      if (result.code === 'SUCCESS') {
        sluiceDatas.value = result.body;
        console.log(sluiceDatas);
        const sluicePoints = [];
        // 遍历每个水闸数据并加载GLB模型
        sluiceDatas.value.forEach((sluice) => {
          // 从geog字段中提取经纬度
          const pointRegex = /POINT\(([\d.]+)\s([\d.]+)\)/;
          const match = sluice.geog.match(pointRegex);

          if (match && match.length === 3) {
            const longitude = parseFloat(match[1]);
            const latitude = parseFloat(match[2]);
            const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
            
            sluicePoints.push({
              id: sluice.id,
              name: sluice.name,
              text: sluice.irrname, 
              position: {
                longitude: longitude,
                latitude: latitude
              }
            });
            // 添加模型实体并保存引用
            const entity = viewer.entities.add({
              position: position,
              model: {
                uri: './sluice/sluice.glb', // GLB模型路径
                scale: 10.0, // 缩放比例
                minimumPixelSize: 32, // 最小像素大小，确保远距离可见
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              },
              show: true,
              type: 'sluice' // 添加类型标识
            });

            // 保存实体引用，便于后续删除
            sluiceEntities.value.push(entity);
          }
        });
        // 将水闸点位合并到全局waterPoints
        waterPoints.value = [...waterPoints.value, ...sluicePoints];
        initializeEntites(waterPoints.value);

      } else {
        message.error(result.msg);
      }
    })

}

function selectAllPumpDatas() {
  // 先清除已有的泵站模型，避免重复加载
  pumpEntities.value.forEach(entity => {
    viewer.entities.remove(entity);
  });
  pumpEntities.value = [];

  selectAllPumpingStationByConditions({})
    .then((res) => {
      const result = res.response.value;
      console.log(result);
      if (result.code === 'SUCCESS') {
        pumpDatas.value = result.body;
        console.log(pumpDatas);
        const pumpPoints = [];
        // 遍历每个泵站数据并加载GLB模型
        pumpDatas.value.forEach((pump) => {
          // 从geog字段中提取经纬度
          const pointRegex = /POINT\(([\d.]+)\s([\d.]+)\)/;
          const match = pump.geog.match(pointRegex);

          if (match && match.length === 3) {
            const longitude = parseFloat(match[1]);
            const latitude = parseFloat(match[2]);
            const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
            
            pumpPoints.push({
              id: pump.id,
              name: pump.name,
              text: pump.irrname,
              position: {
                longitude: longitude,
                latitude: latitude
              }
            });

            // 添加模型实体并保存引用
            const entity = viewer.entities.add({
              position: position,
              model: {
                uri: './pump/pump.glb', // GLB模型路径
                scale: 10.0, // 缩放比例
                minimumPixelSize: 32, // 最小像素大小，确保远距离可见
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              },
              show: true,
              type: 'pump' // 添加类型标识
            });

            // 保存实体引用，便于后续删除
            pumpEntities.value.push(entity);
          }
        });
        // 将泵站点位合并到全局waterPoints
        waterPoints.value = [...waterPoints.value, ...pumpPoints];
        initializeEntites(waterPoints.value);
      } else {
        message.error(result.msg);
      }
    })

}


// 清除所有水闸和泵站模型
function clearSluiceAndPumpModels() {
  // 清除水闸模型
  sluiceEntities.value.forEach(entity => {
    viewer.entities.remove(entity);
  });
  sluiceEntities.value = [];

  // 清除泵站模型
  pumpEntities.value.forEach(entity => {
    viewer.entities.remove(entity);
  });
  pumpEntities.value = [];

  //清除广告牌
  const entities = viewer.entities.values;
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i];
    // 通过monitoItems.data判断是否为水闸/泵站相关实体
    if (entity.monitoItems && entity.monitoItems.data && 
        waterPoints.value.some(point => point.id === entity.monitoItems.data.id)) {
      viewer.entities.remove(entity);
    }
  }
  waterPoints.value = [];
}

async function initializeEntites(points) {
  // // 创建带有图片的实体
  //  try {
  //   viewer.entities.add({
  //     name: '泵站',
  //     position: Cesium.Cartesian3.fromDegrees(114.3472038, 34.7961106, 0),
  //     billboard: {
  //       image: marker,
  //       width: 40.85,
  //       height: 95.8,
  //       verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  //       heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  //       pixelOffset: new Cesium.Cartesian2(0, 16)
  //     },
  //     monitoItems: {
  //       data: {
  //         "name": "泵站位置"
  //       }
  //     },
  //   });
  // } catch (error) {
  //   if (error instanceof Cesium.DeveloperError && error.message.includes('already exists')) {
  //     console.debug('忽略重复实体ID报错（功能正常）:', error.message); 
  //     return; 
  //   }
  //   throw error;
  // }

  // // 获取地图容器和 HTML 元素
  // var cesiumContainer = document.getElementById('cesiumContainer');
  // var htmlElement = document.getElementById('htmlElement');

  // // 将 HTML 元素添加到地图容器中
  // cesiumContainer.appendChild(htmlElement);

  // // 将 HTML 元素与 Cesium 地图相对位置绑定
  // viewer.scene.preRender.addEventListener(function () {
  //   var position = Cesium.Cartesian3.fromDegrees(114.3472038, 34.7961106);
  //   var canvasPosition = viewer.scene.cartesianToCanvasCoordinates(position);
  //   if (Cesium.defined(canvasPosition)) {
  //     htmlElement.style.left = canvasPosition.x + 'px';
  //     htmlElement.style.top = canvasPosition.y + 'px';
  //   }
  // });




  // 创建一个数组来保存所有的实体
  const entities = [];


  //广告牌
  points.forEach(res => {
      const entity = viewer.entities.add({
          id: res.id,
          name: res.name,
          position: Cesium.Cartesian3.fromDegrees(res.position.longitude, res.position.latitude),
          billboard: {
              image: new Cesium.PinBuilder().fromText(res.text, Cesium.Color.ROYALBLUE, 48).toDataURL(),
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          },
          monitoItems: {
              data: res
          },
      });
      // 将实体添加到数组中
      entities.push(entity);
  });


  // 创建一个具有渐变色背景的图像
  function createGradientBackground(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    // 创建渐变
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

    // 填充渐变
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // 返回作为背景的图像
    return canvas.toDataURL('image/png');
  }
  // let model = viewer.entities.add({
  //     id: '建筑模型',
  //     position: Cesium.Cartesian3.fromDegrees(114.3472038, 34.7961106, 0),
  //     model: {
  //         uri: glbModel,
  //         minimumPixelSize: 800,
  //         maximumScale: 800,
  //         scale: 1.0, // 模型的缩放比例
  //         shadows: Cesium.ShadowMode.ENABLED // 阴影模式
  //     },
  // });
  // 使用上面创建的图像作为标签的背景
  const gradientBackground = createGradientBackground(200, 50);
// 点位信息
points.forEach(res => {
  const entity = viewer.entities.add({
    name: res.name,
    position: Cesium.Cartesian3.fromDegrees(res.position.longitude, res.position.latitude, 0),
    billboard: {
      image: marker, // 图片路径
      width: 40.85,  // 图片宽度（像素）
      height: 95.8, // 图片高度（像素）
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,// 垂直方向上的对齐方式
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 紧贴地面
      pixelOffset: new Cesium.Cartesian2(0, 16) // 偏移量，单位为像素。这里的例子是向下偏移50像素
    },
    label: {
      text: res.name,
      font: "bold 30px Helvetica", // 字体大小和样式
      scale: 0.5,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 使用填充和轮廓
      fillColor: new Cesium.Color.fromCssColorString('#47e8fe'), // 文字颜色
      outlineColor: new Cesium.Color(0, 0, 0, 0.3), // 轮廓颜色，模拟阴影
      outlineWidth: 2.0, // 轮廓宽度
      pixelOffset: new Cesium.Cartesian2(0, -100), // 负值，将标签置于广告牌上方
      showBackground: true, // 显示背景
      backgroundImage: gradientBackground, // 背景图像
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平对齐方式
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 紧贴地面
      verticalOrigin: Cesium.VerticalOrigin.TOP, // 改为顶部对齐，使标签显示在广告牌上方
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 100000) // 距离显示条件
    },
    // point: {
    //     pixelSize: 10, // 点的大小（像素）
    //     color: Cesium.Color.ROYALBLUE, // 点的颜色
    //     outlineColor: Cesium.Color.WHITE, // 点的轮廓颜色
    //     outlineWidth: 1 // 点的轮廓宽度
    // },
    monitoItems: {
      data: res
    }
  });
  // 将实体添加到数组中
  entities.push(entity);
});

  console.log("实体加载完毕");
}

function FarmLandChange() {
  if (!loadedFarmLand.value) {
    console.log("开始加载农田模型...");
    addFarmlandData();   // 你的加载函数
    loadedFarmLand.value = true;
  } else {
    console.log("移除农田模型...");
    clearFarmland();     // 移除函数
    loadedFarmLand.value = false;
  }
}

function clearFarmland() {
  if (farmlandDataSource) {
    viewer.dataSources.remove(farmlandDataSource);
    farmlandDataSource = null;
    console.log("农田模型已清除");
  }
}

//农田加载函数
const addFarmlandData = async () => {
  try {
    const response = await fetch('/nongtian/zzz.geojson');
    const geojson = await response.json();
    const features = geojson.features;

    const CHUNK_SIZE = 20; // ✅ 一批加载20个模型，防止卡顿
    let index = 0;

   farmlandDataSource = new Cesium.CustomDataSource('farmland');
viewer.dataSources.add(farmlandDataSource);


    function getFeatureCenter(feature) {
      const coords = feature.geometry.coordinates;
      const type = feature.geometry.type;
      let vertices = [];

      if (type === 'Polygon') {
        vertices = coords[0];
      } else if (type === 'MultiPolygon') {
        vertices = coords[0][0];
      } else {
        console.warn('❌ 不支持的几何类型:', type);
        return null;
      }

      const { lonSum, latSum } = vertices.reduce((acc, [lon, lat]) => {
        acc.lonSum += lon;
        acc.latSum += lat;
        return acc;
      }, { lonSum: 0, latSum: 0 });

      const centerLon = lonSum / vertices.length;
      const centerLat = latSum / vertices.length;

      return [centerLon, centerLat];
    }

    async function processChunk() {
      if (index >= features.length) {
        console.log('✅ 所有农田模型加载完成');
        viewer.zoomTo(dataSource);
        return;
      }

      const chunk = features.slice(index, index + CHUNK_SIZE);

      chunk.forEach((feature, i) => {
        const center = getFeatureCenter(feature);
        if (!center) return;

        const [lon, lat] = center;

        const entity = new Cesium.Entity({
          name: '草模型农田',
          position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
          model: {
            uri: '/nongtian/grass.glb', // ✅ 正确模型路径
            scale: 0.2,                 // ✅ 控制模型大小，防止拉伸
            minimumPixelSize: 20,
            maximumScale: 200
          },
          properties: feature.properties
        });

        farmlandDataSource.entities.add(entity);

      });

      index += CHUNK_SIZE;

      // ✅ 分帧加载，不卡顿
      setTimeout(processChunk, 100);
    }

    processChunk();
  } catch (err) {
    console.error('❌ 加载农田模型失败:', err);
  }
};
function checkCesiumLoaded() {

  // 设置定时器，每隔一段时间检查Cesium对象是否存在
  const intervalId = setInterval(async () => {
    console.log("正在等待Cesium加载");
    if (typeof Cesium !== 'undefined') {
      // Cesium对象已加载
      clearInterval(intervalId); // 停止定时器
      cesiumLoaded.value = true;
      // 执行你的操作，例如初始化Cesium地图
      await initializeCesium();
      console.log("初始化完毕");

      var eventHelper = new Cesium.EventHelper();
      var tileLoadProgressEvent = viewer.scene.globe.tileLoadProgressEvent;
      eventHelper.add(tileLoadProgressEvent, async function (e) {
        console.log('每次加载地图服务矢量切片都会进入这个回调', e);
        if (e == 0) {
          console.log("矢量切片加载完成时的回调");
          //关闭加载动画
          loadingShow.value = false;
          // 移除监听器
          eventHelper.removeAll(tileLoadProgressEvent);
          console.log("移除监听器");
          await boxesSlidein();
          console.log("页面初始化完毕!");
        }
      });
    }
  }, 1000); // 每隔1秒检查一次
}

class TreeDataLoader {
    constructor(viewer, options = {}) {
        this.viewer = viewer;
        this.config = {
            rangeUrl: './tree/TreeRange.geojson',
            pointUrl: './tree/trees.geojson',
            models: {
                high: {
                    url: './tree/tree.glb',
                    scale: 2.0,
                    maxDistance: 500
                },
                low: {
                    url: './tree/l_tree.glb',
                    scale: 2.0,
                    maxDistance: 6000
                }
            },
            heightThreshold: 5000,
            chunkSize: 200,
            idleTimeout: 15,
            maximumScreenSpaceError: 2,
            visibleDistance: 6000,
            rangeStyle: {
                fill: Cesium.Color.GREEN.withAlpha(0.3),
                stroke: Cesium.Color.GREEN
            }
        };
        Object.assign(this.config, options);

        this.rangeDataSource = null;
        this.pointDataSource = null;
        this.allPoints = [];
        this.loaded = false;
        this.isInitialized = false;//标记是否已初始化
        this.currentVisible = new Map();
        
        this.modelCaches = {
            high: null,
            low: null
        };
        this.modelInstances = new Map();
        
        this.lastCameraHeight = 0;
        this.shouldShowModels = false;
        this.isActive = false;
    }

    // 新增：初始化方法（不立即加载数据）
    async init() {
        if (this.isInitialized) return;
        
        await this._preloadModels();
        this.isInitialized = true;
        console.log('树木加载器初始化完成，等待激活');
    }

    // 新增激活方法
    async activate() {
        if (!this.isInitialized) {
            await this.init();
        }
        
        if (this.isActive) return;
        
        this.isActive = true;
        
        if (!this.loaded) {
            await this._loadRangeData();
            await this._loadAllPoints();
            this.loaded = true;
        }

        // 确保范围数据初始状态正确
      if (this.rangeDataSource) {
          const currentHeight = this.viewer.camera.positionCartographic.height;
          this.rangeDataSource.show = currentHeight >= this.config.heightThreshold;
      }
      
      // 确保点数据源显示
      if (this.pointDataSource) {
          this.pointDataSource.show = true;
      }
        
      this._setupCameraListener();
      this._updateVisibility();
    }

    // 修改 deactivate 方法
    deactivate() {
      if (!this.isActive) return;
      
      this.isActive = false;
      
      // 移除相机监听
      if (this.cameraChangedListener) {
          this.viewer.camera.changed.removeEventListener(this.cameraChangedListener);
          this.cameraChangedListener = null;
      }
      
      // 隐藏所有模型
      this._hideAllModels();
      
      // 完全移除数据源，而不是只隐藏
      if (this.rangeDataSource) {
          this.viewer.dataSources.remove(this.rangeDataSource);
          this.rangeDataSource = null;
      }
      
      if (this.pointDataSource) {
          this.viewer.dataSources.remove(this.pointDataSource);
          this.pointDataSource = null;
      }
      
      // 重置状态
      this.loaded = false;
      this.allPoints = [];
      this.currentVisible.clear();
      this.modelInstances.clear();
      
      console.log('树木加载器已停用');
    }

    // 新增：切换显示状态
    toggle() {
      if (this.loaded && this.shouldShowModels) {
          this.deactivate();
      } else {
          this.activate();
      }
    }

    async _preloadModels() {
        try {
            for (const [key, modelConfig] of Object.entries(this.config.models)) {
                this.modelCaches[key] = await Cesium.Model.fromGltfAsync({
                    url: modelConfig.url,
                    scale: modelConfig.scale,
                    maximumScreenSpaceError: this.config.maximumScreenSpaceError,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                });
                console.log(`已预加载 ${key} 精度模型: ${modelConfig.url}`);
            }
        } catch (e) {
            console.error('模型加载失败:', e);
        }
    }

    _getAppropriateModel(distance) {
        if (distance <= this.config.models.high.maxDistance) {
            return 'high';
        } else {
            return 'low';
        }
    }

    _isInViewFrustum(position) {
        /*ry {
            const camera = this.viewer.camera;
            const cullingVolume = camera.frustum.computeCullingVolume(
                camera.position, 
                camera.direction, 
                camera.up
            );
            
            const boundingSphere = new Cesium.BoundingSphere(position, 1.0);
            const visibility = cullingVolume.computeVisibility(boundingSphere);
            
            return visibility !== Cesium.Intersect.OUTSIDE;
        } catch (e) {
            console.warn('视锥体检测出错:', e);
            return true;
        }*/
        return true;
    }

    _syncModelVisibility(visiblePoints, cameraPosition) {
        const newVisibleIds = new Set(visiblePoints.map(p => p.id));
        const entitiesToHide = [];

        this.currentVisible.forEach((entity, id) => {
            if (!newVisibleIds.has(id)) {
                entitiesToHide.push(id);
            }
        });

        entitiesToHide.forEach(id => {
            const entity = this.currentVisible.get(id);
            if (entity) {
                entity.show = false;
                entity._currentInView = false;
            }
        });

        this._processVisiblePointsBatch(visiblePoints, cameraPosition, 0);
    }

    _processVisiblePointsBatch(visiblePoints, cameraPosition, startIndex) {
        const batchSize = 50;
        const endIndex = Math.min(startIndex + batchSize, visiblePoints.length);

        for (let i = startIndex; i < endIndex; i++) {
            const point = visiblePoints[i];
            this._updateOrCreateEntity(point, cameraPosition);
        }

        if (endIndex < visiblePoints.length) {
            requestIdleCallback(() => {
                this._processVisiblePointsBatch(visiblePoints, cameraPosition, endIndex);
            }, { timeout: 50 });
        }
    }

    _updateOrCreateEntity(point, cameraPosition) {
        const inViewFrustum = this._isInViewFrustum(point.position);
        
        let entity = this.currentVisible.get(point.id);
        
        if (!inViewFrustum) {
            if (entity) {
                entity.show = false;
                entity._currentInView = false;
            }
            return;
        }

        const distance = Cesium.Cartesian3.distance(cameraPosition, point.position);
        const modelType = this._getAppropriateModel(distance);
        
        const currentModelType = this.modelInstances.get(point.id);

        if (entity) {
            if (currentModelType !== modelType) {
                this._updateEntityModel(entity, point, modelType);
                this.modelInstances.set(point.id, modelType);
            }
            entity.show = true;
            entity._currentInView = true;
        } else {
            this._createEntity(point, modelType);
        }
    }

    _createEntity(point, modelType) {
        try {
            const cachedModel = this.modelCaches[modelType];
            if (!cachedModel) {
                console.warn(`模型缓存不存在: ${modelType}`);
                return;
            }

            const entity = this.pointDataSource.entities.add({
                id: point.id,
                position: point.position,
                model: {
                    uri: this.config.models[modelType].url,
                    scale: this.config.models[modelType].scale,
                    maximumScreenSpaceError: this.config.maximumScreenSpaceError,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                },
                show: true
            });

            entity._currentInView = true;
            
            this.currentVisible.set(point.id, entity);
            this.modelInstances.set(point.id, modelType);
            
        } catch (e) {
            console.error('创建实体时出错:', e);
        }
    }

    _updateEntityModel(entity, point, newModelType) {
        try {
            entity.model = new Cesium.ModelGraphics({
                uri: this.config.models[newModelType].url,
                scale: this.config.models[newModelType].scale,
                maximumScreenSpaceError: this.config.maximumScreenSpaceError,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            });
        } catch (e) {
            console.error('更新实体模型时出错:', e);
        }
    }

    async _loadRangeData() {
      // 如果已存在，先移除
      if (this.rangeDataSource) {
          this.viewer.dataSources.remove(this.rangeDataSource);
      }
      
      this.rangeDataSource = await Cesium.GeoJsonDataSource.load(
          this.config.rangeUrl, 
          { clampToGround: true, ...this.config.rangeStyle }
      );
      this.viewer.dataSources.add(this.rangeDataSource);
      this.rangeDataSource.show = false; // 初始隐藏
    }

    async _loadAllPoints() {
      try {
          const response = await fetch(this.config.pointUrl);
          const geojson = await response.json();
          
          // 如果已存在，先移除
          if (this.pointDataSource) {
              this.viewer.dataSources.remove(this.pointDataSource);
          }
          
          this.pointDataSource = new Cesium.CustomDataSource('treeModels');
          this.viewer.dataSources.add(this.pointDataSource);

          await this._processPointsInBatches(geojson.features);
          this.loaded = true;
      } catch (e) {
          console.error('点数据加载失败:', e);
      }
    }

    _processPointsInBatches(features) {
        return new Promise((resolve) => {
            let processed = 0;
            
            const processBatch = (deadline) => {
                const startTime = performance.now();
                
                while (
                    processed < features.length &&
                    (deadline.timeRemaining() > 0 || deadline.didTimeout) &&
                    (performance.now() - startTime < this.config.idleTimeout)
                ) {
                    const feature = features[processed];
                    if (feature.geometry?.coordinates) {
                        const [lon, lat] = feature.geometry.coordinates;
                        this.allPoints.push({
                            id: `tree_${processed}`,
                            position: Cesium.Cartesian3.fromDegrees(lon, lat)
                        });
                    }
                    processed++;
                }

                if (processed < features.length) {
                    requestIdleCallback(processBatch, { timeout: 50 });
                } else {
                    console.log(`已加载 ${processed} 个树木位置`);
                    resolve();
                }
            };

            requestIdleCallback(processBatch, { timeout: 50 });
        });
    }

    _setupCameraListener() {
      // 移除之前的监听器
      if (this.cameraChangedListener) {
          this.viewer.camera.changed.removeEventListener(this.cameraChangedListener);
      }
      
      let lastUpdate = 0;
      this.cameraChangedListener = this.viewer.camera.changed.addEventListener(() => {
          if (!this.isActive) return;
          
          const now = Date.now();
          if (now - lastUpdate < 300) return;
          lastUpdate = now;
          
          this._updateVisibility();
      });
    }

    _updateVisibility() {
      // 只有在激活状态下才更新可见性
      if (!this.isActive) {
          this._hideAllModels();
          return;
      }

      const currentHeight = this.viewer.camera.positionCartographic.height;
      
      const shouldShowNow = currentHeight < this.config.heightThreshold;
      
      // 如果高度状态发生变化
      if (shouldShowNow !== this.shouldShowModels) {
        this.shouldShowModels = shouldShowNow;
        
        // 更新范围数据显示状态
        if (this.rangeDataSource) {
            this.rangeDataSource.show = !shouldShowNow;
        }

        if (!shouldShowNow) {
            // 高度超过阈值，隐藏所有模型
            this._hideAllModels();
        }
        return;
      }
      // 只有在应该显示模型时才进行后续处理
      if (!this.shouldShowModels) {
          return;
      }

      const cameraPosition = this.viewer.camera.position;
      const visiblePoints = this._getPointsInView(cameraPosition);
      this._syncModelVisibility(visiblePoints, cameraPosition);
    }


    _getPointsInView(cameraPosition) {
        return this.allPoints.filter(point => {
            const distance = Cesium.Cartesian3.distance(cameraPosition, point.position);
            return distance <= this.config.visibleDistance;
        });
    }

    _hideAllModels() {
        this.currentVisible.forEach((entity, id) => {
            try {
                entity.show = false;
                entity._currentInView = false;
            } catch (e) {
                console.warn('隐藏实体时出错:', e);
            }
        });
    }

    destroy() {
      this.isActive = false;
      if (this.pointDataSource) {
          this.viewer.dataSources.remove(this.pointDataSource);
      }
      if (this.rangeDataSource) {
          this.viewer.dataSources.remove(this.rangeDataSource);
      }
      this.currentVisible.clear();
      this.allPoints = [];
    }
  }

  // 初始化树木加载器（但不立即加载）
  const initializeTreeLoader = async () => {
      if (!treeLoader && viewer) {
          treeLoader = new TreeDataLoader(viewer, {
              heightThreshold: 4000,
              models: {
                  high: {
                      url: './tree/tree.glb',
                      scale: 2.0,
                      maxDistance: 500
                  },
                  low: {
                      url: './tree/l_tree.glb',
                      scale: 2.0,
                      maxDistance: 6000
                  }
              },
              maximumScreenSpaceError: 4,
              visibleDistance: 6000
          });
          
          // 只初始化，不加载数据
          await treeLoader.init();
          console.log('树木加载器初始化完成');
      }
      return treeLoader;
  };

  // 智慧林地按钮点击事件
  const toggleForest = async () => {
      if (forestLoading.value) return;
      
      forestLoading.value = true;
      try {
          const loader = await initializeTreeLoader();

          if (loadedForest.value) {
              // 当前已加载，需要隐藏
              loader.deactivate();
              loadedForest.value = false;
              console.log('智慧林地已隐藏');
          } else {
              // 当前未加载，需要显示
              await loader.activate();
              loadedForest.value = true;
              console.log('智慧林地已显示');

              //飞行
              viewer.camera.flyTo({
                destination: smartForestPosition,
                duration: 2.0,
                easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
            });
          }
      } catch (error) {
          console.error('操作智慧林地时出错:', error);
      } finally {
          forestLoading.value = false;
      }
  };

// 最简单的智慧林地标记
const addSmartForestMarker = () => {
    if (viewer.entities.getById('smart-forest-marker')) {
        return;
    }
    
    viewer.entities.add({
        id: 'smart-forest-marker',
        name: '智慧林地',
        position: smartForestPosition,
        billboard: {
            image: marker,
            width: 40.85,
            height: 95.8,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            pixelOffset: new Cesium.Cartesian2(0, 16)
        },
        /*label: {
            text: '智慧林地',
            font: 'bold 16px Helvetica',
            fillColor: Cesium.Color.CYAN,
            pixelOffset: new Cesium.Cartesian2(0, -60),
            showBackground: true
        }*/
    });
};

async function boxesSlidein() {
  const boxes = document.querySelectorAll(".dataBoxView");
  boxes.forEach((box) => box.classList.add("fade-out"));
  setTimeout(() => {
    boxes[0].classList.remove("slide-out-left");
    boxes[2].classList.remove("slide-out-right"); // 对应新右1（折线图）
    boxes[0].classList.add("slide-in");
    boxes[2].classList.add("slide-in");
  }, 1000);
  setTimeout(() => {
    boxes[1].classList.remove("slide-out-left");
    boxes[3].classList.remove("slide-out-right"); // 对应新右2（地物）
    boxes[1].classList.add("slide-in");
    boxes[3].classList.add("slide-in");
  }, 1500);
}


async function boxesSlideOut() {
  const boxes = document.querySelectorAll(".dataBoxView");
  boxes.forEach((box) => box.classList.add("fade-out"));
  setTimeout(() => {
    boxes[0].classList.remove("slide-in");
    boxes[2].classList.remove("slide-in");
    boxes[0].classList.add("slide-out-left");
    boxes[2].classList.add("slide-out-right");
  }, 1000);
  setTimeout(() => {
    boxes[1].classList.remove("slide-in");
    boxes[3].classList.remove("slide-in");
    boxes[1].classList.add("slide-out-left");
    boxes[3].classList.add("slide-out-right");
  }, 1500);
  const lis = document.querySelectorAll(".boxMenuView ul li");
  lis.forEach((li, index) => {
    li.style.animation = `fadeInUp 2s ease reverse`;
    li.style.animationDelay = `${index * 0.3}s`;
  });
}
async function initializeCesium() {
  // 请自己去cesium官网注册申请一个token替换
  //个人token全权限
  Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwODZhN2NiNi00N2JiLTQwMjQtOTFlZS1kZmY2MTdlMzE5M2UiLCJpZCI6MjcwODY2LCJpYXQiOjE3Mzk2Mjk1Mzh9.5jTz_wsmd8tYJSDLnUmxSpGE2d4gNp3EJqGTUjfGpf0"
  //个人令牌，双权限："eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZGU2YTc1ZS0zMmVjLTQ0YjktODthisMC05YTUxMjthisYmE3MGIiLCJpZCI6MjcwODY2LCJpYXQiOjE3Mzc1OTkwMTl9.cebCb2cPYCxfd8jVXFVB-6HpmD63nQLiEVDtO2Z7Ccs"
  //默认令牌："eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNmJkYzFiZi1jMGE2LTQ2YmYtYTAyZS1jOTNhODEwZTYzZjYiLCJpZCI6MjE2NTk4LCJpYXQiOjE3MTYyNTc5OTJ9.AbNDyzzy3zB6vFXXXnJ9HwVhNvBSbKAnhFRo3k9D3hE";
  viewer = new Cesium.Viewer("cesiumContainer", {
    geocoder: false,               // 是否显示地名查找控件
    sceneModePicker: false,         // 是否显示投影方式控件
    navigationHelpButton: false,    // 是否显示帮助信息控件
    baseLayerPicker: false,         // 是否显示图层选择控件
    homeButton: false,              // 是否显示Home按钮
    fullscreenButton: false,        // 是否显示全屏按钮
    animation: false,               // 是否显示动画控件
    shouldAnimate: true,           // 控制模型动画
    timeline: false,                // 是否显示时间轴
    selectionIndicator: false,      // 是否显示选中指示器
    infoBox: false                 // 是否显示信息框
    //terrain: new Cesium.Terrain(Cesium.CesiumTerrainProvider.fromUrl('./dixing'))//加载地形
    // 使用中国在线地图服务作为底图
    // imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
    //     url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer"
    // }),
    // imageryProvider: new Cesium.UrlTemplateImageryProvider({
    //     url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    //     layer: "tdtVecBasicLayer",
    //     style: "default",
    //     format: "image/png",
    //     tileMatrixSetID: "GoogleMapsCompatible",
    // })
  });

  // 初始化完再加载模型
  //await addFarmlandData();


  //await initializeterrain();
  //await initializeWater();
  await CesiumHandlerConfig();
  addSmartForestMarker();

  // viewer.entities.remove({
  //   id:'model',
  //   position:position,
  //   //orientation:orientation,
  //   model:{
  //       uri:'./building/building.glb',
  //   }
  // })   


  // // 倾斜视图 鼠标左键平移
  // viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.RIGHT_DRAG]

  // // 缩放设置 重新设置缩放成员
  // viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];

  // // 偏斜平移
  // //viewer.scene.screenSpaceCameraController.lookEventTypes = [ Cesium.CameraEventType.RIGHT_DRAG]

  // // 平移 添加鼠标右键  鼠标右键旋转
  // viewer.scene.screenSpaceCameraController.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG];
  // 将生成的 Primitive 添加到场景中，并缩放至目标区域

  let position = Cesium.Cartesian3.fromDegrees(114.3472038, 34.7961106, 0);
  //   let model=viewer.entities.add({
  //     id:'model',
  //     position:position,
  //     //orientation:orientation,
  //     model:{
  //         uri:'./building/building.glb',
  //     }
  //   })
  //   viewer.zoomTo(model)

  await initializeTreeLoader(); // 用于初始化但不加载数据

  //隐藏logo
  viewer._cesiumWidget._creditContainer.style.display = "none";
  // 设置最小缩放距离（以米为单位）
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1; // 例如设置为 1000 米

  // 设置最大缩放距离（以米为单位）
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 800000; // 例如设置为 5000000 米

  viewer.scene.sun.show = false;
  viewer.scene.moon.show = false;
  viewer.scene.skyBox.show = false;

  // 监听 Cesium 实体点击事件
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(onEntityClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 鼠标悬浮
  handler.setInputAction(onMovement, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



  // 监听地图视图改变事件--待修正
  viewer.scene.postRender.addEventListener(onMapViewChange, this);

  toggleWaterFeatures();  

  // 监听地图鼠标移动事件
  // viewer.screenSpaceEventHandler.setInputAction(onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



  // // 监听地图上的鼠标滚动事件
  // viewer.scene.canvas.addEventListener('wheel', onMouseWheel);

  // function onMouseWheel(event) {
  //     console.log('开始')
  // }

  // // 监听鼠标滚动结束事件
  // viewer.scene.canvas.addEventListener('wheel', onMouseWheelEnd);

  // function onMouseWheelEnd(event) {
  //     console.log('结束')

  // }
  // // 定义目标位置
  var destination = Cesium.Cartesian3.fromDegrees(114.3472038, 34.7961106, 10000);

  // 缓慢飞行到指定位置并控制方向
  viewer.camera.flyTo({
    destination: destination,
    duration: 8,// 以秒为单位的飞行时间，时间越长速度越慢
    complete: function () {
      startRotation();
    }
  });

}

function initializeBuildings() {
  console.log("loadedBuildings:" + loadedBuildings.value)
  if (loadedBuildings.value == false) {
    viewer.entities.add({
      id: 'model',
      position: position,
      //orientation:orientation,
      model: {
        uri: './building/building.glb',
      }
    })
    loadedBuildings.value = true;
  } else {
    viewer.entities.remove({
      id: 'model',
      position: position,
      //orientation:orientation,
      model: {
        uri: './building/building.glb',
      }
    })
    loadedBuildings.value = false;
  }

}

async function initializeterrain() {
  viewer.terrain = new Cesium.Terrain(Cesium.CesiumTerrainProvider.fromUrl('./dixing'));
  console.log("地形导入");
}
// 初始化失败--待处理
// 初始化地球

async function initializeWater() {
  let promise = Cesium.GeoJsonDataSource.load('./water/water.geojson');
  // 数据加载完成后渲染
  promise.then((ds) => {
    let instances = [];
    let entitys = ds.entities.values;

    entitys.forEach((e) => {
      let geometry = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(e.polygon.hierarchy.getValue().positions),
          extrudedHeight: 0,
          height: 0,
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
        }),
        // attributes: {
        //     color: Cesium.ColorGeometryInstanceAttribute.fromColor(
        //         Cesium.Color.fromRandom({
        //             alpha: 0.5
        //         })
        //     )
        // }
      });
      instances.push(geometry);
      viewer.flyTo(ds);

    });

    // 添加 GroundPrimitive 并设置其属性
    let primitive = new Cesium.GroundPrimitive({
      geometryInstances: instances, // 合并几何实例
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        aboveGround: true, // 是否在椭球面上
        material: new Cesium.Material({
          fabric: {
            type: "Water", // 使用 Water 材质模拟水面效果
            uniforms: {
              normalMap: "./water/water.jpg", // 法线贴图路径
              frequency: 2000.0, // 控制波数的数值
              animationSpeed: 0.1, // 水体动画速度
              amplitude: 5.0, // 水波动幅度
              specularIntensity: 0.5, // 镜面反射强度
              baseWaterColor: new Cesium.Color(0 / 255.0, 54 / 255.0, 84 / 255.0, 0.8) // 基础水颜色
            }
          }
        })
      })
    });

    // 将生成的 Primitive 添加到场景中，并缩放至目标区域
    viewer.scene.primitives.add(primitive);
  });
  console.log("水体加载完毕");
}

async function CesiumHandlerConfig() {

  // // 倾斜视图 鼠标左键平移
  // viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.RIGHT_DRAG]

  // // 缩放设置 重新设置缩放成员
  // viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];

  // // 偏斜平移
  // //viewer.scene.screenSpaceCameraController.lookEventTypes = [ Cesium.CameraEventType.RIGHT_DRAG]

  // // 平移 添加鼠标右键  鼠标右键旋转
  // viewer.scene.screenSpaceCameraController.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG];

/*
  //隐藏logo
  viewer._cesiumWidget._creditContainer.style.display = "none";
  // 设置最小缩放距离（以米为单位）
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1000; // 例如设置为 1000 米

  // 设置最大缩放距离（以米为单位）
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 8000000; // 例如设置为 5000000 米*/

  viewer.scene.sun.show = false;
  viewer.scene.moon.show = false;
  viewer.scene.skyBox.show = false;

  // 监听 Cesium 实体点击事件
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(onEntityClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 鼠标悬浮
  handler.setInputAction(onMovement, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



  // 监听地图视图改变事件--待修正
  viewer.scene.postRender.addEventListener(onMapViewChange, this);



  // 监听地图鼠标移动事件
  // viewer.screenSpaceEventHandler.setInputAction(onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



  // // 监听地图上的鼠标滚动事件
  // viewer.scene.canvas.addEventListener('wheel', onMouseWheel);

  // function onMouseWheel(event) {
  //     console.log('开始')
  // }

  // // 监听鼠标滚动结束事件
  // viewer.scene.canvas.addEventListener('wheel', onMouseWheelEnd);

  // function onMouseWheelEnd(event) {
  //     console.log('结束')

  // }
  console.log("Cesium配置和监听加载完毕");
}
// 实体点击事件处理函数
async function onEntityClick(movement) {
  // 获取点击位置的实体对象
  var pickedObject = viewer.scene.pick(movement.position);
  console.log(pickedObject)
  // 如果点击到了一个具有 monitoItems 属性的实体对象
  if (pickedObject && pickedObject.id && pickedObject.id.monitoItems) {
    console.log("点击对象为一个具有 monitoItems 属性的实体对象");
    // 记录点击的位置，保存为当前时间的 Cartesian 坐标
    lastClickedEntityPosition = pickedObject.id.position.getValue(Cesium.JulianDate.now());

    showModal(); // 点击后显示信息框

    // 获取实体的位置信息（Cartesian 坐标）
    const entityPosition = pickedObject.id.position.getValue(Cesium.JulianDate.now());

    // 将 Cartesian 坐标转换为窗口坐标

    const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, entityPosition);
    console.log('坐标检查点2');
    // 获取当前相机高度（Cartographic 坐标中的高度）
    const currentHeight = viewer.camera.positionCartographic.height;
    // 将实体位置从 Cartesian 坐标转换为 Cartographic 坐标（经度、纬度、高度）
    const cartographicPosition = Cesium.Cartographic.fromCartesian(entityPosition);
    console.log(cartographicPosition); // 输出 Cartographic 坐标

    // 将相机飞行到实体位置，并保持当前高度
    viewer.camera.flyTo({
      // 目标位置为实体的经度、纬度和当前高度
      currentHeight,
      destination: Cesium.Cartesian3.fromRadians(cartographicPosition.longitude, cartographicPosition.latitude, 2000),
      duration: 2 // 飞行时间（秒）
    });

    // 获取弹窗元素
    const modalElement = document.getElementById('clickPopup');
    const modal_P_Element = document.getElementById('clickPopup-p');

    // 将弹窗定位到实体位置的窗口坐标
    modalElement.style.left = windowPosition.x + 'px';
    modalElement.style.top = windowPosition.y + 'px';
    // 在弹窗中显示实体的详细信息
    // modal_P_Element.innerHTML = `${JSON.stringify(pickedObject.id.monitoItems.data)}`;
    await boxesSlideOut();
  } else {
    // 如果没有点击到目标实体，则关闭弹窗
    closeModal();
    await boxesSlidein();
    //====取消旋转======
    viewer.clock.onTick.removeEventListener(rotate);

    // 解锁相机
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  }
}


// 显示弹窗
async function showModal() {
  clickPopupShowRight.value = true;
}
// 关闭弹窗
async function closeModal() {
  clickPopupShowRight.value = false;
}


// 地图视图改变事件处理函数
async function onMapViewChange() {

  // 如果弹窗正在显示且存在点击的位置，则更新弹窗位置为点击的位置
  if (clickPopupShowRight && lastClickedEntityPosition) {
    const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, lastClickedEntityPosition);
    const modalElement = document.getElementById('clickPopup');
    // 将弹窗定位到实体位置的窗口坐标
    modalElement.style.left = windowPosition.x + 'px';
    modalElement.style.top = windowPosition.y + 'px';
  }
}


// 鼠标悬浮
async function onMovement(movement) {
  // 获取点击位置的实体对象
  var pickedObject = viewer.scene.pick(movement.endPosition);


  // // 获取鼠标在屏幕上的位置
  // const screenPosition = new Cesium.Cartesian2(movement.endPosition.x, movement.endPosition.y);

  // // 获取弹窗元素
  // const MouseZoom = document.getElementById('MouseZoom');

  // // 将弹窗定位到实体位置的窗口坐标
  // MouseZoom.style.left = screenPosition.x + 'px';
  // MouseZoom.style.top = screenPosition.y + 'px';

  // if (pickedObject && pickedObject.id._id === '建筑模型') {
  //     // 获取模型对应的实体对象
  //     var entity = viewer.entities.getById(pickedObject.id._id);
  //     // 设置模型轮廓宽度
  //     entity.model.silhouetteSize = 2;
  //     entity.model.silhouetteColor = new Cesium.Color.fromCssColorString('#47e8fe');
  // } else {
  //     // 获取模型对应的实体对象
  //     var entity = viewer.entities.getById('建筑模型');

  //     //待处理
  //     // 设置模型轮廓宽度
  //     //entity.model.silhouetteSize = 0;
  // }

  // 如果点击到了一个具有 monitoItems 属性的实体对象
  if (pickedObject && pickedObject.id && pickedObject.id.monitoItems) {

    // 获取实体的位置信息（Cartesian 坐标）
    const entityPosition = pickedObject.id.position.getValue(Cesium.JulianDate.now());

    // 将 Cartesian 坐标转换为窗口坐标
    const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, entityPosition);
    // 获取弹窗元素
    const modalElement = document.getElementById('hoverPopup');
    const modal_P_Element = document.getElementById('hoverPopup-p');

    // 将弹窗定位到实体位置的窗口坐标
    modalElement.style.left = windowPosition.x + 'px';
    modalElement.style.top = windowPosition.y + 'px';

    // 在弹窗中显示实体的详细信息
    modal_P_Element.innerHTML = `${JSON.stringify(pickedObject.id.monitoItems.data.name)}`;

    // 判断clickPopup状态决定是否显示hoverPopup
    if (!clickPopupShowRight.value) {
    }
    clickPopupShowRight.value ? hoverPopupShow.value = false : hoverPopupShow.value = true;
  } else {
    clickPopupShowRight.value = false;
    hoverPopupShow.value = false;
  }
}

// 开始旋转的函数
async function startRotation() {
  // 修改旋转的方法
  viewer.clock.onTick.addEventListener(rotate);
  //设置旋转时间
  setTimeout(() => {
    //====取消旋转======
    viewer.clock.onTick.removeEventListener(rotate);
    console.log("取消旋转");
    // 解锁相机
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    console.log("解锁相机");
  }, 10000);
}

async function rotate() {
  // 控制弧度
  if (increasing) {
    heading += 0.1;
    if (heading >= 300) { // 设定一个上限
      increasing = false;
    }
  } else {
    heading -= 0.1;
    if (heading <= 0) { // 设定一个下限
      increasing = true;
    }
  }

  // 减少俯仰角度
  if (pitch >= 30) {
    pitch -= 0.1;
  }
  // 减少距离
  if (distance < 100000) {
    distance += 30;
  }


  offset = new Cesium.HeadingPitchRange(Cesium.Math.toRadians(heading), -Cesium.Math.toRadians(pitch), distance);
  // 锁定相机
  viewer.camera.lookAt(position, offset);
}

</script>

<style lang="less" scoped>
/* ====================== 新模块样式 ====================== */
/* 自定义边框盒，替代data-view */
.custom-border-box {
  width: 100%;
  border: 1px solid rgba(71, 232, 254, 0.5);
  position: relative;
  overflow: hidden;
  background: rgba(37, 54, 54, 0.3);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 10px;
    height: 10px;
    border-top: 2px solid #47e8fe;
    border-left: 2px solid #47e8fe;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-bottom: 2px solid #47e8fe;
    border-right: 2px solid #47e8fe;
  }
}

/* 新模块内部控件容器 */
.new-module-controls {
  width: 90%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;

  /* Element Plus组件适配 */
  .el-date-picker,
  .el-select {
    width: auto;
    min-width: 120px;
  }

  .el-input__inner {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
  }

  .el-select-dropdown {
    background: rgba(17, 25, 40, 0.9);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .el-option {
    color: #fff;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

/* 年间变化模块的年份选择器特殊样式 */
.yearly-controls {
  .el-date-picker {
    max-width: 100px;
  }
}

/* 图片显示容器（确保图片自适应，不溢出） */
/* 图片容器样式 */
.img-container {
  width: 100%;
  height: calc(100% - 10px);
  /* 减去顶部控件高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* 关键：超出部分隐藏 */
  position: relative;
  background-color: rgba(0, 0, 0, 0.2);
  /* 可选：添加背景色 */
  border-radius: 4px;
  /* 可选：圆角 */

  img {
    max-width: 60%;
    /* 限制最大宽度 */
    max-height: 60%;
    /* 限制最大高度 */
    object-fit: contain;
    /* 关键：保持比例自适应 */
    display: block;
    margin: auto;

    flex-direction: column;
  }

  .img-placeholder {
    color: #7dffff;
    font-size: 14px;
    text-align: center;
    padding: 20px;
  }
}

/* 新增：地物模块图片容器专属样式（缩小图片至45%，实现左右对称） */
.feature-img-container {
  img {
    max-width: 45%;
    /* 比左侧模块小15%，视觉更对称，可根据需求微调 */
    max-height: 45%;
  }
}

/* 水体面积折线图容器样式（保持不变） */
.img-container2 {
  width: 100%;
  height: calc(100% - 10px);
  /* 减去顶部控件高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* 关键：超出部分隐藏 */
  position: relative;
  background-color: rgba(0, 0, 0, 0.2);
  /* 可选：添加背景色 */
  border-radius: 4px;
  /* 可选：圆角 */

  img {
    max-width: 80%;
    /* 限制最大宽度 */
    max-height: 80%;
    /* 限制最大高度 */
    object-fit: contain;
    /* 关键：保持比例自适应 */
    display: block;
    margin: auto;

    flex-direction: column;
  }

  .img-placeholder {
    color: #7dffff;
    font-size: 14px;
    text-align: center;
    padding: 20px;
  }
}

/* 图片放大模态框样式 */
.enlarge-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.close {
  position: absolute;
  top: 15px;
  right: 15px;
  color: #ffffff;
  font-size: 30px;
  cursor: pointer;
  z-index: 10;
}

.enlarged-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 原有样式（保留） */
.CesiumapView {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  cursor: url('../../../public/images/cesiumMap/cursor-RmLDFyYc32.png') 24 24, auto;
}

#cesiumContainer {
  height: 100%;
  width: 100%;
}


/* 弹窗内容容器 */
.clickModal-content {
  width: 450px;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(2, 7, 17, .8);
  // padding: 0 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  /* position: relative; */

  /* X 轴左移一半，Y 轴向上偏移 100% */
  transform: translate(-50%, -220%);

  font-family: PuHuiTi, serif;
  color: #ffffff;
}

.clickModal-content::after {
  content: "";
  position: absolute;
  bottom: -13px;
  /* 调整这个值来定位三角形 */
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 14px solid rgba(2, 7, 17, .8);
}

.clickPopup-title {
  // width: 100%;
  height: 35px;
  line-height: 32px;
  background: url('../../../public/images/cesiumMap/custom-styles-title-BXpsbnaH.png');
  background-size: 100% 100%;
  padding-left: 16px;
  user-select: none;
}

.clickPopupTitleText {
  font-family: YouShe, serif;
  font-weight: 400;
  font-size: 18px;
  color: transparent;
  background: linear-gradient(180deg, #ffffff 0%, #22fffe 100%);
  /* 添加必要的字体样式 */
  -webkit-background-clip: text;
  background-clip: text;
  letter-spacing: .06em;
  cursor: default;
}


.clickModal-content p {
  word-wrap: break-word;
  padding: 10px 10px 15px 10px;
  margin: 0;
  color: #bdbdbd;
}


/* 关闭按钮样式 */
.close {
  position: absolute;
  top: -5px;
  right: 2px;
  cursor: pointer;
  color: #1f7c81;
  zoom: 1.5;
}

/* 关闭按钮的样式 */
.close:hover {
  color: #7dffff;
}

/* 鼠标悬浮窗口 */
.hoverModal-content {
  width: 300px;
  height: 40px;
  line-height: 40px;
  padding: 0 10px;
  position: fixed;
  top: 0;
  left: 50%;
  color: #ffffff;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  /* X 轴左移一半，Y 轴向上偏移 100% */
  transform: translate(-50%, -330%);
  /* 穿透效果 */
  pointer-events: none;

  font-family: PuHuiTi, serif;
}

.hoverModal-content::after {
  content: "";
  position: absolute;
  bottom: -8px;
  /* 调整这个值来定位三角形 */
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 14px solid rgba(0, 0, 0, 0.8);
}


.hoverModal-content p {
  padding: 0;
  margin: 0;
}


/* 动画点 */
.mars3d-animation-point,
.mars3d-animation-point:before,
.mars3d-animation-point:after,
.mars3d-animation-point p,
.mars3d-animation-point p:before,
.mars3d-animation-point p:after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  /* 穿透效果 */
  pointer-events: none;
}

.mars3d-animation-point {
  color: #f33349;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #ff4d4d;
  cursor: pointer;
  color: #f33349;
  background: currentColor;
  z-index: 3;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 2em currentColor, 0 0 0.5em currentColor;
  position: absolute;
  left: 50%;
  top: 50%;
}

.mars3d-animation-point p {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: mars3d-animation-point-mapAni 2s ease infinite;
}

.mars3d-animation-point:before,
.mars3d-animation-point:after,
.mars3d-animation-point p:before,
.mars3d-animation-point p:after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid;
  animation: mars3d-animation-point-mapAni 1s ease infinite;
}

@keyframes mars3d-animation-point-mapAni {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }

  25% {
    width: 100%;
    height: 120%;
    opacity: 0.8;
  }

  50% {
    width: 150%;
    height: 150%;
    opacity: 0.6;
  }

  75% {
    width: 200%;
    height: 200%;
    opacity: 0.4;
  }

  100% {
    width: 250%;
    height: 250%;
    opacity: 0;
  }
}







/* loading */

.loading-box {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background-color: white;
  z-index: 9999999999;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  user-select: none;
  cursor: wait;
  font-family: PuHuiTi, serif;
}

.loading-box.active {
  display: block;
}

.spinner {
  border: 8px solid #f3f3f3;
  /* Light grey */
  border-top: 8px solid #3498db;
  /* Blue */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.5s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}





.headView {
  width: 100%;
  height: 80px;
  background: url('../../../public/images/cesiumMap/header-CE2FZDIm.png');
  background-size: 100% 100%;
  position: fixed;
  top: -2px;
  z-index: 9;


  display: flex;
  justify-content: space-between;
  align-items: start;

  color: #ffffff;

  user-select: none;
  /* 穿透效果 */
  // pointer-events: none;
}

.headTime {
  font-family: PuHuiTi, serif;
  color: #bebebe;
  padding: 8px 0 0 20px;
  pointer-events: all;
}

.headTitle {
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  font-weight: 400;
  font-size: 30px;
  line-height: 70px;
  letter-spacing: .1rem;

  font-family: YouShe, serif;
  font-style: normal;
  font-weight: 400;
}

.headWeather {
  font-family: PuHuiTi, serif;
  color: #bebebe;
  padding: 8px 20px 0 0;
  pointer-events: all;
}

.headTime:hover,
.headWeather:hover {
  color: #47e8fe;
}

/* 鼠标缩放 */
.MouseZoom {
  position: absolute;
  width: 40px;
  height: 40px;
  top: -100px;
  left: -100px;
  margin-top: -20px;
  margin-left: -20px;

  background: url("../../../public/images/cesiumMap/cursor-RmLDFyYc.png");
  background-size: 100% 100%;
  z-index: 1;

  /* 穿透效果 */
  pointer-events: none;
}


/* 盒子内容 */
.dataBoxView {
  width: 23%;
  height: calc(100%/3.5);
  position: fixed;
  z-index: 1;
  left: 20px;
  top: 70px;
  /* 穿透效果 */
  /* pointer-events: none; */
  background: linear-gradient(to right, rgba(37, 54, 54, .6) 0%, rgba(37, 54, 54, .4) 100%);
  user-select: none;
  border-radius: 6px 0 0 0;

  // 滑动特效
  transition: opacity 2s ease-in-out, transform 2s ease-in-out;
  /* 初始位置在屏幕左侧之外 */
  transform: translateX(-200%);

}

.slide-in {
  /* 目标位置 */
  transform: translateX(0) !important;
}

.slide-out-left {
  transform: translateX(-200%) !important;
}

.slide-out-right {
  transform: translateX(200%) !important;
}

.fade-out {
  animation: fadeOut 2s forwards;
}

.fade-out-back {
  animation: fadeOut 2s reverse;
}

.titleIcon {
  position: absolute;
  left: 0px;
  top: -12px;
  width: 24px;
  height: 24px;
  background-color: green;
  background: url("../../../public/images/cesiumMap/panel-header2-D01NbEeL.png");
  background-size: 100% 100%;
}

.boxTitle {
  height: 30px;
  padding-left: 24px;

  color: #ffffff;
  background: url("../../../public/images/cesiumMap/panel-header1-DVTX7Lb2.png");
  background-size: 100% 100%;

  font-family: YouShe, serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  text-shadow: 0 2px 4px rgba(2, 7, 17, .8);
}

.dataCenter {
  padding: 20px;
  color: #ffffff;
  font-family: PuHuiTi, serif;
  height: 100%;
  // background-color: red;
}


// 底部菜单
.boxMenuView {
  position: fixed;
  z-index: 1;
  bottom: 20px;
  width: 800px;
  left: 50%;
  transform: translate(-50%, 0);
  user-select: none;

  ul {
    display: flex;
    justify-content: space-between;
    align-items: center;

    li {
      width: 151px;
      height: 40px;
      line-height: 40px;
      text-shadow: 0 2px 4px rgba(2, 7, 17, .5);
      letter-spacing: .2rem;
      text-align: center;
      font-family: PangMenZhengDao, serif;
      font-style: normal;
      font-weight: 400;
      font-size: 18px;
      color: #ffffff;
      background: url('../../../public/images/cesiumMap/menu-btn-unchecked-BbOiNvmo.png');
      background-size: 100% 100%;

      opacity: 1;
    }

    li:nth-child(1) {
      background: url('../../../public/images/cesiumMap/menu-btn-checked_2-DcHCg5DW.png');
      background-size: 100% 100%;
      color: #ffdea3;

    }

    li:hover {
      color: #ffdea3;
    }

  }
}

/* 定义动画 */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(-30px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.farmland-polygon {
  stroke-width: 2px;
  stroke: #f00a0a;
  fill: rgba(0, 255, 0, 0.1);
}

/* ====================== 响应式适配 ====================== */
/* 笔记本屏幕适配 (最大宽度1440px) */
@media screen and (max-width: 1440px) {
  /* 调整悬浮窗大小 */
  .dataBoxView {
    width: 28% !important; /* 缩小宽度 */
    height: calc(100% / 4) !important; /* 增加高度比例 */
    max-height: 220px; /* 限制最大高度 */
  }
  
  /* 调整头部 */
  .headView {
    height: 70px;
  }
  
  .headTitle {
    font-size: 24px;
    line-height: 60px;
  }
  
  /* 调整底部菜单 */
  .boxMenuView {
    width: 700px;
    bottom: 10px;
  }
  
  .boxMenuView ul li {
    width: 130px;
    height: 36px;
    line-height: 36px;
    font-size: 16px;
  }
  
  /* 调整图片容器大小 */
  .img-container img,
  .feature-img-container img {
    max-width: 50% !important;
    max-height: 50% !important;
  }
  
  .img-container2 img {
    max-width: 70% !important;
    max-height: 70% !important;
  }
  
  /* 调整数据框内边距 */
  .dataCenter {
    padding: 15px;
  }
  
  /* 调整弹窗位置 */
  .clickModal-content,
  .hoverModal-content {
    transform: translate(-50%, -180%);
  }
}

/* 小屏幕笔记本适配 (最大宽度1366px) */
@media screen and (max-width: 1366px) {
  .dataBoxView {
    width: 30% !important;
    height: calc(100% / 3.8) !important;
    max-height: 200px;
  }
  
  .boxMenuView {
    width: 650px;
  }
  
  .boxMenuView ul li {
    width: 120px;
    font-size: 15px;
  }
  
  /* 进一步缩小图片 */
  .img-container img,
  .feature-img-container img {
    max-width: 45% !important;
    max-height: 45% !important;
  }
  
  .img-container2 img {
    max-width: 65% !important;
    max-height: 65% !important;
  }
  
  /* 调整模块间距 */
  .dataBoxView[style*="top: 37%"] {
    top: 32% !important;
  }
  
  .dataBoxView[style*="top: 67%"] {
    top: 62% !important;
  }
}

/* 超小屏幕适配 (最大宽度1280px) */
@media screen and (max-width: 1280px) {
  .dataBoxView {
    width: 32% !important;
  }
  
  .boxMenuView {
    width: 600px;
  }
  
  .boxMenuView ul li {
    width: 110px;
    font-size: 14px;
  }
  
  .headTitle {
    font-size: 22px;
  }
}

/* 数据菜单按钮样式 */
.data-menu-btn {
  position: fixed;
  top: 32px; 
  right: 30px;
  z-index: 10;
  /* 其他样式保持不变 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 36px;
  background: rgba(71, 232, 254, 0.2);
  border: 1px solid rgba(71, 232, 254, 0.5);
  border-radius: 4px;
  color: #47e8fe;
  font-family: PuHuiTi, serif;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  pointer-events: all;
  
  i {
    margin-right: 8px;
    font-size: 16px;
  }
  
  &:hover {
    background: rgba(71, 232, 254, 0.3);
    border-color: #47e8fe;
    box-shadow: 0 0 10px rgba(71, 232, 254, 0.5);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

/* ====================== 响应式适配 ====================== */
/* 笔记本屏幕适配 (最大宽度1440px) */
@media screen and (max-width: 1440px) {
  /* 调整数据菜单按钮 */
  .data-menu-btn {
    top: 24px; 
    right: 20px;
    width: 110px;
    height: 34px;
    font-size: 13px;
  }
}

/* 小屏幕笔记本适配 (最大宽度1366px) */
@media screen and (max-width: 1366px) {
  .data-menu-btn {
    top: 26px; /* 原11px + 15px = 26px */
    right: 15px;
    width: 100px;
    height: 32px;
    font-size: 12px;
  }
}

/* 超小屏幕适配 (最大宽度1280px) */
@media screen and (max-width: 1280px) {
  .data-menu-btn {
    top: 21px; /* 原6px + 15px = 21px */
    right: 10px;
    width: 90px;
    height: 30px;
    font-size: 11px;
  }
  
  .data-menu-btn i {
    font-size: 14px;
    margin-right: 5px;
  }
}
</style>