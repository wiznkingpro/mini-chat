<template>
  <div id="app">
    <div v-if="!isLoggedIn" class="login-container">
      <div class="login-card">
        <h1>SilkRoad</h1>
        <p class="subtitle">Messenger</p>
        <input
          v-model="username"
          @keyup.enter="login"
          placeholder="Username"
          class="login-input"
        />
        <button @click="login" class="login-btn">Enter</button>
      </div>
    </div>
    <Chat v-else :currentUser="username" />
  </div>
</template>

<script>
import { ref } from 'vue'
import Chat from './components/Chat.vue'

export default {
  name: 'App',
  components: { Chat },
  setup() {
    const isLoggedIn = ref(false)
    const username = ref('')
    
    const login = () => {
      if (username.value.trim()) {
        isLoggedIn.value = true
      }
    }
    
    return { isLoggedIn, username, login }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #000000;
  color: #ffffff;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #000000;
}

.login-card {
  width: 320px;
  text-align: center;
}

.login-card h1 {
  font-size: 32px;
  font-weight: 300;
  letter-spacing: 2px;
  margin-bottom: 8px;
  color: #ffffff;
}

.subtitle {
  font-size: 12px;
  letter-spacing: 4px;
  color: #666666;
  margin-bottom: 48px;
  text-transform: uppercase;
}

.login-input {
  width: 100%;
  padding: 12px;
  background: #111111;
  border: 1px solid #222222;
  color: #ffffff;
  font-size: 14px;
  margin-bottom: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.login-input:focus {
  border-color: #ffffff;
}

.login-input::placeholder {
  color: #444444;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #ffffff;
  color: #000000;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover {
  opacity: 0.8;
}
</style>