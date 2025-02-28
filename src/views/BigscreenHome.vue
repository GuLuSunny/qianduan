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
          <div class="s_tc" @click="$hasPermission('screen_titleA_a')===true?goLink('/mainMenu', '1', 'sub1'):''" >数据获取</div>
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
          <div class="s_tc"  @click="$hasPermission('screen_titleA_b')===true?goLink('/mainMenu', '9', 'sub2'):''" >数据查询</div>
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
          <div class="s_header">黄河流域陆浑湖野外观测站多源数据综汇系统</div>
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
          <div class="s_tc" @click="$hasPermission('screen_titleA_c')===true?goLink('/mainMenu', '14', 'sub4'):''" >用户管理</div>
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
          <div class="s_tc" @click="$hasPermission('screen_titleA_d')===true?goLink('/mainMenu', '12', 'sub3'):''" >数据共享</div>
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
            <div class="s_title_tc"  @click="$hasPermission('screen_titleB_a')===true?goLink('/mainMenu', '10', 'sub2'):''">径流</div>
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
                    @change="didianChange('jingliu')"
                  >
                    <el-radio
                      v-for="item in jingLiuDiDianOption"
                      :key="item.id"
                      :label="item.deviceName"
                      :value="item.id"
                      size="large"
                    />
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
                  (visibility) => handleVisibleChange(visibility, 'jingliu')
                "
                :disabled-date="(time) => disabledDate(time, 'jingliu')"
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
          <RunOff :jingLiuData="jingLiuData" />
        </dv-border-box-7>

        <!-- 水位标题部分 -->
        <dv-border-box-6
          :reverse="true"
          style="width: calc(100vw * 0.248); height: calc(100vh * 0.045)"
        >
          <div class="s_title1">
            <div class="s_title_tc" @click="$hasPermission('screen_titleB_b')===true?goLink('/mainMenu', '9', 'sub2'):''">水位</div>
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
                  (visibility) => handleVisibleChange(visibility, 'shuiwei')
                "
                :disabled-date="(time) => disabledDate(time, 'shuiwei')"
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
          <HydrographView :shuiWeiData="shuiWeiData" />
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
            <div class="s_title3_tc" style="width: calc(100vw * 0.12)"  @click="$hasPermission('screen_titleB_c')===true?goLink('/mainMenu', '8', 'sub2'):''">
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
                  (visibility) => handleVisibleChange(visibility, 'guangpu')
                "
                :disabled-date="(time) => disabledDate(time, 'guangpu')"
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
          <SpectralReflectance :guangPuData="guangPuData" />
        </dv-border-box-7>
        <!-- 水体理化标题部分 -->
        <dv-border-box-6
          :reverse="true"
          style="width: calc(100vw * 0.248); height: calc(100vh * 0.045)"
        >
          <div class="s_title1">
            <div class="s_title3_tc" style="width: calc(100vw * 0.12)"  @click="$hasPermission('screen_titleB_d')===true?goLink('/mainMenu', '7', 'sub2'):''">
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
                  (visibility) => handleVisibleChange(visibility, 'shuitilihua')
                "
                :disabled-date="(time) => disabledDate(time, 'shuitilihua')"
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
          <WaterPhysicochemistry :shuiTiData="shuiTiData" />
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
            <div class="s_title_tc" @click="$hasPermission('screen_titleC_a')===true?goLink('/mainMenu', '5', 'sub2'):''">气象</div>
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
                    @change="didianChange('qixiang')"
                  >
                    <el-radio value="24" size="large">董屯</el-radio>
                    <el-radio value="25" size="large">曲里</el-radio>
                    <el-radio value="26" size="large">上窑</el-radio>
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
                  (visibility) => handleVisibleChange(visibility, 'qixiang')
                "
                :disabled-date="(time) => disabledDate(time, 'qixiang')"
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
          <Atmosphere :qiXiangData="qiXiangData" />
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
               @click="$hasPermission('screen_titleC_b')===true?goLink('/mainMenu', '6', 'sub2'):''"
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
               @click="$hasPermission('screen_titleC_c')===true?goLink('/mainMenu', '11', 'sub2'):''"
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
                  (visibility) => handleVisibleChange(visibility, 'shiditurang')
                "
                :disabled-date="(time) => disabledDate(time, 'shiditurang')"
              />
            </div>
          </div>
        </dv-border-box-6>
        <!--  湿地图 -->
        <dv-border-box-7
          style="width: calc(100vw * 0.2481); height: calc(100vh * 0.25)"
        >
          <!-- 湿地图 -->
          <WetLandView :shiDiData='shiDiData'/>
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
            <div class="s_title3_tc" style="width: calc(100vw * 0.07)" 
            @click="$hasPermission('screen_titleC_d')===true?goLink('/mainMenu', '16', 'sub2'):''">
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
                  (visibility) => handleVisibleChange(visibility, 'yaogan')
                "
                :disabled-date="(time) => disabledDate(time, 'yaogan')"
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
import { useRouter } from 'vue-router'
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
import { ElMessage } from 'element-plus'

import {
  getTimesByType,
  queryDeviceByMultiWord
} from '@/api/getData'

import axios from 'axios'
/* 径流地点弹框 */
const visible_jingliu_didian = ref(false)
/* 径流时间 */
const jingLiuShiJian = ref('2021-09')
/* 径流地点的选择 */
const jingliu_didian_radio1 = ref()
const jingliuSelect = ref('month')
const jingLiuShiJianFormat = ref('YYYY-MM')
const jingLiuShiJianType = ref('month')
const jingLiuDiDianOption = ref([]) // 径流地点下拉框数据
const jingLiuData = ref({ time: '', device: '', type: 'month' }) // 径流数据

/* 水位地点弹框 */
const visible_shuiwei_didian = ref(false)
/* 水位时间 */
const shuiWeiShiJian = ref('2021-12')
/* 水位地点的选择 */
const shuiwei_didian_radio1 = ref('1')
const shuiweiSelect = ref('month')
const shuiWeiShiJianFormat = ref('YYYY-MM')
const shuiWeiShiJianType = ref('month')
const shuiWeiData = ref({ time: '2021-12', type: 'month' }) // 水位数据

/* 光谱地点弹框 */
const visible_guangpu_didian = ref(false)
/* 光谱时间 */
const guangPuShiJian = ref('2021-05-20')
/* 光谱地点的选择 */
const guangpu_didian_radio1 = ref('1')
const guangpuSelect = ref('date')
const guangPuShiJianFormat = ref('YYYY-MM-DD')
const guangPuShiJianType = ref('date')
const guangPuData = ref({ time: '', device: '' }) // 光谱

/* 水体地点弹框 */
const visible_shuiti_didian = ref(false)
const shuiTiData = ref({ time: '', device: '' }) // 水体理化

/* 气象地点弹框 */
const visible_qixiang_didian = ref(false)
/* 气象时间 */
const qiXiangShiJian = ref('2021-01')
/* 气象地点的选择 */
const qixiang_didian_radio1 = ref('24')
const qixiangSelect = ref('month')
const qiXiangShiJianFormat = ref('YYYY-MM')
const qiXiangShiJianType = ref('month')
const qiXiangData = ref({ time: '2021-01-01', device: '24' }) // 气象

/* 水鸟地点弹框 */
/* const visible_shuiniao_didian = ref(false) */
/* 水鸟地点的选择 */
const shuiniao_didian_radio1 = ref('1')
/* 水鸟图显示 */
const shuiniao_tu_show = ref('1')

/* 湿地时间 */
const shiDiShiJian = ref('2024-12-12')
/* 湿地地点的选择 */
const shiDiShiJianFormat = ref('YYYY-MM-DD')
const shiDiShiJianType = ref('date')
const shiDiData = ref({ time: '2024-12-12', type: '' }) // 湿地

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
    }, getDeviceInfoList('02'))
  }
})

// 监听变化
watch(
  () => [shuiniao_didian_radio1.value],
  (newValue, oldValue) => {
    shuiniao_tu_show.value = shuiniao_didian_radio1.value
  }
)

/* 地点改变 */
function didianChange (type) {
  if (type === 'jingliu') {
    if (jingLiuShiJian.value === '') {
      return
    }
    jingLiuData.value = {
      time: jingLiuShiJian.value,
      device: jingliu_didian_radio1.value,
      type: jingLiuShiJianType.value
    }
  } else if (type === 'shuiwei') {
    if (shuiWeiShiJian.value === '') return
    shuiWeiData.value = {
      time: shuiWeiShiJian.value,
      type: shuiWeiShiJianType.value
    }
  } else if (type === 'guangpu' || type === 'shuitilihua') {
    if (guangPuShiJian.value === '') {
      return
    }
    guangPuData.value = {
      time: guangPuShiJian.value,
      device: ''
    }
    shuiTiData.value = {
      time: guangPuShiJian.value,
      device: ''
    }
  } else if (type === 'qixiang') {
    if (qiXiangShiJian.value === '') return
    qiXiangData.value = {
      time: qiXiangShiJian.value,
      device: qixiang_didian_radio1.value
    }
  }else if (type === 'shiditurang') {
    if (shiDiShiJian.value === '') return
    shiDiData.value = {
      time: qiXiangShiJian.value
    }
  }
}

// 根据设备类型，查询设备列表
// 观测设备种类分类；
// 01：光谱和水体监测点；
// 02：径流监测点；
// 03：气象站；
// 04：外业调查点位
function getDeviceInfoList (deviceType) {
  queryDeviceByMultiWord({
    id: '',
    deviceName: '',
    type: deviceType
  })
    .then((res) => {
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        if (deviceType === '02') {
          jingLiuDiDianOption.value = []
          jingLiuDiDianOption.value.push({ id: '', deviceName: '全部' })
          jingLiuDiDianOption.value.push(...result.body)
          if (jingLiuDiDianOption.value.length > 0) {
            jingliu_didian_radio1.value = jingLiuDiDianOption.value[0].id
          }
        }
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

/* 日期筛选 */
const showDateArr = ref([])
function disabledDate (time, type) {
  if (showDateArr.value == null || showDateArr.value.length === 0) {
    return true
  }
  let customString = `${time.getFullYear()}-${(time.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}`
  if (type === 'jingliu') {
    if (jingLiuShiJianType.value === 'year') {
      customString = `${time.getFullYear()}`
    }
    if (jingLiuShiJianType.value === 'month') {
      customString = `${time.getFullYear()}-${(time.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`
    }
  }
  if (type === 'shuiwei') {
    if (shuiWeiShiJianType.value === 'year') {
      customString = `${time.getFullYear()}`
    }
    if (shuiWeiShiJianType.value === 'month') {
      customString = `${time.getFullYear()}-${(time.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`
    }
  }
  if (type === 'guangpu' || type === 'shuitilihua') {
    if (
      guangPuShiJianType.value === 'year' ||
      guangPuShiJianType.value === 'month'
    ) {
      return true
    }
  }
  if (type === 'qixiang') {
    if (qiXiangShiJianType.value === 'year') {
      customString = `${time.getFullYear()}`
    }
    if (qiXiangShiJianType.value === 'month') {
      customString = `${time.getFullYear()}-${(time.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`
    }
  }
  if (type === 'yaogan') {
    return true
  }
  const isTimeInArray = showDateArr.value.includes(customString)
  return !isTimeInArray
}

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
function handleVisibleChange (visibility, type) {
  if (visibility) {
    // 开启时
    visible_jingliu_didian.value = false
    visible_shuiwei_didian.value = false
    visible_qixiang_didian.value = false
    visible_guangpu_didian.value = false
    visible_shuiti_didian.value = false
    visible_yaogan_didian.value = false

    let searchTimeType = ''
    if (type === 'jingliu') {
      searchTimeType = jingLiuShiJianType.value
      if (searchTimeType === 'date') {
        return
      }
    } else if (type === 'shuiwei') {
      searchTimeType = shuiWeiShiJianType.value
      if (searchTimeType === 'date') {
        return
      }
    } else if (type === 'guangpu') {
      searchTimeType = guangPuShiJianType.value
      if (searchTimeType === 'year' || searchTimeType === 'month') {
        return
      }
    } else if (type === 'shuitilihua') {
      searchTimeType = guangPuShiJianType.value
      if (searchTimeType === 'year' || searchTimeType === 'month') {
        return
      }
    } else if (type === 'qixiang') {
      searchTimeType = qiXiangShiJianType.value
    }
    else if (type === 'yaogan') {
      return
    }
    getTimesByType({
      type: type,
      searchTimeType: searchTimeType
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
  } else {
    didianChange(type)
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
/*点击跳转*/
const routers = useRouter()
function goLink (addressLink, menuItemKey, openKey) {
  const menuItemKeyList = { menuItemKey: menuItemKey, openSubKey: openKey }
  localStorage.setItem('menuItemKeyList', JSON.stringify(menuItemKeyList))
  routers.push(addressLink)
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
  font-family: 'YouShe', 'SimHei', 'Heiti SC', serif;
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
  font-family: 'YouShe', 'SimHei', 'Heiti SC', serif;
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
  font-family: 'YouShe', 'SimHei', 'Heiti SC', serif;
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
  background: url('../../public/images/fullscreenSample/title.png') no-repeat
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
  background: url('../../public/images/fullscreenSample/title.png') no-repeat
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
  background: url('../../public/images/fullscreenSample/title.png') no-repeat
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
