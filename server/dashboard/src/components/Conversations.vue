<template>
  <div class='conversations'>
    <div class='navbar'><router-link class='title' to='/'>OpenChat</router-link></div>
    <div class='users'>
      <div @click='goToUser(user)' v-for='user in users' class='user'>
        <div class='userHeader'>
          <div class='letterWrapper' :style="`background-color: ${user.color}`">
            <span class='letter'>{{ user.handle.slice(0, 1).toUpperCase() }}</span>
          </div>
          {{ user.handle }}
          <span class='time'>{{ formatTime(user.createdAt) }}</span>
        </div>
        <div v-if='user.messages[0]' class='lastMessage'>
          {{ user.messages[0].text.slice(0, 45) }}...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'conversations',
  data() {
    return {
      users: [],
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
      this.$router.push(`/users/${user.handle}`);
    },
  },
  beforeMount() {
    this.$http.get('http://localhost:3000/users').then((response) => {
      this.users = response.body;
    });
  },
};
</script>

<style scoped lang="scss">
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/conversation.scss';
</style>
