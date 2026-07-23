<template>
  <div class="CesiumapView">
    <!-- 顶部标题 -->

    <transition name="fade">
      <div class="headView">
        <!-- <div class="headTime">2025-4-16 16:52:36</div> -->
        <div class="headTitle">地表水资源综合信息遥感监测系统</div>
        <!-- <div class="headWeather">开封 34℃ 浮尘</div> -->
      </div>
    </transition>
        <div v-if="showHenanLayer" class="back-to-province-btn" @click="backToProvinceLayer">
      <i class="el-icon-back"></i>
      <span>返回省级视图</span>
    </div>
<!-- 右上角横向按钮容器 -->
<div style="position: absolute; top: 30px; right: 30px; z-index: 99999; display: flex; flex-direction: row; gap: 15px;">
  <!-- 1. 行政区图层按钮 -->
  <div class="admin-layer-btn" @click="toggleAdminLayer" style="position: relative; top: 0; right: 0;">
    <i class="el-icon-map-location"></i>
    <span>{{ showAdminLayer ? "关闭行政区" : "行政区图层" }}</span>
  </div>

  <!-- 2. 数据菜单按钮 -->
  <div class="data-menu-btn" @click="goToModelView" style="position: relative; top: 0; right: 0;">
    <i class="el-icon-menu"></i>
    <span>数据菜单</span>
  </div>

  <!-- 3. 测试洪水接口按钮 -->
  <div class="data-menu-btn" @click="testConnect" style="position: relative; top: 0; right: 0;">
    <i class="el-icon-connection"></i>
    <span>测试洪水接口</span>
  </div>

  <!-- 4. 加载洪水动画按钮 -->
  <div class="data-menu-btn" @click="loadFloodData" style="position: relative; top: 0; right: 0;">
    <i class="el-icon-video-play"></i>
    <span>加载洪水动画</span>
  </div>

  <!-- 5. 暂停/继续洪水动画按钮 -->
  <div class="data-menu-btn" @click="toggleFloodAnimation" style="position: relative; top: 0; right: 0;" v-if="currentRunId">
    <i v-if="floodAnimationFrameId" class="el-icon-pause"></i>
    <i v-else class="el-icon-video-play"></i>
    <span>{{ floodAnimationFrameId ? '暂停动画' : '继续动画' }}</span>
  </div>

  <!-- 洪水动画状态显示 -->
  <div class="data-menu-btn flood-status" style="position: relative; top: 0; right: 0;" v-if="currentRunId">
    <i class="el-icon-loading"></i>
    <span v-if="floodLoadingProgress < 100">预加载 {{ floodLoadingProgress }}%</span>
    <span v-else>Flood: {{ floodFrameIndex }}/{{ FLOOD_TOTAL_FRAMES_COUNT }}</span>
  </div>
</div>

    <!-- ====================== 6个模块====================== -->
    <div v-if="currentModuleGroup === 'old'">
      <!-- 1：水位 -->
      <div class="dataBoxView" :class="{ 'slide-in': dataBoxShow, 'slide-out-left': !dataBoxShow }">
        <div class="titleIcon"></div>
        <div class="boxTitle">水位</div>
        <div class="dataCenter">
          <HydrographView />
        </div>
      </div>
      <!-- 2：径流 -->
      <div class="dataBoxView" style="top: 37%" :class="{ 'slide-in': dataBoxShow, 'slide-out-left': !dataBoxShow }">
        <div class="titleIcon"></div>
        <div class="boxTitle">径流</div>
        <div class="dataCenter">
          <RunOff />
        </div>
      </div>
      <!-- 3：气象 -->
      <div class="dataBoxView" style="top: 67%" :class="{ 'slide-in': dataBoxShow, 'slide-out-left': !dataBoxShow }">
        <div class="titleIcon"></div>
        <div class="boxTitle">气象</div>
        <div class="dataCenter">
          <Atmosphere />
        </div>
      </div>

      <!-- 1：水质 -->
      <div class="dataBoxView" style="right: 20px; left: auto"
        :class="{ 'slide-in': dataBoxShow, 'slide-out-right': !dataBoxShow }">
        <div class="titleIcon"></div>
        <div class="boxTitle">水质</div>
        <div class="dataCenter">
          <WaterPhysicochemistry />
        </div>
      </div>
      <!-- 2：光谱反射率 -->
      <div class="dataBoxView" style="right: 20px; left: auto; top: 37%"
        :class="{ 'slide-in': dataBoxShow, 'slide-out-right': !dataBoxShow }">
        <div class="titleIcon"></div>
        <div class="boxTitle">光谱反射率</div>
        <div class="dataCenter">
          <SpectralReflectance />
        </div>
      </div>
      <!-- 3：土壤 -->
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
        <li @click="toggleFloodHeatmap">
          {{ floodEnabled ? "关闭模拟" : "洪水模拟" }}
        </li>
        <li @click="initializeterrain">地形加载</li>
      </ul>

    </div>
    <!-- 【新增】heatmap.js 需要的隐藏容器（必须存在且有宽高） -->
    <div id="heatmap" ref="heatmapContainer" v-show="false"></div>

    <!-- 地图 -->
    <div id="cesiumContainer"></div>

    <!-- 鼠标缩放控件 -->
    <div class="MouseZoom" id="MouseZoom"></div>

    <transition name="fade">
      <div v-if="loadingShow" class="loading-box" id="loadingBox">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
    </transition>

    <!-- 保留原有普通监测点的单弹窗（水闸/泵站用） -->
    <transition name="fade">
      <div v-show="clickPopupShowNormal">
        <div class="clickModal-content normal-popup" id="clickPopupNormal">
          <span class="close" @click="closeNormalModal">&times;</span>
          <div class="clickPopup-title">
            <div class="clickPopupTitleText">{{ normalPopupTitle }}</div>
          </div>
          <div id="clickPopup-content" style="padding: 10px">
            <p id="clickPopup-p">{{ normalPopupContent }}</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- 新增特殊监测点的双弹窗（水体图/植被覆盖/土地覆盖用） -->
    <transition name="fade">
      <div v-show="clickPopupShowLeft">
        <div class="clickModal-content left-popup" id="clickPopupLeft">
          <span class="close" @click="closeLeftModal">&times;</span>
          <div class="clickPopup-title">
            <div class="clickPopupTitleText">{{ leftPopupTitle }}</div>
          </div>
          <div style="padding: 10px">
            <img :src="leftPopupImgSrc" class="popup-img-item" @click="enlargeImg(leftPopupImgSrc)" />
          </div>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div v-show="clickPopupShowRight">
        <div class="clickModal-content right-popup" id="clickPopupRight">
          <span class="close" @click="closeRightModal">&times;</span>
          <div class="clickPopup-title">
            <div class="clickPopupTitleText">{{ rightPopupTitle }}</div>
          </div>
          <div style="padding: 10px">
            <img :src="rightPopupImgSrc" class="popup-img-item" @click="enlargeImg(rightPopupImgSrc)" />
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade2">
      <div v-show="hoverPopupShow">
        <div class="hoverModal-content" id="hoverPopup">
          <p id="hoverPopup-p">{{hoverPopupContent}}</p>
        </div>
      </div>
    </transition>

    <!-- 图片放大模态框 -->
    <transition name="fade">
      <div v-if="showEnlargeModal" class="enlarge-modal">
        <div class="modal-content">
          <span class="enlarge-close" @click="closeEnlargeModal">&times;</span>
          <img :src="enlargedImgSrc" alt="Enlarged Image" class="enlarged-img" />
        </div>
      </div>
    </transition>

    <!-- <div class="mars3d-animation-point" id="htmlElement">
      <p></p>
    </div> -->

    <!-- AI 小助手 -->
    <div class="ai-assistant">
      <div class="ai-button" @click="toggleAI" title="AI 小助手">
        <img src="/Images/ai小助手/1.gif" alt="AI 小助手" class="ai-btn-img" />
      </div>
      <transition name="fade">
        <div v-show="aiVisible" class="ai-panel">
          <div class="ai-header">
            <span>AI 小助手</span>
            <span class="close" @click="toggleAI">&times;</span>
          </div>
          <div class="ai-messages" ref="aiMessagesContainer">
            <div v-for="(m, idx) in aiMessages" :key="idx" :class="['ai-message', m.from]">
              <div class="ai-from">{{ m.from === 'assistant' ? '小助手' : '我' }}</div>
              <div class="ai-text">{{ m.text }}</div>
            </div>
          </div>
          <div class="ai-input">
            <input id="ai-input" v-model="aiInput" @keyup.enter="sendAIMessage" placeholder="请描述你的问题或命令（示例：定位到 114.34,34.79 / 放大 / 加载水体）" />
            <button @click="sendAIMessage">发送</button>
          </div>
        </div>
      </transition>
    </div>

  </div>
</template>
<script setup>
import { ref, watch, getCurrentInstance, onMounted, onUnmounted } from "vue";
//导入cesium
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import marker from "../../../public/images/cesiumMap/marker.png";
import { dialogEmits } from "element-plus";
import RunOff from "./charts/RunOff.vue"; /* 径流 */
import HydrographView from "./charts/HydrographView.vue"; /* 水位 */
import SpectralReflectance from "./charts/SpectralReflectance.vue"; /* 光谱反射率 */
import WaterPhysicochemistry from "./charts/WaterPhysicochemistry.vue"; /* 水质 */
import Atmosphere from "./charts/AtmosphereView.vue"; /* 气象 */
import WetLandView from "./charts/WetLandView.vue"; /* 土壤 */
import {
  selectAllSluicesByConditions,
  getFarmlandgeojson,
  selectAllPumpingStationByConditions,
  getProductPageData,
  getModelClassName,
  getFilesByConditions
} from "@/api/getData";
import router from "@/router";
import { resolve } from "path";
//新增：热力图
import h337 from "heatmap.js";
import { pingPython, createFloodRun, getFloodFrame, preloadFloodFrames } from '@/api/flood'
import { ElMessage } from 'element-plus'


const currentRunId = ref(null) // 改为响应式ref，用于模板显示
// 新增:洪水热力图模拟状态
const floodEnabled = ref(false);
const heatmapContainer = ref(null);

let heatmapInstance = null;
let floodEntity = null;
let floodBorderEntity = null;

let floodTimer = null;
const floodAnimationFrameId = ref(null); // 改为响应式ref，用于模板显示
const floodFrameIndex = ref(0); // 改为响应式ref，用于模板显示

// 帧缓存系统
let floodFrameCache = {}; // { frameIndex: canvas }
let floodIsPreloading = false;
let floodPreloadProgress = 0;
const floodLoadingProgress = ref(0); // 预加载进度（0-100），用于模板显示
const FLOOD_PRELOAD_BATCH = 100; // 每次预加载批次大小
const FLOOD_PRELOAD_THRESHOLD = 20; // 缓存低于20帧时开始预加载
const FLOOD_FRAME_DURATION = 50; // 每帧显示时间(ms)

// 【新增】洪水热力图相机高度控制
let floodHeightCheckHandler = null;
const FLOOD_HIDE_HEIGHT = 10000; // 1万米以下隐藏热力图
const FLOOD_CAMERA_HEIGHT = 100; // 点击洪水模拟后镜头高度
// 【新增】固定定位点
const FLOOD_CAMERA_LON = 114.321;
const FLOOD_CAMERA_LAT = 34.8642;

// Cesium 有时对“同一 canvas 对象内容变化”不刷新：用双缓冲 canvas 交替返回更稳
let bufferCanvasA = null;
let bufferCanvasB = null;
let useCanvasA = true;

// heatmap 像素尺寸（要与 CSS 的 #heatmap 宽高一致）
const HEATMAP_W = 500;
const HEATMAP_H = 500;

// 每隔多少米设一个点（控制点密度/性能）
const FLOOD_POINT_SPACING_M = 1000;

// 动画参数
const FLOOD_FRAME_MS = 120;
const FLOOD_TOTAL_FRAMES = 240;
const FLOOD_MAX_DEPTH = 100;

// 洪水贴图覆盖矩形：
// 实际布点会“只在水面多边形内部”，但 Cesium 贴图需要一个矩形区域（用水面总 bbox）
const floodBounds = ref({
  lonMin: 114.30,   // 河南区域经度范围
  latMin: 34.80,    // 河南区域纬度范围
  lonMax: 114.40,
  latMax: 34.90,
});

//【新增】缓存水面多边形（经纬度）用于“只在水面内布点” 
const waterPolygonsDeg = ref([]);
// [{ outer:[{lon,lat},...], holes:[[...],[...]] }, ...]
const waterBoundsDeg = ref(null);
// {lonMin,latMin,lonMax,latMax}

// 预生成网格点（lon/lat + 相位）
let floodGridPoints = [];
// 【新增】原水体 primitive / 材质缓存（用于蔓延层复用材质）
let waterPrimitive = null;
let waterMaterial = null;

// 【新增】蔓延层 primitive
let waterSpreadPrimitive = null;

// 【新增】蔓延动画独立定时器与帧
let waterSpreadTimer = null;
let waterSpreadFrameIndex = 0;

// 【新增】蔓延参数（可调）
const WATER_SPREAD_FRAME_MS = 80;     // 蔓延帧间隔（越大越慢）
const WATER_SPREAD_TOTAL_FRAMES = 400; // 蔓延总帧数（越大越慢越平滑）
const WATER_SPREAD_MAX_M = 60;      // 最大外扩米数（越大扩得越远）
const WATER_SPREAD_HEIGHT_M = 1.5;    // 蔓延层抬高（米，避免Z-fighting）
// 【新增】单个水面参与蔓延的最小面积（平方米）
// 小于这个值的零碎小水面，不做蔓延
const WATER_SPREAD_MIN_SINGLE_POLY_AREA_M2 = 25000; // 例：1万㎡，自行调整
// 【新增】细长水体识别参数（仅用于决定是否走“沿边界法线偏移”）
const WATER_SPREAD_SLENDER_MIN_LENGTH_M = 200; // 细长水体最小长度
const WATER_SPREAD_SLENDER_MAX_WIDTH_M = 120;  // 细长水体最大宽度
const WATER_SPREAD_SLENDER_MIN_ASPECT = 5;     // 最小长宽比


// 绿色水滴   http://mars3d.cn/project/vue/img/marker/mark-green.png
// 红色公司   http://mars3d.cn/project/vue/img/marker/mark-red.png
// 蓝色标志   http://mars3d.cn/project/vue/img/marker/mark-blue.png
const sluiceDatas = ref();
const pumpDatas = ref();
// lading
const loadingShow = ref(true);
const cesiumLoaded = ref(false);
const clickPopupShowNormal = ref(false);
const clickPopupShowLeft = ref(false);
const clickPopupShowRight = ref(false);
const normalPopupTitle = ref("");        // 普通监测点标题
const normalPopupContent = ref("");      // 普通监测点内容

const leftPopupTitle = ref("");
const rightPopupTitle = ref("");
const leftPopupImgSrc = ref("");
const rightPopupImgSrc = ref("");
const closeNormalModal = () => { clickPopupShowNormal.value = false; };
const closeLeftModal = () => { clickPopupShowLeft.value = false; };
const closeRightModal = () => { clickPopupShowRight.value = false; };
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
var offset = new Cesium.HeadingPitchRange(
  Cesium.Math.toRadians(heading),
  -Cesium.Math.toRadians(pitch),
  distance
);
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
const areaChartImgSrc = ref(
  "/images/水体/5.产品数据-月间水体变化/8-9.png图/水域面积时序.png"
);
// 6. 新模块4：各月份地物（新增）
const monthlyFeatureDate = ref("2025-06-15");
const monthlyFeatureImgSrc = ref("/images/地物/25-0615.png"); // 对应本地F盘路径
// 7. 图片放大功能
const enlargedImgSrc = ref("");
const showEnlargeModal = ref(false);
let farmlandDataSource = null;

// 智慧林地坐标
const smartForestPosition = Cesium.Cartesian3.fromDegrees(
  114.3547,
  34.81422,
  1500
);
// 行政区状态变量
const showAdminLayer = ref(false);
let adminDataSource = null;
let adminEntities = []; 

// ========== 河南省行政区相关变量 ==========
const showHenanLayer = ref(false); // 是否显示河南省详细区划
let henanDataSource = null; // 河南省数据源
let henanEntities = []; // 河南省实体数组
let doubleClickHandler = null; // 双击事件处理器
let clickTimer = null; // 双击检测计时器
let clickCount = 0; // 点击计数
// 悬浮弹窗相关
const hoverPopupContent = ref(""); 
let hoverHandler = null; 


// 行政区图层切换方法
function toggleAdminLayer() {
  if (!showAdminLayer.value) {
    addAdminLayer();
  } else {
    removeAdminLayer();
    // 同时移除河南省图层
    removeHenanLayer();
    showHenanLayer.value = false;
  }
  showAdminLayer.value = !showAdminLayer.value;
}

// 添加行政区图层
async function addAdminLayer() {
  try {
    const response = await fetch("/provincial_level_json/中国_省.geojson");
    let geojsonData = await response.json();
    delete geojsonData.crs;
    
    // 加载GeoJSON数据
    adminDataSource = await Cesium.GeoJsonDataSource.load(geojsonData, {
      clampToGround: true,
      stroke: Cesium.Color.fromCssColorString("#47e8fe"),
      strokeWidth: 2,
      fill: false,
    });

    viewer.dataSources.add(adminDataSource);
    adminEntities = [];
    
    // 遍历所有实体，设置属性
    adminDataSource.entities.values.forEach(entity => {
      if (entity.properties) {
        try {
          const nameValue = entity.properties.NAME;
          if (nameValue) {
            entity.name = nameValue;
          }
        } catch (e) {
          console.warn("获取省份名称失败:", e);
        }
      }
      
      if (!entity.name && entity.id) {
        entity.name = entity.id;
      }
      
      adminEntities.push(entity);
      
      if (entity.polygon) {
        entity.polygon.fill = false;
        entity.polygon.outline = true;
        entity.polygon.outlineColor = Cesium.Color.fromCssColorString("#47e8fe");
        entity.polygon.outlineWidth = 2;
        entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
      }
    });

    // 添加鼠标交互（原有）
    setupAdminLayerInteraction();
    
    // ========== 新增：添加双击事件监听 ==========
    setupDoubleClickHandler();
    
    console.log(`行政区图层加载成功，共加载 ${adminEntities.length} 个省份`);
    
    return true;
  } catch (error) {
    console.error("行政区图层加载失败:", error);
    return false;
  }
}

// ========== 新增：设置双击事件处理器 ==========
function setupDoubleClickHandler() {
  // 移除之前的双击处理器
  if (doubleClickHandler) {
    doubleClickHandler.destroy();
  }
  
  doubleClickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  
  // 修复：使用LEFT_DOUBLE_CLICK事件，更可靠
  doubleClickHandler.setInputAction((movement) => {
    // 处理双击逻辑
    handleDoubleClick(movement);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  
  // 清除单击检测的旧代码
  clickCount = 0;
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }
}

// ========== 新增：处理双击事件 ==========
async function handleDoubleClick(movement) {
  // 获取双击位置的地理坐标
  const ray = viewer.camera.getPickRay(movement.position);
  if (!ray) return;
  
  const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
  if (!cartesian) return;
  
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  
  // 检测是否双击在河南省内
  const clickedEntity = getEntityAtPosition(longitude, latitude);
  
  if (clickedEntity && clickedEntity.name === "河南省") {
    console.log("双击河南省，加载详细区划");
    // 传入clickedEntity参数
    await loadHenanAdminLayer(clickedEntity);
  }
}

// ========== 新增：加载河南省详细行政区划 ==========
async function loadHenanAdminLayer(clickedEntity) {
  try {
    // 隐藏省级图层
    if (adminDataSource) {
      adminDataSource.show = false;
    }
    
    removeHenanLayer();
    
    const response = await fetch("/provincial_level_json/河南省_市.geojson"); // 建议使用市级数据
    if (!response.ok) {
      throw new Error(`加载河南省GeoJSON失败: ${response.status}`);
    }
    
    let geojsonData = await response.json();
    delete geojsonData.crs;
    
    // 加载GeoJSON数据
    henanDataSource = await Cesium.GeoJsonDataSource.load(geojsonData, {
      clampToGround: true,
      stroke: Cesium.Color.fromCssColorString("#ff6b6b"), // 红色边框
      strokeWidth: 3,
      fill: false,
    });

    viewer.dataSources.add(henanDataSource);
    henanEntities = [];
    
    // 遍历所有实体，设置样式
    henanDataSource.entities.values.forEach(entity => {
      henanEntities.push(entity);
      
      if (entity.polygon) {
        entity.polygon.fill = false;
        entity.polygon.outline = true;
        entity.polygon.outlineColor = Cesium.Color.fromCssColorString("#ff6b6b");
        entity.polygon.outlineWidth = 3;
        entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
        
        // 修复悬停高亮的正确写法
        entity.polygon.onMouseOver = function() {
          this.outlineColor = Cesium.Color.YELLOW;
          this.outlineWidth = 4;
        };
        
        entity.polygon.onMouseOut = function() {
          this.outlineColor = Cesium.Color.fromCssColorString("#ff6b6b");
          this.outlineWidth = 3;
        };
      }
    });
    
    // 飞行到河南省
    flyToProvince(clickedEntity);
    
    // 显示返回按钮
    showHenanLayer.value = true;
    
    console.log(`河南省详细区划加载成功，共加载 ${henanEntities.length} 个区域`);
    
  } catch (error) {
    console.error("河南省行政区划加载失败:", error);
    // 恢复省级图层显示
    if (adminDataSource) {
      adminDataSource.show = true;
    }
    
    // 显示错误提示
    alert("加载河南省行政区划失败，请检查GeoJSON文件路径是否正确！");
  }
}


// ========== 新增：返回省级图层 ==========
function backToProvinceLayer() {
  // 移除河南省图层
  removeHenanLayer();
  
  // 显示省级图层
  if (adminDataSource) {
    adminDataSource.show = true;
  }
  
  // 隐藏返回按钮
  showHenanLayer.value = false;
  
  console.log("已返回省级行政区图层");
}

// ========== 新增：移除河南省图层 ==========
function removeHenanLayer() {
  if (henanDataSource) {
    viewer.dataSources.remove(henanDataSource);
    henanDataSource = null;
    henanEntities = [];
  }
}

// 存储当前高亮的省份
let highlightedEntity = null;


// 修改悬停检测逻辑
function setupAdminLayerInteraction() {
  // 移除之前的事件处理器
  if (hoverHandler) {
    hoverHandler.destroy();
  }
  
  hoverHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  
  // 存储上次悬停的实体
  let lastHoveredEntity = null;
  
  // 存储鼠标位置，用于悬浮窗跟随
  let lastMousePosition = null;

  // 鼠标移动事件
  hoverHandler.setInputAction((movement) => {
    // 保存鼠标位置
    lastMousePosition = movement.endPosition;
    
    // 尝试使用 Cesium 内置的 pick 方法
    let hoveredEntity = null;
    const pickedObject = viewer.scene.pick(movement.endPosition);
    if (pickedObject && pickedObject.id) {
      hoveredEntity = pickedObject.id;
    }
    
    // 如果没直接点选到，进行多边形区域检测
    if (!hoveredEntity) {
      // 获取鼠标对应的地理坐标
      const ray = viewer.camera.getPickRay(movement.endPosition);
      if (!ray) return;
      
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;
      
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      
      // 检测点在哪个行政区多边形内
      hoveredEntity = getEntityAtPosition(longitude, latitude);
    }
    
    // 更新悬停状态
    if (hoveredEntity) {
      // 获取显示名称
      let displayName = hoveredEntity.name || "未知区域";
      
      // 如果是河南省详细区划，尝试获取更友好的名称
      if (showHenanLayer.value && henanEntities.includes(hoveredEntity)) {
        if (hoveredEntity.properties) {
          // 尝试从properties中获取名称
          const possibleProps = ['NAME', 'name', '市', '县', '区', 'city', 'City', '地区'];
          for (const prop of possibleProps) {
            try {
              const val = hoveredEntity.properties[prop];
              if (val) {
                displayName = val;
                break;
              }
            } catch (e) {}
          }
        }
      }
      
      // 更新悬停弹窗
      updateHoverPopup(displayName, movement.endPosition);
      
      // 高亮显示当前悬停的区域
      if (lastHoveredEntity && lastHoveredEntity !== hoveredEntity) {
        resetHoverStyle(lastHoveredEntity);
      }
      setHoverStyle(hoveredEntity);
      
      lastHoveredEntity = hoveredEntity;
    } 
    else if (lastHoveredEntity) {
      // 移出区域
      resetHoverStyle(lastHoveredEntity);
      hoverPopupShow.value = false;
      lastHoveredEntity = null;
    }
    else if (lastMousePosition) {
      // 在同一区域内移动，更新悬浮窗位置
      updateHoverPopupPosition(movement.endPosition);
    }
    
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  hoverHandler.setInputAction((movement) => {
  const ray = viewer.camera.getPickRay(movement.position);
  if (!ray) return;
  
  const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
  if (!cartesian) return;
  
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  
  // 先取消之前的高亮
  if (highlightedEntity) {
    resetEntityStyle(highlightedEntity);
    highlightedEntity = null;
  }
  
  // 检测点击区域
  const clickedEntity = getEntityAtPosition(longitude, latitude);
  
  // ========== 新增逻辑：如果在河南详细视图且点击了其他省份 ==========
  if (showHenanLayer.value) {
    // 如果点击的实体存在且不是河南详细视图中的实体（即不是河南省内的市县）
    if (clickedEntity && !henanEntities.includes(clickedEntity)) {
      // 自动返回省级视图
      backToProvinceLayer();
      
      // 返回后重新获取点击实体（现在是省级实体）
      const newClickedEntity = getEntityAtPosition(longitude, latitude);
      if (newClickedEntity) {
        highlightedEntity = newClickedEntity;
        setHighlightStyle(highlightedEntity);
        
        // 获取显示名称并飞行
        let displayName = newClickedEntity.name || "未知区域";
        if (showHenanLayer.value && henanEntities.includes(newClickedEntity)) {
          // 这里不会进入，因为已经返回省级视图，但保留逻辑
          if (newClickedEntity.properties) {
            const possibleProps = ['NAME', 'name', '市', '县', '区', 'city', 'City', '地区'];
            for (const prop of possibleProps) {
              try {
                const val = newClickedEntity.properties[prop];
                if (val) {
                  displayName = val;
                  break;
                }
              } catch (e) {}
            }
          }
        }
        console.log(`点击选中区域: ${displayName}`);
        flyToProvince(newClickedEntity);
      }
      return; // 结束，不再执行原有逻辑
    }
  }
  if (clickedEntity) {
    highlightedEntity = clickedEntity;
    setHighlightStyle(highlightedEntity);
    
    // 获取显示名称
    let displayName = clickedEntity.name || "未知区域";
    if (showHenanLayer.value && henanEntities.includes(clickedEntity)) {
      if (clickedEntity.properties) {
        const possibleProps = ['NAME', 'name', '市', '县', '区', 'city', 'City', '地区'];
        for (const prop of possibleProps) {
          try {
            const val = clickedEntity.properties[prop];
            if (val) {
              displayName = val;
              break;
            }
          } catch (e) {}
        }
      }
    }
    
    console.log(`点击选中区域: ${displayName}`);
    flyToProvince(clickedEntity);
  }
  
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

// 新增辅助函数：根据经纬度获取对应的行政区实体
function getEntityAtPosition(longitude, latitude) {
  const point = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
  
  // 先检查河南省详细区划（如果有显示）
  if (showHenanLayer.value && henanEntities.length > 0) {
    for (const entity of henanEntities) {
      if (entity.polygon && isPointInPolygonFast(entity, point)) {
        return entity;
      }
    }
  }
  
  // 再检查省级行政区
  for (const entity of adminEntities) {
    if (entity.polygon && isPointInPolygonFast(entity, point)) {
      return entity;
    }
  }
  
  return null;
}


// 新增辅助函数：优化的点在多边形检测
function isPointInPolygonFast(entity, point) {
  if (!entity.polygon) return false;
  
  try {
    // 获取多边形的层次结构
    const hierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());
    if (!hierarchy || !hierarchy.positions) return false;
    
    const positions = hierarchy.positions;
    if (positions.length < 3) return false;
    
    // 射线法判断点是否在多边形内
    const ellipsoid = viewer.scene.globe.ellipsoid;
    const cartographic = ellipsoid.cartesianToCartographic(point);
    
    let inside = false;
    const vertices = [];
    
    // 预转换所有顶点为经纬度
    for (let i = 0; i < positions.length; i++) {
      const vertexCartographic = ellipsoid.cartesianToCartographic(positions[i]);
      vertices.push({
        lon: vertexCartographic.longitude,
        lat: vertexCartographic.latitude
      });
    }
    
    // 射线法算法
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const vi = vertices[i];
      const vj = vertices[j];
      
      if (((vi.lat > cartographic.latitude) !== (vj.lat > cartographic.latitude)) &&
          (cartographic.longitude < (vj.lon - vi.lon) * 
           (cartographic.latitude - vi.lat) / 
           (vj.lat - vi.lat) + vi.lon)) {
        inside = !inside;
      }
    }
    
    return inside;
  } catch (error) {
    console.warn("点在多边形检测出错:", error);
    return false;
  }
}

// 更新悬停弹窗
function updateHoverPopup(displayName, mousePosition) {
  if (!displayName) return;
  
  hoverPopupContent.value = displayName;
  hoverPopupShow.value = true;
  
  // 更新弹窗位置
  updateHoverPopupPosition(mousePosition);
}

// 新增函数：更新悬停弹窗位置（跟随鼠标）
function updateHoverPopupPosition(mousePosition) {
  if (!hoverPopupShow.value) return;
  
  const hoverPopup = document.getElementById("hoverPopup");
  if (!hoverPopup) return;
  
  // 设置悬浮窗位置（跟随鼠标，偏移一些距离避免遮挡）
  const offsetX = 15;
  const offsetY = 15;
  
  // 确保位置在可视区域内
  const popupWidth = hoverPopup.offsetWidth || 120;
  const popupHeight = hoverPopup.offsetHeight || 40;
  
  // 计算弹窗位置
  let left = mousePosition.x + offsetX;
  let top = mousePosition.y - popupHeight - offsetY;
  
  // 边界检查
  const canvas = viewer.scene.canvas;
  if (left + popupWidth > canvas.width) {
    left = mousePosition.x - popupWidth - offsetX;
  }
  if (top < 0) {
    top = mousePosition.y + offsetY;
  }
  
  hoverPopup.style.left = `${left}px`;
  hoverPopup.style.top = `${top}px`;
}

//设置高亮样式
function setHighlightStyle(entity) {
  if (entity && entity.polygon) {
    entity.polygon.fill = true;
    entity.polygon.material = Cesium.Color.fromCssColorString("#00ff00").withAlpha(0.3);
    entity.polygon.outlineColor = Cesium.Color.RED;
    entity.polygon.outlineWidth = 3;
  }
}
// 新增：设置悬停高亮样式
function setHoverStyle(entity) {
  if (entity && entity.polygon) {
    entity.polygon.fill = true;
    entity.polygon.material = Cesium.Color.fromCssColorString("#47e8fe").withAlpha(0.2);
    entity.polygon.outlineColor = Cesium.Color.fromCssColorString("#47e8fe");
    entity.polygon.outlineWidth = 3;
  }
}

// 新增：重置悬停样式
function resetHoverStyle(entity) {
  if (entity && entity.polygon) {
    if (showHenanLayer.value && henanEntities.includes(entity)) {
      // 河南省样式
      entity.polygon.fill = false;
      entity.polygon.outlineColor = Cesium.Color.fromCssColorString("#ff6b6b");
      entity.polygon.outlineWidth = 3;
    } else {
      // 省级样式
      entity.polygon.fill = false;
      entity.polygon.outlineColor = Cesium.Color.fromCssColorString("#47e8fe");
      entity.polygon.outlineWidth = 2;
    }
  }
}

//重置实体样式
function resetEntityStyle(entity) {
  if (entity && entity.polygon) {
    entity.polygon.fill = false;
    entity.polygon.outline = true;
    entity.polygon.outlineColor = Cesium.Color.fromCssColorString("#47e8fe");
    entity.polygon.outlineWidth = 2;
  }
}
// 辅助函数：飞行到省份
function flyToProvince(entity) {
  if (!entity) return;
  
  try {
    // 使用实体的包围盒进行飞行
    const boundingSphere = entity.boundingSphere;
    
    if (boundingSphere) {
      viewer.camera.flyToBoundingSphere(boundingSphere, {
        duration: 2,
        offset: new Cesium.HeadingPitchRange(
          0,
          Cesium.Math.toRadians(-45), // 俯视角度
          boundingSphere.radius * 1.5 // 根据省份大小调整距离
        ),
        complete: () => {
          console.log(`已飞行聚焦到 ${entity.name || '选中省份'}`);
        }
      });
    } else {
      // 如果没有包围盒，使用默认飞行参数
      viewer.flyTo(entity, {
        duration: 2,
        offset: new Cesium.HeadingPitchRange(
          0,
          Cesium.Math.toRadians(-30),
          0
        ),
        complete: () => {
          console.log(`已飞行聚焦到 ${entity.name || '选中省份'}`);
        }
      });
    }
  } catch (error) {
    console.error("飞行失败:", error);
  }
}

function removeAdminLayer() {
  if (adminDataSource) {
    viewer.dataSources.remove(adminDataSource);
    adminDataSource = null;
    adminEntities = [];
    highlightedEntity = null;
    
    // 清理事件处理器
    if (hoverHandler) {
      hoverHandler.destroy();
      hoverHandler = null;
    }
    
    // 清理双击事件处理器
    if (doubleClickHandler) {
      doubleClickHandler.destroy();
      doubleClickHandler = null;
    }
    
    // 移除河南省图层
    removeHenanLayer();
    showHenanLayer.value = false;
    
    // 隐藏悬浮弹窗
    hoverPopupShow.value = false;
    
    console.log("自定义行政区图层已移除");
  } else {
    console.log("行政区图层未加载，无需移除");
  }
}
// 产品分类映射
const classNameInfo = ref({
  'plant': '地表水生态',
  'plantChange': '地表水生态变化',
  'land': '地表水环境',
  'landChange': '地表水格局演变',
  'water': '地表水资源',
  'waterChange': '地表水资源变化',
  'RSEI': '生态指数',
  'RSEIChange': '生态指数变化'
})

// 产品图片缓存
const productImageCache = ref({})


onMounted(async () => {
  const instance = getCurrentInstance();
  if (instance) {
    instance.proxy.$nextTick(() => {
      console.log("实体化完成。");
      checkCesiumLoaded();
      updateAreaChartImg(); // 初始化水体面积折线图（默认时序）
      updateMonthlyFeatureImg(); // 初始化各月份地物图片
    });
  }
});
onUnmounted(() => {
  clearProductImageCache();
  if (treeLoader) {
    treeLoader.destroy();
    treeLoader = null;
  }
  removeAdminLayer();
  stopFloodHeatmap();
});

function goToModelView() {
  console.log(localStorage);
  setTimeout(resolve, 10000);
  router.push("/mainMenu");
}

// 原有：模块切换函数
/*
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
*/
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
  areaChartImgSrc.value = `/images/水体/5.产品数据-月间水体变化/8-9.png图/水域面积${areaChartType.value}.png`;
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
    areaChartImgSrc.value =
      "/images/水体/5.产品数据-月间水体变化/8-9.png图/水域面积时序.png";
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

// ====================== AI 小助手 状态与逻辑 ======================
const aiVisible = ref(false);
const aiMessages = ref([
  { from: "assistant", text: "你好，我是 AI 小助手，有什么我可以帮你的吗？" },
]);
const aiInput = ref("");

function toggleAI() {
  aiVisible.value = !aiVisible.value;
  // 打开时聚焦输入框
  if (aiVisible.value) {
    setTimeout(() => {
      const el = document.getElementById("ai-input");
      if (el) el.focus();
      // 滚动到底部
      const c = document.querySelector(".ai-messages");
      if (c) c.scrollTop = c.scrollHeight;
    }, 80);
  }
}

async function sendAIMessage() {
  const text = (aiInput.value || "").trim();
  if (!text) return;
  aiMessages.value.push({ from: "user", text });
  aiInput.value = "";

  // 尝试请求后端 AI 接口，若不可用则使用本地规则回复
  let reply = "";
  try {
    const base = process.env.VUE_APP_AI_PROXY_URL || '';
    const url = base ? `${base}/api/ai-assistant` : '/api/ai-assistant';
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    if (resp.ok) {
      const textBody = await resp.text();
      console.log('AI proxy response text:', textBody.slice(0,500));
      // 尝试解析 JSON，否则直接使用返回的原始文本
      let json;
      try { json = JSON.parse(textBody); } catch (e) { json = null; }
      const rawReply = (json && (json.reply || json.result)) || textBody;
      // 解析并合并可能的 NDJSON/分片回复
      reply = parseLLMReply(rawReply) || "抱歉，未收到有效回复";
    } else {
      reply = ruleBasedReply(text);
    }
  } catch (e) {
    // 网络或未实现的接口走本地规则
    reply = ruleBasedReply(text);
  }

  aiMessages.value.push({ from: "assistant", text: reply });

  // 优先使用 LLM 的回答执行命令（例如 LLM 可能返回“放大到 ...”），若无效果也尝试使用用户原始指令
  handleAssistantCommand(reply);
  handleAssistantCommand(text);

  // 确保消息区域滚动到底部
  setTimeout(() => {
    const c = document.querySelector(".ai-messages");
    if (c) c.scrollTop = c.scrollHeight;
  }, 120);
}

function ruleBasedReply(text) {
  const t = String(text || "").toLowerCase();
  if (t.includes("放大")) return "好的，帮你放大地图视图。";
  if (t.includes("缩小")) return "好的，帮你缩小地图视图。";
  if (t.includes("定位")) return "请告诉我经度和纬度，例如：定位到 114.34,34.79 或 定位到 114.34 34.79";
  if (t.includes("加载水体") || t.includes("加载 水体")) return loadedWater.value ? "水体已加载。" : "收到，我将在地图上加载智慧水体。";
  if (t.includes("隐藏水体")) return "收到，我将移除水体图层。";
  return "抱歉，我还在学习中。你可以尝试询问其他相关水利问题。";
}

// 解析来自本地大模型的回复（可能是 NDJSON / 多行 JSON / 转义的 JSON 字符串）并合并为可读文本
function parseLLMReply(raw) {
  if (!raw) return '';
  // 规范化转义的换行符和引号
  let s = String(raw).replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\"/g, '"');

  // 简单短句直接返回
  if (!/\{|\n/.test(s)) return s;

  // 尝试从文本中提取多个 JSON 对象（支持没有真实换行但包含多个 JSON 的情况）
  function extractJsonObjects(text) {
    const objs = [];
    let depth = 0;
    let start = -1;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          objs.push(text.slice(start, i + 1));
          start = -1;
        }
      }
    }
    return objs;
  }

  const parts = [];

  // 1) 优先按行拆分并解析每一行
  const lines = s.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.response) parts.push(String(obj.response));
      else if (obj.output) {
        if (Array.isArray(obj.output)) parts.push(obj.output.map(o => (typeof o === 'string' ? o : (o?.content || o?.text || JSON.stringify(o)))).join(''));
        else parts.push(typeof obj.output === 'string' ? obj.output : (obj.output?.content || obj.output?.text || JSON.stringify(obj.output)));
      } else if (obj.text) parts.push(obj.text);
      else if (obj.result) parts.push(obj.result);
    } catch (e) {
      // 继续 - 有可能该行不是 JSON
    }
  }

  // 2) 如果行解析没有结果，尝试从整体中抽取 JSON 对象并解析
  if (parts.length === 0) {
    const objs = extractJsonObjects(s);
    for (const j of objs) {
      try {
        const obj = JSON.parse(j);
        if (obj.response) parts.push(String(obj.response));
        else if (obj.output) {
          if (Array.isArray(obj.output)) parts.push(obj.output.map(o => (typeof o === 'string' ? o : (o?.content || o?.text || JSON.stringify(o)))).join(''));
          else parts.push(typeof obj.output === 'string' ? obj.output : (obj.output?.content || obj.output?.text || JSON.stringify(obj.output)));
        } else if (obj.text) parts.push(obj.text);
        else if (obj.result) parts.push(obj.result);
      } catch (e) {
        // ignore
      }
    }
  }

  if (parts.length > 0) return parts.join('');

  // 3) 最后尝试整体解析为 JSON
  try {
    const obj = JSON.parse(s);
    if (obj.reply) return String(obj.reply);
    if (obj.output) return Array.isArray(obj.output) ? obj.output.join('') : (obj.output?.content || obj.output?.text || String(obj.output));
    if (obj.text) return String(obj.text);
    if (obj.result) return String(obj.result);
  } catch (e) {
    // not JSON
  }

  // 返回原始文本
  return s;
}

function handleAssistantCommand(text) {
  if (!viewer) return;
  const t = String(text || "").replace(/，/g, ",").trim().toLowerCase();

  // 缩放（通过调整相机高度）
  function adjustCameraScale(factor) {
    try {
      const carto = Cesium.Cartographic.fromCartesian(viewer.camera.position);
      const lon = carto.longitude;
      const lat = carto.latitude;
      const height = carto.height || 10000;
      const newHeight = Math.max(10, height * factor);
      viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromRadians(lon, lat, newHeight), duration: 1 });
    } catch (e) {
      console.warn('调整相机高度失败', e);
    }
  }

  if (t.includes("放大")) {
    adjustCameraScale(0.5);
  }
  if (t.includes("缩小")) {
    adjustCameraScale(2.0);
  }
  if (t.includes("加载水体")) {
    if (!loadedWater.value) toggleWaterFeatures();
  }
  if (t.includes("隐藏水体")) {
    if (loadedWater.value) toggleWaterFeatures();
  }

  // 定位：尝试解析经纬度
  if (t.startsWith("定位到") || t.startsWith("定位")) {
    const nums = t.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
    if (nums) {
      const lon = parseFloat(nums[1]);
      const lat = parseFloat(nums[2]);
      viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(lon, lat, 15000), duration: 2 });
      aiMessages.value.push({ from: "assistant", text: `已前往 ${lon}, ${lat}` });
    } else {
      aiMessages.value.push({ from: "assistant", text: "无法解析坐标，请使用“定位到 经度,纬度”格式" });
    }
  }
}

// 监听年份变化，确保联动更新
watch([yearlyChangeStartYear, yearlyChangeEndYear], handleYearChange);
// 监听月份变化，确保联动更新
watch(monthlyWaterDate, updateMonthlyWaterImg);
// 监听折线图类型变化，确保联动更新
watch(areaChartType, updateAreaChartImg);
watch(monthlyFeatureDate, updateMonthlyFeatureImg); // 新增地物监听


// 新增：洪水模拟：几何判断/布点/贴图
// 米→经纬度步长（近似，足够用于布点）
function metersToDegStep(latDeg, meters) {
  const dLat = meters / 111320;
  const dLon = meters / (111320 * Math.cos((latDeg * Math.PI) / 180));
  return { dLat, dLon };
}
// 【新增】经纬度转局部平面坐标（米）
// 用于近似计算单个水面 polygon 面积
function projectLonLatToMeters(lon, lat, lon0, lat0) {
  const R = 6378137;
  const x = ((lon - lon0) * Math.PI / 180) * R * Math.cos((lat0 * Math.PI) / 180);
  const y = ((lat - lat0) * Math.PI / 180) * R;
  return { x, y };
}

// 【新增】计算单个环面积（平方米）
function calcRingAreaM2(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return 0;

  let lon0 = 0;
  let lat0 = 0;

  for (const p of ring) {
    lon0 += Number(p.lon) || 0;
    lat0 += Number(p.lat) || 0;
  }

  lon0 /= ring.length;
  lat0 /= ring.length;

  const pts = ring.map(p =>
    projectLonLatToMeters(
      Number(p.lon) || 0,
      Number(p.lat) || 0,
      lon0,
      lat0
    )
  );

  let sum = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    sum += pts[j].x * pts[i].y - pts[i].x * pts[j].y;
  }

  return Math.abs(sum) * 0.5;
}
// 【新增】计算 ring 周长（米）
// 用于更稳地识别弯曲细长水体
function calcRingPerimeterM(ring) {
  if (!Array.isArray(ring) || ring.length < 2) return 0;

  let lon0 = 0;
  let lat0 = 0;
  for (const p of ring) {
    lon0 += Number(p.lon) || 0;
    lat0 += Number(p.lat) || 0;
  }
  lon0 /= ring.length;
  lat0 /= ring.length;

  const pts = ring.map(p =>
    projectLonLatToMeters(
      Number(p.lon) || 0,
      Number(p.lat) || 0,
      lon0,
      lat0
    )
  );

  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    sum += Math.sqrt(dx * dx + dy * dy);
  }

  return sum;
}
// 【新增】计算带洞多边形面积（平方米）
function calcPolygonAreaM2(poly) {
  if (!poly || !Array.isArray(poly.outer) || poly.outer.length < 3) return 0;

  const outerArea = calcRingAreaM2(poly.outer);
  const holesArea = (poly.holes || []).reduce((sum, hole) => {
    return sum + calcRingAreaM2(hole);
  }, 0);

  return Math.max(0, outerArea - holesArea);
}

// 【新增】筛选“允许参与蔓延”的水面 polygon
function getSpreadEligiblePolygons(polys) {
  if (!Array.isArray(polys) || polys.length === 0) return [];

  return polys.filter(poly => {
    const areaM2 = calcPolygonAreaM2(poly);
    return areaM2 >= WATER_SPREAD_MIN_SINGLE_POLY_AREA_M2;
  });
}

// 点在环内（射线法）
function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].lon, yi = ring[i].lat;
    const xj = ring[j].lon, yj = ring[j].lat;

    const intersect =
      (yi > lat) !== (yj > lat) &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + 0.0) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

// 点在多边形内：在外环内 且 不在任何 hole 内
function pointInPolygonWithHoles(lon, lat, poly) {
  if (!pointInRing(lon, lat, poly.outer)) return false;
  if (poly.holes?.length) {
    for (const hole of poly.holes) {
      if (hole?.length && pointInRing(lon, lat, hole)) return false;
    }
  }
  return true;
}

// 只在水面多边形内部生成网格点
function buildFloodGridPoints() {
  const polys = waterPolygonsDeg.value;
  const pts = [];

  // 如果水面还没加载出多边形，退化为 floodBounds 矩形布点
  if (!polys || polys.length === 0) {
    const b = floodBounds.value;
    const latMid = (b.latMin + b.latMax) / 2;
    const { dLat, dLon } = metersToDegStep(latMid, FLOOD_POINT_SPACING_M);

    for (let lat = b.latMin; lat <= b.latMax; lat += dLat) {
      for (let lon = b.lonMin; lon <= b.lonMax; lon += dLon) {
        pts.push({ lon, lat, phase: Math.random() * Math.PI * 2 });
      }
    }
    floodGridPoints = pts;
    return;
  }

  // 有水面多边形：按每个 poly 的 bbox 产候选点 + 点在多边形内判断
  for (const poly of polys) {
    if (!poly?.outer?.length) continue;

    let lonMin = Infinity, latMin = Infinity, lonMax = -Infinity, latMax = -Infinity;
    for (const p of poly.outer) {
      lonMin = Math.min(lonMin, p.lon);
      latMin = Math.min(latMin, p.lat);
      lonMax = Math.max(lonMax, p.lon);
      latMax = Math.max(latMax, p.lat);
    }
    if (!isFinite(lonMin)) continue;

    const latMid = (latMin + latMax) / 2;
    const { dLat, dLon } = metersToDegStep(latMid, FLOOD_POINT_SPACING_M);

    for (let lat = latMin; lat <= latMax; lat += dLat) {
      for (let lon = lonMin; lon <= lonMax; lon += dLon) {
        if (pointInPolygonWithHoles(lon, lat, poly)) {
          pts.push({ lon, lat, phase: Math.random() * Math.PI * 2 });
        }
      }
    }
  }

  floodGridPoints = pts;

  // 同步 floodBounds 为水面总 bbox（用于 Cesium Rectangle 覆盖范围）
  if (waterBoundsDeg.value) {
    floodBounds.value = { ...waterBoundsDeg.value };
  }
}

// 经纬度→热力图像素（方法：线性归一化）
function lonLatToHeatXY(lon, lat) {
  const b = floodBounds.value;
  const x = Math.floor(((lon - b.lonMin) / (b.lonMax - b.lonMin)) * HEATMAP_W);
  const y = Math.floor(((b.latMax - lat) / (b.latMax - b.latMin)) * HEATMAP_H);
  return { x, y };
}

// 给每个点一个水深值（有真实数据时，只替换这个函数即可）
function calcDepthAtPoint(p, tSec) {
  const b = floodBounds.value;
  const u = (p.lon - b.lonMin) / (b.lonMax - b.lonMin); // 0~1
  const v = (p.lat - b.latMin) / (b.latMax - b.latMin); // 0~1

  // 前沿从西→东推进（循环）
  const front = (tSec / 18) % 1;
  const behind = front - u;

  const base = Math.max(0, Math.min(1, behind * 2.2)) * FLOOD_MAX_DEPTH;
  const wave = 0.18 * FLOOD_MAX_DEPTH * Math.sin(2 * Math.PI * (tSec * 0.25 + v) + p.phase);

  return Math.max(0, Math.min(FLOOD_MAX_DEPTH, base + wave));
}

// 生成某一帧热力图 canvas（双缓冲交替返回）
function getFloodCanvasForFrame(frameIdx) {
  if (!heatmapContainer.value) return null;

  const tSec = (frameIdx * FLOOD_FRAME_MS) / 1000;

  const points = [];
  let localMax = 1;

  for (const p of floodGridPoints) {
    const value = Math.floor(calcDepthAtPoint(p, tSec));
    localMax = Math.max(localMax, value);
    const { x, y } = lonLatToHeatXY(p.lon, p.lat);
    points.push({ x, y, value });
  }

  if (!heatmapInstance) {
    heatmapInstance = h337.create({
      container: heatmapContainer.value,
      radius: 18,
      blur: 0.85,
    });
  }

  heatmapInstance.setData({
    max: localMax,
    min: 0,
    data: points,
  });

  const src = heatmapContainer.value.querySelector(".heatmap-canvas");
  if (!src) return null;

  if (!bufferCanvasA) {
    bufferCanvasA = document.createElement("canvas");
    bufferCanvasA.width = src.width;
    bufferCanvasA.height = src.height;
  }
  if (!bufferCanvasB) {
    bufferCanvasB = document.createElement("canvas");
    bufferCanvasB.width = src.width;
    bufferCanvasB.height = src.height;
  }

  const dst = useCanvasA ? bufferCanvasA : bufferCanvasB;
  useCanvasA = !useCanvasA;

  if (dst.width !== src.width) dst.width = src.width;
  if (dst.height !== src.height) dst.height = src.height;

  const ctx = dst.getContext("2d");
  ctx.clearRect(0, 0, dst.width, dst.height);
  ctx.drawImage(src, 0, 0);

  return dst;
}

function startFloodHeatmap() {
  if (!viewer) return;

  // 1) 确保 heatmap 容器尺寸正确
  if (heatmapContainer.value) {
    heatmapContainer.value.style.width = `${HEATMAP_W}px`;
    heatmapContainer.value.style.height = `${HEATMAP_H}px`;
  }

  // 2) 只在水面多边形内部布点
  buildFloodGridPoints();

  // 3) 动态材质（CallbackProperty + ImageMaterialProperty）
  const dynamicImage = new Cesium.CallbackProperty(() => {
    return getFloodCanvasForFrame(floodFrameIndex.value);
  }, false);

  const b = floodBounds.value;

  // 清旧防重复
  if (floodEntity) viewer.entities.remove(floodEntity);
  if (floodBorderEntity) viewer.entities.remove(floodBorderEntity);

  floodEntity = viewer.entities.add({
    name: "flood-heatmap",
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(
        b.lonMin,
        b.latMin,
        b.lonMax,
        b.latMax
      ),
      material: new Cesium.ImageMaterialProperty({
        image: dynamicImage,
        transparent: true,
      }),
      outline: true,
      outlineColor: Cesium.Color.RED.withAlpha(0.6),
    },
  });

  // 可选：画边框方便校准（不影响功能）
  const borderHeights = [
    b.lonMin, b.latMin, 1200,
    b.lonMax, b.latMin, 1200,
    b.lonMax, b.latMax, 1200,
    b.lonMin, b.latMax, 1200,
    b.lonMin, b.latMin, 1200,
  ];
  floodBorderEntity = viewer.entities.add({
    name: "flood-heatmap-border",
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights(borderHeights),
      width: 2,
      material: Cesium.Color.RED,
      clampToGround: false,
    },
  });
  // 可调参数：-90 是完全俯视，越接近 0 越平视
  const FLOOD_CAMERA_HEADING = 0;     // 朝向
  const FLOOD_CAMERA_PITCH = -45;     // 倾斜角，建议 -35 到 -60 之间
  const FLOOD_CAMERA_ROLL = 0;
  // 4) 点击洪水模拟后，定位到指定 POINT，并把镜头拉到 500 米高度
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      FLOOD_CAMERA_LON,
      FLOOD_CAMERA_LAT,
      FLOOD_CAMERA_HEIGHT
    ),
    orientation: {
      heading: Cesium.Math.toRadians(FLOOD_CAMERA_HEADING),
      pitch: Cesium.Math.toRadians(FLOOD_CAMERA_PITCH),
      roll: Cesium.Math.toRadians(FLOOD_CAMERA_ROLL),
    },
    duration: 2,
    easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
  });

  // 5) 一万米高度以下不显示热力图
  if (floodHeightCheckHandler) {
    viewer.scene.preRender.removeEventListener(floodHeightCheckHandler);
    floodHeightCheckHandler = null;
  }

  floodHeightCheckHandler = function () {
    if (!viewer) return;

    const cameraHeight = viewer.camera.positionCartographic.height;
    const shouldShow = cameraHeight >= FLOOD_HIDE_HEIGHT;

    if (floodEntity) {
      floodEntity.show = shouldShow;
    }
    if (floodBorderEntity) {
      floodBorderEntity.show = shouldShow;
    }
  };

  viewer.scene.preRender.addEventListener(floodHeightCheckHandler);

  // 启动后立刻执行一次，避免初始状态不对
  floodHeightCheckHandler();

  // 6) 帧动画推进
  if (floodTimer) window.clearInterval(floodTimer);
  floodTimer = window.setInterval(() => {
    floodFrameIndex.value = (floodFrameIndex.value + 1) % FLOOD_TOTAL_FRAMES;
    viewer.scene?.requestRender?.();
  }, FLOOD_FRAME_MS);

  floodEnabled.value = true;

  // 【新增】启动蔓延（与热力图无关，独立定时器）
  startWaterSpread();
}

function stopFloodHeatmap() {
  floodEnabled.value = false;

  if (floodTimer) {
    window.clearInterval(floodTimer);
    floodTimer = null;
  }
  floodFrameIndex.value = 0;

  // 【新增】移除高度监听，避免重复绑定或关闭后仍继续执行
  if (viewer && floodHeightCheckHandler) {
    viewer.scene.preRender.removeEventListener(floodHeightCheckHandler);
    floodHeightCheckHandler = null;
  }

  if (viewer && floodEntity) {
    viewer.entities.remove(floodEntity);
    floodEntity = null;
  }
  if (viewer && floodBorderEntity) {
    viewer.entities.remove(floodBorderEntity);
    floodBorderEntity = null;
  }

  // 停止蔓延并清理蔓延层
  stopWaterSpread();
}

//ring 的中心点
function ringCentroidDeg(ring) {
  let sx = 0, sy = 0;
  const n = ring?.length || 1;
  for (let i = 0; i < (ring?.length || 0); i++) {
    sx += ring[i].lon;
    sy += ring[i].lat;
  }
  return { lon: sx / n, lat: sy / n };
}
// 将 ring 规范化：去掉重复闭合点、去掉相邻重复点
function normalizeRingDeg(ring) {
  if (!Array.isArray(ring)) return [];

  const out = [];
  for (const p of ring) {
    if (!p || !Number.isFinite(p.lon) || !Number.isFinite(p.lat)) continue;

    const last = out[out.length - 1];
    if (!last || last.lon !== p.lon || last.lat !== p.lat) {
      out.push({ lon: p.lon, lat: p.lat });
    }
  }

  // 如果首尾重复，去掉最后一个
  if (out.length >= 2) {
    const first = out[0];
    const last = out[out.length - 1];
    if (first.lon === last.lon && first.lat === last.lat) {
      out.pop();
    }
  }

  return out;
}

// 以局部原点做经纬度 <-> 米 的近似投影（足够用于局部河道偏移）
function projectDegToLocalXY(p, origin) {
  const latRad = origin.lat * Math.PI / 180.0;
  const metersPerDegLat = 111320.0;
  const metersPerDegLon = 111320.0 * Math.cos(latRad);

  return {
    x: (p.lon - origin.lon) * metersPerDegLon,
    y: (p.lat - origin.lat) * metersPerDegLat,
  };
}

function projectLocalXYToDeg(p, origin) {
  const latRad = origin.lat * Math.PI / 180.0;
  const metersPerDegLat = 111320.0;
  const metersPerDegLon = 111320.0 * Math.cos(latRad) || 1e-9;

  return {
    lon: origin.lon + p.x / metersPerDegLon,
    lat: origin.lat + p.y / metersPerDegLat,
  };
}

// 计算 ring 在局部平面下的有向面积
function signedAreaXY(ringXY) {
  let s = 0;
  const n = ringXY.length;
  for (let i = 0; i < n; i++) {
    const a = ringXY[i];
    const b = ringXY[(i + 1) % n];
    s += a.x * b.y - b.x * a.y;
  }
  return s * 0.5;
}

function normalizeVec2(vx, vy) {
  const len = Math.sqrt(vx * vx + vy * vy);
  if (len < 1e-9) return { x: 0, y: 0, len: 0 };
  return { x: vx / len, y: vy / len, len };
}

// 根据 ring 方向返回“外法线”
// CCW：外侧在右手边 -> (dy, -dx)
// CW ：外侧在左手边 -> (-dy, dx)
function getOutwardNormal(dx, dy, isCCW) {
  const v = normalizeVec2(dx, dy);
  if (v.len < 1e-9) return { x: 0, y: 0 };

  if (isCCW) {
    return { x: v.y, y: -v.x };
  } else {
    return { x: -v.y, y: v.x };
  }
}

// 两条二维直线求交点：L1 = p1 + t*d1, L2 = p2 + s*d2
function lineIntersection2D(p1, d1, p2, d2) {
  const cross = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(cross) < 1e-9) return null;

  const qpx = p2.x - p1.x;
  const qpy = p2.y - p1.y;
  const t = (qpx * d2.y - qpy * d2.x) / cross;

  return {
    x: p1.x + d1.x * t,
    y: p1.y + d1.y * t,
  };
}
// 【修改】计算 polygon 主轴方向上的长度/宽度（米）
// 修正点：
// 1. 不能直接用 PCA 次轴跨度当“河道宽度”，弯曲细长水体会被误判
// 2. 改为：长度取 max(PCA主轴长度, 外环周长/2)
// 3. 宽度取 面积/长度，得到平均宽度，更符合细长河道/水渠特征
function getPolygonSlimStatsM(poly) {
  if (!poly?.outer?.length || poly.outer.length < 3) return null;

  const cleanRing = normalizeRingDeg(poly.outer);
  if (cleanRing.length < 3) return null;

  const origin = ringCentroidDeg(cleanRing);
  const pts = cleanRing.map(p => projectDegToLocalXY(p, origin));
  if (pts.length < 3) return null;

  // ---------- 1) PCA 主轴长度 ----------
  let mx = 0, my = 0;
  for (const p of pts) {
    mx += p.x;
    my += p.y;
  }
  mx /= pts.length;
  my /= pts.length;

  let xx = 0, xy = 0, yy = 0;
  for (const p of pts) {
    const dx = p.x - mx;
    const dy = p.y - my;
    xx += dx * dx;
    xy += dx * dy;
    yy += dy * dy;
  }
  xx /= pts.length;
  xy /= pts.length;
  yy /= pts.length;

  const trace = xx + yy;
  const det = xx * yy - xy * xy;
  const temp = Math.sqrt(Math.max(0, trace * trace * 0.25 - det));
  const lambda1 = trace * 0.5 + temp;

  let axis1;
  if (Math.abs(xy) > 1e-9) {
    axis1 = normalizeVec2(lambda1 - yy, xy);
  } else {
    axis1 = xx >= yy ? { x: 1, y: 0, len: 1 } : { x: 0, y: 1, len: 1 };
  }

  let min1 = Infinity;
  let max1 = -Infinity;
  for (const p of pts) {
    const dx = p.x - mx;
    const dy = p.y - my;
    const s1 = dx * axis1.x + dy * axis1.y;
    min1 = Math.min(min1, s1);
    max1 = Math.max(max1, s1);
  }
  const pcaLengthM = Math.max(0, max1 - min1);

  // ---------- 2) 面积 ----------
  const areaM2 = calcPolygonAreaM2(poly);

  // ---------- 3) 周长近似中心线长度 ----------
  // 对细长水体，外环周长约等于 2*(长度 + 宽度)
  // 用 perimeter/2 作为“河道长度”的稳健近似，对弯曲河道比 bbox/PCA 次轴更稳定
  const perimeterM = calcRingPerimeterM(cleanRing);
  const perimeterBasedLengthM = Math.max(0, perimeterM * 0.5);

  // ---------- 4) 最终长度 / 平均宽度 ----------
  // 弯曲河道常常 PCA 长度偏小，所以取两者较大值
  const lengthM = Math.max(pcaLengthM, perimeterBasedLengthM);

  if (lengthM < 1e-6) return null;

  // 平均宽度 = 面积 / 长度
  const widthM = areaM2 / Math.max(lengthM, 1e-6);
  const aspect = lengthM / Math.max(widthM, 1e-6);

  return {
    lengthM,
    widthM,
    aspect,
    pcaLengthM,
    perimeterM,
    areaM2,
  };
}

// 【新增】识别是否为细长水体
function isSlenderWaterPolygon(poly) {
  const stats = getPolygonSlimStatsM(poly);
  if (!stats) return false;

  return (
    stats.lengthM >= WATER_SPREAD_SLENDER_MIN_LENGTH_M &&
    stats.widthM <= WATER_SPREAD_SLENDER_MAX_WIDTH_M &&
    stats.aspect >= WATER_SPREAD_SLENDER_MIN_ASPECT
  );
}
// 外环向外扩（改为“沿边法线偏移”，适合细长河道）
// 外环向外扩（默认：从多边形中心向外发散，适用于普通水体）
function expandRingDeg(ring, expandMeters) {
  if (!ring || ring.length < 3) return ring;

  const cleanRing = normalizeRingDeg(ring);
  if (cleanRing.length < 3) return ring;

  const c = ringCentroidDeg(cleanRing);
  const step = metersToDegStep(c.lat, expandMeters);
  const dLon = step.dLon;
  const dLat = step.dLat;

  const out = [];
  for (let i = 0; i < cleanRing.length; i++) {
    const p = cleanRing[i];
    const vx = p.lon - c.lon;
    const vy = p.lat - c.lat;
    const len = Math.sqrt(vx * vx + vy * vy) || 1;

    const ux = vx / len;
    const uy = vy / len;

    out.push({
      lon: p.lon + ux * dLon,
      lat: p.lat + uy * dLat,
    });
  }

  return out;
}
// 【新增】沿边界法线偏移（仅适用于细长水体，如细长水渠）
function expandRingByEdgeNormalDeg(ring, expandMeters) {
  if (!ring || ring.length < 3 || !expandMeters) return ring;

  const cleanRing = normalizeRingDeg(ring);
  if (cleanRing.length < 3) return ring;

  // 用中心只作为局部投影原点，不作为发散中心
  const origin = ringCentroidDeg(cleanRing);

  // 转为局部平面坐标（米）
  const ringXY = cleanRing.map(p => projectDegToLocalXY(p, origin));
  const n = ringXY.length;
  if (n < 3) return ring;

  // 判断方向：CCW 时外法线取右法线；CW 时外法线取左法线
  const isCCW = signedAreaXY(ringXY) > 0;

  const outXY = [];

  for (let i = 0; i < n; i++) {
    const prev = ringXY[(i - 1 + n) % n];
    const curr = ringXY[i];
    const next = ringXY[(i + 1) % n];

    const e1 = normalizeVec2(curr.x - prev.x, curr.y - prev.y);
    const e2 = normalizeVec2(next.x - curr.x, next.y - curr.y);

    const n1 = isCCW
      ? normalizeVec2(e1.y, -e1.x)
      : normalizeVec2(-e1.y, e1.x);

    const n2 = isCCW
      ? normalizeVec2(e2.y, -e2.x)
      : normalizeVec2(-e2.y, e2.x);

    // 顶点法线：相邻边外法线求平均
    let nv = normalizeVec2(n1.x + n2.x, n1.y + n2.y);

    // 极端情况下退化
    if (!isFinite(nv.x) || !isFinite(nv.y) || (Math.abs(nv.x) < 1e-9 && Math.abs(nv.y) < 1e-9)) {
      nv = normalizeVec2(n2.x || n1.x, n2.y || n1.y);
    }

    // 轻量 miter 修正，避免尖角位移过小
    const dot1 = Math.abs(nv.x * n1.x + nv.y * n1.y);
    const dot2 = Math.abs(nv.x * n2.x + nv.y * n2.y);
    const denom = Math.max(0.35, dot1, dot2);
    const moveDist = Math.min(expandMeters * 2.5, expandMeters / denom);

    outXY.push({
      x: curr.x + nv.x * moveDist,
      y: curr.y + nv.y * moveDist,
    });
  }

  return outXY.map(p => projectLocalXYToDeg(p, origin));
}
// 先识别细长水体：
// 细长水体 -> 沿边界法线偏移
// 其余水体 -> 继续使用从多边形中心向外发散
function expandPolygonWithHolesDeg(poly, expandMeters) {
  const useEdgeNormal = isSlenderWaterPolygon(poly);

  return {
    outer: useEdgeNormal
      ? expandRingByEdgeNormalDeg(poly.outer, expandMeters)
      : expandRingDeg(poly.outer, expandMeters),
    holes: (poly.holes || []).map(h => h),
  };
}

// 【新增】删除蔓延层 primitive
function clearWaterSpreadPrimitive() {
  if (!viewer) return;
  if (waterSpreadPrimitive) {
    try { viewer.scene.primitives.remove(waterSpreadPrimitive); } catch (e) {}
    waterSpreadPrimitive = null;
  }
}

// 【新增】构建蔓延层（用 Primitive + height 抬高，避免看不见）
function rebuildWaterSpreadPrimitive(expandMeters) {
  if (!viewer) return;
  if (!waterPolygonsDeg.value || waterPolygonsDeg.value.length === 0) return;
  if (!waterMaterial) return;

  // 先清上一帧
  clearWaterSpreadPrimitive();

  const instances = [];

  for (const poly of waterPolygonsDeg.value) {
    const ep = expandPolygonWithHolesDeg(poly, expandMeters);

    const hierarchy = new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray(ep.outer.flatMap(p => [p.lon, p.lat])),
      (ep.holes || []).map(holeRing =>
        new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray(holeRing.flatMap(p => [p.lon, p.lat]))
        )
      )
    );

    // 关键：给一个很小的 height 抬高，避开与贴地 waterPrimitive 的 z-fighting
    const geom = new Cesium.PolygonGeometry({
      polygonHierarchy: hierarchy,
      height: WATER_SPREAD_HEIGHT_M,
      vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
    });

    instances.push(new Cesium.GeometryInstance({ geometry: geom }));
  }

  waterSpreadPrimitive = new Cesium.Primitive({
    geometryInstances: instances,
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      aboveGround: true,
      material: waterMaterial, // 与原水体同材质
    }),
    asynchronous: false,
  });

  viewer.scene.primitives.add(waterSpreadPrimitive);
}
// 【新增】仅让“大于单体面积阈值”的水面参与蔓延
rebuildWaterSpreadPrimitive = function (expandMeters) {
  if (!viewer) return;
  if (!waterPolygonsDeg.value || waterPolygonsDeg.value.length === 0) return;
  if (!waterMaterial) return;

  // 先筛掉零碎小水面
  const spreadPolygons = getSpreadEligiblePolygons(waterPolygonsDeg.value);

  // 没有可参与蔓延的水面，则直接清掉蔓延层
  if (spreadPolygons.length === 0) {
    clearWaterSpreadPrimitive();
    return;
  }

  // 先清上一帧
  clearWaterSpreadPrimitive();

  const instances = [];

  for (const poly of spreadPolygons) {
    const ep = expandPolygonWithHolesDeg(poly, expandMeters);

    const hierarchy = new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray(ep.outer.flatMap(p => [p.lon, p.lat])),
      (ep.holes || []).map(holeRing =>
        new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray(holeRing.flatMap(p => [p.lon, p.lat]))
        )
      )
    );

    const geom = new Cesium.PolygonGeometry({
      polygonHierarchy: hierarchy,
      height: WATER_SPREAD_HEIGHT_M,
      vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
    });

    instances.push(new Cesium.GeometryInstance({ geometry: geom }));
  }

  if (instances.length === 0) {
    clearWaterSpreadPrimitive();
    return;
  }

  waterSpreadPrimitive = new Cesium.Primitive({
    geometryInstances: instances,
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      aboveGround: true,
      material: waterMaterial,
    }),
    asynchronous: false,
  });

  viewer.scene.primitives.add(waterSpreadPrimitive);
};

// 【新增】启动蔓延（独立于热力图定时器）
function startWaterSpread() {
  if (!viewer) return;

  // 必须有水体缓存
  if (!waterPolygonsDeg.value || waterPolygonsDeg.value.length === 0) return;
  if (!waterMaterial) return;

  // 先建第0帧
  waterSpreadFrameIndex = 0;
  rebuildWaterSpreadPrimitive(0);

  // 独立定时器
  if (waterSpreadTimer) window.clearInterval(waterSpreadTimer);
  waterSpreadTimer = window.setInterval(() => {
    waterSpreadFrameIndex = (waterSpreadFrameIndex + 1) % WATER_SPREAD_TOTAL_FRAMES;

    // easeOut：前期明显、后期趋缓
    const t01 = waterSpreadFrameIndex / (WATER_SPREAD_TOTAL_FRAMES - 1);
    const ease = 1 - Math.pow(1 - t01, 3);
    const spreadMeters = WATER_SPREAD_MAX_M * ease;

    rebuildWaterSpreadPrimitive(spreadMeters);
    viewer.scene?.requestRender?.();
  }, WATER_SPREAD_FRAME_MS);
}

// 【新增】启动蔓延前，先判断是否存在“可参与蔓延”的水面
const __rawStartWaterSpread = startWaterSpread;

startWaterSpread = function (...args) {
  const spreadPolygons = getSpreadEligiblePolygons(waterPolygonsDeg.value || []);

  if (spreadPolygons.length === 0) {
    clearWaterSpreadPrimitive();
    if (waterSpreadTimer) {
      window.clearInterval(waterSpreadTimer);
      waterSpreadTimer = null;
    }
    waterSpreadFrameIndex = 0;

    console.info(
      `[waterSpread] 已跳过蔓延：当前只有零碎小水面，单体面积阈值为 ${WATER_SPREAD_MIN_SINGLE_POLY_AREA_M2}㎡`
    );
    return;
  }

  return __rawStartWaterSpread.apply(this, args);
};
// 【新增】停止蔓延
function stopWaterSpread() {
  if (waterSpreadTimer) {
    window.clearInterval(waterSpreadTimer);
    waterSpreadTimer = null;
  }
  waterSpreadFrameIndex = 0;
  clearWaterSpreadPrimitive();
}
function toggleFloodHeatmap() {
  if (!viewer) return;
  if (!floodEnabled.value) startFloodHeatmap();
  else stopFloodHeatmap();
}

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
      },
    });
  } else {
    // 只清除水闸和泵站模型
    clearSluiceAndPumpModels();
    loadedWater.value = false;
  }
}
function selectAllSluicesDatas() {
  // 先清除已有的水闸模型，避免重复加载
  sluiceEntities.value.forEach((entity) => {
    viewer.entities.remove(entity);
  });
  sluiceEntities.value = [];

  selectAllSluicesByConditions({}).then((res) => {
    const result = res.response.value;
    console.log(result);
    if (result.success) {
      sluiceDatas.value = result.data;
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
              latitude: latitude,
            },
          });
          // 添加模型实体并保存引用
          const entity = viewer.entities.add({
            position: position,
            model: {
              uri: "./sluice/sluice.glb", // GLB模型路径
              scale: 10.0, // 缩放比例
              minimumPixelSize: 32, // 最小像素大小，确保远距离可见
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
            show: true,
            type: "sluice", // 添加类型标识
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
  });
}

function selectAllPumpDatas() {
  // 先清除已有的泵站模型，避免重复加载
  pumpEntities.value.forEach((entity) => {
    viewer.entities.remove(entity);
  });
  pumpEntities.value = [];

  selectAllPumpingStationByConditions({}).then((res) => {
    const result = res.response.value;
    console.log(result);
    if (result.success) {
      pumpDatas.value = result.data;
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
              latitude: latitude,
            },
          });

          // 添加模型实体并保存引用
          const entity = viewer.entities.add({
            position: position,
            model: {
              uri: "./pump/pump.glb", // GLB模型路径
              scale: 10.0, // 缩放比例
              minimumPixelSize: 32, // 最小像素大小，确保远距离可见
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
            show: true,
            type: "pump", // 添加类型标识
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
  });
}

// 清除所有水闸和泵站模型
function clearSluiceAndPumpModels() {
  stopFloodHeatmap();
  // 清除水闸模型
  sluiceEntities.value.forEach((entity) => {
    viewer.entities.remove(entity);
  });
  sluiceEntities.value = [];

  // 清除泵站模型
  pumpEntities.value.forEach((entity) => {
    viewer.entities.remove(entity);
  });
  pumpEntities.value = [];

  //清除广告牌
  const entities = viewer.entities.values;
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i];
    // 通过monitoItems.data判断是否为水闸/泵站相关实体
    if (
      entity.monitoItems &&
      entity.monitoItems.data &&
      waterPoints.value.some((point) => point.id === entity.monitoItems.data.id)
    ) {
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
  // points.forEach(res => {
  //     const entity = viewer.entities.add({
  //         id: res.id,
  //         name: res.name,
  //         position: Cesium.Cartesian3.fromDegrees(res.position.longitude, res.position.latitude),
  //         billboard: {
  //             image: new Cesium.PinBuilder().fromText(res.text, Cesium.Color.ROYALBLUE, 48).toDataURL(),
  //             verticalOrigin: Cesium.VerticalOrigin.BOTTOM
  //         },
  //         monitoItems: {
  //             data: res
  //         },
  //     });
  //     // 将实体添加到数组中
  //     entities.push(entity);
  // });

  // 创建一个具有渐变色背景的图像
  function createGradientBackground(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    // 创建渐变
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)");

    // 填充渐变
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // 返回作为背景的图像
    return canvas.toDataURL("image/png");
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
  points.forEach((res) => {
    const entity = viewer.entities.add({
      name: res.name,
      position: Cesium.Cartesian3.fromDegrees(
        res.position.longitude,
        res.position.latitude,
        0
      ),
      billboard: {
        image: marker, // 图片路径
        width: 40.85, // 图片宽度（像素）
        height: 95.8, // 图片高度（像素）
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直方向上的对齐方式
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 紧贴地面
        pixelOffset: new Cesium.Cartesian2(0, 16), // 偏移量，单位为像素。这里的例子是向下偏移50像素
      },
      label: {
        text: res.name,
        font: "bold 30px Helvetica", // 字体大小和样式
        scale: 0.5,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 使用填充和轮廓
        fillColor: Cesium.Color.fromCssColorString("#47e8fe"), // 文字颜色
        outlineColor: new Cesium.Color(0, 0, 0, 0.3), // 轮廓颜色，模拟阴影
        outlineWidth: 2.0, // 轮廓宽度
        pixelOffset: new Cesium.Cartesian2(0, -100), // 负值，将标签置于广告牌上方
        showBackground: true, // 显示背景
        backgroundImage: gradientBackground, // 背景图像
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平对齐方式
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 紧贴地面
        verticalOrigin: Cesium.VerticalOrigin.TOP, // 改为顶部对齐，使标签显示在广告牌上方
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          100000
        ), // 距离显示条件
      },
      // point: {
      //     pixelSize: 10, // 点的大小（像素）
      //     color: Cesium.Color.ROYALBLUE, // 点的颜色
      //     outlineColor: Cesium.Color.WHITE, // 点的轮廓颜色
      //     outlineWidth: 1 // 点的轮廓宽度
      // },
      monitoItems: {
        data: res,
      },
    });
    // 将实体添加到数组中
    entities.push(entity);
  });

  console.log("实体加载完毕");
}

function FarmLandChange() {
  if (!loadedFarmLand.value) {
    console.log("开始加载农田模型...");
    addFarmlandData(); // 你的加载函数
    loadedFarmLand.value = true;
  } else {
    console.log("移除农田模型...");
    clearFarmland(); // 移除函数
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
    const response = await fetch("/nongtian/zzz.geojson");
    const geojson = await response.json();
    const features = geojson.features;

    const CHUNK_SIZE = 20; // ✅ 一批加载20个模型，防止卡顿
    let index = 0;

    farmlandDataSource = new Cesium.CustomDataSource("farmland");
    viewer.dataSources.add(farmlandDataSource);

    function getFeatureCenter(feature) {
      const coords = feature.geometry.coordinates;
      const type = feature.geometry.type;
      let vertices = [];

      if (type === "Polygon") {
        vertices = coords[0];
      } else if (type === "MultiPolygon") {
        vertices = coords[0][0];
      } else {
        console.warn("❌ 不支持的几何类型:", type);
        return null;
      }

      const { lonSum, latSum } = vertices.reduce(
        (acc, [lon, lat]) => {
          acc.lonSum += lon;
          acc.latSum += lat;
          return acc;
        },
        { lonSum: 0, latSum: 0 }
      );

      const centerLon = lonSum / vertices.length;
      const centerLat = latSum / vertices.length;

      return [centerLon, centerLat];
    }

    async function processChunk() {
      if (index >= features.length) {
        console.log("✅ 所有农田模型加载完成");
        viewer.zoomTo(dataSource);
        return;
      }

      const chunk = features.slice(index, index + CHUNK_SIZE);

      chunk.forEach((feature, i) => {
        const center = getFeatureCenter(feature);
        if (!center) return;

        const [lon, lat] = center;

        const entity = new Cesium.Entity({
          name: "草模型农田",
          position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
          model: {
            uri: "/nongtian/grass.glb", // ✅ 正确模型路径
            scale: 0.2, // ✅ 控制模型大小，防止拉伸
            minimumPixelSize: 20,
            maximumScale: 200,
          },
          properties: feature.properties,
        });

        farmlandDataSource.entities.add(entity);
      });

      index += CHUNK_SIZE;

      // ✅ 分帧加载，不卡顿
      setTimeout(processChunk, 100);
    }

    processChunk();
  } catch (err) {
    console.error("❌ 加载农田模型失败:", err);
  }
};
function checkCesiumLoaded() {
  // 设置定时器，每隔一段时间检查Cesium对象是否存在
  const intervalId = setInterval(async () => {
    console.log("正在等待Cesium加载");
    if (typeof Cesium !== "undefined") {
      // Cesium对象已加载
      clearInterval(intervalId); // 停止定时器
      cesiumLoaded.value = true;
      // 执行你的操作，例如初始化Cesium地图
      await initializeCesium();
      console.log("初始化完毕");

      var eventHelper = new Cesium.EventHelper();
      var tileLoadProgressEvent = viewer.scene.globe.tileLoadProgressEvent;
      eventHelper.add(tileLoadProgressEvent, async function (e) {
        console.log("每次加载地图服务矢量切片都会进入这个回调", e);
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
      rangeUrl: "./tree/TreeRange.geojson",
      pointUrl: "./tree/trees.geojson",
      models: {
        high: {
          url: "./tree/tree.glb",
          scale: 2.0,
          maxDistance: 500,
        },
        low: {
          url: "./tree/l_tree.glb",
          scale: 2.0,
          maxDistance: 6000,
        },
      },
      heightThreshold: 5000,
      chunkSize: 200,
      idleTimeout: 15,
      maximumScreenSpaceError: 2,
      visibleDistance: 6000,
      rangeStyle: {
        fill: Cesium.Color.GREEN.withAlpha(0.3),
        stroke: Cesium.Color.GREEN,
      },
    };
    Object.assign(this.config, options);

    this.rangeDataSource = null;
    this.pointDataSource = null;
    this.allPoints = [];
    this.loaded = false;
    this.isInitialized = false; //标记是否已初始化
    this.currentVisible = new Map();

    this.modelCaches = {
      high: null,
      low: null,
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
    console.log("树木加载器初始化完成，等待激活");
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
      this.viewer.camera.changed.removeEventListener(
        this.cameraChangedListener
      );
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

    console.log("树木加载器已停用");
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
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        });
        console.log(`已预加载 ${key} 精度模型: ${modelConfig.url}`);
      }
    } catch (e) {
      console.error("模型加载失败:", e);
    }
  }

  _getAppropriateModel(distance) {
    if (distance <= this.config.models.high.maxDistance) {
      return "high";
    } else {
      return "low";
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
    const newVisibleIds = new Set(visiblePoints.map((p) => p.id));
    const entitiesToHide = [];

    this.currentVisible.forEach((entity, id) => {
      if (!newVisibleIds.has(id)) {
        entitiesToHide.push(id);
      }
    });

    entitiesToHide.forEach((id) => {
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
      requestIdleCallback(
        () => {
          this._processVisiblePointsBatch(
            visiblePoints,
            cameraPosition,
            endIndex
          );
        },
        { timeout: 50 }
      );
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
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        show: true,
      });

      entity._currentInView = true;

      this.currentVisible.set(point.id, entity);
      this.modelInstances.set(point.id, modelType);
    } catch (e) {
      console.error("创建实体时出错:", e);
    }
  }

  _updateEntityModel(entity, point, newModelType) {
    try {
      entity.model = new Cesium.ModelGraphics({
        uri: this.config.models[newModelType].url,
        scale: this.config.models[newModelType].scale,
        maximumScreenSpaceError: this.config.maximumScreenSpaceError,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      });
    } catch (e) {
      console.error("更新实体模型时出错:", e);
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

      this.pointDataSource = new Cesium.CustomDataSource("treeModels");
      this.viewer.dataSources.add(this.pointDataSource);

      await this._processPointsInBatches(geojson.features);
      this.loaded = true;
    } catch (e) {
      console.error("点数据加载失败:", e);
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
          performance.now() - startTime < this.config.idleTimeout
        ) {
          const feature = features[processed];
          if (feature.geometry?.coordinates) {
            const [lon, lat] = feature.geometry.coordinates;
            this.allPoints.push({
              id: `tree_${processed}`,
              position: Cesium.Cartesian3.fromDegrees(lon, lat),
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
      this.viewer.camera.changed.removeEventListener(
        this.cameraChangedListener
      );
    }

    let lastUpdate = 0;
    this.cameraChangedListener = this.viewer.camera.changed.addEventListener(
      () => {
        if (!this.isActive) return;

        const now = Date.now();
        if (now - lastUpdate < 300) return;
        lastUpdate = now;

        this._updateVisibility();
      }
    );
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
    return this.allPoints.filter((point) => {
      const distance = Cesium.Cartesian3.distance(
        cameraPosition,
        point.position
      );
      return distance <= this.config.visibleDistance;
    });
  }

  _hideAllModels() {
    this.currentVisible.forEach((entity, id) => {
      try {
        entity.show = false;
        entity._currentInView = false;
      } catch (e) {
        console.warn("隐藏实体时出错:", e);
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
          url: "./tree/tree.glb",
          scale: 2.0,
          maxDistance: 500,
        },
        low: {
          url: "./tree/l_tree.glb",
          scale: 2.0,
          maxDistance: 6000,
        },
      },
      maximumScreenSpaceError: 4,
      visibleDistance: 6000,
    });

    // 只初始化，不加载数据
    await treeLoader.init();
    console.log("树木加载器初始化完成");
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
      console.log("智慧林地已隐藏");
    } else {
      // 当前未加载，需要显示
      await loader.activate();
      loadedForest.value = true;
      console.log("智慧林地已显示");

      //飞行
      viewer.camera.flyTo({
        destination: smartForestPosition,
        duration: 2.0,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
      });
    }
  } catch (error) {
    console.error("操作智慧林地时出错:", error);
  } finally {
    forestLoading.value = false;
  }
};

// 最简单的智慧林地标记
const addSmartForestMarker = () => {
  if (viewer.entities.getById("smart-forest-marker")) {
    return;
  }

  viewer.entities.add({
    id: "smart-forest-marker",
    name: "智慧林地",
    position: smartForestPosition,
    billboard: {
      image: marker,
      width: 40.85,
      height: 95.8,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      pixelOffset: new Cesium.Cartesian2(0, 16),
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

//滑入
async function boxesSlidein() {
  const boxes = document.querySelectorAll(".dataBoxView");
  boxes.forEach((box) => box.classList.add("fade-out"));

  const leftBoxes = [0, 1, 2];
  leftBoxes.forEach((index, i) => {
    setTimeout(() => {
      boxes[index].classList.remove("slide-out-left");
      boxes[index].classList.add("slide-in");
    }, i * 500);
  });

  const rightBoxes = [3, 4, 5];
  rightBoxes.forEach((index, i) => {
    setTimeout(() => {
      boxes[index].classList.remove("slide-out-right");
      boxes[index].classList.add("slide-in");
    }, i * 500);
  });
}

// 滑出
async function boxesSlideOut() {
  const boxes = document.querySelectorAll(".dataBoxView");
  boxes.forEach((box) => box.classList.add("fade-out"));

  const leftBoxes = [0, 1, 2];
  leftBoxes.forEach((index, i) => {
    setTimeout(() => {
      boxes[index].classList.remove("slide-in");
      boxes[index].classList.add("slide-out-left");
    }, i * 500);
  });

  const rightBoxes = [3, 4, 5];
  rightBoxes.forEach((index, i) => {
    setTimeout(() => {
      boxes[index].classList.remove("slide-in");
      boxes[index].classList.add("slide-out-right");
    }, i * 500);
  });

  const lis = document.querySelectorAll(".boxMenuView ul li");
  lis.forEach((li, index) => {
    li.style.animation = `fadeInUp 2s ease reverse`;
    li.style.animationDelay = `${index * 0.3}s`;
  });
}
async function initializeCesium() {
  // 请自己去cesium官网注册申请一个token替换
  //个人token全权限
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwODZhN2NiNi00N2JiLTQwMjQtOTFlZS1kZmY2MTdlMzE5M2UiLCJpZCI6MjcwODY2LCJpYXQiOjE3Mzk2Mjk1Mzh9.5jTz_wsmd8tYJSDLnUmxSpGE2d4gNp3EJqGTUjfGpf0";
  //个人令牌，双权限："eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZGU2YTc1ZS0zMmVjLTQ0YjktODthisMC05YTUxMjthisYmE3MGIiLCJpZCI6MjcwODY2LCJpYXQiOjE3Mzc1OTkwMTl9.cebCb2cPYCxfd8jVXFVB-6HpmD63nQLiEVDtO2Z7Ccs"
  //默认令牌："eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNmJkYzFiZi1jMGE2LTQ2YmYtYTAyZS1jOTNhODEwZTYzZjYiLCJpZCI6MjE2NTk4LCJpYXQiOjE3MTYyNTc5OTJ9.AbNDyzzy3zB6vFXXXnJ9HwVhNvBSbKAnhFRo3k9D3hE";
  viewer = new Cesium.Viewer("cesiumContainer", {
    geocoder: false, // 是否显示地名查找控件
    sceneModePicker: false, // 是否显示投影方式控件
    navigationHelpButton: false, // 是否显示帮助信息控件
    baseLayerPicker: false, // 是否显示图层选择控件
    homeButton: false, // 是否显示Home按钮
    fullscreenButton: false, // 是否显示全屏按钮
    animation: false, // 是否显示动画控件
    shouldAnimate: true, // 控制模型动画
    timeline: false, // 是否显示时间轴
    selectionIndicator: false, // 是否显示选中指示器
    infoBox: false, // 是否显示信息框
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
  // addSmartForestMarker();

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

  // 设置最小缩放距离（以米为单位）
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 500; // 例如设置为 1000 米

  // 设置最大缩放距离（以米为单位）
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 8000000; // 例如设置为 5000000 米

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
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100; // 例如设置为 1000 米

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
  var destination = Cesium.Cartesian3.fromDegrees(
    114.3472038,
    34.7961106,
    10000
  );

  // 缓慢飞行到指定位置并控制方向
  viewer.camera.flyTo({
    destination: destination,
    duration: 8, // 以秒为单位的飞行时间，时间越长速度越慢
    complete: function () {
      startRotation();
    },
  });
  // ========== 监测点配置数组 ==========
  const monitorPoints = [
    {
      id: "waterChartMonitor",
      name: "地表水资源",
      className: "water",
      position: { lng: 114.358, lat: 34.805 }
    },
    {
      id: "vegetationCoverMonitor",
      name: "植被覆盖度",
      className: "plant",
      position: { lng: 114.33, lat: 34.81 }
    },
    {
      id: "landCoverMonitor",
      name: "地表水环境格局",
      className: "land",
      position: { lng: 114.365, lat: 34.79 }
    },
    {
      id: "RSEIMonitor",
      name: "生态指数",
      className: "RSEI",
      position: { lng: 114.3472038, lat: 34.7961106 }
    }
  ];

  // ========== 循环创建所有监测点实体 ==========
  monitorPoints.forEach((pointConfig) => {
    viewer.entities.add({
      id: pointConfig.id,
      name: pointConfig.name,
      position: Cesium.Cartesian3.fromDegrees(
        pointConfig.position.lng,
        pointConfig.position.lat,
        0
      ),
      billboard: {
        image: marker,
        width: 40.85,
        height: 95.8,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        pixelOffset: new Cesium.Cartesian2(0, 16),
      },

      label: {
        text: pointConfig.name + "产品",
        font: "bold 30px Helvetica",
        scale: 0.5,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.fromCssColorString("#47e8fe"),
        outlineColor: new Cesium.Color(0, 0, 0, 0.3),
        outlineWidth: 2.0,
        pixelOffset: new Cesium.Cartesian2(0, -100),
        showBackground: true,
        backgroundImage: createGradientBackground(200, 50),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          100000
        ),
      },
      monitoItems: {
        data: {
          className: pointConfig.className,
          name: pointConfig.name
        },
      },
    });
  });
}

//建筑物模型
function initializeBuildings() {
  console.log("loadedBuildings:" + loadedBuildings.value);
  if (!loadedBuildings.value) {
    viewer.entities.add({
      id: "model",
      position: position,

      model: {
        uri: "./building/building.glb",
      },
    });

    loadedBuildings.value = true;

    // 点击后自动飞到建筑
    flyTo(position);
  } else {
    const modelEntity = viewer.entities.getById("model");
    if (modelEntity) {
      viewer.entities.remove(modelEntity); // 正确删除方式
    }

    loadedBuildings.value = false;
  }
}
function flyTo(pos) {
  viewer.camera.flyTo({
    destination: pos,
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-35),
    },
    duration: 2,
  });
}

async function initializeterrain() {
  viewer.terrain = new Cesium.Terrain(
    Cesium.CesiumTerrainProvider.fromUrl("./dixing")
  );
  console.log("地形导入");
}
// 初始化失败--待处理
// 初始化地球

async function initializeWater() {
  let promise = Cesium.GeoJsonDataSource.load("./water/water.geojson");
  // 数据加载完成后渲染
  promise.then((ds) => {
    let instances = [];
    let entitys = ds.entities.values;

    //【新增】提取水面多边形（经纬度）及总 bbox，只在水面内布点
    const polys = [];
    let lonMin = Infinity, latMin = Infinity, lonMax = -Infinity, latMax = -Infinity;

    const cartesianToLonLat = (p) => {
      const c = Cesium.Cartographic.fromCartesian(p);
      const lon = Cesium.Math.toDegrees(c.longitude);
      const lat = Cesium.Math.toDegrees(c.latitude);
      return { lon, lat };
    };

    const updateBounds = ({ lon, lat }) => {
      lonMin = Math.min(lonMin, lon);
      latMin = Math.min(latMin, lat);
      lonMax = Math.max(lonMax, lon);
      latMax = Math.max(latMax, lat);
    };
    // 【新增】结束

    entitys.forEach((e) => {
      // 原来的 polygon primitive 几何构建
      let geometry = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            e.polygon.hierarchy.getValue().positions
          ),
          extrudedHeight: 0,
          height: 0,
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
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
      // 【新增】提取该面对应的外环 + holes（如果有）
      const h = e.polygon.hierarchy.getValue(Cesium.JulianDate.now());
      if (h?.positions?.length) {
        const outer = h.positions.map(cartesianToLonLat);
        outer.forEach(updateBounds);

        const holes = (h.holes || [])
          .map((hole) => (hole?.positions?.length ? hole.positions.map(cartesianToLonLat) : null))
          .filter(Boolean);

        holes.forEach((ring) => ring.forEach(updateBounds));
        polys.push({ outer, holes });
      }
    });

    //【新增】写入全局缓存（洪水布点会使用）
    waterPolygonsDeg.value = polys;
    if (isFinite(lonMin)) {
      waterBoundsDeg.value = { lonMin, latMin, lonMax, latMax };
      // 让洪水贴图覆盖范围跟水面 bbox 对齐（可选但推荐）
      floodBounds.value = { lonMin, latMin, lonMax, latMax };
    }
    // 【新增】结束
    viewer.flyTo(ds);

    // 水面材质
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
              baseWaterColor: new Cesium.Color(
                0 / 255.0,
                54 / 255.0,
                84 / 255.0,
                0.8
              ), // 基础水颜色
            },
          },
        }),
      }),
    });

    // 将生成的 Primitive 添加到场景中，并缩放至目标区域
    viewer.scene.primitives.add(primitive);

    // 你原来的水面材质创建位置：把 Material 对象缓存到 waterMaterial
    waterMaterial = new Cesium.Material({
      fabric: {
        type: "Water",
        uniforms: {
          normalMap: "./water/water.jpg",
          frequency: 2000.0,
          animationSpeed: 0.1,
          amplitude: 5.0,
          specularIntensity: 0.5,
          baseWaterColor: new Cesium.Color(
              0 / 255.0,
              54 / 255.0,
              84 / 255.0,
              0.8
          ),
        },
      },
    });

    // 你原来的 primitive：把 primitive 缓存到 waterPrimitive
    waterPrimitive = new Cesium.GroundPrimitive({
      geometryInstances: instances,
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        aboveGround: true,
        material: waterMaterial, // 用缓存材质（与原效果一致）
      }),
    });

    viewer.scene.primitives.add(waterPrimitive);
  });
  console.log("水体加载完毕");
}
function createGradientBackground(width, height) {
  // 创建一个临时 Canvas 元素
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 创建线性渐变（从左到右：浅蓝 → 深蓝，和原有实体标签渐变一致）
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "rgba(10, 40, 80, 0.8)");
  gradient.addColorStop(1, "rgba(5, 20, 40, 0.8)");

  // 填充渐变背景
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 返回 Canvas 的 DataURL（Cesium 标签的 backgroundImage 支持该格式）
  return canvas.toDataURL("image/png");
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
// 实体点击事件处理函数
async function onEntityClick(movement) {
  // 获取点击位置的实体对象
  var pickedObject = viewer.scene.pick(movement.position);
  console.log(pickedObject);
  // 如果点击到了一个具有 monitoItems 属性的实体对象
  if (pickedObject && pickedObject.id && pickedObject.id.monitoItems) {
    console.log("点击对象为一个具有 monitoItems 属性的实体对象");
    // 记录点击的位置，保存为当前时间的 Cartesian 坐标
    lastClickedEntityPosition = pickedObject.id.position.getValue(
      Cesium.JulianDate.now()
    );

    showModal(); // 点击后显示信息框

    // 获取实体的位置信息（Cartesian 坐标）
    const entityPosition = pickedObject.id.position.getValue(
      Cesium.JulianDate.now()
    );

    // 将 Cartesian 坐标转换为窗口坐标
    const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(
      viewer.scene,
      entityPosition
    );
    console.log("坐标检查点2");
    // 获取当前相机高度（Cartographic 坐标中的高度）
    const currentHeight = viewer.camera.positionCartographic.height;
    // 将实体位置从 Cartesian 坐标转换为 Cartographic 坐标（经度、纬度、高度）
    const cartographicPosition =
      Cesium.Cartographic.fromCartesian(entityPosition);
    console.log(
      cartographicPosition.longitude + " " + cartographicPosition.latitude
    ); // 输出 Cartographic 坐标

    // 将相机飞行到实体位置，并保持当前高度
    // viewer.camera.flyTo({
    //   // 目标位置为实体的经度、纬度和当前高度
    //   currentHeight,
    //   destination: Cesium.Cartesian3.fromRadians(cartographicPosition.longitude, cartographicPosition.latitude, 2000),
    //       // 相机方向，控制观察角度
    //   orientation: {
    //       // heading: Cesium.Math.toRadians(0),   // 水平朝向：0度为正北
    //       pitch: Cesium.Math.toRadians(-80),   // 俯仰角：-30度表示向下看，但不是垂直
    //       roll: 0.0                             // 翻滚角：通常保持为0
    //   },
    //   duration: 2 // 飞行时间（秒）
    // });
    const monitorData = pickedObject.id.monitoItems.data;

    const specialPoints = ["water", "plant", "land", "RSEI"];

    if (specialPoints.includes(monitorData.className)) {
      // 关闭普通弹窗
      clickPopupShowNormal.value = false;

      // 设置弹窗标题
      leftPopupTitle.value = monitorData.name + "分布产品";

      // 根据className设置右侧弹窗标题
      if (monitorData.className === "land") {
        rightPopupTitle.value = monitorData.name + "演变产品";
      } else {
        rightPopupTitle.value = monitorData.name + "变化产品";
      }

      // 显示双弹窗（先显示，图片异步加载）
      clickPopupShowLeft.value = true;
      clickPopupShowRight.value = true;

      // 双弹窗定位
      const leftModal = document.getElementById("clickPopupLeft");
      const rightModal = document.getElementById("clickPopupRight");

      if (leftModal && rightModal && windowPosition) {
        const popupWidth = leftModal.offsetWidth;
        const gap = 20;
        const popupHeight = leftModal.offsetHeight;

        leftModal.style.left = (windowPosition.x - popupWidth - gap) + "px";
        leftModal.style.top = (windowPosition.y - popupHeight / 2) + "px";
        leftModal.style.transform = "none";

        rightModal.style.left = (windowPosition.x + gap) + "px";
        rightModal.style.top = (windowPosition.y - popupHeight / 2) + "px";
        rightModal.style.transform = "none";
      }

      // 异步加载产品图片
      loadPopupImages(monitorData);

    } else {
      // 普通监测点（水闸/泵站）逻辑保持不变
      clickPopupShowLeft.value = false;
      clickPopupShowRight.value = false;
      normalPopupTitle.value = monitorData.name || "监测点信息";
      normalPopupContent.value = monitorData.text || `名称：${monitorData.name}\nID：${monitorData.id}`;
      clickPopupShowNormal.value = true;
      const normalModal = document.getElementById("clickPopupNormal");
      normalModal.style.left = windowPosition.x + "px";
      normalModal.style.top = (windowPosition.y - 80) + "px";
    }

    await boxesSlideOut();
  } else {
    // 如果没有点击到目标实体，则关闭弹窗
    closeModal();
    await boxesSlidein();
    //====取消旋转======
    viewer.clock.onTick.removeEventListener(rotate);
    // 解锁相机
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

    // 点击空白处关闭所有弹窗
    clickPopupShowNormal.value = false;
    clickPopupShowLeft.value = false;
    clickPopupShowRight.value = false;
  }
}
/**
 * 根据监测点类型获取产品图片
 * @param {string} className - 监测点类型 (land, landChange, water, waterChange, plant, plantChange, RSEI, RSEIChange)
 * @returns {Promise<string>} 图片的Blob URL
 */
async function fetchProductImage(className) {
  const cacheKey = className;

  // 检查缓存
  if (productImageCache.value[cacheKey]) {
    return productImageCache.value[cacheKey];
  }

  try {

    // 先尝试png类型
    let product = null;

    // 尝试png
    const pngParams = {
      className: className,
      currentPage: 1,
      pageSize: 1,
      type: 'png'
    };

    const pngRes = await getProductPageData(pngParams);
    const pngResult = pngRes.response?.value || pngRes;

    if (pngResult.code === 'SUCCESS' && pngResult.body?.records?.length > 0) {
      product = pngResult.body.records[0];
    } else {
      // 尝试jpg
      const jpgParams = {
        className: className,
        currentPage: 1,
        pageSize: 1,
        type: 'jpg'
      };

      const jpgRes = await getProductPageData(jpgParams);
      const jpgResult = jpgRes.response?.value || jpgRes;

      if (jpgResult.code === 'SUCCESS' && jpgResult.body?.records?.length > 0) {
        product = jpgResult.body.records[0];
      }
    }

    if (product) {

      // 获取图片文件
      const fileRes = await getFilesByConditions({
        ids: [product.id]
      });
      console.log(fileRes);
      if(!(fileRes.response?.value || fileRes))
      {
        return '';
      }
      // 创建Blob URL
      const blob = new Blob([fileRes.response?.value || fileRes], {
        type: imageType === 'jpg' ? 'image/jpeg' : 'image/png'
      });
      const imageUrl = window.URL.createObjectURL(blob);

      // 缓存结果
      productImageCache.value[cacheKey] = imageUrl;

      return imageUrl;

    } else {
      console.warn(`未找到产品数据: className=${className} (中文: ${chineseClassName})`);
      return '';
    }
  } catch (error) {
    console.error('获取产品图片失败:', error);
    return '';
  }
}

/**
 * 加载监测点弹窗图片
 */
async function loadPopupImages(monitorData) {
  try {
    // 分别获取分布产品和变化产品
    const distImgPromise = fetchProductImage(monitorData.className); // 如 'land'
    const changeImgPromise = fetchProductImage(monitorData.className + 'Change'); // 如 'landChange'

    // 等待两个请求都完成
    const [distImg, changeImg] = await Promise.all([distImgPromise, changeImgPromise]);

    // 更新弹窗图片，如果获取失败则使用回退图片
    leftPopupImgSrc.value = distImg || getFallbackImage(monitorData.className);
    rightPopupImgSrc.value = changeImg || getFallbackImage(monitorData.className + 'Change');

    console.log(leftPopupImgSrc)
  } catch (error) {
    console.error('更新监测点图片失败:', error);
    // 使用回退图片
    leftPopupImgSrc.value = getFallbackImage(monitorData.className);
    rightPopupImgSrc.value = getFallbackImage(monitorData.className + 'Change');
  }
}


/**
 * 获取回退图片路径（如果动态获取失败）
 */
function getFallbackImage(className) {
  const fallbackMap = {
    'water': '/images/水体/水资源分布产品图/2024-09.jpg',
    'waterChange': '/images/水体/水资源变化产品图/2023-2024.png',
    'plant': '/images/植被覆盖度/4.产品数据-各日期植被覆盖度/FVC结果图/分类结果/20240716FVC.png',
    'plantChange': '/images/植被覆盖度/变化产品/2024-67.png',
    'land': '/images/地物分类/4.产品数据-2020及2025年地物分布/2020.png',
    'landChange': '/images/地物分类/2020-2025年地表水环境格局演变产品/增长.png',
    'RSEI': '/images/生态/遥感生态指数分布产品/20年4月.png',
    'RSEIChange': '/images/生态/遥感生态指数变化产品/20年4月至24年4月.png'
  };
  
  return fallbackMap[className] || '';
}

// 清理产品图片缓存（在组件卸载时调用）
function clearProductImageCache() {
  Object.values(productImageCache.value).forEach(url => {
    if (url && url.startsWith('blob:')) {
      window.URL.revokeObjectURL(url);
    }
  });
  productImageCache.value = {};
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
  // 1. 先获取所有弹窗元素
  const leftModal = document.getElementById("clickPopupLeft");
  const rightModal = document.getElementById("clickPopupRight");
  const normalModal = document.getElementById("clickPopupNormal");

  // 2. 如果是【双弹窗】显示，同时更新左右弹窗位置
  if (clickPopupShowLeft.value && clickPopupShowRight.value && lastClickedEntityPosition) {
    const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(
      viewer.scene,
      lastClickedEntityPosition
    );
    if (windowPosition && leftModal && rightModal) {
      const popupWidth = leftModal.offsetWidth;
      const gap = 50;
      const popupHeight = leftModal.offsetHeight;

      // 左弹窗位置
      leftModal.style.left = (windowPosition.x - popupWidth - gap) + "px";
      leftModal.style.top = (windowPosition.y - popupHeight / 2) + "px";
      // 右弹窗位置
      rightModal.style.left = (windowPosition.x + gap) + "px";
      rightModal.style.top = (windowPosition.y - popupHeight / 2) + "px";
    }
  }
  // 3. 如果是【普通弹窗】显示，更新普通弹窗位置
  else if (clickPopupShowNormal.value && lastClickedEntityPosition && normalModal) {
    const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(
      viewer.scene,
      lastClickedEntityPosition
    );
    if (windowPosition) {
      normalModal.style.left = windowPosition.x + "px";
      normalModal.style.top = (windowPosition.y - 80) + "px";
    }
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
    const entityPosition = pickedObject.id.position.getValue(
      Cesium.JulianDate.now()
    );
    
    // 将 Cartesian 坐标转换为窗口坐标
    const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(
      viewer.scene,
      entityPosition
    );
    // 获取弹窗元素
    const modalElement = document.getElementById("hoverPopup");
    const modal_P_Element = document.getElementById("hoverPopup-p");

    // 将弹窗定位到实体位置的窗口坐标
    if (modalElement && modal_P_Element) {
      modalElement.style.left = windowPosition.x + "px";
      modalElement.style.top = windowPosition.y + "px";
      // 在悬浮窗中显示实体名称
      //modal_P_Element.innerHTML = pickedObject.id.monitoItems.data.name || "监测点";
    }

    // 判断clickPopup状态决定是否显示hoverPopup
    if (clickPopupShowRight.value || clickPopupShowLeft.value || clickPopupShowNormal.value) {
      hoverPopupShow.value = false; // 点击弹窗显示时，隐藏悬浮窗
    } else {
      hoverPopupShow.value = true; // 点击弹窗未显示时，显示悬浮窗
    }
  } else {
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
    if (heading >= 300) {
      // 设定一个上限
      increasing = false;
    }
  } else {
    heading -= 0.1;
    if (heading <= 0) {
      // 设定一个下限
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

  offset = new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(heading),
    -Cesium.Math.toRadians(pitch),
    distance
  );
  // 锁定相机
  viewer.camera.lookAt(position, offset);
}


// eslint-disable-next-line no-unused-vars
import * as floodApi from '../../api/flood'
// 1.测试连接
const testConnect = async () => {
  const isOk = await floodApi.pingPython()
  if (isOk) {
    ElMessage.success('洪水后端连接正常')
  } else {
    ElMessage.error('洪水后端连接失败，请启动Python服务')
  }
}

// 洪水帧数据配置
const FLOOD_GRID_ROWS = 153;
const FLOOD_GRID_COLS = 238;
const FLOOD_WATER_THRESHOLD = 0.03; // 水深小于此值视为无水

// 颜色渐变配置（更美观的洪水效果）
const FLOOD_COLOR_STOPS = [
  { depth: 0.0, color: [200, 230, 255, 0] },      // 透明（无水）
  { depth: 0.1, color: [180, 220, 255, 100] },    // 浅蓝（刚淹没）
  { depth: 0.5, color: [120, 190, 255, 160] },    // 蓝色（浅水区）
  { depth: 1.0, color: [60, 150, 255, 200] },     // 中蓝（中等水深）
  { depth: 2.0, color: [30, 100, 230, 220] },     // 深蓝（较深）
  { depth: 3.0, color: [20, 70, 200, 230] },      // 暗蓝
  { depth: 5.0, color: [10, 40, 150, 240] },      // 最深
];

// 预计算颜色查找表（避免每帧重复计算）
const COLOR_LOOKUP_TABLE = [];
const MAX_DEPTH = 5.0;
const TABLE_SIZE = 501; // 0-5.0米，精度0.01米

// 初始化颜色查找表
(function initColorLookup() {
  for (let i = 0; i < TABLE_SIZE; i++) {
    const depth = (i / (TABLE_SIZE - 1)) * MAX_DEPTH;
    
    if (depth < FLOOD_WATER_THRESHOLD) {
      COLOR_LOOKUP_TABLE[i] = [0, 0, 0, 0]; // 完全透明
    } else {
      // 找到当前深度所在的渐变区间
      let lower = FLOOD_COLOR_STOPS[0];
      let upper = FLOOD_COLOR_STOPS[FLOOD_COLOR_STOPS.length - 1];
      
      for (let j = 0; j < FLOOD_COLOR_STOPS.length - 1; j++) {
        if (depth >= FLOOD_COLOR_STOPS[j].depth && depth <= FLOOD_COLOR_STOPS[j + 1].depth) {
          lower = FLOOD_COLOR_STOPS[j];
          upper = FLOOD_COLOR_STOPS[j + 1];
          break;
        }
      }
      
      // 计算插值比例
      const range = upper.depth - lower.depth;
      const t = range > 0 ? (depth - lower.depth) / range : 0;
      
      // 线性插值颜色
      const r = Math.round(lower.color[0] + (upper.color[0] - lower.color[0]) * t);
      const g = Math.round(lower.color[1] + (upper.color[1] - lower.color[1]) * t);
      const b = Math.round(lower.color[2] + (upper.color[2] - lower.color[2]) * t);
      const a = Math.round(lower.color[3] + (upper.color[3] - lower.color[3]) * t);
      
      COLOR_LOOKUP_TABLE[i] = [r, g, b, a];
    }
  }
})();

// 使用查找表的颜色映射（速度更快）
function depthToColor(depth) {
  if (depth < FLOOD_WATER_THRESHOLD) {
    return [0, 0, 0, 0]; // 完全透明
  }
  
  // 使用查找表快速获取颜色
  const idx = Math.min(Math.floor(depth / MAX_DEPTH * (TABLE_SIZE - 1)), TABLE_SIZE - 1);
  return COLOR_LOOKUP_TABLE[idx];
}

// 边缘羽化效果（优化版：只检查4个方向，减少计算量）
function applyEdgeFeathering(imageData, floatArray, cols, rows) {
  const pixels = imageData.data;
  const threshold = FLOOD_WATER_THRESHOLD;
  
  // 只检查4个方向（上下左右），减少50%计算量
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  for (let row = 1; row < rows - 1; row++) {
    for (let col = 1; col < cols - 1; col++) {
      const idx = (row * cols + col) * 4;
      if (pixels[idx + 3] === 0) continue; // 跳过透明像素
      
      // 检查周围4个像素
      let neighborCount = 0;
      for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (floatArray[nr * cols + nc] < threshold) {
            neighborCount++;
          }
        }
      }
      
      // 如果有透明邻居，应用羽化
      if (neighborCount > 0) {
        const featherFactor = 1 - (neighborCount / 4) * 0.5; // 最多减少50%透明度
        pixels[idx + 3] = Math.round(pixels[idx + 3] * featherFactor);
      }
    }
  }
}

// 将float32帧数据渲染为Canvas（复用canvas）
function renderFloodFrameToCanvas(frameData, reuseCanvas = null) {
  const floatArray = new Float32Array(frameData);
  const canvas = reuseCanvas || document.createElement('canvas');
  canvas.width = FLOOD_GRID_COLS;
  canvas.height = FLOOD_GRID_ROWS;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(FLOOD_GRID_COLS, FLOOD_GRID_ROWS);
  const pixels = imageData.data;
  
  // 渲染主图像
  for (let i = 0; i < floatArray.length; i++) {
    const depth = floatArray[i];
    const color = depthToColor(depth);
    const idx = i * 4;
    pixels[idx] = color[0];
    pixels[idx + 1] = color[1];
    pixels[idx + 2] = color[2];
    pixels[idx + 3] = color[3];
  }
  
  // 应用边缘羽化（使边缘更柔和）
  applyEdgeFeathering(imageData, floatArray, FLOOD_GRID_COLS, FLOOD_GRID_ROWS);
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// 当前显示的洪水帧canvas引用（CallbackProperty每次渲染时读取）
let currentFloodCanvas = null;

// 创建或获取洪水实体（使用CallbackProperty自动同步渲染）
function getOrCreateFloodEntity() {
  if (!floodEntity) {
    const b = floodBounds.value;
    floodEntity = viewer.entities.add({
      name: 'flood-frame',
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(
          b.lonMin, b.latMin, b.lonMax, b.latMax
        ),
        material: new Cesium.ImageMaterialProperty({
          image: new Cesium.CallbackProperty(() => {
            // Cesium每帧渲染时自动读取最新的canvas
            return currentFloodCanvas;
          }, false),
          transparent: true,
        }),
      },
    });
  }
  return floodEntity;
}

// 更新洪水实体的材质图片（只更新引用，Cesium CallbackProperty自动拉取）
function updateFloodEntityMaterial(canvas) {
  getOrCreateFloodEntity(); // 确保实体已创建
  currentFloodCanvas = canvas;
}

// 加载单帧（带缓存）
const loadSingleFrame = async (frameIndex, force = false) => {
  try {
    // 如果缓存中已有，直接使用
    if (!force && floodFrameCache[frameIndex]) {
      updateFloodEntityMaterial(floodFrameCache[frameIndex]);
      return true;
    }

    console.log('请求第', frameIndex, '帧')
    
    // 使用封装的接口函数
    const data = await getFloodFrame(currentRunId.value, frameIndex)

    if (!data || data.byteLength <= 0) {
      throw new Error('后端返回空数据')
    }

    // 渲染为Canvas并缓存
    const canvas = renderFloodFrameToCanvas(data);
    floodFrameCache[frameIndex] = canvas;
    
    // 更新Cesium洪水图层
    updateFloodEntityMaterial(canvas);
    
    return true;
  } catch (err) {
    console.error('渲染异常详情：', err)
    return false;
  }
}

// 预加载帧数据（后台并发加载）
const preloadFrames = async (startIndex, count) => {
  if (floodIsPreloading) return;
  
  floodIsPreloading = true;
  try {
    const buffers = await preloadFloodFrames(
      currentRunId.value, 
      startIndex, 
      count,
      (completed, total) => {
        floodPreloadProgress = (completed / total) * 100;
      }
    );
    
    // 将预加载的帧数据渲染为Canvas并缓存
    for (let i = 0; i < buffers.length; i++) {
      const frameIndex = startIndex + i;
      if (buffers[i] && !floodFrameCache[frameIndex]) {
        const canvas = renderFloodFrameToCanvas(buffers[i]);
        floodFrameCache[frameIndex] = canvas;
      }
    }
  } catch (err) {
    console.error('预加载失败：', err);
  } finally {
    floodIsPreloading = false;
  }
};

// 动画循环（使用requestAnimationFrame）
let floodLastTime = 0;
const FLOOD_TOTAL_FRAMES_COUNT = 266;

// 计算当前缓存中可用的帧数
const getCachedFrameCount = () => {
  let count = 0;
  const current = floodFrameIndex.value;
  for (let i = current + 1; i < current + FLOOD_PRELOAD_BATCH; i++) {
    const idx = i % FLOOD_TOTAL_FRAMES_COUNT;
    if (floodFrameCache[idx]) count++;
  }
  return count;
};

const floodAnimationLoop = (timestamp) => {
  if (!currentRunId.value) return;
  
  const elapsed = timestamp - floodLastTime;
  
  if (elapsed >= FLOOD_FRAME_DURATION) {
    // 渲染当前帧（全部266帧已预加载，缓存命中率100%）
    const cachedCanvas = floodFrameCache[floodFrameIndex.value];
    if (cachedCanvas) {
      updateFloodEntityMaterial(cachedCanvas);
    } else {
      // 兜底：缓存未命中时异步加载
      loadSingleFrame(floodFrameIndex.value);
    }
    
    // 下一帧（循环播放）
    floodFrameIndex.value++;
    if (floodFrameIndex.value >= FLOOD_TOTAL_FRAMES_COUNT) {
      floodFrameIndex.value = 0;
    }
    
    floodLastTime = timestamp;
  }
  
  floodAnimationFrameId.value = requestAnimationFrame(floodAnimationLoop);
};

// 停止洪水动画
const stopFloodAnimation = () => {
  if (floodTimer) {
    clearInterval(floodTimer);
    floodTimer = null;
  }
  if (floodAnimationFrameId.value) {
    cancelAnimationFrame(floodAnimationFrameId.value);
    floodAnimationFrameId.value = null;
  }
  floodIsPreloading = false;
};

// 暂停/继续洪水动画
const toggleFloodAnimation = () => {
  if (floodTimer || floodAnimationFrameId.value) {
    // 当前在播放，暂停
    stopFloodAnimation();
    ElMessage.info('洪水动画已暂停');
  } else if (currentRunId.value) {
    // 当前已暂停，继续
    floodLastTime = performance.now();
    floodAnimationFrameId.value = requestAnimationFrame(floodAnimationLoop);
    ElMessage.info('洪水动画已继续');
  }
};

// 3.加载动画（先硬编码runId=1，跳过创建任务）
const loadFloodData = async () => {
  try {
    // 先停止之前的动画和热力图（避免冲突）
    stopFloodAnimation();
    if (floodEnabled.value) {
      stopFloodHeatmap(); // 停止旧版热力图，清除floodTimer
    }
    // 清理旧实体（热力图清除了就重建，避免冲突）
    if (floodEntity) {
      viewer.entities.remove(floodEntity);
      floodEntity = null;
    }
    currentFloodCanvas = null;
    
    // 清空缓存
    floodFrameCache = {};
    floodFrameIndex.value = 0;
    floodPreloadProgress = 0;
    floodLoadingProgress.value = 0;
    
    currentRunId.value = 1 // 临时固定，先跑通动画
    
    // 飞到洪水区域附近（中国河南）
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(114.35, 34.85, 5000),
      duration: 2,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
    })

    // 预加载全部266帧（分批加载，显示进度）
    ElMessage({
      message: '正在预加载洪水帧数据 0%...',
      duration: 0,
      type: 'info'
    })
    
    const totalFrames = FLOOD_TOTAL_FRAMES_COUNT;
    let loadedCount = 0;
    
    // 分批预加载所有帧
    for (let start = 0; start < totalFrames; start += FLOOD_PRELOAD_BATCH) {
      const count = Math.min(FLOOD_PRELOAD_BATCH, totalFrames - start);
      await preloadFrames(start, count);
      loadedCount = start + count;
      const percent = Math.round((loadedCount / totalFrames) * 100);
      floodLoadingProgress.value = percent;
      
      // 更新页面上的消息（关闭旧消息重新显示）
      ElMessage.closeAll();
      ElMessage({
        message: `正在预加载洪水帧数据 ${percent}%...`,
        duration: 0,
        type: 'info'
      })
    }
    
    ElMessage.closeAll();
    
    // 预加载完成后立即显示第一帧
    if (floodFrameCache[0]) {
      updateFloodEntityMaterial(floodFrameCache[0]);
    }
    
    ElMessage.success(`洪水动画加载完成，共${totalFrames}帧，开始播放`);
    
    // 启动动画循环，从帧0开始连续播放
    floodLastTime = performance.now();
    floodAnimationFrameId.value = requestAnimationFrame(floodAnimationLoop);
    
  } catch (err) {
    console.error('加载失败：', err)
    ElMessage.error('洪水动画加载失败')
  }
}
</script>
<style lang="less" scoped>
/* 【新增】heatmap 容器必须有宽高（与 HEATMAP_W/HEATMAP_H 一致） */
#heatmap {
  width: 500px;
  height: 500px;
}

/* 【新增】洪水按钮样式 */
.flood-heatmap-btn {
  position: absolute;
  top: 90px;     /* 放在 data-menu-btn 下方即可 */
  right: 30px;
  z-index: 10;

  display: flex;
  align-items: center;
  gap: 6px;

  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;

  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.25);
  user-select: none;
}

.flood-heatmap-btn:hover {
  background: rgba(0, 0, 0, 0.6);
}

/* 洪水状态显示样式 */
.flood-status {
  background: rgba(0, 150, 255, 0.6) !important;
  border-color: rgba(0, 150, 255, 0.8) !important;
  
  .el-icon-loading {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

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
  width: 100vw;
  /* 全屏宽度 */
  height: 100vh;
  /* 全屏高度 */
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.modal-content {
  position: relative;
  max-width: 50%;
  max-height: 50%;
  width: auto;
  height: auto;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.enlarge-close {
  position: absolute;
  top: -80px;
  right: -10px;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  cursor: pointer;
  color: #1f7c81;
  zoom: 1.5;
}

.close {
  position: absolute;
  top: -10px;
  right: -10px;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
}

.enlarged-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
}

/* 原有样式（保留） */
.CesiumapView {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  cursor: url("../../../public/images/cesiumMap/cursor-RmLDFyYc32.png"),
    auto;
}

#cesiumContainer {
  height: 100%;
  width: 100%;
}

.clickModal-content {
  width: 500px;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(17, 17, 17, 0.5);
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
  font-family: PuHuiTi, serif;
  color: #fff;
  z-index: 9999;
  /* 确保置顶 */
}

.left-popup {
  width: 500px;
  /* 和主容器宽度一致 */
  height: 400px;
  min-height: 400px;
  margin-left: -50px;
  background: linear-gradient(to bottom, rgba(24, 26, 27, 0.5), rgba(20, 24, 27, 0.5));
  /* 匹配主弹窗浅色背景 */
}

.right-popup {
  width: 500px;
  /* 和主容器宽度一致 */
  height: 400px;
  min-height: 400px;
  margin-left: 50px;
  background: linear-gradient(to bottom, rgba(24, 26, 27, 0.5), rgba(20, 24, 27, 0.5));
  /* 匹配主弹窗浅色背景 */
}

/* 弹窗三角箭头 - 居中显示，指向监测点 */
.clickModal-content::after {
  content: "";
  position: absolute;
  bottom: -13px;
  left: 50%;
  transform: translateX(-50%);
  /* 仅箭头居中，不影响弹窗整体 */
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 14px solid rgba(2, 7, 17, 0.8);
}

/* 普通弹窗样式保留 */
.normal-popup {
  width: 400px;
  /* 普通弹窗略窄 */
}

.popup-img-container {
  width: 100%;
  margin-bottom: 10px;
  display: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 10px 0;
}

.popup-img-item {
  max-width: 500px;
  max-height: 300px;
  height: 400px;
  width: 100%;
  cursor: zoom-in;
  border-radius: 4px;
  object-fit: contain;
  margin: 5px auto;
  display: block;
}

.clickPopup-title {
  // width: 100%;
  height: 35px;
  line-height: 32px;
  background: url("../../../public/images/cesiumMap/custom-styles-title-BXpsbnaH.png");
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
  letter-spacing: 0.06em;
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

.enlarge-close:hover {
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
  background: url("../../../public/images/cesiumMap/header-CE2FZDIm.png");
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
  letter-spacing: 0.1rem;

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
  width: 25%;
  height: calc(100% / 3.5);
  position: fixed;
  z-index: 1;
  //left: 20px;
  top: 70px;
  /* 穿透效果 */
  /* pointer-events: none; */
  background: linear-gradient(to right,
      rgba(37, 54, 54, 0.6) 0%,
      rgba(37, 54, 54, 0.4) 100%);
  user-select: none;
  border-radius: 6px 0 0 0;

  // 滑动特效
  transition: opacity 2s ease-in-out, transform 2s ease-in-out;
  /* 初始位置在屏幕左侧之外 */
  transform: translateX(-200%);
}

.slide-in {
  /* 目标位置 */
  transform: translateX(2%) !important;
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
  text-shadow: 0 2px 4px rgba(2, 7, 17, 0.8);
}

.dataCenter {
  padding: 10px;
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
      text-shadow: 0 2px 4px rgba(2, 7, 17, 0.5);
      letter-spacing: 0.2rem;
      text-align: center;
      font-family: PangMenZhengDao, serif;
      font-style: normal;
      font-weight: 400;
      font-size: 18px;
      color: #ffffff;
      background: url("../../../public/images/cesiumMap/menu-btn-unchecked-BbOiNvmo.png");
      background-size: 100% 100%;

      opacity: 1;
    }

    li:nth-child(1) {
      background: url("../../../public/images/cesiumMap/menu-btn-checked_2-DcHCg5DW.png");
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
    width: 28% !important;
    /* 缩小宽度 */
    height: calc(100% / 4) !important;
    /* 增加高度比例 */
    max-height: 220px;
    /* 限制最大高度 */
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
  top: 6px;
  right: 60px;
  z-index: 10;
  /* 其他样式保持不变 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 24px;
  background: rgba(71, 232, 254, 0.2);
  border: 1px solid rgba(71, 232, 254, 0.5);
  border-radius: 4px;
  color: #47e8fe;
  font-family: PuHuiTi, serif;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  pointer-events: all;

  i {
    margin-right: 0px;
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

/* 行政区图层按钮样式 */
.admin-layer-btn {
  position: fixed;
  top: 6px; 
  right: 150px; /* 在数据菜单按钮左侧 */
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 24px;
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.5);
  border-radius: 4px;
  color: #ff6b6b;
  font-family: PuHuiTi, serif;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  pointer-events: all;

  i {
    margin-right: 0px;
    font-size: 16px;
  }

  &:hover {
    background: rgba(255, 107, 107, 0.3);
    border-color: #ff6b6b;
    box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}
.back-to-province-btn {
  position: fixed;
  top: 6px;
  left: 60px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 24px;
  background: rgba(71, 232, 254, 0.2);
  border: 1px solid rgba(71, 232, 254, 0.5);
  border-radius: 4px;
  color: #47e8fe;
  font-family: PuHuiTi, serif;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  pointer-events: all;

  i {
    margin-right: 0px;
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
    right: 140px;
    width: 110px;
    height: 34px;
    font-size: 13px;
  }

  /* 调整行政区图层按钮 */
  .admin-layer-btn {
    top: 24px;
    right: 260px;
    width: 110px;
    height: 34px;
    font-size: 13px;
  }
  .back-to-province-btn {
    top: 24px;
    right: 140px;
    width: 110px;
    height: 34px;
    font-size: 13px;
  }nt-size: 13px;
  
}

/* 小屏幕笔记本适配 (最大宽度1366px) */
@media screen and (max-width: 1366px) {
  .data-menu-btn {
    top: 26px;
    right: 130px;
    width: 100px;
    height: 32px;
    font-size: 12px;
  }

  .admin-layer-btn {
    top: 26px;
    right: 240px;
    width: 100px;
    height: 32px;
    font-size: 12px;
  }

  .back-to-province-btn{
    top: 26px;
    right: 240px;
    width: 100px;
    height: 32px;
    font-size: 12px;
  }
}

/* 超小屏幕适配 (最大宽度1280px) */
@media screen and (max-width: 1280px) {
  .data-menu-btn {
    top: 21px;
    right: 110px;
    width: 90px;
    height: 30px;
    font-size: 11px;
  }

  .data-menu-btn i {
    font-size: 14px;
    margin-right: 5px;
  }

  .admin-layer-btn {
    top: 21px;
    right: 210px;
    width: 90px;
    height: 30px;
    font-size: 11px;
  }

  .admin-layer-btn i {
    font-size: 14px;
    margin-right: 5px;
  }

  .back-to-province-btn {
    top: 21px;
    right: 110px;
    width: 90px;
    height: 30px;
    font-size: 11px;
    

  }    
  .back-to-province-btn i {
      font-size: 14px;
      margin-right: 5px;
  }
}

/* ====================== AI 小助手 样式 ====================== */
.ai-assistant {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 99999;
  pointer-events: all;
}

.ai-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
    background: transparent;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(31, 124, 129, 0.2);
  }

  .ai-button .ai-btn-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 50%;
  }

  /* AI 面板样式：白底、圆角、阴影，便于在地图上阅读 */
  .ai-panel {
    width: 340px;
    max-height: 480px;
    background: #ffffff;
    color: #222;
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-bottom: 12px;
  }

.ai-header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-weight: 600;
  background: linear-gradient(90deg, rgba(31,124,129,0.06), rgba(34,232,254,0.03));
  color: #0b2930; /* 深色，便于白底显示 */
}

.ai-header .close {
  cursor: pointer;
  color: #4b5563;
  font-weight: 700;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-message {
  display: flex;
  flex-direction: column;
  max-width: 90%;
}

.ai-message .ai-from {
  font-size: 12px;
  color: #6b7280; /* 深灰，更适合白底 */
  margin-bottom: 4px;
}

.ai-message.assistant .ai-text {
  background: #f7f7f9; /* 浅灰背景 */
  color: #111827; /* 深色文字 */
  padding: 8px 10px;
  border-radius: 6px;
  align-self: flex-start;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.ai-message.user .ai-text {
  background: linear-gradient(90deg, #e6f7fa, #d5f1ef); /* 浅蓝-青背景 */
  color: #0b2930; /* 深色文字 */
  padding: 8px 10px;
  border-radius: 6px;
  align-self: flex-end;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.ai-input {
  display: flex;
  padding: 10px;
  gap: 8px;
  background: #f4f6f8;
  border-top: 1px solid #e6e9ec;
}

.ai-input input {
  flex: 1;
  height: 36px;
  border-radius: 6px;
  padding: 0 8px;
  border: 1px solid #dbe4e8;
  background: #ffffff;
  color: #111827;
}

.ai-input button {
  width: 64px;
  border-radius: 6px;
  background: #0d98a2; /* 稍深的青色按钮 */
  border: none;
  color: #fff;
  cursor: pointer;
}

</style>