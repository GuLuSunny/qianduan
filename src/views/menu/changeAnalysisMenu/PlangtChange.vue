<template>
    <div>
        <!-- 植被覆盖度变化检测功能 -->
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
                        <div class="step-title">检测结果</div>
                    </div>
                </div>
            </div>

            <!-- 选择文件和参数页面 -->
            <div class="form-container" v-if="predictCurrent === 0">
                <el-form :model="form" label-width="140px">
                    <div class="form-horizontal-group">
                        <div class="form-column-full">
                            <!-- 早期FVC文件上传 -->
                            <el-form-item label="早期FVC文件：" required>
                                <div style="display: flex; align-items: center; gap: 10px; width: 400px;">
                                    <el-input v-model="earlyFilePath" placeholder="请选择早期FVC结果文件" readonly
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
                                <div class="file-hint">请选择早期FVC TIFF文件</div>
                            </el-form-item>

                            <!-- 后期FVC文件上传 -->
                            <el-form-item label="后期FVC文件：" required>
                                <div style="display: flex; align-items: center; gap: 10px; width: 400px;">
                                    <el-input v-model="lateFilePath" placeholder="请选择后期FVC结果文件" readonly
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
                                <div class="file-hint">请选择后期FVC TIFF文件</div>
                            </el-form-item>

                            <!-- 显示模式选择 -->
                            <el-form-item label="显示模式：" required>
                                <el-radio-group v-model="displayMode" class="radio-group">
                                    <el-radio label="changes_only">仅显示变化区域</el-radio>
                                    <el-radio label="all">显示全部类别</el-radio>
                                </el-radio-group>
                            </el-form-item>

                            <!-- 阈值配置（可选） -->
                            <el-form-item label="阈值配置：">
                                <div style="display: flex; flex-direction: column; gap: 10px; width: 400px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="min-width: 160px;">显著退化阈值：</span>
                                        <el-input-number v-model="thresholds.significant_decrease_threshold" :min="-1"
                                            :max="0" :step="0.05" :precision="2" size="small" />
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="min-width: 160px;">轻微退化阈值：</span>
                                        <el-input-number v-model="thresholds.slight_decrease_threshold" :min="-1"
                                            :max="0" :step="0.05" :precision="2" size="small" />
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="min-width: 160px;">轻微改善阈值：</span>
                                        <el-input-number v-model="thresholds.slight_increase_threshold" :min="0"
                                            :max="1" :step="0.05" :precision="2" size="small" />
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="min-width: 160px;">显著改善阈值：</span>
                                        <el-input-number v-model="thresholds.significant_increase_threshold" :min="0"
                                            :max="1" :step="0.05" :precision="2" size="small" />
                                    </div>
                                </div>
                                <div class="file-hint">FVC变化阈值配置（可选，使用默认值可不设置）</div>
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
                                </div>
                            </el-form-item>

                            <!-- 输出选项 -->
                            <el-form-item label="输出选项">
                                <el-checkbox-group v-model="outputOptions">
                                    <el-checkbox label="change_stats">变化统计</el-checkbox>
                                    <el-checkbox label="change_image">变化预览图</el-checkbox>
                                    <el-checkbox label="classified_tif">分类结果下载</el-checkbox>
                                    <el-checkbox label="raw_tif">原始变化数据下载</el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>

                            <div class="button-group">
                                <el-button @click="handleChangeDetection" class="submit-button" type="primary"
                                    :loading="detectionLoading" :disabled="!earlyFileObject || !lateFileObject">
                                    {{ detectionLoading ? '处理中...' : '开始检测' }}
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-form>
            </div>

            <!-- 检测结果页面 -->
            <div class="result-container" v-if="predictCurrent === 1">
                <div class="result-content">
                    <!-- 结果内容区域 - 左右布局 -->
                    <div class="result-layout">
                        <!-- 左边：变化统计 -->
                        <div class="result-left">
                            <div class="result-section-header">
                                <h3><el-icon>
                                        <DataAnalysis />
                                    </el-icon> FVC变化统计</h3>
                            </div>

                            <!-- 主要内容区域 - 添加滚动 -->
                            <div class="result-section-content stats-section-content">
                                <div class="stats-scroll-container">
                                    <div v-if="Object.keys(changeStats).length > 0 || changeCategories.length > 0"
                                        class="stats-main-content">
                                        <!-- 总体统计卡片 -->
                                        <div class="stat-summary-card">
                                            <h4 class="stat-summary-title">总体统计</h4>
                                            <div class="stat-summary-grid">
                                                <div class="stat-card">
                                                    <div class="stat-card-value">{{ totalStats.total_pixels?.toLocaleString() || '0' }}</div>
                                                    <div class="stat-card-label">总像素数</div>
                                                </div>
                                                <div class="stat-card">
                                                    <div class="stat-card-value">{{ totalStats.valid_pixels?.toLocaleString() || '0' }}</div>
                                                    <div class="stat-card-label">有效像素</div>
                                                </div>
                                                <div class="stat-card stat-card-changed">
                                                    <div class="stat-card-value">{{ totalStats.changed_pixels?.toLocaleString() || '0' }}</div>
                                                    <div class="stat-card-label">变化像素</div>
                                                    <div class="stat-card-percent">{{ totalStats.change_percentage?.toFixed(2) || '0.00' }}%</div>
                                                </div>
                                                <div class="stat-card">
                                                    <div class="stat-card-value">{{ totalStats.unchanged_pixels?.toLocaleString() || '0' }}</div>
                                                    <div class="stat-card-label">未变化像素</div>
                                                    <div class="stat-card-percent">{{ totalStats.unchanged_percentage?.toFixed(2) || '0.00' }}%</div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- FVC变化类别统计 -->
                                        <div v-if="changeCategories.length > 0" class="stats-section">
                                            <div class="section-header">
                                                <h4>FVC变化类别统计</h4>
                                                <span class="section-count">{{ changeCategories.length }} 个类别</span>
                                            </div>
                                            <div class="stats-list-container">
                                                <div v-for="(category, index) in changeCategories" :key="index" 
                                                     class="change-category-item animate__animated"
                                                     @mouseenter="animateItem($event, 'animate__pulse')">
                                                    <div class="change-category-header">
                                                        <div class="category-color-indicator" 
                                                             :style="{ backgroundColor: getCategoryColor(category.name) }"></div>
                                                        <span class="category-name">{{ category.name }}</span>
                                                        <span class="category-count">{{ category.count?.toLocaleString() || '0' }}</span>
                                                    </div>
                                                    <div class="change-category-progress">
                                                        <div class="progress-bar">
                                                            <div class="progress-fill" 
                                                                 :style="{ 
                                                                     width: `${category.percentage || 0}%`,
                                                                     background: `linear-gradient(90deg, ${getCategoryColor(category.name)}80, ${getCategoryColor(category.name)})`
                                                                 }"></div>
                                                        </div>
                                                        <span class="category-percent">{{ category.percentage?.toFixed(2) || '0.00' }}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 变化统计信息 -->
                                        <div v-if="changeStatistics.mean_change !== undefined" class="stats-section">
                                            <div class="section-header">
                                                <h4>变化统计信息</h4>
                                            </div>
                                            <div class="stats-info-container">
                                                <div class="stat-info-item">
                                                    <span class="stat-info-label">平均变化：</span>
                                                    <span class="stat-info-value" 
                                                          :class="{ 'positive': changeStatistics.mean_change > 0, 'negative': changeStatistics.mean_change < 0 }">
                                                        {{ changeStatistics.mean_change?.toFixed(4) || '0.0000' }}
                                                    </span>
                                                </div>
                                                <div class="stat-info-item">
                                                    <span class="stat-info-label">标准差：</span>
                                                    <span class="stat-info-value">{{ changeStatistics.std_change?.toFixed(4) || '0.0000' }}</span>
                                                </div>
                                                <div class="stat-info-item">
                                                    <span class="stat-info-label">最小变化：</span>
                                                    <span class="stat-info-value">{{ changeStatistics.min_change?.toFixed(4) || '0.0000' }}</span>
                                                </div>
                                                <div class="stat-info-item">
                                                    <span class="stat-info-label">最大变化：</span>
                                                    <span class="stat-info-value">{{ changeStatistics.max_change?.toFixed(4) || '0.0000' }}</span>
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
                        </div>

                        <!-- 右边：变化图像和下载 -->
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
                                <div v-if="previewData && outputOptions.includes('change_image')" class="image-container">
                                    <img :src="previewData" alt="FVC变化预览" 
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

                            <!-- 下载区域 -->
                            <div class="download-container">
                                <!-- 统计文件下载 -->
                                <div class="download-section" v-if="outputOptions.includes('change_stats')">
                                    <h4><el-icon><Download /></el-icon> 统计文件下载</h4>
                                    <el-button @click="downloadStatsFile" type="primary" plain 
                                               class="download-button animate__animated" @mouseenter="animateButton($event)">
                                        下载统计文件 (JSON)
                                    </el-button>
                                </div>

                                <!-- 分类结果下载 -->
                                <div class="download-section" v-if="outputOptions.includes('classified_tif')">
                                    <h4><el-icon><Download /></el-icon> 分类结果下载</h4>
                                    <el-button @click="downloadClassifiedTif" type="primary" plain 
                                               class="download-button animate__animated" @mouseenter="animateButton($event)">
                                        下载分类结果 (TIFF)
                                    </el-button>
                                </div>

                                <!-- 原始变化数据下载 -->
                                <div class="download-section" v-if="outputOptions.includes('raw_tif')">
                                    <h4><el-icon><Download /></el-icon> 原始变化数据下载</h4>
                                    <el-button @click="downloadRawTif" type="primary" plain 
                                               class="download-button animate__animated" @mouseenter="animateButton($event)">
                                        下载原始变化数据 (TIFF)
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <el-button @click="handleDetectionPrevious" :icon="Back" class="animate__animated" 
                                   @mouseenter="animateButton($event)">
                            上一步
                        </el-button>
                        <el-button @click="handleDetectionContinue" type="primary" :icon="Refresh"
                                   class="animate__animated" @mouseenter="animateButton($event)">
                            继续检测
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
import { ref, watch, onMounted } from 'vue'
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
    ElTag,
    ElInputNumber
} from 'element-plus'
import { getPlantChangeResult } from '@/api/getData'
import 'animate.css'
// 状态定义
const predictCurrent = ref(0)
const displayMode = ref('changes_only')
const outputOptions = ref(['change_stats', 'change_image', 'classified_tif', 'raw_tif'])
const detectionLoading = ref(false)
const error = ref('')
const imageDialogVisible = ref(false)
const previewData = ref('')
const isImageLoaded = ref(false)
const zoomLevel = ref(1)

// 阈值配置
const thresholds = ref({
    significant_decrease_threshold: -0.3,
    slight_decrease_threshold: -0.1,
    slight_increase_threshold: 0.1,
    significant_increase_threshold: 0.3,
    fvc_min_value: 0.0,
    fvc_max_value: 1.0
})

// 文件上传相关状态
const earlyFilePath = ref('')
const lateFilePath = ref('')
const earlyFileObject = ref(null)
const lateFileObject = ref(null)
const earlyFileInput = ref(null)
const lateFileInput = ref(null)
const focusedInput = ref('')

// 变化统计数据
const changeStats = ref({})
const totalStats = ref({})
const changeCategories = ref([])
const changeStatistics = ref({})
const downloadFiles = ref({
    stats_file: '',
    image_file: '',
    classified_tif_file: '',
    raw_tif_file: ''
})

// 类别颜色映射
const categoryColors = {
    '无效区域': '#909399',
    '显著退化': '#8B0000',
    '轻微退化': '#D2B48C',
    '基本不变': '#FFFF99',
    '轻微改善': '#90EE90',
    '显著改善': '#006400'
}

// 获取类别颜色
const getCategoryColor = (categoryName) => {
    return categoryColors[categoryName] || '#909399'
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

const handleRemoveFile = (type) => {
    if (type === 'early') {
        earlyFilePath.value = ''
        earlyFileObject.value = null
        earlyFileInput.value && (earlyFileInput.value.value = '')
    } else if (type === 'late') {
        lateFilePath.value = ''
        lateFileObject.value = null
        lateFileInput.value && (lateFileInput.value.value = '')
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
    }

    const isLt100M = file.size / 1024 / 1024 < 1000
    if (!isLt100M) {
        message.error('文件大小不能超过 1000MB')
        return false
    }
    return true
}

//变化检测处理
const handleChangeDetection = async () => {
    if (!earlyFileObject.value || !lateFileObject.value) {
        message.error('请上传早期和后期FVC文件')
        return
    }

    detectionLoading.value = true
    error.value = ''

    try {
        const formData = new FormData()
        formData.append('earlyFile', earlyFileObject.value)
        formData.append('lateFile', lateFileObject.value)
        formData.append('DISPLAY_MODE', displayMode.value)

        // 添加阈值配置
        formData.append('CHANGE_THRESHOLDS', JSON.stringify(thresholds.value))

        outputOptions.value.forEach(option => {
            formData.append(option, 'True')
        })

        const res = await getPlantChangeResult(formData)
        const response = res?.response?.value || res?.value || res

        if (response?.code === 'SUCCESS') {
            message.success('植被覆盖度变化检测完成')
            const body = response.body

            // 解析统计数据
            if (body.stats) {
                // 获取总统计信息
                const pixelStats = body.stats.pixel_statistics || {}
                totalStats.value = {
                    total_pixels: pixelStats.total_pixels || 0,
                    valid_pixels: pixelStats.valid_pixels || 0,
                    changed_pixels: pixelStats.changed_pixels || 0,
                    unchanged_pixels: pixelStats.unchanged_pixels || 0,
                    change_percentage: pixelStats.valid_pixels > 0 ?
                        ((pixelStats.changed_pixels || 0) * 100.0 / pixelStats.valid_pixels) : 0,
                    unchanged_percentage: pixelStats.valid_pixels > 0 ?
                        ((pixelStats.unchanged_pixels || 0) * 100.0 / pixelStats.valid_pixels) : 0
                }

                // 获取FVC变化类别统计 - 修正这里
                const classStats = body.stats.class_statistics || {}
                const classPercentages = body.stats.class_percentages || {}

                // 构建变化类别数组
                changeCategories.value = Object.keys(classStats).map(name => {
                    // 从class_percentages中获取百分比，如果没有则计算
                    let percentage = 0
                    if (classPercentages[name] && classPercentages[name].endsWith('%')) {
                        percentage = parseFloat(classPercentages[name])
                    } else if (totalStats.value.valid_pixels > 0) {
                        percentage = (classStats[name] * 100.0 / totalStats.value.valid_pixels)
                    }

                    return {
                        name,
                        count: classStats[name],
                        percentage: percentage
                    }
                }).filter(item => item.name !== '无效区域')  // 过滤掉无效区域

                // 获取变化统计信息
                changeStatistics.value = body.stats.change_statistics || {}

                // 将class_stats存储在changeStats中（如果需要）
                changeStats.value = classStats

            } else {
                // 如果后端直接将统计信息放在顶层
                totalStats.value = {
                    total_pixels: body.total_pixels || 0,
                    valid_pixels: body.valid_pixels || 0,
                    changed_pixels: body.changed_pixels || 0,
                    unchanged_pixels: body.unchanged_pixels || 0,
                    change_percentage: body.change_percentage ||
                        (body.valid_pixels > 0 ? (body.changed_pixels * 100.0 / body.valid_pixels) : 0),
                    unchanged_percentage: body.unchanged_percentage ||
                        (body.valid_pixels > 0 ? (body.unchanged_pixels * 100.0 / body.valid_pixels) : 0)
                };

                // 解析类别统计 - 修正这里
                if (body.class_statistics) {
                    // 构建变化类别数组
                    changeCategories.value = Object.entries(body.class_statistics)
                        .filter(([name]) => name !== '无效区域')
                        .map(([name, count]) => {
                            let percentage = 0
                            if (body.class_percentages && body.class_percentages[name]) {
                                const percentStr = body.class_percentages[name]
                                if (percentStr.endsWith('%')) {
                                    percentage = parseFloat(percentStr)
                                }
                            } else if (totalStats.value.valid_pixels > 0) {
                                percentage = (count * 100.0 / totalStats.value.valid_pixels)
                            }

                            return {
                                name,
                                count,
                                percentage: percentage
                            }
                        })

                    // 存储在changeStats中
                    changeStats.value = body.class_statistics
                }

                changeStatistics.value = body.change_statistics || {}
            }

            downloadFiles.value = {
                stats_file: body.stats_file?.replace(/\\/g, '/') || '',
                image_file: body.image_file?.replace(/\\/g, '/') || '',
                classified_tif_file: body.classified_tif_file?.replace(/\\/g, '/') || '',
                raw_tif_file: body.raw_tif_file?.replace(/\\/g, '/') || ''
            };

            if (body.image_file) {
                await loadPreviewImage(body.image_file.replace(/\\/g, '/'))
            }
            predictCurrent.value = 1
        } else {
            const msg = response?.msg || '检测失败'
            error.value = msg
            message.error(msg)
        }
    } catch (err) {
        console.error('检测失败:', err)
        error.value = '检测失败: ' + err.message
        message.error('检测失败: ' + err.message)
    } finally {
        detectionLoading.value = false
    }
}


// 添加动画函数
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

const animateButton = (event) => {
    const button = event.currentTarget
    button.classList.remove('animate__animated', 'animate__rubberBand')
    void button.offsetWidth
    button.classList.add('animate__animated', 'animate__rubberBand')

    button.addEventListener('animationend', () => {
        button.classList.remove('animate__animated', 'animate__rubberBand')
    }, { once: true })
}

// 可选：添加图标动画函数
const animateIcon = (event) => {
    const icon = event.currentTarget
    icon.classList.remove('animate__animated', 'animate__swing')
    void icon.offsetWidth
    icon.classList.add('animate__animated', 'animate__swing')

    icon.addEventListener('animationend', () => {
        icon.classList.remove('animate__animated', 'animate__swing')
    }, { once: true })
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
    await downloadFile(downloadFiles.value.stats_file, 'plant_change_stats.json')
}

const downloadClassifiedTif = async () => {
    if (!downloadFiles.value.classified_tif_file) {
        message.error('没有可下载的分类结果')
        return
    }
    await downloadFile(downloadFiles.value.classified_tif_file, 'plant_change_classified.tif')
}

const downloadRawTif = async () => {
    if (!downloadFiles.value.raw_tif_file) {
        message.error('没有可下载的原始变化数据')
        return
    }
    await downloadFile(downloadFiles.value.raw_tif_file, 'plant_change_raw.tif')
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

const handleDetectionPrevious = () => {
    if (predictCurrent.value > 0) predictCurrent.value -= 1
}

const handleDetectionContinue = () => {
    predictCurrent.value = 0
    earlyFilePath.value = ''
    lateFilePath.value = ''
    earlyFileObject.value = null
    lateFileObject.value = null
    changeStats.value = {}
    totalStats.value = {}
    changeCategories.value = []
    changeStatistics.value = {}
    downloadFiles.value = {
        stats_file: '',
        image_file: '',
        classified_tif_file: '',
        raw_tif_file: ''
    }
    previewData.value = ''
    isImageLoaded.value = false
    zoomLevel.value = 1
    displayMode.value = 'changes_only'
    // 重置阈值为默认值
    thresholds.value = {
        significant_decrease_threshold: -0.3,
        slight_decrease_threshold: -0.1,
        slight_increase_threshold: 0.1,
        significant_increase_threshold: 0.3,
        fvc_min_value: 0.0,
        fvc_max_value: 1.0
    }
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
/* 复用LandChange.vue的样式，添加个性化修改 */
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
    height: 780px;
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
}

.result-section-header h3 {
    margin: 0;
    color: #303133;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 左侧统计区域样式 */
.stats-section-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.stats-scroll-container {
    flex: 1;
    overflow-y: auto;
    margin: -24px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.stats-main-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: min-content;
}

/* 统计卡片样式 - 个性化调整 */
.stat-summary-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-summary-title {
    margin: 0 0 16px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
}

.stat-summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.stat-card {
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
    padding: 16px;
    border-radius: 6px;
    text-align: center;
    position: relative;
    transition: all 0.3s;
    border: 1px solid #dcdfe6;
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
    color: #606266;
    font-weight: 500;
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

/* FVC变化类别样式 */
.stats-section {
    display: flex;
    flex-direction: column;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.section-header h4 {
    margin: 0;
    color: #303133;
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
    max-height: 250px;
    overflow-y: auto;
}

.change-category-item {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.3s;
}

.change-category-item:hover {
    transform: translateX(5px);
    background: rgba(0, 0, 0, 0.02);
    border-radius: 6px;
    padding: 8px 12px;
    margin: 0 -8px 8px -8px;
}

.change-category-item:last-child {
    margin-bottom: 0;
    border-bottom: none;
}

.change-category-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.category-color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.category-name {
    flex: 1;
    font-size: 13px;
    color: #303133;
    font-weight: 500;
}

.category-count {
    font-size: 13px;
    color: #409eff;
    font-weight: 600;
}

.change-category-progress {
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
    border-radius: 3px;
    transition: width 1s ease-in-out;
}

.category-percent {
    font-size: 12px;
    color: #909399;
    min-width: 40px;
}

/* 统计信息样式 */
.stats-info-container {
    background: white;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    padding: 16px;
}

.stat-info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.stat-info-item:last-child {
    border-bottom: none;
}

.stat-info-label {
    font-size: 13px;
    color: #606266;
}

.stat-info-value {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
}

.stat-info-value.positive {
    color: #67c23a;
}

.stat-info-value.negative {
    color: #f56c6c;
}

/* 右侧图片区域样式 */
.result-section-content.image-section {
    flex: 1;
    padding: 24px;
    overflow: hidden;
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
    max-height: 300px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    object-fit: contain;
}

.image-actions {
    margin-top: 20px;
}

/* 下载容器样式 */
.download-container {
    background: white;
    padding: 0;
    border-top: 1px solid #e4e7ed;
    flex-shrink: 0;
}

.download-section {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
}

.download-section:last-child {
    border-bottom: none;
}

.download-section h4 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.download-button {
    width: 100%;
    background: linear-gradient(135deg, #f6f8ff 0%, #e8f4ff 100%);
    border: 1px solid #d9ecff;
    color: #409eff;
    font-weight: 500;
}

.download-button:hover {
    background: linear-gradient(135deg, #e8f4ff 0%, #d9ecff 100%);
    border-color: #409eff;
    color: #409eff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

/* 空状态样式 */
.empty-image,
.empty-stats {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    min-height: 300px;
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
    width: 100%;
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

/* 动画效果 */
.animate__animated {
    animation-duration: 0.5s;
}

/* 自定义滚动条 */
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

    .stats-list-container {
        max-height: 200px;
    }
    
    .full-image-container {
        height: 50vh;
    }
}

/* 复用原有基础样式 */
.file-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
}

.radio-group {
    display: flex;
    gap: 20px;
}

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