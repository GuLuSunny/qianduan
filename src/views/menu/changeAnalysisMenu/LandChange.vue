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
                        <div class="step-title">预测结果</div>
                    </div>
                </div>
            </div>

            <!-- 选择文件和参数页面 -->
            <div class="form-container" v-if="predictCurrent === 0">
                <el-form :model="form" label-width="auto">
                    <div class="form-horizontal-group">
                        <div class="form-column-full">
                            <!-- 早期文件上传 -->
                            <el-form-item label="早期文件：" required>
                                <div class="file-input-wrapper">
                                    <el-input v-model="earlyFilePath" placeholder="请选择早期地类分类文件" readonly
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
                                <div class="file-hint">请选择早期地类分类TIFF文件</div>
                            </el-form-item>

                            <!-- 后期文件上传 -->
                            <el-form-item label="后期文件：" required>
                                <div class="file-input-wrapper">
                                    <el-input v-model="lateFilePath" placeholder="请选择后期地类分类文件" readonly
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
                                <div class="file-hint">请选择后期地类分类TIFF文件</div>
                            </el-form-item>

                            <!-- 显示模式选择 -->
                            <el-form-item label="显示模式：" required>
                                <el-radio-group v-model="displayMode" class="radio-group">
                                    <el-radio label="changes_only">仅显示变化区域</el-radio>
                                    <el-radio label="all">显示全部类别</el-radio>
                                </el-radio-group>
                            </el-form-item>

                            <!-- 配置文件上传（可选） -->
                            <el-form-item label="配置文件：">
                                <div class="file-input-wrapper">
                                    <el-input v-model="configFilePath" placeholder="请选择配置文件（可选）" readonly
                                        clearable @clear="handleRemoveFile('config')"
                                        @keydown.delete="handleKeydown($event, 'config')"
                                        @focus="handleInputFocus('config')">
                                        <template #append>
                                            <el-button @click="handleConfigBrowseClick" class="browse-button">
                                                浏览
                                            </el-button>
                                        </template>
                                    </el-input>
                                    <input type="file" ref="configFileInput" @change="handleConfigFileSelect"
                                        accept=".json" class="file-input-hidden" />
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

                            <!-- 预测参数选项 -->
                            <el-form-item label="预测参数">
                                <el-checkbox-group v-model="predictOptions" class="checkbox-group">
                                    <el-checkbox label="change_stats">变化统计</el-checkbox>
                                    <el-checkbox label="change_image">变化预览</el-checkbox>
                                    <el-checkbox label="change_tif">变化结果下载</el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>

                            <div class="button-group">
                                <el-button @click="handlePredict" class="submit-button" type="primary"
                                    :loading="predictLoading" :disabled="!earlyFileObject || !lateFileObject">
                                    {{ predictLoading ? '上传并预测中...' : '开始预测' }}
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-form>
            </div>

            <!-- 预测结果页面 -->
            <div class="result-container" v-if="predictCurrent === 1">
                <div class="result-content">
                    <!-- 结果内容区域 - 响应式布局 -->
                    <div class="result-layout">
                        <!-- 左边：变化统计 -->
                        <div class="result-panel stats-panel">
                            <h3>变化统计</h3>
                            <div v-if="Object.keys(changeStats).length > 0 || changeTypes.length > 0">
                                <div class="stat-summary">
                                    <div class="stat-item">
                                        <span class="stat-label">总像素数：</span>
                                        <span class="stat-value">{{ totalStats.total_pixels?.toLocaleString() || '0'
                                            }}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">有效像素：</span>
                                        <span class="stat-value">{{ totalStats.valid_pixels?.toLocaleString() || '0'
                                            }}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">变化像素：</span>
                                        <span class="stat-value">{{ totalStats.changed_pixels?.toLocaleString() || '0'
                                            }}</span>
                                        <span class="stat-percent">({{ totalStats.change_percentage?.toFixed(2) ||
                                            '0.00'
                                            }}%)</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">未变化像素：</span>
                                        <span class="stat-value">{{ totalStats.unchanged_pixels?.toLocaleString() || '0'
                                            }}</span>
                                        <span class="stat-percent">({{ totalStats.unchanged_percentage?.toFixed(2) ||
                                            '0.00'
                                            }}%)</span>
                                    </div>
                                </div>

                                <!-- 未变化类别统计 -->
                                <div v-if="Object.keys(changeStats).length > 0">
                                    <h4>未变化类别统计</h4>
                                    <div class="scrollable-container">
                                        <div v-for="(value, key) in changeStats" :key="key" class="change-type-item">
                                            <div class="change-type-header">
                                                <span class="change-from">{{ key }}</span>
                                            </div>
                                            <div class="change-type-details">
                                                <span>像素数: {{ value.count?.toLocaleString() || value?.toLocaleString()
                                                    || '0'
                                                    }}</span>
                                                <span v-if="value.percentage !== undefined">比例: {{
                                                    value.percentage.toFixed(2)
                                                    }}%</span>
                                                <span v-else-if="totalStats.valid_pixels > 0">
                                                    比例: {{ ((value.count || value) * 100.0 /
                                                    totalStats.valid_pixels).toFixed(2) }}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 变化类型统计 -->
                                <div v-if="changeTypes.length > 0">
                                    <h4>变化类型统计</h4>
                                    <div class="scrollable-container tall-scroll">
                                        <div v-for="(change, index) in changeTypes" :key="index"
                                            class="change-type-item">
                                            <div class="change-type-header">
                                                <span class="change-from">{{ change.from_name }}</span>
                                                <el-icon>
                                                    <Right />
                                                </el-icon>
                                                <span class="change-to">{{ change.to_name }}</span>
                                            </div>
                                            <div class="change-type-details">
                                                <span>像素数: {{ change.count?.toLocaleString() || '0' }}</span>
                                                <span>比例: {{ change.percentage?.toFixed(2) || '0.00' }}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="no-data">
                                <el-icon>
                                    <DataAnalysis />
                                </el-icon>
                                <div>暂无统计数据</div>
                            </div>

                            <!-- 下载按钮 -->
                            <div class="download-section" v-if="predictOptions.includes('change_stats')">
                                <h3>统计文件下载</h3>
                                <el-button @click="downloadStatsFile" type="primary" plain icon="Download"
                                    class="download-button">
                                    下载统计文件 (JSON)
                                </el-button>
                            </div>
                        </div>

                        <!-- 右边：变化图像 -->
                        <div class="result-panel image-panel">
                            <div v-if="previewData && predictOptions.includes('change_image')" class="image-container">
                                <img :src="previewData" alt="变化结果预览" class="preview-image" />
                                <div class="image-info">
                                    <el-tag size="small" :type="displayMode === 'all' ? 'success' : 'warning'">
                                        {{ displayMode === 'all' ? '全类别显示' : '仅变化区域' }}
                                    </el-tag>
                                </div>
                                <el-button @click="openImageDialog" type="primary" plain class="view-image-button">
                                    <el-icon>
                                        <ZoomIn />
                                    </el-icon>
                                    查看大图
                                </el-button>
                            </div>
                            <div v-else class="no-data">
                                <el-icon>
                                    <Picture />
                                </el-icon>
                                <div>暂无预览图</div>
                            </div>
                            <div class="download-section" v-if="predictOptions.includes('change_tif')">
                                <h3>变化地图下载</h3>
                                <el-button @click="downloadTifFile" type="primary" plain icon="Download"
                                    class="download-button">
                                    下载变化地图 (TIFF)
                                </el-button>
                            </div>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <el-button @click="handlePredictPrevious" icon="Back">
                            上一步
                        </el-button>
                        <el-button @click="handlePredictContinue" type="primary" icon="Refresh">
                            继续预测
                        </el-button>
                    </div>
                </div>
            </div>

            <!-- 大图预览对话框 -->
            <el-dialog v-model="imageDialogVisible" title="预览大图" width="90%" :destroy-on-close="true">
                <div class="full-image-container">
                    <img :src="previewData" alt="完整预览" class="full-size-image" @load="onImageLoad" />
                    <div v-if="isImageLoaded" class="zoom-controls">
                        <el-button @click="zoomIn" icon="ZoomIn" circle size="small" />
                        <el-button @click="zoomOut" icon="ZoomOut" circle size="small" />
                    </div>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
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

// 预测处理
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
            message.success('预测完成')
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
        } else {
            const msg = response?.msg || '预测失败'
            error.value = msg
            message.error(msg)
        }
    } catch (err) {
        console.error('预测失败:', err)
        error.value = '预测失败: ' + err.message
        message.error('预测失败: ' + err.message)
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
/* 基础样式 */
.feature-container {
    margin: 0 auto;
    max-width: 1200px;
    width: 100%;
    padding: 0 15px;
    box-sizing: border-box;
}

/* 步骤条样式 */
.steps-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 30px auto;
    width: 100%;
}

.custom-steps {
    display: flex;
    width: 100%;
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

/* 表单容器 */
.form-container {
    width: 100%;
    margin: 30px 0;
    padding: 0 10px;
    box-sizing: border-box;
}

/* 文件输入样式 */
.file-input-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 500px;
}

.file-input-hidden {
    display: none;
}

.browse-button {
    background-color: #409eff;
    color: white;
    border: none;
    min-width: 60px;
}

.browse-button:hover {
    background-color: #79bbff;
}

.file-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
}

/* 单选按钮组 */
.radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

/* 复选框组 */
.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

/* 文件状态 */
.file-status {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

/* 按钮组 */
.button-group {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    width: 100%;
}

.submit-button {
    padding: 10px 25px;
    background-color: #1890ff;
    color: white;
    border-radius: 4px;
    font-weight: 500;
    width: 100%;
    max-width: 200px;
}

.submit-button:hover {
    background-color: #40a9ff;
}

/* 结果容器 */
.result-container {
    margin: 20px auto;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
}

.result-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* 结果布局 */
.result-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    width: 100%;
    flex-wrap: wrap;
}

.result-panel {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    flex: 1;
    min-width: 300px;
}

.stats-panel {
    flex: 1.5;
}

.image-panel {
    flex: 1.5;
    text-align: center;
}

/* 统计样式 */
.stat-summary {
    background: white;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    margin-bottom: 20px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.stat-label {
    color: #606266;
    font-weight: bold;
}

.stat-value {
    color: #303133;
    font-weight: bold;
}

.stat-percent {
    color: #409eff;
    font-size: 12px;
    margin-left: 5px;
}

/* 变化类型 */
.change-type-item {
    background: white;
    padding: 12px 15px;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    margin-bottom: 10px;
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
    margin-bottom: 8px;
    flex-wrap: wrap;
}

.change-from {
    color: #f56c6c;
    font-weight: bold;
}

.change-to {
    color: #67c23a;
    font-weight: bold;
}

.change-type-details {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #909399;
    flex-wrap: wrap;
    gap: 10px;
}

/* 滚动容器 */
.scrollable-container {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 20px;
}

.tall-scroll {
    max-height: 300px;
    margin-top: 10px;
}

/* 图片容器 */
.image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.preview-image {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
    object-fit: contain;
}

.image-info {
    margin-top: 10px;
}

.view-image-button,
.download-button {
    width: 100%;
    margin-top: 10px;
}

/* 无数据状态 */
.no-data {
    color: #909399;
    text-align: center;
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.no-data .el-icon {
    font-size: 48px;
    margin-bottom: 10px;
}

/* 下载区域 */
.download-section {
    margin-top: 25px;
}

.download-section h3 {
    margin: 0 0 15px 0;
    color: #303133;
    text-align: center;
}

/* 操作按钮 */
.action-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 30px;
    width: 100%;
    flex-wrap: wrap;
}

/* 大图预览 */
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

/* 响应式断点 */
@media (max-width: 1200px) {
    .feature-container {
        max-width: 100%;
        padding: 0 20px;
    }
    
    .result-layout {
        gap: 15px;
    }
    
    .result-panel {
        min-width: 280px;
    }
}

@media (max-width: 992px) {
    .form-container {
        margin: 20px 0;
    }
    
    .custom-steps {
        max-width: 90%;
    }
    
    .file-input-wrapper {
        max-width: 100%;
    }
    
    .result-layout {
        flex-direction: column;
    }
    
    .result-panel {
        width: 100%;
        min-width: unset;
    }
    
    .full-image-container {
        height: 60vh;
    }
}

@media (max-width: 768px) {
    .feature-container {
        padding: 0 15px;
    }
    
    .steps-container {
        margin: 20px auto;
    }
    
    .step-number {
        width: 35px;
        height: 35px;
        font-size: 14px;
    }
    
    .step-title {
        font-size: 13px;
    }
    
    .step-item:not(:last-child):after {
        top: 17.5px;
    }
    
    .form-container {
        margin: 15px 0;
    }
    
    :deep(.el-form-item__label) {
        font-size: 14px;
        margin-bottom: 5px;
        display: block;
        width: 100%;
    }
    
    :deep(.el-form-item__content) {
        width: 100%;
    }
    
    .radio-group {
        flex-direction: column;
        gap: 10px;
    }
    
    .checkbox-group {
        flex-direction: column;
        gap: 10px;
    }
    
    .stat-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
    
    .change-type-details {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
    
    .action-buttons {
        flex-direction: column;
        width: 100%;
    }
    
    .action-buttons .el-button {
        width: 100%;
    }
    
    .full-image-container {
        height: 50vh;
    }
    
    .button-group {
        margin-top: 20px;
    }
    
    .submit-button {
        max-width: 100%;
    }
}

@media (max-width: 576px) {
    .feature-container {
        padding: 0 10px;
    }
    
    .step-number {
        width: 30px;
        height: 30px;
        font-size: 12px;
    }
    
    .step-title {
        font-size: 12px;
    }
    
    .step-item:not(:last-child):after {
        top: 15px;
    }
    
    .result-panel {
        padding: 15px;
    }
    
    .stat-summary {
        padding: 12px;
    }
    
    .change-type-item {
        padding: 10px 12px;
    }
    
    .no-data {
        padding: 30px 20px;
    }
    
    .no-data .el-icon {
        font-size: 36px;
    }
    
    .full-image-container {
        height: 40vh;
    }
}

/* 高分辨率适配 */
@media (min-width: 1920px) {
    .feature-container {
        max-width: 1400px;
    }
    
    .result-layout {
        gap: 30px;
    }
    
    .result-panel {
        padding: 30px;
    }
    
    .preview-image {
        max-height: 500px;
    }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
    .browse-button,
    .submit-button,
    .view-image-button,
    .download-button,
    .action-buttons .el-button {
        min-height: 44px;
    }
    
    .step-number {
        width: 44px;
        height: 44px;
    }
    
    .step-item:not(:last-child):after {
        top: 22px;
    }
}
</style>