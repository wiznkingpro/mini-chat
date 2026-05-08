<template>
  <div class="chat-app">
    <!-- Боковая панель -->
    <aside class="sidebar">
      <div class="user-profile">
        <div class="avatar">{{ currentUser.charAt(0).toUpperCase() }}</div>
        <div class="user-name">{{ currentUser }}</div>
        <div class="user-status">В сети</div>
      </div>
      
      <div class="online-section">
        <h3>Участники чата · {{ onlineUsers.length }}</h3>
        <div class="users-list">
          <div v-for="user in onlineUsers" :key="user" class="user-item">
            <span class="online-indicator"></span>
            <span class="user-name-text">{{ user }}</span>
          </div>
        </div>
      </div>
    </aside>
    
    <!-- Основная область чата -->
    <main class="chat-main">
      <div class="chat-header">
        <h2>Общий чат</h2>
        <div class="chat-info">{{ onlineUsers.length }} участников онлайн</div>
      </div>
      
      <div class="messages-container" ref="messagesContainer">
        <div v-for="msg in messages" :key="msg.id" 
             class="message" 
             :class="{ 'system-message': msg.username === 'System' }">
          <div v-if="msg.username !== 'System'" class="message-header">
            <span class="username">{{ msg.username }}</span>
            <span class="time">{{ msg.time }}</span>
          </div>
          <div class="message-text">{{ msg.text }}</div>
        </div>
        
        <div v-if="isSomeoneTyping" class="typing-indicator">
          <span class="typing-dots"></span>
          {{ typingUser }} печатает...
        </div>
      </div>
      
      <div class="input-area">
        <input
          type="text"
          v-model="newMessage"
          @keyup.enter="sendMessage"
          @keyup="handleTyping"
          placeholder="Введите сообщение..."
          class="message-input"
        />
        <button @click="sendMessage" class="send-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          Отправить
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { io } from 'socket.io-client'

export default {
  name: 'Chat',
  props: {
    currentUser: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const socket = ref(null)
    const messages = ref([])
    const onlineUsers = ref([])
    const newMessage = ref('')
    const messagesContainer = ref(null)
    const isSomeoneTyping = ref(false)
    const typingUser = ref('')
    let typingTimeout = null
    
    const sendMessage = () => {
      if (!newMessage.value.trim()) return
      
      socket.value.emit('chat message', { text: newMessage.value })
      newMessage.value = ''
      socket.value.emit('typing', false)
    }
    
    const handleTyping = () => {
      socket.value.emit('typing', true)
      
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => {
        socket.value.emit('typing', false)
      }, 1000)
    }
    
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }
    
    onMounted(() => {
      socket.value = io('http://localhost:3001')
      
      socket.value.on('connect', () => {
        socket.value.emit('user join', props.currentUser)
      })
      
      socket.value.on('message history', (history) => {
        messages.value = history
        scrollToBottom()
      })
      
      socket.value.on('chat message', (msg) => {
        messages.value.push(msg)
        scrollToBottom()
      })
      
      socket.value.on('system message', (msg) => {
        messages.value.push(msg)
        scrollToBottom()
      })
      
      socket.value.on('user list', (users) => {
        onlineUsers.value = users
      })
      
      socket.value.on('user typing', ({ username, isTyping }) => {
        if (isTyping) {
          typingUser.value = username
          isSomeoneTyping.value = true
        } else {
          isSomeoneTyping.value = false
        }
      })
    })
    
    onUnmounted(() => {
      if (socket.value) {
        socket.value.disconnect()
      }
      if (typingTimeout) clearTimeout(typingTimeout)
    })
    
    return {
      messages,
      onlineUsers,
      newMessage,
      messagesContainer,
      isSomeoneTyping,
      typingUser,
      sendMessage,
      handleTyping
    }
  }
}
</script>

<style scoped>
.chat-app {
  display: flex;
  height: 100vh;
  background: #f5f7fb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e1e8ed;
  display: flex;
  flex-direction: column;
}

.user-profile {
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid #e1e8ed;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto 15px;
  border: 3px solid white;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.user-status {
  font-size: 12px;
  opacity: 0.9;
}

.online-section {
  flex: 1;
  padding: 20px;
}

.online-section h3 {
  margin: 0 0 15px 0;
  font-size: 13px;
  color: #657786;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;
  cursor: pointer;
}

.user-item:hover {
  background: #f5f7fb;
}

.online-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  display: inline-block;
  box-shadow: 0 0 0 2px white;
}

.user-name-text {
  font-size: 14px;
  color: #14171a;
}

/* Chat Main */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: white;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e8ed;
}

.chat-header h2 {
  margin: 0 0 5px 0;
  font-size: 20px;
  color: #14171a;
}

.chat-info {
  font-size: 13px;
  color: #657786;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;
  background: #fff;
}

.message {
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.system-message {
  text-align: center;
  margin: 20px 0;
}

.system-message .message-text {
  background: #f0f3f4;
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  color: #657786;
}

.message-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 5px;
}

.username {
  font-weight: 600;
  color: #4a6fa5;
  font-size: 14px;
}

.time {
  font-size: 11px;
  color: #8899a6;
}

.message-text {
  font-size: 14px;
  color: #14171a;
  line-height: 1.4;
}

.typing-indicator {
  padding: 10px;
  color: #657786;
  font-style: italic;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-dots {
  width: 20px;
  height: 20px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23657786"><circle cx="12" cy="12" r="2"><animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0s"/></circle><circle cx="18" cy="12" r="2"><animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.3s"/></circle><circle cx="6" cy="12" r="2"><animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.6s"/></circle></svg>') center no-repeat;
  background-size: contain;
}

.input-area {
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #e1e8ed;
  display: flex;
  gap: 15px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 25px;
  font-size: 14px;
  transition: all 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #4a6fa5;
  box-shadow: 0 0 0 3px rgba(74,111,165,0.1);
}

.send-button {
  padding: 12px 24px;
  background: #4a6fa5;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.send-button:hover {
  background: #3a5a8c;
}

.send-button svg {
  stroke: white;
}
</style>
