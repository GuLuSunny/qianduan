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
                <div class="form-center-wrapper">
                    <el-form :model="form" label-width="auto" class="center-form">
                        <div class="form-horizontal-group">
                            <div class="form-column-full">
                                <!-- 早期FVC文件上传 -->
                                <el-form-item label="早期FVC文件：" required class="compact-form-item">
                                    <div class="form-item-center-wrapper">
                                        <div class="file-input-wrapper center-content">
                                            <el-input v-model="earlyFilePath" placeholder="请选择早期FVC结果文件" readonly
                                                clearable @clear="handleRemoveFile('early')"
                                                @keydown.delete="handleKeydown($event, 'early')"
                                                @focus="handleInputFocus('early')">
                                                <template #append>
                                                    <el-button @click="handleEarlyBrowseClick" class="browse-button">
                                                        浏览
                                                    </el-button>
                                                </template>
                                            </el-input>
                                            <input type="file" ref="earlyFileInput" @change="handleEarlyFileSelect"
                                                accept=".tif,.tiff" class="file-input-hidden" />
                                        </div>
                                        <div class="file-hint">请选择早期FVC TIFF文件</div>
                                    </div>
                                </el-form-item>

                                <!-- 后期FVC文件上传 -->
                                <el-form-item label="后期FVC文件：" required class="compact-form-item">
                                    <div class="form-item-center-wrapper">
                                        <div class="file-input-wrapper center-content">
                                            <el-input v-model="lateFilePath" placeholder="请选择后期FVC结果文件" readonly
                                                clearable @clear="handleRemoveFile('late')"
                                                @keydown.delete="handleKeydown($event, 'late')"
                                                @focus="handleInputFocus('late')">
                                                <template #append>
                                                    <el-button @click="handleLateBrowseClick" class="browse-button">
                                                        浏览
                                                    </el-button>
                                                </template>
                                            </el-input>
                                            <input type="file" ref="lateFileInput" @change="handleLateFileSelect"
                                                accept=".tif,.tiff" class="file-input-hidden" />
                                        </div>
                                        <div class="file-hint">请选择后期FVC TIFF文件</div>
                                    </div>
                                </el-form-item>

                                <!-- 显示模式选择 -->
                                <el-form-item label="显示模式：" required class="compact-form-item">
                                    <div class="form-item-center-wrapper">
                                        <el-radio-group v-model="displayMode" class="radio-group-compact">
                                            <el-radio label="changes_only">仅变化区域</el-radio>
                                            <el-radio label="all">显示全部类别</el-radio>
                                        </el-radio-group>
                                    </div>
                                </el-form-item>

                                <!-- 阈值配置（可选） -->
                                <el-form-item label="阈值配置：" class="compact-form-item">
                                    <div class="form-item-center-wrapper">
                                        <div class="thresholds-grid-compact">
                                            <div class="threshold-item-compact">
                                                <span class="threshold-label-compact">显著退化：</span>
                                                <el-input-number v-model="thresholds.significant_decrease_threshold" :min="-1"
                                                    :max="0" :step="0.05" :precision="2" :controls="false" />
                                            </div>
                                            <div class="threshold-item-compact">
                                                <span class="threshold-label-compact">轻微退化：</span>
                                                <el-input-number v-model="thresholds.slight_decrease_threshold" :min="-1"
                                                    :max="0" :step="0.05" :precision="2" :controls="false" />
                                            </div>
                                            <div class="threshold-item-compact">
                                                <span class="threshold-label-compact">轻微改善：</span>
                                                <el-input-number v-model="thresholds.slight_increase_threshold" :min="0"
                                                    :max="1" :step="0.05" :precision="2" :controls="false" />
                                            </div>
                                            <div class="threshold-item-compact">
                                                <span class="threshold-label-compact">显著改善：</span>
                                                <el-input-number v-model="thresholds.significant_increase_threshold" :min="0"
                                                    :max="1" :step="0.05" :precision="2" :controls="false" />
                                            </div>
                                        </div>
                                        <div class="file-hint-compact">阈值配置（可选，使用默认值可不设置）</div>
                                    </div>
                                </el-form-item>

                                <!-- 文件状态提示 -->
                                <el-form-item label="文件状态" class="compact-form-item">
                                    <div class="form-item-center-wrapper">
                                        <div class="file-status-compact">
                                            <div v-if="earlyFileObject" class="status-item-compact">
                                                <el-icon color="#67C23A">
                                                    <Check />
                                                </el-icon>
                                                <span class="status-text-compact">早期: {{ getShortFileName(earlyFilePath) }} ({{ (earlyFileObject.size / 1024 / 1024).toFixed(1) }}M)</span>
                                            </div>
                                            <div v-else class="status-item-compact">
                                                <el-icon color="#F56C6C">
                                                    <Close />
                                                </el-icon>
                                                <span class="status-text-compact">未选择早期文件</span>
                                            </div>
                                            <div v-if="lateFileObject" class="status-item-compact">
                                                <el-icon color="#67C23A">
                                                    <Check />
                                                </el-icon>
                                                <span class="status-text-compact">后期: {{ getShortFileName(lateFilePath) }} ({{ (lateFileObject.size / 1024 / 1024).toFixed(1) }}M)</span>
                                            </div>
                                            <div v-else class="status-item-compact">
                                                <el-icon color="#F56C6C">
                                                    <Close />
                                                </el-icon>
                                                <span class="status-text-compact">未选择后期文件</span>
                                            </div>
                                        </div>
                                    </div>
                                </el-form-item>

                                <!-- 输出选项 -->
                                <el-form-item label="输出选项" class="compact-form-item">
                                    <div class="form-item-center-wrapper">
                                        <el-checkbox-group v-model="outputOptions" class="checkbox-grid-compact">
                                            <el-checkbox label="change_stats">变化统计</el-checkbox>
                                            <el-checkbox label="change_image">变化预览图</el-checkbox>
                                            <el-checkbox label="classified_tif">分类结果下载</el-checkbox>
                                            <el-checkbox label="raw_tif">原始变化数据下载</el-checkbox>
                                        </el-checkbox-group>
                                    </div>
                                </el-form-item>

                                <div class="button-group-compact">
                                    <el-button @click="handleChangeDetection" class="submit-button-compact" type="primary"
                                        :loading="detectionLoading" :disabled="!earlyFileObject || !lateFileObject">
                                        {{ detectionLoading ? '处理中...' : '开始检测' }}
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </el-form>
                </div>
            </div>

            <!-- 检测结果页面 -->
            <div class="result-container" v-if="predictCurrent === 1">
                <div class="result-content-compact">
                    <!-- 结果内容区域 -->
                    <div class="result-layout-compact">
                        <!-- 左边：变化统计 -->
                        <div class="result-panel-compact stats-panel-compact">
                            <h3 class="panel-title-compact">FVC变化统计</h3>
                            <div v-if="Object.keys(changeStats).length > 0">
                                <!-- 统计摘要 -->
                                <div class="stat-summary-compact">
                                    <div class="stat-grid-compact">
                                        <div class="stat-item-compact">
                                            <span class="stat-label-compact">总像素数：</span>
                                            <span class="stat-value-compact">{{ totalStats.total_pixels?.toLocaleString() || '0' }}</span>
                                        </div>
                                        <div class="stat-item-compact">
                                            <span class="stat-label-compact">有效像素：</span>
                                            <span class="stat-value-compact">{{ totalStats.valid_pixels?.toLocaleString() || '0' }}</span>
                                        </div>
                                        <div class="stat-item-compact">
                                            <span class="stat-label-compact">变化像素：</span>
                                            <div class="stat-value-container-compact">
                                                <span class="stat-value-compact">{{ totalStats.changed_pixels?.toLocaleString() || '0' }}</span>
                                                <span class="stat-percent-compact">({{ totalStats.change_percentage?.toFixed(2) || '0.00' }}%)</span>
                                            </div>
                                        </div>
                                        <div class="stat-item-compact">
                                            <span class="stat-label-compact">未变化像素：</span>
                                            <div class="stat-value-container-compact">
                                                <span class="stat-value-compact">{{ totalStats.unchanged_pixels?.toLocaleString() || '0' }}</span>
                                                <span class="stat-percent-compact">({{ totalStats.unchanged_percentage?.toFixed(2) || '0.00' }}%)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- FVC变化类别统计 -->
                                <div v-if="changeCategories.length > 0" class="categories-section-compact">
                                    <h4 class="sub-title-compact">FVC变化类别统计</h4>
                                    <div class="scrollable-container-compact">
                                        <div v-for="(category, index) in changeCategories" :key="index"
                                            class="change-type-item-compact">
                                            <div class="change-type-header-compact">
                                                <span class="color-indicator-compact" :style="{ backgroundColor: getCategoryColor(category.name) }"></span>
                                                <span class="category-name-compact">{{ category.name }}</span>
                                            </div>
                                            <div class="change-type-details-compact">
                                                <span>{{ category.count?.toLocaleString() || '0' }} 像素</span>
                                                <span>{{ category.percentage?.toFixed(2) }}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 变化统计信息 -->
                                <div v-if="changeStatistics.mean_change !== undefined" class="stats-section-compact">
                                    <h4 class="sub-title-compact">变化统计信息</h4>
                                    <div class="stat-grid-compact">
                                        <div class="stat-item-compact">
                                            <span class="stat-label-compact">平均变化：</span>
                                            <span class="stat-value-compact" :class="{
                                                'positive': changeStatistics.mean_change > 0,
                                                'negative': changeStatistics.mean_change < 0
                                            }">
                                                {{ changeStatistics.mean_change?.toFixed(4) || '0.0000' }}
                                            </span>
                                        </div>
                                        <div class="stat-item-compact">
                                            <span class="stat-label-compact">标准差：</span>
                                            <span class="stat-value-compact">{{ changeStatistics.std_change?.toFixed(4) || '0.0000' }}</span>
                                        </div>
                                        <div class="stat-item-compact">
                                            <span class="stat-label-compact">最小变化：</span>
                                            <span class="stat-value-compact">{{ changeStatistics.min_change?.toFixed(4) || '0.0000' }}</span>
                                        </div>
                                        <div class="stat-item-compact">
                                            <span class="stat-label-compact">最大变化：</span>
                                            <span class="stat-value-compact">{{ changeStatistics.max_change?.toFixed(4) || '0.0000' }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- 下载按钮 -->
                                <div class="download-section-compact" v-if="outputOptions.includes('change_stats')">
                                    <el-button @click="downloadStatsFile" type="primary" plain icon="Download"
                                        class="download-button-compact">
                                        下载统计文件 (JSON)
                                    </el-button>
                                </div>
                            </div>
                            <div v-else class="no-data-compact">
                                <el-icon>
                                    <DataAnalysis />
                                </el-icon>
                                <div>暂无统计数据</div>
                            </div>
                        </div>

                        <!-- 右边：变化图像 -->
                        <div class="result-panel-compact image-panel-compact">
                            <div v-if="previewData && outputOptions.includes('change_image')" class="image-container-compact">
                                <img :src="previewData" alt="FVC变化预览" class="preview-image-compact" />
                                <div class="image-info-compact">
                                    <el-tag :type="displayMode === 'all' ? 'success' : 'warning'">
                                        {{ displayMode === 'all' ? '全类别显示' : '仅变化区域' }}
                                    </el-tag>
                                    <el-button @click="openImageDialog" type="primary" plain class="view-image-button-compact">
                                        <el-icon>
                                            <ZoomIn />
                                        </el-icon>
                                        查看大图
                                    </el-button>
                                </div>
                            </div>
                            <div v-else class="no-data-compact">
                                <el-icon>
                                    <Picture />
                                </el-icon>
                                <div>暂无预览图</div>
                            </div>

                            <!-- 分类结果下载 -->
                            <div class="download-section-compact" v-if="outputOptions.includes('classified_tif')">
                                <el-button @click="downloadClassifiedTif" type="primary" plain icon="Download"
                                    class="download-button-compact">
                                    下载分类结果 (TIFF)
                                </el-button>
                            </div>

                            <!-- 原始变化数据下载 -->
                            <div class="download-section-compact" v-if="outputOptions.includes('raw_tif')">
                                <el-button @click="downloadRawTif" type="primary" plain icon="Download"
                                    class="download-button-compact">
                                    下载原始变化数据 (TIFF)
                                </el-button>
                            </div>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="action-buttons-compact">
                        <el-button @click="handleDetectionPrevious" icon="Back" class="action-button-compact">
                            上一步
                        </el-button>
                        <el-button @click="handleDetectionContinue" type="primary" icon="Refresh" class="action-button-compact">
                            继续检测
                        </el-button>
                    </div>
                </div>
            </div>

        
            <!-- 大图预览对话框 -->
            <el-dialog v-model="imageDialogVisible" title="预览大图" width="90%" :destroy-on-close="true" class="compact-dialog">
                <div class="full-image-container-compact">
                    <img :src="previewData" alt="完整预览" class="full-size-image-compact" @load="onImageLoad" />
                    <div v-if="isImageLoaded" class="zoom-controls-compact">
                        <el-button @click="zoomIn" icon="ZoomIn" circle />
                        <el-button @click="zoomOut" icon="ZoomOut" circle />
                    </div>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { Check, Picture, Download, Back, Refresh, ZoomIn, ZoomOut, Close, DataAnalysis } from '@element-plus/icons-vue'
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

// 缩短文件名显示
const getShortFileName = (filePath) => {
    if (!filePath) return ''
    const fileName = filePath.split('/').pop() || filePath
    if (fileName.length <= 18) return fileName
    return fileName.substring(0, 15) + '...'
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

// 变化检测处理
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

                // 获取FVC变化类别统计
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
                }).filter(item => item.name !== '无效区域')

                // 获取变化统计信息
                changeStatistics.value = body.stats.change_statistics || {}

                // 将class_stats存储在changeStats中
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

                // 解析类别统计
                if (body.class_statistics) {
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
    const img = document.querySelector('.full-size-image-compact')
    if (img) {
        img.style.transform = `scale(${zoomLevel.value})`
        img.style.transformOrigin = '0 0'
    }
}
</script>

<style scoped>
/* 基础样式 - 增加字体 */
.feature-container {
    margin: 0 auto;
    max-width: 100%;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    height: calc(100vh - 20px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 步骤条样式 - 增加字体 */
.steps-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px auto 15px;
    width: 100%;
}

.custom-steps {
    display: flex;
    width: 100%;
    max-width: 350px;
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
    top: 15px;
    left: 50%;
    width: 100%;
    height: 2px;
    background-color: #e0e0e0;
    z-index: 0;
}

.step-number {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-bottom: 5px;
    position: relative;
    z-index: 1;
    border: 2px solid #e0e0e0;
    color: #999;
    font-size: 14px;
}

.step-title {
    font-size: 13px;
    color: #999;
    text-align: center;
    white-space: nowrap;
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

/* 表单居中包装器 */
.form-center-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    flex: 1;
    min-height: 0;
}

/* 表单容器 */
.center-form {
    width: 100%;
    max-width: 550px;
}

.form-container {
    width: 100%;
    padding: 0 5px;
    box-sizing: border-box;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
}

/* 紧凑表单项目 */
.compact-form-item :deep(.el-form-item) {
    margin-bottom: 10px !important;
}

.compact-form-item :deep(.el-form-item__label) {
    padding-bottom: 4px !important;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 500;
}

/* 表单项目居中包装器 */
.form-item-center-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

/* 文件输入样式 - 增加字体 */
.file-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    max-width: 450px;
}

.file-input-hidden {
    display: none;
}

.browse-button {
    background-color: #409eff;
    color: white;
    border: none;
    min-width: 60px;
    height: 32px;
    line-height: 30px;
    font-size: 13px;
    padding: 0 12px;
}

.browse-button:hover {
    background-color: #79bbff;
}

.file-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    text-align: center;
}

.file-hint-compact {
    font-size: 11px;
    color: #909399;
    margin-top: 4px;
    text-align: center;
}

/* 阈值网格布局 - 增加字体 */
.thresholds-grid-compact {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    width: 100%;
    max-width: 400px;
}

.threshold-item-compact {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.threshold-label-compact {
    min-width: 70px;
    font-size: 13px;
    white-space: nowrap;
    font-weight: 500;
}

/* 单选按钮组 - 增加字体 */
.radio-group-compact {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 15px;
    width: 100%;
    max-width: 350px;
}

.radio-group-compact :deep(.el-radio__label) {
    font-size: 13px;
}

/* 复选框网格 - 增加字体 */
.checkbox-grid-compact {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;
    max-width: 400px;
}

.checkbox-grid-compact :deep(.el-checkbox__label) {
    font-size: 13px;
}

/* 紧凑的文件状态 - 增加字体 */
.file-status-compact {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    max-width: 450px;
}

.status-item-compact {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    padding: 3px 0;
}

.status-text-compact {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 320px;
}

/* 按钮组 - 增加字体 */
.button-group-compact {
    display: flex;
    justify-content: center;
    margin-top: 15px;
    width: 100%;
}

.submit-button-compact {
    padding: 10px 20px;
    background-color: #1890ff;
    color: white;
    border-radius: 4px;
    font-weight: 500;
    width: 100%;
    max-width: 180px;
    font-size: 14px;
}

.submit-button-compact:hover {
    background-color: #40a9ff;
}

/* 调整表单内容 */
:deep(.el-form-item__content) {
    display: flex;
    justify-content: center;
    width: 100%;
}

/* 结果容器 - 增加字体 */
.result-container {
    width: 100%;
    padding: 0 5px;
    box-sizing: border-box;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.result-content-compact {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-height: 0;
}

/* 紧凑的结果布局 */
.result-layout-compact {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    width: 100%;
    flex-wrap: nowrap;
    flex: 1;
    min-height: 0;
    max-height: calc(100vh - 170px);
}

.result-panel-compact {
    background: #f8f9fa;
    padding: 12px;
    border-radius: 6px;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    max-height: 100%;
}

.stats-panel-compact {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

.image-panel-compact {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

/* 面板标题 - 增加字体 */
.panel-title-compact {
    margin: 0 0 10px 0;
    color: #303133;
    font-size: 15px;
    text-align: center;
    font-weight: 600;
}

.sub-title-compact {
    margin: 8px 0 6px 0;
    color: #606266;
    font-size: 14px;
    text-align: center;
    font-weight: 500;
}

/* 统计样式 - 增加字体 */
.stat-summary-compact {
    background: white;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    margin-bottom: 10px;
}

.stat-grid-compact {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.stat-item-compact {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 6px 0;
}

.stat-label-compact {
    color: #606266;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 2px;
    text-align: center;
}

.stat-value-compact {
    color: #303133;
    font-weight: bold;
    font-size: 14px;
}

.stat-value-compact.positive {
    color: #67c23a;
}

.stat-value-compact.negative {
    color: #f56c6c;
}

.stat-percent-compact {
    color: #409eff;
    font-size: 12px;
    margin-left: 2px;
}

.stat-value-container-compact {
    display: flex;
    align-items: center;
    gap: 2px;
}

/* 变化类型 - 增加字体 */
.categories-section-compact,
.stats-section-compact {
    margin-top: 10px;
}

.scrollable-container-compact {
    max-height: 130px;
    overflow-y: auto;
    margin-bottom: 8px;
}

.change-type-item-compact {
    background: white;
    padding: 8px 10px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    margin-bottom: 6px;
}

.change-type-header-compact {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-weight: 500;
}

.color-indicator-compact {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    display: inline-block;
}

.category-name-compact {
    font-size: 13px;
    color: #303133;
}

.change-type-details-compact {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #909399;
    gap: 10px;
}

/* 图片容器 - 增加字体 */
.image-container-compact {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-height: 0;
}

.preview-image-compact {
    max-width: 100%;
    max-height: 160px;
    border-radius: 4px;
    object-fit: contain;
    flex: 1;
}

.image-info-compact {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 6px;
}

.view-image-button-compact {
    padding: 6px 12px;
    font-size: 13px;
}

/* 下载区域 - 增加字体 */
.download-section-compact {
    margin-top: 10px;
    text-align: center;
}

.download-button-compact {
    width: 100%;
    padding: 8px 12px;
    font-size: 13px;
}

/* 无数据状态 - 增加字体 */
.no-data-compact {
    color: #909399;
    text-align: center;
    padding: 20px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
    justify-content: center;
}

.no-data-compact .el-icon {
    font-size: 36px;
    margin-bottom: 8px;
}

.no-data-compact div {
    font-size: 14px;
}

/* 操作按钮 - 增加字体 */
.action-buttons-compact {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 12px;
    width: 100%;
    padding: 10px 0;
}

.action-button-compact {
    padding: 8px 16px;
    font-size: 13px;
    min-width: 100px;
}

/* 版权信息 - 增加字体 */
.copyright {
    text-align: center;
    font-size: 12px;
    color: #606266;
    padding: 6px 0;
    margin-top: auto;
    white-space: nowrap;
    font-weight: 500;
}

/* 大图预览 */
.full-image-container-compact {
    width: 100%;
    height: 60vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto;
    position: relative;
}

.full-size-image-compact {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.2s;
}

.zoom-controls-compact {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    gap: 5px;
}

/* 响应式断点 - 字体自适应 */
@media (max-width: 992px) {
    .result-layout-compact {
        flex-direction: column;
        gap: 10px;
        max-height: calc(100vh - 180px);
    }
    
    .result-panel-compact {
        width: 100%;
        min-width: unset;
        flex: none;
        max-height: 48%;
    }
    
    .preview-image-compact {
        max-height: 140px;
    }
    
    .scrollable-container-compact {
        max-height: 120px;
    }
}

@media (max-width: 768px) {
    .feature-container {
        padding: 8px;
        height: calc(100vh - 16px);
    }
    
    .steps-container {
        margin: 6px auto 12px;
    }
    
    .step-number {
        width: 26px;
        height: 26px;
        font-size: 12px;
    }
    
    .step-title {
        font-size: 12px;
    }
    
    .step-item:not(:last-child):after {
        top: 13px;
    }
    
    .thresholds-grid-compact {
        grid-template-columns: 1fr;
        max-width: 300px;
    }
    
    .checkbox-grid-compact {
        grid-template-columns: 1fr;
    }
    
    .preview-image-compact {
        max-height: 120px;
    }
    
    .scrollable-container-compact {
        max-height: 100px;
    }
    
    .copyright {
        font-size: 11px;
        padding: 5px 0;
    }
}

@media (max-width: 576px) {
    .feature-container {
        padding: 6px;
        height: calc(100vh - 12px);
    }
    
    .step-number {
        width: 24px;
        height: 24px;
        font-size: 11px;
    }
    
    .step-title {
        font-size: 11px;
    }
    
    .step-item:not(:last-child):after {
        top: 12px;
    }
    
    .result-panel-compact {
        padding: 10px;
    }
    
    .panel-title-compact {
        font-size: 14px;
    }
    
    .preview-image-compact {
        max-height: 100px;
    }
    
    .full-image-container-compact {
        height: 50vh;
    }
    
    .copyright {
        font-size: 10px;
        padding: 4px 0;
    }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
    .browse-button,
    .submit-button-compact,
    .view-image-button-compact,
    .download-button-compact,
    .action-button-compact {
        min-height: 44px;
        padding: 12px;
        font-size: 14px;
    }
    
    .step-number {
        width: 32px;
        height: 32px;
        font-size: 14px;
    }
    
    .step-item:not(:last-child):after {
        top: 16px;
    }
    
    .threshold-label-compact,
    .stat-label-compact,
    .category-name-compact {
        font-size: 14px;
    }
}
</style>