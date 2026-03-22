const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const express = require('express');

// === 修复：使用正确的 AnythingLLM API 配置和调用方式 ===
// 配置 AnythingLLM 服务地址（默认本地部署的地址）
const ANYTHINGLLM_BASE_URL = process.env.ANYTHINGLLM_URL || 'http://localhost:3001';
// AnythingLLM 的 API 密钥（在 AnythingLLM 设置 -> API Keys 中生成）
const ANYTHINGLLM_API_KEY = process.env.ANYTHINGLLM_API_KEY || process.env.AI_API_KEY;
// AnythingLLM 的 workspace ID（替代之前的向量库 ID，在工作区设置中查看）
const WORKSPACE_ID = process.env.ANYTHINGLLM_WORKSPACE_ID || "8c2bb5a3-26de-4077-a544-82b7b187d6aa";

// 向量库查询函数（使用正确的 AnythingLLM API）
async function queryVectorDB(question) {
  try {
    console.log(`[向量查询] 问题: ${question}`);
    console.log(`[向量查询] 请求地址: ${ANYTHINGLLM_BASE_URL}/api/v1/workspaces/${WORKSPACE_ID}/query`);
    
    // 直接调用 AnythingLLM 的查询接口（内置嵌入生成）
    const response = await fetch(`${ANYTHINGLLM_BASE_URL}/api/v1/workspaces/${WORKSPACE_ID}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANYTHINGLLM_API_KEY}` // 必须配置正确的 API 密钥
      },
      body: JSON.stringify({
        query: question,
        topK: 5, // 返回最相关的5条结果
        returnSourceDocuments: true // 返回原始文档内容
      })
    });

    // 打印响应状态和原始内容，方便调试
    const rawText = await response.text();
    console.log(`[向量查询] 响应状态: ${response.status}`);
    console.log(`[向量查询] 响应内容: ${rawText}`);

    if (!response.ok) {
      throw new Error(`向量查询失败: ${response.status} - ${rawText}`);
    }

    const result = JSON.parse(rawText);
    
    // 解析返回的文档内容
    if (result.sourceDocuments && result.sourceDocuments.length > 0) {
      return result.sourceDocuments.map(doc => doc.pageContent || doc.content || JSON.stringify(doc));
    } else if (result.results && result.results.length > 0) {
      return result.results.map(res => res.text || res.content || JSON.stringify(res));
    } else {
      return [];
    }
  } catch (e) {
    console.error('[向量查询异常]', e.message);
    throw e;
  }
}
// === 修复结束 ===

const app = express();
app.use(express.json());

// CORS 配置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// 服务配置
const PORT = process.env.AI_PORT || 3001;
const PROVIDER = process.env.AI_PROVIDER || 'ollama';
const DEFAULT_LOCAL_BASE = 'http://127.0.0.1:11434';
const DEFAULT_API_URL = process.env.AI_API_URL || (PROVIDER === 'ollama' ? `${DEFAULT_LOCAL_BASE}/api/generate` : 'http://127.0.0.1:8000/v1/chat/completions');
const API_URL = DEFAULT_API_URL;
const API_KEY = process.env.AI_API_KEY || ''; 

// AI 助手接口
app.post('/api/ai-assistant', async (req, res) => {
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'missing message in body' });
  }

  // 向量库检索
  let ctx = '';
  try {
    const hits = await queryVectorDB(message);
    console.log(`[向量查询结果] 找到 ${hits.length} 条相关内容`);
    if (hits && hits.length) {
      ctx = hits.join('\n---\n');
      console.log(`[上下文内容]\n${ctx}`);
    }
  } catch (e) {
    console.error('vector db query failed', e);
    // 检索失败不阻断，仅打印日志，继续使用原始问题请求 AI
  }

  // 检查 API KEY（非本地服务必填）
  const isLocal = API_URL.startsWith('http://127.0.0.1') || API_URL.startsWith('http://localhost') || API_URL.startsWith('http://[::1]');
  if (!API_KEY && !isLocal) {
    return res.status(500).json({ error: 'Server missing AI_API_KEY environment variable (required for non-local providers)' });
  }

  try {
    const model = process.env.AI_MODEL || 'deepseek-r1:1.5b';

    // 拼接上下文和用户问题
    let fullMessage = message;
    if (ctx) {
      fullMessage = `请基于以下内容回答问题：\n${ctx}\n\n${message}`;
    }

    // 构建不同服务商的请求体
    let payload;
    if (PROVIDER === 'ollama') {
      payload = {
        model,
        prompt: fullMessage,
        max_tokens: 1024,
      };
    } else {
      payload = {
        model,
        messages: [{ role: 'user', content: fullMessage }],
        max_tokens: 1024,
      };
    }

    // 兼容 Node.js 不同版本的 fetch
    const fetchFn = global.fetch || (await import('node-fetch').then(m => m.default));

    // 请求头配置
    const headers = {
      'Content-Type': 'application/json',
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    };

    // 调用 AI 服务商 API
    const r = await fetchFn(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('AI provider responded error', r.status, text);
      return res.status(502).json({ error: 'AI provider error', status: r.status, text });
    }

    // 处理响应（兼容 SSE/NDJSON 和普通 JSON）
    const contentType = (r.headers.get('content-type') || '').toLowerCase();
    const rawText = await r.text();

    // 提取响应文本的辅助函数
    function extractFromText(text) {
      const lines = String(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const parts = [];
      for (const line of lines) {
        try {
          const obj = JSON.parse(line);
          if (obj.response) parts.push(String(obj.response));
          else if (obj.output) {
            if (Array.isArray(obj.output)) parts.push(obj.output.map(o => (typeof o === 'string' ? o : (o?.content || o?.text || JSON.stringify(o)))).join('\n'));
            else parts.push(typeof obj.output === 'string' ? obj.output : (obj.output?.content || obj.output?.text || JSON.stringify(obj.output)));
          } else if (obj.text) parts.push(obj.text);
          else if (obj.result) parts.push(obj.result);
        } catch (e) {
          const m = line.match(/\{.*\}/);
          if (m) {
            try { const obj = JSON.parse(m[0]); if (obj.response) parts.push(String(obj.response)); } catch (e2) { /* ignore */ }
          }
        }
      }
      return parts.length ? parts.join('') : null;
    }

    let parsed;
    const extracted = extractFromText(rawText);
    if (extracted) {
      parsed = extracted;
    } else {
      try { parsed = JSON.parse(rawText); } catch (e) { parsed = { _raw: rawText }; }
    }

    // 解析不同服务商的响应
    let reply = '';
    if (PROVIDER === 'ollama') {
      if (typeof parsed === 'string') {
        reply = parsed;
      } else if (parsed && parsed.output) {
        if (Array.isArray(parsed.output)) {
          reply = parsed.output.map(o => (typeof o === 'string' ? o : (o?.content || o?.text || JSON.stringify(o)))).join('\n');
        } else {
          reply = typeof parsed.output === 'string' ? parsed.output : (parsed.output?.content || parsed.output?.text || JSON.stringify(parsed.output));
        }
      } else if (parsed && parsed.text) {
        reply = parsed.text;
      } else if (parsed && parsed.result) {
        reply = parsed.result;
      } else if (Array.isArray(parsed) && parsed[0] && parsed[0].content) {
        reply = parsed[0].content;
      } else if (parsed && parsed._raw) {
        reply = parsed._raw;
      } else {
        reply = JSON.stringify(parsed);
      }
    } else {
      if (parsed && parsed.choices && parsed.choices.length > 0) {
        reply = parsed.choices[0].message?.content || parsed.choices[0].text || '';
      } else if (parsed && parsed.result) {
        reply = parsed.result;
      } else {
        reply = parsed._raw || JSON.stringify(parsed);
      }
    }

    return res.json({ reply });
  } catch (err) {
    console.error('AI proxy error', err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

// 启动服务
app.listen(PORT, () => {
  console.log(`AI proxy listening on http://localhost:${PORT}  (AI provider: ${API_URL}, provider: ${PROVIDER})`);
  console.log(`AnythingLLM 配置 - 地址: ${ANYTHINGLLM_BASE_URL}, Workspace ID: ${WORKSPACE_ID}`);
});