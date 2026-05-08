<template>
  <div class="chat-app">
    <aside class="sidebar">
      <div class="user-section">
        <div class="user-initial">{{ currentUser.charAt(0).toUpperCase() }}</div>
        <div class="user-name">{{ currentUser }}</div>
        <div class="user-status">online</div>
      </div>
      
      <div class="online-section">
        <div class="section-title">
          <span>Participants</span>
          <span class="count">{{ onlineUsers.length }}</span>
        </div>
        <div class="users-list">
          <div v-for="user in onlineUsers" :key="user" class="user-item">
            <span class="user-dot"></span>
            <span class="user-label">{{ user }}</span>
          </div>
        </div>
      </div>
    </aside>
    
    <main class="chat-main">
      <div class="chat-header">
        <div class="chat-title">General</div>
        <div class="chat-status">{{ onlineUsers.length }} participants</div>
      </div>
      
      <div class="messages-container" ref="messagesContainer">
        <div v-for="msg in messages" :key="msg.id" 
             class="message" 
             :class="{ 'system': msg.username === 'System' }">
          <div v-if="msg.username !== 'System'" class="message-meta">
            <span class="message-author">{{ msg.username }}</span>
            <span class="message-time">{{ msg.time }}</span>
          </div>
          <div class="message-text">{{ msg.text }}</div>
        </div>
        
        <div v-if="isSomeoneTyping" class="typing-indicator">
          {{ typingUser }} is typing...
        </div>
      </div>
      
      <div class="input-area">
        <input
          type="text"
          v-model="newMessage"
          @keyup.enter="sendMessage"
          @keyup="handleTyping"
          placeholder="Type a message"
          class="message-input"
        />
        <button @click="sendMessage" class="send-button">Send</button>
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
  background: #000000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: #050505;
  border-right: 1px solid #111111;
  display: flex;
  flex-direction: column;
}

.user-section {
  padding: 32px 24px;
  border-bottom: 1px solid #111111;
  text-align: left;
}

.user-initial {
  width: 48px;
  height: 48px;
  border: 1px solid #222222;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 16px;
}

.user-name {
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 4px;
}

.user-status {
  font-size: 11px;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.online-section {
  flex: 1;
  padding: 24px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #666666;
  margin-bottom: 16px;
}

.count {
  color: #888888;
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
  font-size: 13px;
  color: #cccccc;
}

.user-dot {
  width: 4px;
  height: 4px;
  background: #ffffff;
  border-radius: 50%;
}

.user-label {
  font-weight: 400;
}

/* Chat Main */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px 32px;
  border-bottom: 1px solid #111111;
  background: #000000;
}

.chat-title {
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 4px;
}

.chat-status {
  font-size: 11px;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: #000000;
}

.message {
  margin-bottom: 24px;
}

.system {
  text-align: center;
  margin: 24px 0;
}

.system .message-text {
  display: inline-block;
  font-size: 11px;
  color: #555555;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.message-meta {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 6px;
}

.message-author {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}

.message-time {
  font-size: 10px;
  color: #444444;
}

.message-text {
  font-size: 14px;
  color: #cccccc;
  line-height: 1.5;
  word-wrap: break-word;
}

.typing-indicator {
  padding: 8px 0;
  font-size: 12px;
  color: #555555;
  font-style: normal;
}

/* Input Area */
.input-area {
  padding: 20px 32px;
  background: #000000;
  border-top: 1px solid #111111;
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  color: #ffffff;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #333333;
}

.message-input::placeholder {
  color: #333333;
}

.send-button {
  padding: 12px 24px;
  background: #ffffff;
  color: #000000;
  border: none;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.send-button:hover {
  opacity: 0.8;
}

/* Scrollbar */
.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: #0a0a0a;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #222222;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #333333;
}
</style>ы