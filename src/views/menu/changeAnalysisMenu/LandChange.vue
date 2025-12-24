<template>
    <div>
        <!-- 地类变化识别功能 -->
        <div class="feature-container">
            <!-- 自定义步骤条 -->
            <div class="steps-container">
                <div class="custom-steps">
                    <div :class="['step-item', { 'active': predictCurrent === 0 }]">
                        <div class="step-number">1</div>
                        <div class="step-title">选择文件和参数</div>
                    </div>
                    <div :class="['step-item', { 'active': predictCurrent === 1 }]">
                        <div class="step-number">2</div>
                        <div class="step-title">生产结果</div>
                    </div>
                </div>
            </div>

            <!-- 选择文件和参数页面 -->
            <div class="form-container" v-if="predictCurrent === 0">
                <el-form :model="form" label-width="140px">
                    <div class="form-horizontal-group">
                        <div class="form-column-full">
                            <!-- 早期文件上传 -->
                            <el-form-item label="早期文件" required>
                                <div style="display: flex; align-items: center; gap: 10px; width: 400px;">
                                    <el-input v-model="earlyFilePath" placeholder="请选择早期地类分类文件" readonly
                                        style="width: 100%;" clearable @clear="handleRemoveFile('early')"
                                        @keydown.delete="handleKeydown($event, 'early')"
                                        @focus="handleInputFocus('early')">
                                        <template #append>
                                            <el-button @click="handleEarlyBrowseClick"
                                                style="background-color: #409eff; color: white; border: none;">
                                                浏览
                                            </el-button>
                                        </template>
                                    </el-input>
                                    <input type="file" ref="earlyFileInput" @change="handleEarlyFileSelect"
                                        accept=".tif,.tiff" style="display: none;" />
                                </div>
                                <div class="file-hint">请选择早期地类分类TIFF文件</div>
                            </el-form-item>

                            <!-- 后期文件上传 -->
                            <el-form-item label="后期文件" required>
                                <div style="display: flex; align-items: center; gap: 10px; width: 400px;">
                                    <el-input v-model="lateFilePath" placeholder="请选择后期地类分类文件" readonly
                                        style="width: 100%;" clearable @clear="handleRemoveFile('late')"
                                        @keydown.delete="handleKeydown($event, 'late')"
                                        @focus="handleInputFocus('late')">
                                        <template #append>
                                            <el-button @click="handleLateBrowseClick"
                                                style="background-color: #409eff; color: white; border: none;">
                                                浏览
                                            </el-button>
                                        </template>
                                    </el-input>
                                    <input type="file" ref="lateFileInput" @change="handleLateFileSelect"
                                        accept=".tif,.tiff" style="display: none;" />
                                </div>
                                <div class="file-hint">请选择后期地类分类TIFF文件</div>
                            </el-form-item>

                            <!-- 显示模式选择 -->
                            <el-form-item label="显示模式" required>
                                <el-radio-group v-model="displayMode" class="radio-group">
                                    <el-radio label="changes_only">仅显示变化区域</el-radio>
                                    <el-radio label="all">显示全部类别</el-radio>
                                </el-radio-group>
                            </el-form-item>

                            <!-- 配置文件上传（可选） -->
                            <el-form-item label="配置文件">
                                <div style="display: flex; align-items: center; gap: 10px; width: 400px;">
                                    <el-input v-model="configFilePath" placeholder="请选择配置文件（可选）" readonly
                                        style="width: 100%;" clearable @clear="handleRemoveFile('config')"
                                        @keydown.delete="handleKeydown($event, 'config')"
                                        @focus="handleInputFocus('config')">
                                        <template #append>
                                            <el-button @click="handleConfigBrowseClick"
                                                style="background-color: #409eff; color: white; border: none;">
                                                浏览
                                            </el-button>
                                        </template>
                                    </el-input>
                                    <input type="file" ref="configFileInput" @change="handleConfigFileSelect"
                                        accept=".json" style="display: none;" />
                                </div>
                                <div class="file-hint">JSON格式配置文件，定义类别和颜色（可选）</div>
                            </el-form-item>

                            <!-- 文件状态提示 -->
                            <el-form-item label="文件状态">
                                <div class="file-status">
                                    <div v-if="earlyFileObject" class="status-item">
                                        <el-icon color="#67C23A">
                                            <Check />
                                        </el-icon>
                                        <span>早期文件: {{ earlyFilePath }} ({{ (earlyFileObject.size / 1024 /
                                            1024).toFixed(2) }} MB)</span>
                                    </div>
                                    <div v-else class="status-item">
                                        <el-icon color="#F56C6C">
                                            <Close />
                                        </el-icon>
                                        <span>未选择早期文件</span>
                                    </div>
                                    <div v-if="lateFileObject" class="status-item">
                                        <el-icon color="#67C23A">
                                            <Check />
                                        </el-icon>
                                        <span>后期文件: {{ lateFilePath }} ({{ (lateFileObject.size / 1024 /
                                            1024).toFixed(2) }} MB)</span>
                                    </div>
                                    <div v-else class="status-item">
                                        <el-icon color="#F56C6C">
                                            <Close />
                                        </el-icon>
                                        <span>未选择后期文件</span>
                                    </div>
                                    <div v-if="configFileObject" class="status-item">
                                        <el-icon color="#67C23A">
                                            <Check />
                                        </el-icon>
                                        <span>配置文件: {{ configFilePath }} ({{ (configFileObject.size / 1024).toFixed(2)
                                        }} KB)</span>
                                    </div>
                                </div>
                            </el-form-item>

                            <!-- 生产参数选项 -->
                            <el-form-item label="生产参数">
                                <el-checkbox-group v-model="predictOptions">
                                    <el-checkbox label="change_stats">变化统计</el-checkbox>
                                    <el-checkbox label="change_image">变化预览</el-checkbox>
                                    <el-checkbox label="change_tif">变化结果下载</el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>

                            <div class="button-group">
                                <el-button @click="handlePredict" class="submit-button" type="primary"
                                    :loading="predictLoading" :disabled="!earlyFileObject || !lateFileObject">
                                    {{ predictLoading ? '上传并生产中...' : '开始生产' }}
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-form>
            </div>

            <!-- 生产结果页面 -->
            <div class="result-container" v-if="predictCurrent === 1">
                <div class="result-content">
                    <!-- 结果内容区域 - 左右布局 -->
                    <div class="result-layout">
                        <!-- 左边：变化统计 -->
                        <div class="result-left">
                            <div class="result-section-header">
                                <h3><el-icon>
                                        <DataAnalysis />
                                    </el-icon> 变化统计</h3>
                            </div>

                            <!-- 主要内容区域 - 添加滚动 -->
                            <div class="result-section-content stats-section-content">
                                <div class="stats-scroll-container">
                                    <div v-if="Object.keys(changeStats).length > 0 || changeTypes.length > 0"
                                        class="stats-main-content">
                                        <!-- 总体统计卡片 -->
                                        <div class="stat-summary-card" @mouseenter="onCardHover('summary')">
                                            <h4 class="stat-summary-title">总体统计</h4>
                                            <div class="stat-summary-grid">
                                                <div class="stat-card"
                                                    :class="{ 'hovered': hoveredCard === 'summary-total' }"
                                                    @mouseenter="onCardHover('summary-total')"
                                                    @mouseleave="hoveredCard = ''">
                                                    <div class="stat-card-value">{{
                                                        totalStats.total_pixels?.toLocaleString() || '0'
                                                    }}</div>
                                                    <div class="stat-card-label">总像素数</div>
                                                </div>
                                                <div class="stat-card"
                                                    :class="{ 'hovered': hoveredCard === 'summary-valid' }"
                                                    @mouseenter="onCardHover('summary-valid')"
                                                    @mouseleave="hoveredCard = ''">
                                                    <div class="stat-card-value">{{
                                                        totalStats.valid_pixels?.toLocaleString() || '0'
                                                    }}</div>
                                                    <div class="stat-card-label">有效像素</div>
                                                </div>
                                                <div class="stat-card stat-card-changed"
                                                    :class="{ 'hovered': hoveredCard === 'summary-changed' }"
                                                    @mouseenter="onCardHover('summary-changed')"
                                                    @mouseleave="hoveredCard = ''">
                                                    <div class="stat-card-value">{{
                                                        totalStats.changed_pixels?.toLocaleString() ||
                                                        '0' }}</div>
                                                    <div class="stat-card-label">变化像素</div>
                                                    <div class="stat-card-percent">{{
                                                        totalStats.change_percentage?.toFixed(2) ||
                                                        '0.00' }}%</div>
                                                </div>
                                                <div class="stat-card"
                                                    :class="{ 'hovered': hoveredCard === 'summary-unchanged' }"
                                                    @mouseenter="onCardHover('summary-unchanged')"
                                                    @mouseleave="hoveredCard = ''">
                                                    <div class="stat-card-value">{{
                                                        totalStats.unchanged_pixels?.toLocaleString() ||
                                                        '0' }}</div>
                                                    <div class="stat-card-label">未变化像素</div>
                                                    <div class="stat-card-percent">{{
                                                        totalStats.unchanged_percentage?.toFixed(2) ||
                                                        '0.00' }}%</div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 未变化类别统计 -->
                                        <div v-if="Object.keys(changeStats).length > 0" class="stats-section">
                                            <div class="section-header">
                                                <h4>未变化类别统计</h4>
                                                <span class="section-count">{{ Object.keys(changeStats).length }}
                                                    个类别</span>
                                            </div>
                                            <div class="stats-list-container">
                                                <div v-for="(value, key) in changeStats" :key="key"
                                                    class="stat-item animate__animated"
                                                    @mouseenter="animateItem($event, 'animate__pulse')">
                                                    <div class="stat-item-header">
                                                        <span class="stat-item-label">{{ key }}</span>
                                                        <span class="stat-item-count">{{ value.count?.toLocaleString()
                                                            ||
                                                            value?.toLocaleString() || '0' }}</span>
                                                    </div>
                                                    <div class="stat-item-progress">
                                                        <div class="progress-bar">
                                                            <div class="progress-fill"
                                                                :data-percent="value.percentage !== undefined ?
                                                                    value.percentage :
                                                                    totalStats.valid_pixels > 0 ?
                                                                        ((value.count || value) * 100.0 / totalStats.valid_pixels) : 0"
                                                                :style="{
                                                                    width: `${value.percentage !== undefined ?
                                                                        value.percentage :
                                                                        totalStats.valid_pixels > 0 ?
                                                                            ((value.count || value) * 100.0 / totalStats.valid_pixels) : 0}%`
                                                                }"></div>
                                                        </div>
                                                        <span class="stat-item-percent">
                                                            {{ value.percentage !== undefined ?
                                                                value.percentage.toFixed(2) :
                                                                totalStats.valid_pixels > 0 ?
                                                                    ((value.count || value) * 100.0 /
                                                                        totalStats.valid_pixels).toFixed(2) :
                                                                    '0.00' }}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 变化类型统计 -->
                                        <div v-if="changeTypes.length > 0" class="stats-section">
                                            <div class="section-header">
                                                <h4>变化类型统计</h4>
                                                <span class="section-count">{{ changeTypes.length }} 种类型</span>
                                            </div>
                                            <div class="stats-list-container">
                                                <div v-for="(change, index) in changeTypes" :key="index"
                                                    class="change-type-item animate__animated"
                                                    @mouseenter="animateItem($event, 'animate__headShake')">
                                                    <div class="change-type-header">
                                                        <span class="change-from">{{ change.from_name }}</span>
                                                        <el-icon class="change-arrow animate__animated"
                                                            @mouseenter="animateIcon($event)">
                                                            <Right />
                                                        </el-icon>
                                                        <span class="change-to">{{ change.to_name }}</span>
                                                    </div>
                                                    <div class="change-type-details">
                                                        <div class="change-count">
                                                            <span class="count-label">像素数：</span>
                                                            <span class="count-value">{{ change.count?.toLocaleString()
                                                                || '0'
                                                            }}</span>
                                                        </div>
                                                        <div class="change-progress">
                                                            <div class="progress-bar">
                                                                <div class="progress-fill"
                                                                    :data-percent="change.percentage?.toFixed(2) || '0'"
                                                                    :style="{ width: `${change.percentage?.toFixed(2) || '0'}%` }">
                                                                </div>
                                                            </div>
                                                            <span class="change-percent">{{
                                                                change.percentage?.toFixed(2) || '0.00'
                                                            }}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="empty-stats animate__animated animate__pulse">
                                        <el-icon class="empty-icon">
                                            <DataAnalysis />
                                        </el-icon>
                                        <div>暂无统计数据</div>
                                    </div>
                                </div>
                            </div>

                            <!-- 统计文件下载 -->
                            <div class="download-section" v-if="predictOptions.includes('change_stats')">
                                <h4>统计文件下载</h4>
                                <el-button @click="downloadStatsFile" type="primary" plain :icon="Download"
                                    class="download-button animate__animated" @mouseenter="animateButton($event)">
                                    下载统计文件 (JSON)
                                </el-button>
                            </div>
                        </div>

                        <!-- 右边：变化图像 -->
                        <div class="result-right">
                            <div class="result-section-header">
                                <h3><el-icon>
                                        <Picture />
                                    </el-icon> 变化预览</h3>
                                <el-tag v-if="displayMode" size="small"
                                    :type="displayMode === 'all' ? 'success' : 'warning'">
                                    {{ displayMode === 'all' ? '全类别显示' : '仅变化区域' }}
                                </el-tag>
                            </div>

                            <div class="result-section-content image-section">
                                <div v-if="previewData && predictOptions.includes('change_image')"
                                    class="image-container">
                                    <img :src="previewData" alt="变化结果预览"
                                        class="preview-image animate__animated animate__fadeIn" />
                                    <div class="image-actions">
                                        <el-button @click="openImageDialog" type="primary" :icon="ZoomIn" plain
                                            class="animate__animated" @mouseenter="animateButton($event)">
                                            查看大图
                                        </el-button>
                                    </div>
                                </div>
                                <div v-else class="empty-image animate__animated animate__pulse">
                                    <el-icon class="empty-icon">
                                        <Picture />
                                    </el-icon>
                                    <div>暂无预览图</div>
                                </div>
                            </div>

                            <!-- 变化地图下载 -->
                            <div class="download-section" v-if="predictOptions.includes('change_tif')">
                                <h4>变化地图下载</h4>
                                <el-button @click="downloadTifFile" type="primary" plain :icon="Download"
                                    class="download-button animate__animated" @mouseenter="animateButton($event)">
                                    下载变化地图 (TIFF)
                                </el-button>
                            </div>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <el-button @click="handlePredictPrevious" :icon="Back" class="animate__animated"
                            @mouseenter="animateButton($event)">
                            上一步
                        </el-button>
                        <el-button @click="handlePredictContinue" type="primary" :icon="Refresh"
                            class="animate__animated" @mouseenter="animateButton($event)">
                            继续生产
                        </el-button>
                    </div>
                </div>
            </div>

            <!-- 大图预览对话框 -->
            <el-dialog v-model="imageDialogVisible" title="预览大图" width="90%" :destroy-on-close="true">
                <div class="full-image-container">
                    <img :src="previewData" alt="完整预览" class="full-size-image" @load="onImageLoad" />
                    <div v-if="isImageLoaded" class="zoom-controls">
                        <el-button @click="zoomIn" :icon="ZoomIn" circle size="small" />
                        <el-button @click="zoomOut" :icon="ZoomOut" circle size="small" />
                    </div>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { Check, Picture, Download, Back, Refresh, ZoomIn, ZoomOut, Close, Right, DataAnalysis } from '@element-plus/icons-vue'
import {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElIcon,
    ElCheckbox,
    ElCheckboxGroup,
    ElDialog,
    ElRadioGroup,
    ElRadio,
    ElTag
} from 'element-plus'
import { getLandChangeResult } from '@/api/getData'
// 导入Animate.css
import 'animate.css'

// 状态定义
const predictCurrent = ref(0)
const displayMode = ref('changes_only')
const predictOptions = ref(['change_stats', 'change_image', 'change_tif'])
const predictLoading = ref(false)
const error = ref('')
const imageDialogVisible = ref(false)
const previewData = ref('')
const isImageLoaded = ref(false)
const zoomLevel = ref(1)

// 文件上传相关状态
const earlyFilePath = ref('')
const lateFilePath = ref('')
const configFilePath = ref('')
const earlyFileObject = ref(null)
const lateFileObject = ref(null)
const configFileObject = ref(null)
const earlyFileInput = ref(null)
const lateFileInput = ref(null)
const configFileInput = ref(null)
const focusedInput = ref('')

// 变化统计数据
const changeStats = ref({})
const totalStats = ref({})
const changeTypes = ref([])
const downloadFiles = ref({ stats_file: '', image_file: '', tif_file: '' })

// 新增响应式状态
const hoveredCard = ref('')

// 新增动画方法
const onCardHover = (cardId) => {
    hoveredCard.value = cardId
}

const animateItem = (event, animationClass) => {
    const element = event.currentTarget
    element.classList.remove('animate__animated', 'animate__pulse', 'animate__headShake', 'animate__bounce')
    void element.offsetWidth // 触发重绘
    element.classList.add('animate__animated', animationClass)

    // 动画结束后移除类
    element.addEventListener('animationend', () => {
        element.classList.remove('animate__animated', animationClass)
    }, { once: true })
}

const animateIcon = (event) => {
    const icon = event.currentTarget
    icon.classList.remove('animate__animated', 'animate__swing')
    void icon.offsetWidth
    icon.classList.add('animate__animated', 'animate__swing')

    icon.addEventListener('animationend', () => {
        icon.classList.remove('animate__animated', 'animate__swing')
    }, { once: true })
}

const animateButton = (event) => {
    const button = event.currentTarget
    button.classList.remove('animate__animated', 'animate__rubberBand')
    void button.offsetWidth
    button.classList.add('animate__animated', 'animate__rubberBand')

    button.addEventListener('animationend', () => {
        button.classList.remove('animate__animated', 'animate__rubberBand')
    }, { once: true })
}

// 进度条动画方法
const animateProgressBars = () => {
    setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress-fill')
        progressBars.forEach(bar => {
            const percent = bar.getAttribute('data-percent') || '0'
            bar.style.width = '0%'

            setTimeout(() => {
                bar.style.transition = 'width 1s ease-in-out'
                bar.style.width = `${percent}%`
            }, 100)
        })
    }, 500)
}

// 文件选择和验证
const handleInputFocus = (type) => {
    focusedInput.value = type
}

const handleEarlyBrowseClick = () => {
    if (earlyFileInput.value) earlyFileInput.value.click()
}

const handleLateBrowseClick = () => {
    if (lateFileInput.value) lateFileInput.value.click()
}

const handleConfigBrowseClick = () => {
    if (configFileInput.value) configFileInput.value.click()
}

const handleEarlyFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && beforeUpload(file, 'tif')) {
        earlyFilePath.value = file.name
        earlyFileObject.value = file
        event.target.value = ''
    }
}

const handleLateFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && beforeUpload(file, 'tif')) {
        lateFilePath.value = file.name
        lateFileObject.value = file
        event.target.value = ''
    }
}

const handleConfigFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && beforeUpload(file, 'json')) {
        configFilePath.value = file.name
        configFileObject.value = file
        event.target.value = ''
    }
}

const handleRemoveFile = (type) => {
    if (type === 'early') {
        earlyFilePath.value = ''
        earlyFileObject.value = null
        earlyFileInput.value && (earlyFileInput.value.value = '')
    } else if (type === 'late') {
        lateFilePath.value = ''
        lateFileObject.value = null
        lateFileInput.value && (lateFileInput.value.value = '')
    } else if (type === 'config') {
        configFilePath.value = ''
        configFileObject.value = null
        configFileInput.value && (configFileInput.value.value = '')
    }
}

const handleKeydown = (event, type) => {
    const isDelete = event.key === 'Delete' || event.keyCode === 46
    const isBackspace = event.key === 'Backspace' || event.keyCode === 8
    if (isDelete || isBackspace) {
        event.preventDefault()
        handleRemoveFile(type)
    }
}

function beforeUpload(file, expectedType) {
    if (expectedType === 'tif') {
        const validTypes = ['.tif', '.tiff']
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
        if (!validTypes.includes(fileExt)) {
            message.error(`只能上传 ${validTypes.join(', ')} 格式的文件`)
            return false
        }
    } else if (expectedType === 'json') {
        const validTypes = ['.json']
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
        if (!validTypes.includes(fileExt)) {
            message.error(`只能上传 ${validTypes.join(', ')} 格式的文件`)
            return false
        }
    }

    const isLt100M = file.size / 1024 / 1024 < 1000
    if (!isLt100M) {
        message.error('文件大小不能超过 1000MB')
        return false
    }
    return true
}

// 生产处理
const handlePredict = async () => {
    if (!earlyFileObject.value || !lateFileObject.value) {
        message.error('请上传早期和后期文件')
        return
    }
    if (!earlyFileObject.value.size || !lateFileObject.value.size) {
        message.error('文件内容为空，请重新选择')
        return
    }

    predictLoading.value = true
    error.value = ''

    try {
        const formData = new FormData()
        formData.append('earlyFile', earlyFileObject.value)
        formData.append('lateFile', lateFileObject.value)
        formData.append('DISPLAY_MODE', displayMode.value)

        if (configFileObject.value) {
            formData.append('configFile', configFileObject.value)
        }

        predictOptions.value.forEach(option => {
            formData.append(option, 'True')
        })

        const res = await getLandChangeResult(formData)
        const response = res?.response?.value || res?.value || res

        if (response?.code === 'SUCCESS') {
            message.success('生产完成')
            const body = response.body

            // 解析统计数据
            if (body.stats) {
                // 获取未变化类别统计
                if (body.stats.unchanged_classes) {
                    changeStats.value = body.stats.unchanged_classes;
                } else {
                    changeStats.value = {};
                }

                // 获取总统计信息
                const pixelStats = body.stats.pixel_statistics || {};
                totalStats.value = {
                    total_pixels: pixelStats.total_pixels || 0,
                    valid_pixels: pixelStats.valid_pixels || 0,
                    changed_pixels: pixelStats.changed_pixels || 0,
                    unchanged_pixels: pixelStats.unchanged_pixels || 0,
                    change_percentage: pixelStats.valid_pixels > 0 ?
                        ((pixelStats.changed_pixels || 0) * 100.0 / pixelStats.valid_pixels) : 0,
                    unchanged_percentage: pixelStats.valid_pixels > 0 ?
                        ((pixelStats.unchanged_pixels || 0) * 100.0 / pixelStats.valid_pixels) : 0
                };

                // 获取变化类型统计
                changeTypes.value = body.stats.change_types || [];
            } else {
                // 如果后端直接将统计信息放在顶层，使用这种方式
                changeStats.value = body.unchanged_classes || {};
                totalStats.value = {
                    total_pixels: body.total_pixels || 0,
                    valid_pixels: body.valid_pixels || 0,
                    changed_pixels: body.changed_pixels || 0,
                    unchanged_pixels: body.unchanged_pixels || 0,
                    change_percentage: body.change_percentage || 0,
                    unchanged_percentage: body.unchanged_percentage || 0
                };
                changeTypes.value = body.change_types || [];
            }

            downloadFiles.value = {
                stats_file: body.stats_file?.replace(/\\/g, '/') || '',
                image_file: body.image_file?.replace(/\\/g, '/') || '',
                tif_file: body.tif_file?.replace(/\\/g, '/') || ''
            };

            if (body.image_file) {
                await loadPreviewImage(body.image_file.replace(/\\/g, '/'))
            }
            predictCurrent.value = 1

            // 延迟触发进度条动画
            animateProgressBars()
        } else {
            const msg = response?.msg || '生产失败'
            error.value = msg
            message.error(msg)
        }
    } catch (err) {
        console.error('生产失败:', err)
        error.value = '生产失败: ' + err.message
        message.error('生产失败: ' + err.message)
    } finally {
        predictLoading.value = false
    }
}

const loadPreviewImage = async (imagePath) => {
    if (!imagePath) {
        previewData.value = ''
        message.error('图片路径为空')
        return
    }
    try {
        const timestamp = Date.now()
        const response = await fetch(`/api/proxy/preview?t=${timestamp}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                'Accept': 'image/*'
            },
            body: JSON.stringify({ imagePath })
        })
        if (!response.ok) {
            const errorText = await response.text()
            console.error('预览图请求失败:', response.status, errorText)
            if (errorText.includes('token 已过期')) {
                message.error('token 已过期，请重新登录')
            } else {
                message.error(`加载失败: ${errorText || '未知错误'}`)
            }
            previewData.value = ''
            return
        }
        const contentType = response.headers.get('Content-Type')
        if (!contentType || !contentType.startsWith('image/')) {
            const errorText = await response.text()
            console.error('非图片响应内容:', errorText)
            message.error('返回的内容不是有效图片: ' + (errorText || contentType))
            previewData.value = ''
            return
        }
        const blob = await response.blob()
        if (blob.size === 0) {
            console.error('图片数据为空')
            message.error('图片数据为空')
            previewData.value = ''
            return
        }
        const imageUrl = URL.createObjectURL(blob)
        previewData.value = imageUrl
        isImageLoaded.value = false
        const img = new Image()
        img.src = imageUrl
        img.onload = () => {
            isImageLoaded.value = true
            console.log('图片成功加载')
        }
        img.onerror = () => {
            console.error('图片加载失败')
            previewData.value = ''
            message.error('图片加载失败，无法显示')
            URL.revokeObjectURL(imageUrl)
        }
        return () => URL.revokeObjectURL(imageUrl)
    } catch (error) {
        console.error('加载预览图失败:', error)
        previewData.value = ''
        message.error('无法加载预览图: ' + error.message)
    }
}

const downloadStatsFile = async () => {
    if (!downloadFiles.value.stats_file) {
        message.error('没有可下载的统计文件')
        return
    }
    await downloadFile(downloadFiles.value.stats_file, 'land_change_stats.json')
}

const downloadTifFile = async () => {
    if (!downloadFiles.value.tif_file) {
        message.error('没有可下载的变化地图')
        return
    }
    await downloadFile(downloadFiles.value.tif_file, 'land_change_map.tif')
}

const downloadFile = async (filePath, defaultName) => {
    try {
        const timestamp = Date.now()
        const response = await fetch(`/api/proxy/download?t=${timestamp}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({ filePath, fileName: filePath.split(/[\\/]/).pop() || defaultName })
        })
        if (!response.ok) throw new Error(`下载失败: ${response.status}`)
        const blob = await response.blob()
        if (blob.size < 10) throw new Error('文件大小异常')
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filePath.split(/[\\/]/).pop() || defaultName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        message.success(`下载完成，文件大小: ${(blob.size / 1024).toFixed(2)} KB`)
    } catch (error) {
        console.error('下载失败:', error)
        if (error.message.includes('401')) {
            message.error('token 可能已过期，请重新登录')
        } else {
            message.error('下载失败: ' + error.message)
        }
    }
}

const handlePredictPrevious = () => {
    if (predictCurrent.value > 0) predictCurrent.value -= 1
}

const handlePredictContinue = () => {
    hoveredCard.value = ''
    predictCurrent.value = 0
    earlyFilePath.value = ''
    lateFilePath.value = ''
    configFilePath.value = ''
    earlyFileObject.value = null
    lateFileObject.value = null
    configFileObject.value = null
    changeStats.value = {}
    totalStats.value = {}
    changeTypes.value = []
    downloadFiles.value = { stats_file: '', image_file: '', tif_file: '' }
    previewData.value = ''
    isImageLoaded.value = false
    zoomLevel.value = 1
    displayMode.value = 'changes_only'
}

const openImageDialog = () => {
    imageDialogVisible.value = true
}

const onImageLoad = (event) => {
    const img = event.target
    if (img.naturalWidth > window.innerWidth * 0.9 || img.naturalHeight > window.innerHeight * 0.7) {
        zoomLevel.value = Math.min(window.innerWidth * 0.9 / img.naturalWidth, window.innerHeight * 0.7 / img.naturalHeight)
    }
}

const zoomIn = () => {
    zoomLevel.value = Math.min(zoomLevel.value + 0.1, 2)
    applyZoom()
}

const zoomOut = () => {
    zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.1)
    applyZoom()
}

const applyZoom = () => {
    const img = document.querySelector('.full-size-image')
    if (img) {
        img.style.transform = `scale(${zoomLevel.value})`
        img.style.transformOrigin = '0 0'
    }
}
</script>

<style scoped>
/* 复用 WaterChange.vue 的样式，添加一些新样式 */
.file-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
}

.radio-group {
    display: flex;
    gap: 20px;
}

/* 结果页面布局样式 */
.result-layout {
    display: flex;
    gap: 24px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.result-left,
.result-right {
    flex: 1;
    min-width: 300px;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    height: 680px;
    /* 固定高度 */
}

.result-left {
    flex: 1;
    min-width: 300px;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    height: 680px;
    /* 保持固定高度 */
    background: #f8f9fa;
    border-radius: 12px;
    overflow: hidden;
}

/* 统计内容区域 - 这是主要的滚动区域 */
.result-section-content.stats-content {
    flex: 1;
    /* 占据所有可用空间 */
    padding: 0;
    /* 移除内边距，让内容区域更大 */
    overflow-y: auto;
    /* 添加垂直滚动 */
    display: block;
    /* 改为块级显示 */
    min-height: 0;
    /* 重要：允许滚动 */
}


.result-right {
    background: #f8f9fa;
    border-radius: 12px;
    overflow: hidden;
}

.result-section-header {
    background: white;
    padding: 18px 24px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    /* 防止被压缩 */
}

.result-section-header h3 {
    margin: 0;
    color: #303133;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 左侧统计区域专用样式 */
.stats-section-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    /* 添加垂直滚动 */
    display: flex;
    flex-direction: column;
    min-height: 0;
    /* 重要：允许内部滚动 */
}

/* 在 .stats-section-content 后面添加以下样式： */
.stats-scroll-container {
    flex: 1;
    overflow-y: auto;
    margin: -24px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

/* 同时修改 .stats-main-content 的样式： */
.stats-main-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: min-content;
    /* 确保内容可以扩展 */
}

/* 统计卡片样式 */
.stat-summary-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    flex-shrink: 0;
    /* 防止被压缩 */
}

.stat-summary-title {
    margin: 0 0 16px 0;
    color: #606266;
    font-size: 14px;
    font-weight: 600;
}

.stat-summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.stat-card {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 6px;
    text-align: center;
    position: relative;
    transition: all 0.3s;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card-changed {
    background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
    border: 1px solid #91d5ff;
}

.stat-card-value {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 4px;
}

.stat-card-label {
    font-size: 12px;
    color: #909399;
}

.stat-card-percent {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 11px;
    color: #409eff;
    background: rgba(64, 158, 255, 0.1);
    padding: 2px 6px;
    border-radius: 10px;
}

/* 统计区域样式 */
.stats-section {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    /* 防止被压缩 */
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-shrink: 0;
    /* 防止被压缩 */
}

.section-header h4 {
    margin: 0;
    color: #606266;
    font-size: 14px;
    font-weight: 600;
}

.section-count {
    font-size: 12px;
    color: #909399;
    background: #f0f2f5;
    padding: 2px 8px;
    border-radius: 10px;
}

.stats-list-container {
    background: white;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    padding: 16px;
    max-height: 300px;
    /* 限制列表最大高度，防止过长 */
    overflow-y: auto;
    /* 列表内部滚动 */
}

/* 统计项样式 */
.stat-item {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}

.stat-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.stat-item-label {
    font-size: 13px;
    color: #303133;
    font-weight: 500;
}

.stat-item-count {
    font-size: 13px;
    color: #409eff;
    font-weight: 600;
}

.stat-item-progress {
    display: flex;
    align-items: center;
    gap: 12px;
}

.progress-bar {
    flex: 1;
    height: 6px;
    background: #f0f2f5;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #409eff, #79bbff);
    border-radius: 3px;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    /* 平滑的动画曲线 */
}

.stat-item-percent {
    font-size: 12px;
    color: #909399;
    min-width: 40px;
}

/* 变化类型样式 */
.change-type-item {
    background: white;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    margin-bottom: 12px;
    transition: all 0.3s;
}

.change-type-item:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.change-type-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 13px;
}

.change-from {
    color: #f56c6c;
    font-weight: 600;
}

.change-to {
    color: #67c23a;
    font-weight: 600;
}

.change-arrow {
    color: #909399;
    font-size: 12px;
}

.change-type-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.change-count {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
}

.count-label {
    color: #909399;
}

.count-value {
    color: #303133;
    font-weight: 600;
}

.change-progress {
    display: flex;
    align-items: center;
    gap: 12px;
}

.change-percent {
    font-size: 12px;
    color: #409eff;
    font-weight: 600;
    min-width: 40px;
}

/* 右侧图片区域样式 */
.result-section-content {
    flex: 1;
    padding: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.image-section {
    display: flex;
    flex-direction: column;
}

.image-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.preview-image {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    object-fit: contain;
}

.image-actions {
    margin-top: 20px;
}

/* 下载区域样式 */
.download-section {
    background: white;
    padding: 20px 24px;
    border-top: 1px solid #e4e7ed;
    flex-shrink: 0;
    /* 防止被压缩 */
}

.download-section h4 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
}

.download-button {
    width: 100%;
}

/* 空状态样式 */
.empty-image {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    padding: 40px 20px;
}

/* 修改空状态样式： */
.empty-stats {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    min-height: 300px;
    /* 确保空状态有一定高度 */
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: #dcdfe6;
}

/* 操作按钮样式 */
.action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e4e7ed;
}

/* 大图预览样式 */
.full-image-container {
    width: 100%;
    height: 70vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto;
    position: relative;
}

.full-size-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.2s;
}

.zoom-controls {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    gap: 5px;
}

/* 卡片悬停效果 */
.stat-card.hovered {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    z-index: 10;
}

/* 自定义滚动条样式 */
.stats-section-content::-webkit-scrollbar,
.stats-list-container::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.stats-section-content::-webkit-scrollbar-track,
.stats-list-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.stats-section-content::-webkit-scrollbar-thumb,
.stats-list-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
    transition: background 0.3s;
}

.stats-section-content::-webkit-scrollbar-thumb:hover,
.stats-list-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* 统计项悬停效果 */
.stat-item {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.3s ease;
    cursor: pointer;
}

.stat-item:hover {
    transform: translateX(8px);
    border-bottom-color: #409eff;
    background: linear-gradient(90deg, rgba(64, 158, 255, 0.05) 0%, transparent 100%);
    padding-left: 8px;
    padding-right: 8px;
    margin-left: -8px;
    margin-right: -8px;
    border-radius: 6px;
}

.change-type-item:hover {
    transform: translateY(-3px) scale(1.02);
    border-color: #409eff;
    box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
}

/* 按钮悬停效果 */
.download-button:hover,
.image-actions .el-button:hover,
.action-buttons .el-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 992px) {
    .result-layout {
        flex-direction: column;
        gap: 20px;
    }

    .result-left,
    .result-right {
        max-width: 100%;
        height: auto;
        min-height: 400px;
    }

    .stat-summary-grid {
        grid-template-columns: 1fr;
    }

    /* 移动端调整滚动区域 */
    .result-section-content.stats-content {
        overflow-y: visible;
    }

    .stats-list-container {
        max-height: 250px;
    }
}

/* 保留原有样式 */
.file-status {
    display: flex;
    flex-direction: column;
    gap: 0px;
    margin-left: 0px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.feature-container {
    margin: 0 auto;
    max-width: 1200px;
}

.steps-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 30px auto;
    width: 80%;
}

.custom-steps {
    display: flex;
    width: 70%;
    max-width: 600px;
    justify-content: space-between;
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
}

.step-item:not(:last-child):after {
    content: '';
    position: absolute;
    top: 20px;
    left: 50%;
    width: 100%;
    height: 2px;
    background-color: #e0e0e0;
    z-index: 0;
}

.step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-bottom: 10px;
    position: relative;
    z-index: 1;
    border: 2px solid #e0e0e0;
    color: #999;
}

.step-title {
    font-size: 14px;
    color: #999;
    text-align: center;
}

.step-item.active .step-number {
    background-color: #1890ff;
    border-color: #1890ff;
    color: white;
}

.step-item.active .step-title {
    color: #1890ff;
    font-weight: 500;
}

.form-container {
    margin: 50px;
    width: 100%;
    margin-left: 280px;
}

.button-group {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    margin-right: 550px;
    gap: 20px;
}

.submit-button {
    padding: 10px 25px;
    background-color: #1890ff;
    color: white;
    border-radius: 4px;
    font-weight: 500;
}

.submit-button:hover {
    background-color: #40a9ff;
}

.result-container {
    margin: 20px auto;
    max-width: 1200px;
}

.result-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

@media (max-width: 992px) {
    .form-container {
        width: 95%;
    }

    .custom-steps {
        max-width: 90%;
    }

    .full-image-container {
        height: 50vh;
    }
}
</style>