<template>
  <div class='wrapper'>
    <div class='conversations'>
      <div class='users'>
        <div @click='goToUser(user)' v-for='user in users' class='singleUser'>
          <div class='userHeader'>
            <div class='letterWrapper' :style="`background-color: ${user.color}`">
              <span class='letter'>{{ user.handle.slice(0, 1).toUpperCase() }}</span>
            </div>
            {{ user.handle }}
            <span class='time'>{{ formatTime(user.createdAt) }}</span>
          </div>
          <div v-if='user.messages[0]' class='lastMessage'>
            {{ user.messages[0].text.slice(0, 30) }}<span v-if='user.messages[0].text.length > 30'>...</span>
          </div>
        </div>
      </div>
    </div>
    <User :user='user' v-if='user'></User>
  </div>
</template>

<script>
import User from './User';

export default {
  name: 'conversations',
  props: ['users'],
  components: {
    User,
  },
  data() {
    return {
      user: {},
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
    goToUser(user) {
      this.user = user;
      this.$router.push(`/users/${user.handle}`);
    },
  },
  beforeMount() {
    this.$options.sockets.messageCreated = (message) => {
      // TODO fix this as it means new customers first messages don't appear instantly
      console.log(this.users, message); //eslint-disable-line
      const user = this.users.filter(u => u.id === message.userId);
      console.log(user); //eslint-disable-line
      if (user.messages) {
        user.messages.push(message);
      }
      // if (this.user.messages && this.user.id === message.userId) {
      //   this.user.messages.push(message);
      // }
    };
    this.$socket.emit('joinRooms');
  },
};
</script>

<style scoped lang="scss">
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/conversation.scss';
</style>
