<template>
  <div class="s_content">
    <!--第一行布局-->
    <div class="s_module-box1">
      <div style="flex: 0 1 1.5vw"></div>
      <div style="flex: 0 1 9vw">
        <dv-border-box-8
          style="
            width: calc(100vw * 0.065);
            height: calc(100vh * 0.06);
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <div class="s_tc">数据获取</div>
        </dv-border-box-8>
      </div>
      <div style="flex: 0 1 3vw"></div>
      <div style="flex: 0 1 9vw">
        <dv-border-box-8
          style="
            width: calc(100vw * 0.065);
            height: calc(100vh * 0.06);
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <div class="s_tc">数据查询</div>
        </dv-border-box-8>
      </div>
      <div style="flex: 0 1 1.5vw"></div>
      <div style="flex: 0 1 15vw">
        <dv-decoration-9
          style="
            width: calc(100vw * 0.1);
            height: calc(100vh * 0.06);
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
        </dv-decoration-9>
      </div>
      <div style="flex: 0 1 30vw">
        <dv-decoration-7
          style="width: calc(100vw * 0.5); height: calc(100vh * 0.06)"
        >
          <div class="s_header">
            黄河流域陆浑湖野外观测站多源数据综汇示例系统
          </div>
        </dv-decoration-7>
      </div>
      <div style="flex: 0 1 15vw">
        <dv-decoration-9
          style="
            width: calc(100vw * 0.1);
            height: calc(100vh * 0.06);
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
        </dv-decoration-9>
      </div>
      <div style="flex: 0 1 1.5vw"></div>
      <div style="flex: 0 1 9vw">
        <dv-border-box-8
          :reverse="true"
          style="
            width: calc(100vw * 0.065);
            height: calc(100vh * 0.06);
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <div class="s_tc">用户管理</div>
        </dv-border-box-8>
      </div>
      <div style="flex: 0 1 3vw"></div>
      <div style="flex: 0 1 9vw">
        <dv-border-box-8
          :reverse="true"
          style="
            width: calc(100vw * 0.065);
            height: calc(100vh * 0.06);
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <div class="s_tc">数据共享</div>
        </dv-border-box-8>
      </div>
      <div style="flex: 0 1 1.5vw"></div>
    </div>
    <!--第二行布局-->
    <div class="s_module-box2">
      <!-- 第一列 -->
      <div style="flex: 0 1 24vw">
        <!-- 径流标题部分 -->
        <dv-border-box-6
          :reverse="true"
          style="width: calc(100vw * 0.248); height: calc(100vh * 0.045)"
        >
          <div class="s_title1">
            <div class="s_title_tc">径流</div>
            <!-- 径流地点按钮 -->
            <div class="s_title_didian">
              <el-popover
                :visible="visible_jingliu_didian"
                trigger="click"
                placement="top"
                width="calc(100vw * 0.05)"
                hide-after="1"
              >
                <div style="text-align: center; margin: 0">
                  <el-radio-group
                    v-model="jingliu_didian_radio1"
                    @click="jingliu_didian_pop"
                  >
                    <el-radio value="0" size="large">全部</el-radio>
                    <el-radio value="1" size="large">伊河东湾</el-radio>
                    <el-radio value="2" size="large">伊河陆浑坝下</el-radio>
                  </el-radio-group>
                </div>
                <template #reference>
                  <div ref="excludeArea_jingliu">
                    <el-button
                      size="large"
                      color="#1576CE"
                      class="transparent-btn"
                      @click="visible_jingliu_didian = true"
                      >地点</el-button
                    >
                  </div>
                </template>
              </el-popover>
            </div>
            <!-- 径流日期 -->
            <div class="s_title_date">
              <el-date-picker
                v-model="jingLiuShiJian"
                placeholder="请选择"
                :clearable="false"
                :type="jingLiuShiJianType"
                :format="jingLiuShiJianFormat"
                :value-format="jingLiuShiJianFormat"
                @visible-change="
                  (visibility) => handleVisibleChange(visibility)
                "
              />
            </div>
            <div class="s_title_date_switch">
              <el-select
                v-model="jingliuSelect"
                placeholder="请选择"
                style="width: 120px"
                @change="jingLiuSelectChange"
              >
                <el-option label="年" value="year" />
                <el-option label="月" value="month" />
                <el-option label="日" value="date" />
              </el-select>
            </div>
          </div>
        </dv-border-box-6>
        <!--  径流图 -->
        <dv-border-box-7
          style="width: calc(100vw * 0.246); height: calc(100vh * 0.24)"
        >
          <!-- 径流图 -->
          <RunOff />
        </dv-border-box-7>

        <!-- 水位标题部分 -->
        <dv-border-box-6
          :reverse="true"
          style="width: calc(100vw * 0.248); height: calc(100vh * 0.045)"
        >
          <div class="s_title1">
            <div class="s_title_tc">水位</div>
            <!-- 水位地点按钮 -->
            <div class="s_title_didian">
              <el-popover
                :visible="visible_shuiwei_didian"
                trigger="click"
                placement="top"
                width="calc(100vw * 0.05)"
                hide-after="1"
              >
                <div style="text-align: center; margin: 0">
                  <el-radio-group
                    v-model="shuiwei_didian_radio1"
                    @click="shuiwei_didian_pop"
                  >
                    <el-radio value="1" size="large">伊河东湾</el-radio>
                    <el-radio value="2" size="large">伊河陆浑坝下</el-radio>
                  </el-radio-group>
                </div>
                <template #reference>
                  <div ref="excludeArea_shuiwei">
                    <el-button
                      size="large"
                      color="#1576CE"
                      class="transparent-btn"
                      @click="visible_shuiwei_didian = true"
                      >地点</el-button
                    >
                  </div>
                </template>
              </el-popover>
            </div>
            <!-- 水位日期 -->
            <div class="s_title_date">
              <el-date-picker
                v-model="shuiWeiShiJian"
                placeholder="请选择"
                :clearable="false"
                :type="shuiWeiShiJianType"
                :format="shuiWeiShiJianFormat"
                :value-format="shuiWeiShiJianFormat"
                @visible-change="
                  (visibility) => handleVisibleChange(visibility)
                "
              />
            </div>
            <div class="s_title_date_switch">
              <el-select
                v-model="shuiweiSelect"
                placeholder="请选择"
                style="width: 120px"
                @change="shuiWeiSelectChange"
              >
                <el-option label="年" value="year" />
                <el-option label="月" value="month" />
                <el-option label="日" value="date" />
              </el-select>
            </div>
          </div>
        </dv-border-box-6>
        <!--  水位图 -->
        <dv-border-box-7
          style="width: calc(100vw * 0.246); height: calc(100vh * 0.24)"
        >
          <!-- 水位图 -->
          <HydrographView />
        </dv-border-box-7>
      </div>
      <!-- 第二列 -->
      <div style="flex: 0 1 50vw">
        <dv-border-box-6
          :reverse="true"
          style="width: calc(100vw * 0.5); height: calc(100vh * 0.045)"
        >
          <div class="s_title2">
            <div class="s_title2_tc">陆浑湖野外观测场地</div>
          </div>
        </dv-border-box-6>
        <dv-border-box-2
          style="width: calc(100vw * 0.5); height: calc(100vh * 0.53)"
        >
          <!-- 陆浑湖野外观测场地图 -->
          <MapView />
        </dv-border-box-2>
      </div>
      <!-- 第三列 -->
      <div style="flex: 0 1 24vw">
        <!-- 光谱标题部分 -->
        <dv-border-box-6
          :reverse="true"
          style="width: calc(100vw * 0.248); height: calc(100vh * 0.045)"
        >
          <div class="s_title1">
            <div class="s_title3_tc" style="width: calc(100vw * 0.12)">
              光谱反射率
            </div>
            <!-- 光谱地点按钮 -->
            <div class="s_title2_didian">
              <el-popover
                :visible="visible_guangpu_didian"
                trigger="click"
                placement="top"
                width="calc(100vw * 0.05)"
                hide-after="1"
              >
                <div style="text-align: center; margin: 0">
                  <el-radio-group
                    v-model="guangpu_didian_radio1"
                    @click="guangpu_didian_pop"
                  >
                    <el-radio value="1" size="large">陆浑湖水库</el-radio>
                    <el-radio value="2" size="large">小浪底水库</el-radio>
                    <el-radio value="3" size="large">丹江口水库</el-radio>
                    <el-radio value="4" size="large">宿鸭湖水库</el-radio>
                    <el-radio value="5" size="large">白沙水库</el-radio>
                  </el-radio-group>
                </div>
                <template #reference>
                  <div ref="excludeArea_guangpu">
                    <el-button
                      size="large"
                      color="#1576CE"
                      class="transparent-btn"
                      @click="visible_guangpu_didian = true"
                      >地点</el-button
                    >
                  </div>
                </template>
              </el-popover>
            </div>
            <!-- 光谱日期 -->
            <div class="s_title_date">
              <el-date-picker
                v-model="guangPuShiJian"
                placeholder="请选择"
                :clearable="false"
                :type="guangPuShiJianType"
                :format="guangPuShiJianFormat"
                :value-format="guangPuShiJianFormat"
                @visible-change="
                  (visibility) => handleVisibleChange(visibility)
                "
              />
            </div>
            <div class="s_title2_date_switch">
              <el-select
                v-model="guangpuSelect"
                placeholder="请选择"
                style="width: 120px"
                @change="guangPuSelectChange"
              >
                <el-option label="年" value="year" />
                <el-option label="月" value="month" />
                <el-option label="日" value="date" />
              </el-select>
            </div>
          </div>
        </dv-border-box-6>
        <!--  光谱图 -->
        <dv-border-box-7
          style="width: calc(100vw * 0.246); height: calc(100vh * 0.24)"
        >
          <!-- 光谱图 -->
          <SpectralReflectance />
        </dv-border-box-7>
        <!-- 水体理化标题部分 -->
        <dv-border-box-6
          :reverse="true"
          style="width: calc(100vw * 0.248); height: calc(100vh * 0.045)"
        >
          <div class="s_title1">
            <div class="s_title3_tc" style="width: calc(100vw * 0.12)">
              水体理化
            </div>
            <!-- 水体理化地点按钮 -->
            <div class="s_title2_didian">
              <el-popover
                :visible="visible_shuiti_didian"
                trigger="click"
                placement="top"
                width="calc(100vw * 0.05)"
                hide-after="1"
              >
                <div style="text-align: center; margin: 0">
                  <el-radio-group
                    v-model="guangpu_didian_radio1"
                    @click="shuiti_didian_pop"
                  >
                    <el-radio value="1" size="large">陆浑湖水库</el-radio>
                    <el-radio value="2" size="large">小浪底水库</el-radio>
                    <el-radio value="3" size="large">丹江口水库</el-radio>
                    <el-radio value="4" size="large">宿鸭湖水库</el-radio>
                    <el-radio value="5" size="large">白沙水库</el-radio>
                  </el-radio-group>
                </div>
                <template #reference>
                  <div ref="excludeArea_shuiti">
                    <el-button
                      size="large"
                      color="#1576CE"
                      class="transparent-btn"
                      @click="visible_shuiti_didian = true"
                      >地点</el-button
                    >
                  </div>
                </template>
              </el-popover>
            </div>
            <!-- 水体理化日期 -->
            <div class="s_title_date">
              <el-date-picker
                v-model="guangPuShiJian"
                placeholder="请选择"
                :clearable="false"
                :type="guangPuShiJianType"
                :format="guangPuShiJianFormat"
                :value-format="guangPuShiJianFormat"
                @visible-change="
                  (visibility) => handleVisibleChange(visibility)
                "
              />
            </div>
            <div class="s_title2_date_switch">
              <el-select
                v-model="guangpuSelect"
                placeholder="请选择"
                style="width: 120px"
                @change="guangPuSelectChange"
              >
                <el-option label="年" value="year" />
                <el-option label="月" value="month" />
                <el-option label="日" value="date" />
              </el-select>
            </div>
          </div>
        </dv-border-box-6>
        <!--  水体理化图 -->
        <dv-border-box-7
          style="width: calc(100vw * 0.246); height: calc(100vh * 0.24)"
        >
          <!-- 水体理化图 -->
          <WaterPhysicochemistry />
        </dv-border-box-7>
      </div>
    </div>

    <!--第三行布局-->
    <div class="s_module-box3">
      <!-- 第一列 -->
      <div style="flex: 0 1 24vw">
        <!-- 气象标题部分 -->
        <dv-border-box-6
          :reverse="true"
          style="width: calc(100vw * 0.248); height: calc(100vh * 0.05)"
        >
          <div class="s_title1">
            <div class="s_title_tc">气象</div>
            <!-- 气象地点按钮 -->
            <div class="s_title_didian">
              <el-popover
                :visible="visible_qixiang_didian"
                trigger="click"
                placement="top"
                width="calc(100vw * 0.05)"
                hide-after="1"
              >
                <div style="text-align: center; margin: 0">
                  <el-radio-group
                    v-model="qixiang_didian_radio1"
                    @click="qixiang_didian_pop"
                  >
                    <el-radio value="1" size="large">董屯</el-radio>
                    <el-radio value="2" size="large">曲里</el-radio>
                    <el-radio value="3" size="large">上窑</el-radio>
                  </el-radio-group>
                </div>
                <template #reference>
                  <div ref="excludeArea_qixiang">
                    <el-button
                      size="large"
                      color="#1576CE"
                      class="transparent-btn"
                      @click="visible_qixiang_didian = true"
                      >地点</el-button
                    >
                  </div>
                </template>
              </el-popover>
            </div>
            <!-- 气象日期 -->
            <div class="s_title_date">
              <el-date-picker
                v-model="qiXiangShiJian"
                placeholder="请选择"
                :clearable="false"
                :type="qiXiangShiJianType"
                :format="qiXiangShiJianFormat"
                :value-format="qiXiangShiJianFormat"
                @visible-change="
                  (visibility) => handleVisibleChange(visibility)
                "
              />
            </div>
            <div class="s_title_date_switch">
              <el-select
                v-model="qixiangSelect"
                placeholder="请选择"
                style="width: 120px"
                @change="qiXiangSelectChange"
              >
                <el-option label="年" value="year" />
                <el-option label="月" value="month" />
                <el-option label="日" value="date" />
              </el-select>
            </div>
          </div>
        </dv-border-box-6>
        <!--  气象图 -->
        <dv-border-box-7
          style="width: calc(100vw * 0.246); height: calc(100vh * 0.25)"
        >
          <!-- 气象图 -->
          <Atmosphere />
        </dv-border-box-7>
      </div>
      <!-- 第二列 -->
      <div style="flex: 0 1 24vw">
        <!-- 水鸟标题部分 -->
        <dv-border-box-6
          :reverse="true"
          style="width: calc(100vw * 0.25); height: calc(100vh * 0.05)"
        >
          <div class="s_title3">
            <div
              class="s_title_tc"
              style="
                width: calc(100vw * 0.078);
                padding-left: calc(100vw * 0.018);
              "
            >
              水鸟
            </div>
            <!-- 水鸟地点按钮 -->
            <div class="s_title_date_switch s_title3_date_switch">
              <el-select
                v-model="shuiniao_didian_radio1"
                placeholder="请选择"
                style="width: 320px"
              >
                <el-option label="水鸟科普" value="1" />
                <el-option label="人工监测" value="2" />
                <el-option label="智能监测" value="3" />
              </el-select>
            </div>
          </div>
        </dv-border-box-6>
        <!--  水鸟图 -->
        <dv-border-box-7
          style="width: calc(100vw * 0.2481); height: calc(100vh * 0.25)"
        >
          <!-- 水鸟图 -->
          <template v-if="shuiniao_tu_show === '1'">
            <BirdSpecies />
          </template>
          <template v-if="shuiniao_tu_show === '2'">
            <BirdsRatio />
          </template>
          <template v-if="shuiniao_tu_show === '3'">
            <InfraredCameraDetection />
          </template>
        </dv-border-box-7>
      </div>
      <!-- 第三列 -->
      <div style="flex: 0 1 24vw">
        <!-- 湿地标题部分 -->
        <dv-border-box-6
          :reverse="true"
          style="width: calc(100vw * 0.25); height: calc(100vh * 0.05)"
        >
          <div class="s_title3">
            <div
              class="s_title_tc"
              style="
                width: calc(100vw * 0.145);
                padding-left: calc(100vw * 0.018);
              "
            >
              湿地
            </div>

            <!-- 湿地影像日期 -->
            <div class="s_title2_date">
              <el-date-picker
                v-model="shiDiShiJian"
                placeholder="请选择"
                :clearable="false"
                :type="shiDiShiJianType"
                :format="shiDiShiJianFormat"
                :value-format="shiDiShiJianFormat"
                @visible-change="
                  (visibility) => handleVisibleChange(visibility)
                "
              />
            </div>
          </div>
        </dv-border-box-6>
        <!--  湿地图 -->
        <dv-border-box-7
          style="width: calc(100vw * 0.2481); height: calc(100vh * 0.25)"
        >
          <!-- 湿地图 -->
          <WetLandView />
        </dv-border-box-7>
      </div>
      <!-- 第四列 -->
      <div style="flex: 0 1 24vw">
        <!-- 遥感影像标题部分 -->
        <dv-border-box-6
          :reverse="true"
          style="width: calc(100vw * 0.248); height: calc(100vh * 0.05)"
        >
          <div class="s_title1">
            <div class="s_title3_tc" style="width: calc(100vw * 0.07)">
              遥感影像
            </div>
            <!-- 遥感影像地点按钮 -->
            <div class="s_title_didian">
              <el-popover
                :visible="visible_yaogan_didian"
                trigger="click"
                placement="top"
                width="calc(100vw * 0.05)"
                hide-after="1"
              >
                <div style="text-align: center; margin: 0">
                  <el-radio-group
                    v-model="yaogan_didian_radio1"
                    @click="yaogan_didian_pop"
                  >
                    <el-radio value="1" size="large">卫星影像</el-radio>
                    <el-radio value="2" size="large">无人机影像</el-radio>
                  </el-radio-group>
                </div>
                <template #reference>
                  <div ref="excludeArea_yaogan">
                    <el-button
                      size="large"
                      color="#1576CE"
                      class="transparent-btn"
                      @click="visible_yaogan_didian = true"
                      >类型</el-button
                    >
                  </div>
                </template>
              </el-popover>
            </div>
            <!-- 遥感影像日期 -->
            <div class="s_title_date">
              <el-date-picker
                v-model="yaoGanShiJian"
                placeholder="请选择"
                :clearable="false"
                :type="yaoGanShiJianType"
                :format="yaoGanShiJianFormat"
                :value-format="yaoGanShiJianFormat"
                @visible-change="
                  (visibility) => handleVisibleChange(visibility)
                "
              />
            </div>
            <div class="s_title_date_switch">
              <el-select
                v-model="yaoganSelect"
                placeholder="请选择"
                style="width: 120px"
                @change="yaoGanSelectChange"
              >
                <el-option label="年" value="year" />
                <el-option label="月" value="month" />
                <el-option label="日" value="date" />
              </el-select>
            </div>
          </div>
        </dv-border-box-6>
        <!--  遥感影像图 -->
        <dv-border-box-7
          style="width: calc(100vw * 0.246); height: calc(100vh * 0.25)"
        >
          <!-- 遥感影像图 -->
          <SensingImageView />
        </dv-border-box-7>
      </div>
    </div>
    <!--第四行布局-->
    <div class="s_module-box4">
      <!-- 第一列 -->
      <div style="flex: 0 1 24vw">
        <!-- 版本部分 -->
        <dv-border-box-8
          :reverse="true"
          style="width: calc(100vw * 0.994); height: calc(100vh * 0.04)"
          ><div class="s_title4_tc">
            版权所有: 河南省科学院地理研究所&nbsp;&nbsp;数据联系人：{{
              contact
            }}&nbsp;&nbsp;豫ICP备10005160号-2
          </div></dv-border-box-8
        >
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, getCurrentInstance, onBeforeUnmount } from 'vue'
import RunOff from './charts/RunOff.vue' /* 径流 */
import HydrographView from './charts/HydrographView.vue' /* 水位 */
import SpectralReflectance from './charts/SpectralReflectance.vue' /* 光谱反射率 */
import WaterPhysicochemistry from './charts/WaterPhysicochemistry.vue' /* 水体理化 */
import Atmosphere from './charts/AtmosphereView.vue' /* 气象 */
import BirdSpecies from './charts/BirdSpecies.vue' /* 水鸟科普 */
import BirdsRatio from './charts/BirdsRatio.vue' /* 水鸟人工监测 */
import InfraredCameraDetection from './charts/InfraredCameraDetection.vue' /* 水鸟智能监测 */
import WetLandView from './charts/WetLandView.vue' /* 湿地 */
import SensingImageView from './charts/SensingImageView.vue' /* 遥感影像 */
import MapView from './charts/MapView.vue' /* 陆浑湖野外观测站 */

import axios from 'axios'
/* 径流地点弹框 */
const visible_jingliu_didian = ref(false)
/* 径流时间 */
const jingLiuShiJian = ref('2021-09')
/* 径流地点的选择 */
const jingliu_didian_radio1 = ref('0')
const jingliuSelect = ref('month')
const jingLiuShiJianFormat = ref('YYYY-MM')
const jingLiuShiJianType = ref('month')

/* 水位地点弹框 */
const visible_shuiwei_didian = ref(false)
/* 水位时间 */
const shuiWeiShiJian = ref('2021-12')
/* 水位地点的选择 */
const shuiwei_didian_radio1 = ref('1')
const shuiweiSelect = ref('month')
const shuiWeiShiJianFormat = ref('YYYY-MM')
const shuiWeiShiJianType = ref('month')

/* 光谱地点弹框 */
const visible_guangpu_didian = ref(false)
/* 光谱时间 */
const guangPuShiJian = ref('2021-05-20')
/* 光谱地点的选择 */
const guangpu_didian_radio1 = ref('1')
const guangpuSelect = ref('date')
const guangPuShiJianFormat = ref('YYYY-MM-DD')
const guangPuShiJianType = ref('date')

/* 水体地点弹框 */
const visible_shuiti_didian = ref(false)

/* 气象地点弹框 */
const visible_qixiang_didian = ref(false)
/* 气象时间 */
const qiXiangShiJian = ref('2021-01')
/* 气象地点的选择 */
const qixiang_didian_radio1 = ref('1')
const qixiangSelect = ref('month')
const qiXiangShiJianFormat = ref('YYYY-MM')
const qiXiangShiJianType = ref('month')

/* 水鸟地点弹框 */
/* const visible_shuiniao_didian = ref(false) */
/* 水鸟地点的选择 */
const shuiniao_didian_radio1 = ref('1')
/* 水鸟图显示 */
const shuiniao_tu_show = ref('1')

/* 湿地时间 */
const shiDiShiJian = ref('2021-01-01')
/* 湿地地点的选择 */
const shiDiShiJianFormat = ref('YYYY-MM-DD')
const shiDiShiJianType = ref('date')

/* 遥感影像地点弹框 */
const visible_yaogan_didian = ref(false)
/* 遥感影像时间 */
const yaoGanShiJian = ref('2021-01-01')
/* 遥感影像地点的选择 */
const yaogan_didian_radio1 = ref('1')
const yaoganSelect = ref('date')
const yaoGanShiJianFormat = ref('YYYY-MM-DD')
const yaoGanShiJianType = ref('date')

const excludeArea_jingliu = ref(null) // 径流地点按钮区域
const excludeArea_shuiwei = ref(null) // 水位地点按钮区域
const excludeArea_qixiang = ref(null) // 气象地点按钮区域
const excludeArea_guangpu = ref(null) // 光谱地点按钮区域
const excludeArea_shuiti = ref(null) // 水体理化地点按钮区域
const excludeArea_yaogan = ref(null) // 遥感类型按钮区域

const contact = ref()
onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      axios
        .get('/json/fullscreenSampleJson/sample.json')
        .then((response) => {
          contact.value = response.data.contact
        })
        .catch((error) => {
          console.error('Error loading sample.json:', error)
        })
      document.addEventListener('click', handleGlobalClick)
    })
  }
})

// 监听变化
watch(
  () => [shuiniao_didian_radio1.value],
  (newValue, oldValue) => {
    shuiniao_tu_show.value = shuiniao_didian_radio1.value
  }
)

// 监听全局点击事件
function handleGlobalClick (event) {
  // console.log('Clicked excludeArea_jingliu:', excludeArea_jingliu.value)
  // console.log('Clicked element:', event.target)
  // 点击径流-地点按钮
  if (excludeArea_jingliu.value.contains(event.target)) {
    visible_shuiwei_didian.value = false
    visible_qixiang_didian.value = false
    visible_guangpu_didian.value = false
    visible_shuiti_didian.value = false
    visible_yaogan_didian.value = false
    return
  }
  // 点击水位-地点按钮
  if (excludeArea_shuiwei.value.contains(event.target)) {
    visible_jingliu_didian.value = false
    visible_qixiang_didian.value = false
    visible_guangpu_didian.value = false
    visible_shuiti_didian.value = false
    visible_yaogan_didian.value = false
    return
  }
  // 点击气象-地点按钮
  if (excludeArea_qixiang.value.contains(event.target)) {
    visible_shuiwei_didian.value = false
    visible_jingliu_didian.value = false
    visible_guangpu_didian.value = false
    visible_shuiti_didian.value = false
    visible_yaogan_didian.value = false
    return
  }
  // 点击光谱-地点按钮
  if (excludeArea_guangpu.value.contains(event.target)) {
    visible_shuiwei_didian.value = false
    visible_qixiang_didian.value = false
    visible_jingliu_didian.value = false
    visible_shuiti_didian.value = false
    visible_yaogan_didian.value = false
    return
  }
  // 点击水体理化-地点按钮
  if (excludeArea_shuiti.value.contains(event.target)) {
    visible_shuiwei_didian.value = false
    visible_qixiang_didian.value = false
    visible_guangpu_didian.value = false
    visible_jingliu_didian.value = false
    visible_yaogan_didian.value = false
    return
  }
  // 点击遥感-类型按钮
  if (excludeArea_yaogan.value.contains(event.target)) {
    visible_shuiwei_didian.value = false
    visible_qixiang_didian.value = false
    visible_guangpu_didian.value = false
    visible_shuiti_didian.value = false
    visible_jingliu_didian.value = false
    return
  }
  visible_jingliu_didian.value = false
  visible_shuiwei_didian.value = false
  visible_qixiang_didian.value = false
  visible_guangpu_didian.value = false
  visible_shuiti_didian.value = false
  visible_yaogan_didian.value = false
}

// 日期选择框出现/消失时触发
function handleVisibleChange (visibility) {
  if (visibility) {
    // 开启时
    visible_jingliu_didian.value = false
    visible_shuiwei_didian.value = false
    visible_qixiang_didian.value = false
    visible_guangpu_didian.value = false
    visible_shuiti_didian.value = false
    visible_yaogan_didian.value = false
  }
}

onBeforeUnmount(() => {
  // 销毁实例
  document.removeEventListener('click', handleGlobalClick)
})

/* 径流地点的改变 */
function jingliu_didian_pop () {
  visible_jingliu_didian.value = false
}
function jingLiuSelectChange () {
  const jingliuSelectValue = jingliuSelect.value
  jingLiuShiJianType.value = jingliuSelectValue
  if (jingliuSelectValue === 'year') {
    jingLiuShiJianFormat.value = 'YYYY'
    jingLiuShiJian.value = ''
  }
  if (jingliuSelectValue === 'month') {
    jingLiuShiJianFormat.value = 'YYYY-MM'
    jingLiuShiJian.value = ''
  }
  if (jingliuSelectValue === 'date') {
    jingLiuShiJianFormat.value = 'YYYY-MM-DD'
    jingLiuShiJian.value = ''
  }
}

/* 水位地点的改变 */
function shuiwei_didian_pop () {
  visible_shuiwei_didian.value = false
}
function shuiWeiSelectChange () {
  const shuiweiSelectValue = shuiweiSelect.value
  shuiWeiShiJianType.value = shuiweiSelectValue
  if (shuiweiSelectValue === 'year') {
    shuiWeiShiJianFormat.value = 'YYYY'
    shuiWeiShiJian.value = ''
  }
  if (shuiweiSelectValue === 'month') {
    shuiWeiShiJianFormat.value = 'YYYY-MM'
    shuiWeiShiJian.value = ''
  }
  if (shuiweiSelectValue === 'date') {
    shuiWeiShiJianFormat.value = 'YYYY-MM-DD'
    shuiWeiShiJian.value = ''
  }
}

/* 光谱地点的改变 */
function guangpu_didian_pop () {
  visible_guangpu_didian.value = false
}
function guangPuSelectChange () {
  const guangpuSelectValue = guangpuSelect.value
  guangPuShiJianType.value = guangpuSelectValue
  if (guangpuSelectValue === 'year') {
    guangPuShiJianFormat.value = 'YYYY'
    guangPuShiJian.value = ''
  }
  if (guangpuSelectValue === 'month') {
    guangPuShiJianFormat.value = 'YYYY-MM'
    guangPuShiJian.value = ''
  }
  if (guangpuSelectValue === 'date') {
    guangPuShiJianFormat.value = 'YYYY-MM-DD'
    guangPuShiJian.value = ''
  }
}

/* 水体地点的改变 */
function shuiti_didian_pop () {
  visible_shuiti_didian.value = false
}

/* 气象地点的改变 */
function qixiang_didian_pop () {
  visible_qixiang_didian.value = false
}
function qiXiangSelectChange () {
  const qixiangSelectValue = qixiangSelect.value
  qiXiangShiJianType.value = qixiangSelectValue
  if (qixiangSelectValue === 'year') {
    qiXiangShiJianFormat.value = 'YYYY'
    qiXiangShiJian.value = ''
  }
  if (qixiangSelectValue === 'month') {
    qiXiangShiJianFormat.value = 'YYYY-MM'
    qiXiangShiJian.value = ''
  }
  if (qixiangSelectValue === 'date') {
    qiXiangShiJianFormat.value = 'YYYY-MM-DD'
    qiXiangShiJian.value = ''
  }
}

/* 水鸟地点的改变 */
// function shuiniao_didian_pop () {
//   visible_shuiniao_didian.value = false
// }

/* 遥感影像地点的改变 */
function yaogan_didian_pop () {
  visible_yaogan_didian.value = false
}
function yaoGanSelectChange () {
  const yaoganSelectValue = yaoganSelect.value
  yaoGanShiJianType.value = yaoganSelectValue
  if (yaoganSelectValue === 'year') {
    yaoGanShiJianFormat.value = 'YYYY'
    yaoGanShiJian.value = ''
  }
  if (yaoganSelectValue === 'month') {
    yaoGanShiJianFormat.value = 'YYYY-MM'
    yaoGanShiJian.value = ''
  }
  if (yaoganSelectValue === 'date') {
    yaoGanShiJianFormat.value = 'YYYY-MM-DD'
    yaoGanShiJian.value = ''
  }
}
</script>
<style scoped>
/*主体*/
.s_content {
  color: #fff;
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-color: #081325;
  display: flex; /*这不是必需的，除非你也想让 .s_content 的子元素成为 flex 容器 */
  flex-direction: column;
  /* justify-content: flex-start; 水平居中 */
}
.s_module-box1 {
  display: flex; /* 将 .s_module-box 设置为 flex 容器 */
  width: 100vw;
  height: calc(100vh * 0.06); /* 这将设置元素高度为视口高度的100% */
  flex-wrap: nowrap; /* 确保子元素不会换行到下一行 */
  justify-content: space-between; /*两端对齐*/
}
/*文本对齐*/
.s_tc {
  width: calc(100vw * 0.065);
  height: calc(100vh * 0.06);
  text-align: center;
  font-size: calc(100vw * 0.014);
  letter-spacing: 2px; /*字体之间的间隔 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  font-family: 'YouShe', serif;
  font-style: normal;
}
.s_title_tc {
  width: calc(100vw * 0.08);
  height: calc(100vh * 0.045);
  text-align: center;
  font-size: calc(100vw * 0.0125);
  letter-spacing: 2px; /*字体之间的间隔 */
  display: flex;
  justify-content: left; /* 水平居中 */
  padding-left: calc(100vw * 0.015);
  align-items: center; /* 垂直居中 */
  font-family: 'YouShe','SimHei', 'Heiti SC', serif;
  font-style: italic;
}
.s_title2_tc {
  width: calc(100vw * 0.5);
  height: calc(100vh * 0.045);
  text-align: center;
  font-size: calc(100vw * 0.0125);
  letter-spacing: 2px; /*字体之间的间隔 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  font-family:'YouShe', 'SimHei', 'Heiti SC', serif;
  font-style: italic;
}
.s_title3_tc {
  width: calc(100vw * 0.24);
  height: calc(100vh * 0.045);
  text-align: center;
  font-size: calc(100vw * 0.0125);
  letter-spacing: 0px; /*字体之间的间隔 */
  display: flex;
  padding-left: calc(100vw * 0.015);
  justify-content: left; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  font-family: 'YouShe','SimHei', 'Heiti SC', serif;
  font-style: italic;
}
.s_title4_tc {
  width: calc(100vw * 0.994);
  height: calc(100vh * 0.04);
  text-align: center;
  font-size: calc(100vw * 0.008);
  letter-spacing: 2px; /*字体之间的间隔 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  /* font-family: YouShe, serif;
  font-style: normal; */
}
.s_title_didian {
  width: calc(100vw * 0.055);
  height: calc(100vh * 0.035);
  text-align: center;
  font-size: calc(100vw * 0.009);
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  font-family: PuHuiTi, serif;
  font-style: normal;
}
::v-deep .el-button > span {
  font-family: PuHuiTi, serif !important;
  font-style: normal !important;
}

.s_title1_didian {
  width: calc(100vw * 0.075);
  height: calc(100vh * 0.05);
  text-align: center;
  font-size: calc(100vw * 0.009);
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中  */
  font-family: PuHuiTi, serif;
  font-style: normal;
}
.s_title2_didian {
  width: calc(100vw * 0.085);
  height: calc(100vh * 0.045);
  text-align: center;
  font-size: calc(100vw * 0.009);
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /*垂直居中 */
  font-family: PuHuiTi, serif;
  font-style: normal;
}
.s_title_date {
  width: calc(100vw * 0.0741);
  height: calc(100vh * 0.05);
  text-align: center;
  font-size: calc(100vw * 0.009);
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.s_title2_date {
  width: calc(100vw * 0.0741);
  height: calc(100vh * 0.05);
  text-align: center;
  font-size: calc(100vw * 0.009);
  display: flex;
  justify-content: left; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.s_title_date_switch {
  width: calc(100vw * 0.05);
  height: calc(100vh * 0.045);
  text-align: center;
  font-size: calc(100vw * 0.009);
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.s_title2_date_switch {
  width: calc(100vw * 0.08);
  height: calc(100vh * 0.045);
  text-align: center;
  font-size: calc(100vw * 0.009);
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.s_header {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  width: calc(100vw * 0.48);
  height: calc(100vh * 0.05);
  text-align: center;
  font-size: calc(100vw * 0.023);
  font-family: YouShe, serif;
  font-style: normal;
  /* 添加径向渐变色 */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent; /* 文本颜色设为透明以显示背景 */
  background-image: radial-gradient(
    circle,
    #7fdbff,
    #007fff
  ); /* 定义径向渐变，从蓝色到紫色 */
}

.s_module-box2 {
  display: flex; /* 将 .s_module-box 设置为 flex 容器 */
  width: 100vw;
  height: calc(100vh * 0.605); /* 这将设置元素高度为视口高度的100% */
  flex-wrap: nowrap; /* 确保子元素不会换行到下一行 */
  justify-content: center; /*两端对齐*/
  align-items: flex-start; /*与交叉轴的起点对齐。 */
  margin-top: calc(100vh * 0.01);
}
.s_module-box3 {
  display: flex; /* 将 .s_module-box 设置为 flex 容器 */
  width: 100vw;
  height: calc(100vh * 0.55); /* 这将设置元素高度为视口高度的100% */
  flex-wrap: nowrap; /* 确保子元素不会换行到下一行 */
  justify-content: center; /*两端对齐*/
  align-items: flex-start; /*与交叉轴的起点对齐。 */
}
.s_module-box4 {
  display: flex; /* 将 .s_module-box 设置为 flex 容器 */
  width: 100vw;
  height: calc(100vh * 0.4); /* 这将设置元素高度为视口高度的100% */
  flex-wrap: nowrap; /* 确保子元素不会换行到下一行 */
  justify-content: center; /*两端对齐*/
  align-items: flex-start; /*与交叉轴的起点对齐。 */
  margin-top: calc(100vh * 0.01);
}
.s_title1 {
  background: url('../../../public/images/fullscreenSample/title.png') no-repeat
    center center;
  background-size: calc(100vw * 0.246) calc(100vh * 0.045);
  width: calc(100vw * 0.24);
  height: calc(100vh * 0.045);
  display: flex;
  flex-wrap: nowrap; /* 确保子元素不会换行到下一行 */
  justify-content: left; /* 两端对齐space-between，left左对齐，center居中 */
  align-items: center; /* 垂直居中 */
}
.s_title2 {
  background: url('../../../public/images/fullscreenSample/title.png') no-repeat
    center center;
  background-size: calc(100vw * 0.5) calc(100vh * 0.045);
  width: calc(100vw * 0.5);
  height: calc(100vh * 0.045);
  display: flex;
  flex-wrap: nowrap; /* 确保子元素不会换行到下一行 */
  justify-content: left; /* 两端对齐space-between，left左对齐，center居中 */
  align-items: center; /* 垂直居中 */
}
.s_title3 {
  background: url('../../../public/images/fullscreenSample/title.png') no-repeat
    center center;
  background-size: calc(100vw * 0.249) calc(100vh * 0.05);
  width: calc(100vw * 0.249);
  height: calc(100vh * 0.05);
  display: flex;
  flex-wrap: nowrap; /* 确保子元素不会换行到下一行 */
  justify-content: left; /* 两端对齐space-between，left左对齐，center居中 */
  align-items: center; /* 垂直居中 */
}
.transparent-btn {
  background-color: transparent !important; /*按钮透明色 */
  border-color: #dcdfe6 !important;
  height: 32px;
}
/* ::v-deep .el-button--large{
  height:auto
} */
::v-deep .el-input {
  --el-input-bg-color: transparent !important; /*按钮透明色 */
  --el-input-border: none !important;
  border: none !important;
}
::v-deep .el-input__inner {
  color: #fff !important;
}
::v-deep .el-select {
  width: calc(100vw * 0.038) !important;
}

::v-deep .s_title3_date_switch .el-select {
  width: calc(100vw * 0.068) !important;
}
::v-deep .s_title3_date_switch .el-select .el-select__wrapper {
  background-color: transparent !important; /*按钮透明色 */
  border-color: transparent !important;
  width: calc(100vw * 0.068);
}

::v-deep .el-select .el-select__wrapper {
  background-color: transparent !important; /*按钮透明色 */
  border-color: transparent !important;
  width: calc(100vw * 0.038);
}
::v-deep .el-select__placeholder {
  color: #fff !important;
}
</style>
