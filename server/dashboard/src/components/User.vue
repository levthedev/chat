<template>
  <span class='user' v-if='user.id'>
    <div ref='messagesWrapper' class='messagesWrapper'>
      <div class='messages'>
        <div class='title'>
          Chat with {{ user.handle }}
        </div>
        <div v-for='message in user.messages' class='message'>
          <div :class='`${message.sender}`'>{{ message.text }}</div>
          <div :class='`${message.sender}Time`'>
            <span v-if="message.sender === 'company'">
              Delivered {{ formatTime(message.createdAt).toLowerCase() }}
            </span>
            <span v-else>
              {{ formatTime(message.createdAt) }}
            </span>
          </div>
        </div>
      </div>
      <div class='inputWrapper'>
        <span v-show='userTyping' id='typingIndicator'>
          <span id='dotOne'></span>
          <span id='dotTwo'></span>
          <span id='dotThree'></span>
        </span>
        <input ref='input' @keyup='startTyping()' @blur='stopTyping()' @keyup.enter='sendMessage()' placeholder='Reply...' class='input'></input>
      </div>
    </div>
    <div class='sidebar'>
      <div class='letterWrapper' :style="`background-color: ${user.color}`">
        <span v-if='user.handle' class='letter'>{{ user.handle.slice(0, 1).toUpperCase() }}</span>
      </div>
      <div class='sidebarTitle'>{{ user.handle }}</div>
      <div class='userActions'>
        <div @click="toggleConversation()" class='close'>
          <div class="buttonOption" v-if='user.closed'>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAjVBMVEUAAABebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH0tHlMUAAAALnRSTlMAAQIDBAUGBwgJCw4PExQaHyU4UFJZW193f4CIl5qdpqittMHR19re5Obt8fP1/Fs22QAAAHhJREFUGBmlwUcSwjAQBMCRLHIyORkBJgs8/38eCz545RNVdON3Zpp5v1sm0Fb8OkB7stS2wqDEyGOMD8aKBII1AwjWDCEorpMGIiT3trXIfGUO8mRHBbUZeGt2A7Ut8Oq7M7XcAKk5Urs4iDW10INwd1bCpoP/vQETFCLpW+KYLQAAAABJRU5ErkJggg==">
            <div class="right">Reopen</div>
          </div>
          <div class="buttonOption" v-else>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAANlBMVEUAAABebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1IJz9zAAAAEXRSTlMAAgkKICIjNz9Ae6bDxe35+2rvXhwAAABMSURBVBhXxcpBDoAgDAXRKkL5KELvf1ljCKRKF+6c5csQmTkGwOvDfJW7smnM0jo0Sg+tGDSOdgslWBgtxM94zsiUJquOlvR6s6fvXYt/EqV8r54LAAAAAElFTkSuQmCC">
            <div class="right">Close</div>
          </div>
        </div>
      </div>
      <div class="analyticsHeader">Analytics</div>
      <div class="analytics">
        <div class="sessions">
          <span>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAZlBMVEUAAABebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH14NQRJAAAAIXRSTlMAAQIDBQsMFBgdIC0/QEdKXmhpcIydoq3Kztni7fHz+/27Mq+uAAAAoElEQVQ4y93UORaCQBQFURxaVGgHFAdEoPa/SQNEhua0LyGhoh/c6AU/COYU2CnhKdRgxDtU4KbAI1u4fIBHtvAKPvmDBxiR5jiE24oRucuzAVy/wJW2AtOHd3DlBSDuwTM4cnUDIO3CCBxpnvVVLjqwwJV5c+07EF+JCjMVfgcSYKzCVIX1QAKsB1JgosJMhZgG2j+ZiR6Alg6t2Kw+8weTdVKFucDK8AAAAABJRU5ErkJggg==">
            <span class='analyticsLabel'>SESSIONS</span>
          </span>
          <span class="right">{{ user.sessions }}</span>
        </div>
        <div class="firstSeen">
          <span>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAyVBMVEUAAABebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1MQE09AAAAQnRSTlMAAQUGCQsMEBIUHh8gISIuMTQ1O0BES01QUVZXW2RmaG97g4WPkpWaoK+wsrS3ubq+wcPFz9HT19ng4uTr7/H5+/0zNhJVAAAA80lEQVQ4y+2Qy1LCQBBFG1QQFQSJCqOIPIJIBEYMOCpKuP//USbT5llWyEI2wlnM7bpzaippoh8qT45jlSnk+GGJ994hJahAcxYUJ1x8HSVEC7BtYBQUU0DJD6CTEFdYEC2wCoo1XolygJUQAUkkgXjhnuPQOagLIXxR+PjimxBXRf67T/5sFiOw6LE+9cRHbBQx8UQng+hQOOOZaBYTXyKXURGtFuLci+6vYhrbEiUvvik48yjxUEZBp/yXoqpqzAHnJW55aKOhU+33+Ldi5j2qc03f5DRww8MdrnWqXd7jPMMabU80MoiGfrk2lOkML1zrGx57tvPgb4saAAAAAElFTkSuQmCC">
            <span class='analyticsLabel'>FIRST SEEN</span>
          </span>
          <span class="right">{{ formatTime(user.createdAt) }}</span>
        </div>
        <div class="lastSeen">
          <span>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAyVBMVEUAAABebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1MQE09AAAAQnRSTlMAAQUGCQsMEBIUHh8gISIuMTQ1O0BES01QUVZXW2RmaG97g4WPkpWaoK+wsrS3ubq+wcPFz9HT19ng4uTr7/H5+/0zNhJVAAAA80lEQVQ4y+2Qy1LCQBBFG1QQFQSJCqOIPIJIBEYMOCpKuP//USbT5llWyEI2wlnM7bpzaippoh8qT45jlSnk+GGJ994hJahAcxYUJ1x8HSVEC7BtYBQUU0DJD6CTEFdYEC2wCoo1XolygJUQAUkkgXjhnuPQOagLIXxR+PjimxBXRf67T/5sFiOw6LE+9cRHbBQx8UQng+hQOOOZaBYTXyKXURGtFuLci+6vYhrbEiUvvik48yjxUEZBp/yXoqpqzAHnJW55aKOhU+33+Ldi5j2qc03f5DRww8MdrnWqXd7jPMMabU80MoiGfrk2lOkML1zrGx57tvPgb4saAAAAAElFTkSuQmCC">
            <span class='analyticsLabel'>LAST SEEN</span>
          </span>
          <span class="right">{{ user.online ? 'Just now' : formatTime(user.updatedAt) }}</span>
        </div>
      </div>
    </div>
  </span>
</template>

<script>
export default {
  name: 'user',
  props: ['user'],
  data() {
    return {
      userTyping: false,
      agentTyping: false,
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
      if (this.$refs.input.value !== '') {
        this.$socket.emit('agentMessage', { text: this.$refs.input.value, customerID: this.user.id });
        this.$refs.input.value = '';
        this.scrollToBottom();
      }
    },
    toggleConversation() {
      this.$socket.emit('toggleConversation', { customerID: this.user.id });
      this.user.closed = !this.user.closed;
    },
    startTyping() {
      if (!this.agentTyping) {
        this.$socket.emit('agentTyping', { typing: true, customerID: this.user.id });
        this.agentTyping = true;
      }
    },
    stopTyping() {
      if (this.agentTyping) {
        this.$socket.emit('agentTyping', { typing: false, customerID: this.user.id });
        this.agentTyping = false;
      }
    },
    scrollToBottom() {
      const messagesWrapper = this.$refs.messagesWrapper;
      if (messagesWrapper) {
        messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
      }
    },
  },
  beforeMount() {
    this.$options.sockets.userTyping = (data) => {
      if (this.user.id === data.userId) {
        this.userTyping = data.typing;
      }
    };
  },
  updated() {
    this.scrollToBottom();
  },
};
</script>

<style scoped lang="scss">
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/user.scss';
</style>
