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
          {{ user.messages[0].text }}
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

<style scoped>
  .conversations {
    width: 350px;
    display: inline-block;
  }

  .navbar {
    width: 100vw;
    height: 50px;
    background-color: mediumpurple;
  }

  .title {
    color: #f3f3f8;
    font-size: 20px;
    line-height: 50px;
    margin-left: 20px;
    cursor: pointer;
    text-decoration: none;
  }

  .users {
    width: 350px;
    border-right: 1px solid #f3f3f8;
    height: calc(100vh - 53px);
    overflow-y: scroll;
    display: inline-block;
  }

  .users::-webkit-scrollbar {
    display: none;
  }

  .user {
    height: 75px;
    border-bottom: 1px solid #f3f3f8;
    padding: 10px;
  }

  .user:hover {
    background-color: #f3f3f8;
    cursor: pointer;
  }

  .userHeader {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-left: 10px;
    position: relative;
  }

  .letterWrapper {
    display: inline-block;
    height: 35px;
    width: 35px;
    border-radius: 3px;
    text-align: center;
    margin-right: 25px;
  }

  .letter {
    font-size: 30px;
    line-height: 35px;
    color: white;
  }

  .time {
    font-weight: 100;
    font-size: 14px;
    color: grey;
    position: absolute;
    right: 5px;
    top: 10px;
  }

  .lastMessage {
    font-size: 14px;
    margin-left: 10px;
    margin-top: 15px;
    color: grey;
  }
</style>
