<template>
  <span class='user'>
    <div class='messagesWrapper'>
      <div class='messages'>
        <div class='title'>
          Conversation with {{ user.handle }}
        </div>
        <div v-for='message in user.messages' class='message'>
          <div :class='`${message.sender}`'>{{ message.text }}</div>
          <div :class='`${message.sender}Time`'>{{ formatTime(message.createdAt) }}</div>
        </div>
      </div>
      <div class='inputWrapper'>
        <input ref='input' @keyup.enter='sendMessage()' placeholder='Reply...' class='input'></input>
      </div>
    </div>
    <div class='sidebar'>
      <div class='letterWrapper' :style="`background-color: ${user.color}`">
        <span v-if='user.handle' class='letter'>{{ user.handle.slice(0, 1).toUpperCase() }}</span>
      </div>
      <div class='sidebarTitle'>{{ user.handle }}</div>
      <div class='userActions'>
        <div @click="toggleConversation()" class='close'>
          {{ user.closed ? 'Reopen' : 'Close' }}
        </div>
      </div>
    </div>
  </span>
</template>

<script>
export default {
  name: 'user',
  props: ['user'],
  methods: {
    formatTime(date) {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      const format = (length, word) => {
        const interval = Math.floor(seconds / length);
        return interval >= 1 ? `${interval} ${word}${interval > 1 ? 's' : ''} ago` : false;
      };
      return format(2592000, 'month') || format(604800, 'week') || format(86400, 'day') || format(3600, 'hour') || format(60, 'minute') || 'Just now';
    },
    sendMessage() {
      this.$socket.emit('agentMessage', { text: this.$refs.input.value, customerID: this.user.id });
      this.$refs.input.value = '';
    },
    toggleConversation() {
      this.$socket.emit('toggleConversation', { customerID: this.user.id });
      this.user.closed = !this.user.closed;
    },
  },
};
</script>

<style scoped lang="scss">
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/user.scss';
</style>
