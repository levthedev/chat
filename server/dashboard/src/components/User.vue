<template>
  <span class='user'>
    <div class='messagesWrapper'>
      <div class='messages'>
        <div class='title'>
          Conversation with {{ user.handle }}
        </div>
        <div v-for='message in messages' class='message'>
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
        <div class='close'>Close</div>
      </div>
    </div>
  </span>
</template>

<script>
export default {
  name: 'user',
  data() {
    return {
      user: {},
      messages: [],
    };
  },
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
  },
  beforeMount() {
    const handle = this.$route.params.handle;
    this.$http.get(`http://localhost:3000/users/${handle}`).then((response) => {
      this.user = response.body.user;
      this.messages = response.body.messages;
    });
    this.$options.sockets.messageCreated = (message) => {
      this.messages.push(message);
    };
    this.$socket.emit('joinRooms');
  },
  beforeRouteUpdate(to, from, next) {
    const handle = to.params.handle;
    this.$http.get(`http://localhost:3000/users/${handle}`).then((response) => {
      this.user = response.body.user;
      this.messages = response.body.messages;
      next();
    });
  },
};
</script>

<style scoped lang="scss">
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/user.scss';
</style>
