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
    return new Uint8Array(buffer)
  } catch (err) {
    console.error('获取帧数据失败：', err)
    throw err
  }
}