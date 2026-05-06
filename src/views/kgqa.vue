<template>
  <div class="kgqa-page">
    <aside class="session-sidebar">
      <button class="new-chat-btn" type="button" @click="startNewSession">
        <span class="plus">+</span>
        开启新对话
      </button>

      <div class="session-list">
        <button
          v-for="session in sessions"
          :key="session.id"
          type="button"
          class="session-item"
          :class="{ active: session.id === activeSessionId }"
          @click="switchSession(session.id)"
        >
          <span class="session-icon">▱</span>
          <span class="session-title">{{ session.title }}</span>
        </button>
      </div>
    </aside>

    <main class="chat-panel">
      <header class="chat-header">
        <div class="brand">
          <span class="drop-icon">💧</span>
          <span>水资源知识图谱问答</span>
        </div>
        <button class="exit-btn" type="button" @click="goBackUserPage">退出</button>
      </header>

      <section ref="messageBodyRef" class="message-body">
        <div v-if="currentMessages.length === 0" class="empty-state">
          <div class="wave">👋</div>
          <h1>您好，我是水务智能助手！</h1>
          <p>您可以向我提问关于水库调度、水位、容量相关的知识图谱内容。</p>
        </div>

        <div v-else class="message-list">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            class="message-row"
            :class="message.role"
          >
            <div class="avatar" :class="message.role">
              {{ message.role === 'user' ? '我' : '水' }}
            </div>
            <div class="bubble" :class="message.role">
              <div v-if="message.loading" class="typing">
                <span></span><span></span><span></span>
              </div>
              <template v-else>{{ message.content }}</template>
            </div>
          </div>
        </div>
      </section>

      <footer class="input-area">
        <div v-if="currentMessages.length === 0" class="prompt-list">
          <button
            v-for="prompt in quickPrompts"
            :key="prompt"
            type="button"
            class="prompt-chip"
            @click="askPrompt(prompt)"
          >
            {{ prompt }}
          </button>
        </div>

        <div class="input-box">
          <input
            v-model="question"
            type="text"
            placeholder="例如：三峡水库的汛限水位是多少？"
            :disabled="sending"
            @keyup.enter="sendQuestion()"
          />
          <button type="button" class="send-btn" :disabled="!canSend" @click="sendQuestion()">
            ➤
          </button>
        </div>
        <div class="notice">内容由智能语义模型生成，仅供水资源辅助决策参考。</div>
      </footer>
    </main>
  </div>
</template>

<script setup>
import axios from 'axios'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const question = ref('')
const sending = ref(false)
const messageBodyRef = ref(null)
const activeSessionId = ref('')
const sessions = ref([])

const quickPrompts = [
  '龙羊峡水库的坝高是多少？',
  '长江上有哪些水库？',
  '小浪底的总库容是多少？',
  '小浪底的容量是多少？'
]

const currentSession = computed(() => sessions.value.find(item => item.id === activeSessionId.value))
const currentMessages = computed(() => currentSession.value?.messages || [])
const canSend = computed(() => question.value.trim().length > 0 && !sending.value)

onMounted(() => {
  loadSessions()
  if (sessions.value.length === 0) {
    createSession()
  } else {
    activeSessionId.value = sessions.value[0].id
  }
})

watch(
  sessions,
  () => {
    localStorage.setItem('kgqaSessions', JSON.stringify(sessions.value))
  },
  { deep: true }
)

watch(
  currentMessages,
  () => {
    scrollToBottom()
  },
  { deep: true }
)

function loadSessions () {
  try {
    const stored = JSON.parse(localStorage.getItem('kgqaSessions') || '[]')
    sessions.value = Array.isArray(stored) ? stored : []
  } catch (error) {
    sessions.value = []
  }
}

function createSession () {
  const session = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: '新对话',
    messages: [],
    createdAt: Date.now()
  }
  sessions.value.unshift(session)
  activeSessionId.value = session.id
}

function startNewSession () {
  createSession()
  question.value = ''
}

function switchSession (id) {
  activeSessionId.value = id
  question.value = ''
  scrollToBottom()
}

function askPrompt (prompt) {
  question.value = prompt
  sendQuestion()
}

async function sendQuestion () {
  const text = question.value.trim()
  if (!text || sending.value || !currentSession.value) return

  const session = currentSession.value
  if (session.messages.length === 0) {
    session.title = text.length > 12 ? `${text.slice(0, 12)}...` : text
  }

  session.messages.push({
    id: createMessageId(),
    role: 'user',
    content: text
  })
  question.value = ''

  const assistantMessage = {
    id: createMessageId(),
    role: 'assistant',
    content: '',
    loading: true
  }
  session.messages.push(assistantMessage)
  sending.value = true
  scrollToBottom()

  try {
    const { data } = await axios.post('/api/ai-assistant', { message: text })
    assistantMessage.content = normalizeAnswer(data)
  } catch (error) {
    assistantMessage.content = '抱歉，知识图谱问答服务暂时不可用，请稍后再试。'
    ElMessage.error('知识图谱 API 调用失败')
  } finally {
    assistantMessage.loading = false
    sending.value = false
    scrollToBottom()
  }
}

function normalizeAnswer (data) {
  if (!data) return '暂无可用答案。'
  if (typeof data === 'string') return data
  return data.reply || data.answer || data.result || data.data?.answer || data.data?.reply || '暂无可用答案。'
}

function createMessageId () {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function scrollToBottom () {
  nextTick(() => {
    const el = messageBodyRef.value
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  })
}

function goBackUserPage () {
  router.push('/mainMenu')
}
</script>

<style scoped>
.kgqa-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: #f7f8fb;
  color: #1f2937;
}

.session-sidebar {
  width: 210px;
  padding: 16px 12px;
  background: #f3f7fc;
  border-right: 1px solid #dfe8f2;
  box-sizing: border-box;
}

.new-chat-btn,
.session-item,
.exit-btn,
.prompt-chip,
.send-btn {
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.new-chat-btn {
  width: 100%;
  height: 38px;
  border-radius: 18px;
  background: #ffffff;
  color: #4b5563;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.plus {
  margin-right: 6px;
  font-weight: 700;
}

.session-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 4px;
  background: transparent;
  color: #475569;
  text-align: left;
}

.session-item.active,
.session-item:hover {
  background: #dceeff;
  color: #1677d2;
}

.session-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chat-panel {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.chat-header {
  height: 54px;
  flex: 0 0 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  border-bottom: 1px solid #eef2f7;
  box-sizing: border-box;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.drop-icon {
  font-size: 17px;
}

.exit-btn {
  padding: 5px 12px;
  border-radius: 4px;
  background: #fff;
  color: #475569;
}

.exit-btn:hover {
  background: #f1f5f9;
  color: #1677d2;
}

.message-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 32px 9% 22px;
  box-sizing: border-box;
}

.empty-state {
  height: 100%;
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

.wave {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-state h1 {
  margin: 0 0 14px;
  font-size: 24px;
  color: #172033;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.message-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.message-row.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #ffffff;
  background: #36a3ff;
}

.avatar.user {
  background: #73c0ff;
}

.bubble {
  max-width: min(680px, 70%);
  padding: 12px 15px;
  border-radius: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
}

.bubble.assistant {
  border-top-left-radius: 4px;
  background: #f4f7fb;
  color: #253044;
}

.bubble.user {
  border-top-right-radius: 4px;
  background: #2d9cff;
  color: #ffffff;
}

.typing {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 22px;
}

.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8aa4bd;
  animation: typing 1.2s infinite ease-in-out;
}

.typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing span:nth-child(3) {
  animation-delay: 0.3s;
}

.input-area {
  flex: 0 0 auto;
  padding: 0 9% 12px;
  background: #ffffff;
  box-sizing: border-box;
}

.prompt-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.prompt-chip {
  min-height: 32px;
  padding: 0 16px;
  border: 1px solid #e4eaf2;
  border-radius: 17px;
  background: #ffffff;
  color: #64748b;
  transition: all 0.2s;
}

.prompt-chip:hover {
  border-color: #8bc7ff;
  color: #1677d2;
  background: #f4faff;
}

.input-box {
  height: 46px;
  display: flex;
  align-items: center;
  padding: 0 8px 0 18px;
  border-radius: 24px;
  background: #f1f3f5;
}

.input-box input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #1f2937;
  font-size: 15px;
}

.input-box input::placeholder {
  color: #8a94a6;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e4e9ef;
  color: #6b7280;
  transition: all 0.2s;
}

.send-btn:not(:disabled) {
  background: #2d9cff;
  color: #ffffff;
}

.send-btn:disabled {
  cursor: not-allowed;
}

.notice {
  margin-top: 10px;
  text-align: center;
  color: #9aa3af;
  font-size: 12px;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.75);
    opacity: 0.45;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .session-sidebar {
    width: 150px;
  }

  .message-body,
  .input-area {
    padding-left: 20px;
    padding-right: 20px;
  }

  .bubble {
    max-width: 78%;
  }
}
</style>
