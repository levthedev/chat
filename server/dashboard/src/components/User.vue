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

<style scoped>
  * {
    /*outline: 1px solid red !important;*/
  }
  .user {
    display: inline-block;
    width: calc(100vw - 350px);
    height: calc(100vh - 50px);
    margin-top: 51px;
    float: right;
    overflow-x: scroll;
  }

  .title {
    font-size: 18px;
    text-align: center;
    margin-top: 15px;
  }

  .messagesWrapper {
    min-width: 300px;
    width: 40vw;
    height: calc(100vh - 50px);
    display: inline-block;
    border-right: 1px solid #f3f3f8;
    background-color: #f3f3f8;
    margin-left: 1px;
  }

  .messages {
  }

  .inputWrapper {
    position: absolute;
    bottom: 0px;
    min-width: 300px;
    width: 40vw;
  }

  .input {
    height: 50px;
    font-size: 14px;
    min-width: 256px;
    padding: 20px;
    width: calc(40vw - 44px);
    outline: none;
    color: slategrey;
  }

  .sidebar {
    min-width: 250px;
    width: calc(60vw - 355px);
    height: calc(100vh - 50px);
    display: inline-block;
    text-align: center;
    position: absolute;
  }

  .letterWrapper {
    margin-top: 15px;
    display: inline-block;
    height: 100px;
    width: 100px;
    border-radius: 3px;
    text-align: center;
  }

  .letter {
    font-size: 70px;
    line-height: 100px;
    color: white;
  }

  .sidebarTitle {
    margin-top: 15px;
    font-size: 18px;
  }

  .customer, .company {
    border-radius: 5px;
    margin-bottom: 5px;
    clear: both;
    display: inline-block;
    padding: 15px 15px 15px 15px;
    max-width: 250px;
  }

  .customer {
    float: right;
    margin-right: 20px;
    color: #F8FAFD;
    background-color: mediumpurple;
    border: 1px solid mediumpurple;
  }

  .company {
    float: left;
    margin-left: 20px;
    color: #5E6C7D;
    background-color: white;
    border: 1px solid #ededed;
  }

  .customerTime {
    float: right;
    margin-right: 25px;
  }

  .companyTime {
    float: left;
    margin-left: 25px;
  }

  .customerTime, .companyTime {
    clear: both;
    display: inline-block;
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 200;
    color: #5E6C7D;
  }
</style>
