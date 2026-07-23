const baseUrl = 'http://127.0.0.1:8000'

export async function createFloodRun() {
  const res = await fetch(baseUrl + '/api/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) throw new Error('创建模拟任务失败')
  const data = await res.json()
  return data.run_id
}

export async function pingPython() {
  try {
    const res = await fetch(baseUrl + '/api/overview')
    return res.ok
  } catch (err) {
    console.error('ping失败：', err)
    return false
  }
}

export async function getFloodFrame(runId, frameIndex) {
  const url = baseUrl + '/api/runs/' + runId + '/frames/' + frameIndex
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('接口请求失败')
    const buffer = await res.arrayBuffer()
    return buffer // 返回原始arrayBuffer，由调用方解析为Float32Array
  } catch (err) {
    console.error('获取帧数据失败：', err)
    throw err
  }
}

// 预加载多个帧（并发请求，提高加载速度）
export async function preloadFloodFrames(runId, startIndex, count, onProgress) {
  const frames = []
  const requests = []
  
  // 创建所有请求
  for (let i = 0; i < count; i++) {
    const frameIndex = startIndex + i
    requests.push(
      getFloodFrame(runId, frameIndex)
        .then(buffer => ({ index: frameIndex, buffer }))
        .catch(err => {
          console.warn(`预加载帧 ${frameIndex} 失败：`, err)
          return { index: frameIndex, buffer: null }
        })
    )
  }
  
  // 并发执行，每完成一个回调一次进度
  let completed = 0
  const results = await Promise.all(
    requests.map(req => 
      req.then(result => {
        completed++
        if (onProgress) {
          onProgress(completed, count)
        }
        return result
      })
    )
  )
  
  // 按索引排序并返回
  results.sort((a, b) => a.index - b.index)
  return results.map(r => r.buffer)
}