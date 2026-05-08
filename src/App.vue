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
        <br>
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

