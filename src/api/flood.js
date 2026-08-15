// ============================================================
// 洪水模拟前端 API 封装层
// 对接后端：FloodDataController.java
// 后端地址：http://127.0.0.1:8091
// 接口前缀：/api/flood
// ============================================================

// ① Java 后端地址
const baseUrl = 'http://127.0.0.1:8091'

/**
 * 1.测试后端连接
 * 用于：前端"测试洪水接口"按钮
 */
export async function pingPython() {
  try {
    const res = await fetch(baseUrl + '/api/flood/health')
    if (!res.ok) return false
    const data = await res.json()
    return data.status === 'UP'
  } catch (err) {
    console.error('ping后端失败：', err)
    return false
  }
}

/**
 * 2.获取帧统计
 * 对应后端：@GetMapping("/frame-stats") → getFrameStats()
 */
export async function getFrameStats(limit = null) {
  let url = baseUrl + '/api/flood/frame-stats'
  if (limit !== null) url += '?limit=' + limit

  const res = await fetch(url)
  if (!res.ok) throw new Error('获取帧统计失败，状态码：' + res.status)
  const result = await res.json()
  if (result.code !== 200) throw new Error(result.message || '获取帧统计失败')
  return result.data || []
}

/**
 * 3.获取某一帧的水深二进制数据
 * 对应后端：@GetMapping("/frame/{index}") → getFrame(index)
 */
export async function getFloodFrame(runId, frameIndex) {
  const url = baseUrl + '/api/flood/frame/' + frameIndex
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('请求帧 ' + frameIndex + ' 失败，状态码：' + res.status)
    // ② 关键：二进制数据用 arrayBuffer() 接收
    const buffer = await res.arrayBuffer()
    return buffer
  } catch (err) {
    console.error('❌ 获取帧', frameIndex, '失败：', err)
    throw err
  }
}

/**
 * 4.预加载多帧（并发请求，加速加载）
 * 封装 getFloodFrame，批量请求 + Promise.all
 * onProgress(completed, total) 回调用于显示加载进度条
 */
export async function preloadFloodFrames(runId, startIndex, count, onProgress) {
  const requests = []

  for (let i = 0; i < count; i++) {
    const frameIndex = startIndex + i
    requests.push(
      getFloodFrame(runId, frameIndex)
        .then(buffer => ({ index: frameIndex, buffer }))
        .catch(err => {
          console.warn('⚠️ 预加载帧', frameIndex, '失败：', err)
          return { index: frameIndex, buffer: null }
        })
    )
  }

  // 并发执行，每完成一个就回调一次进度
  let completed = 0
  const results = await Promise.all(
    requests.map(req =>
      req.then(result => {
        completed++
        if (onProgress) onProgress(completed, count)
        return result
      })
    )
  )

  // 按帧号排序，保证顺序正确
  results.sort((a, b) => a.index - b.index)
  return results.map(r => r.buffer)
}

/**
 * 5.获取数据集概览
 * 对应后端：@GetMapping("/overview") → getOverview()
 */
export async function getFloodOverview() {
  const res = await fetch(baseUrl + '/api/flood/overview', {
    // 超时时间长一点，因为后端要存数据库
    signal: AbortSignal.timeout(60000)
  })
  if (!res.ok) throw new Error('获取概览失败')
  const result = await res.json()
  if (result.code !== 200) throw new Error(result.message)
  return result.data
}

/**
 * 6.获取地形DEM数据（二进制）
 * 对应后端：@GetMapping("/terrain") → getTerrain()
 */
export async function getTerrainData() {
  const res = await fetch(baseUrl + '/api/flood/terrain')
  if (!res.ok) throw new Error('获取地形数据失败')
  return res.arrayBuffer()
}

/**
 * 7.获取数据集列表
 * 对应后端：@GetMapping("/runs") → getRuns()
 */
export async function getFloodRuns(limit = 5) {
  const res = await fetch(baseUrl + '/api/flood/runs?limit=' + limit)
  if (!res.ok) throw new Error('获取数据集列表失败')
  const result = await res.json()
  if (result.code !== 200) throw new Error(result.message)
  return result.data || []
}
