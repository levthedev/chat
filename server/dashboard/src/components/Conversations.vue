<template>
  <div class='wrapper'>
    <div class='conversations'>
      <div class='users'>
        <div class='toggles'>
          <span @click='filter("open")' :class='{"activeToggle": (activeFilter === "open"), "toggle": true}'>
            Open ({{allUsers.filter(u => !u.closed).length}})
          </span>
          <span @click='filter("closed")' :class='{"activeToggle": (activeFilter === "closed"), "toggle": true}'>
            Closed ({{allUsers.filter(u => u.closed).length}})
          </span>
        </div>
        <div class="noUsers" v-if='filteredUsers.length === 0'>
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAABiVBMVEUAAABebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1ebH1Pxua7AAAAgnRSTlMAAQIDBAUGBwgKDA4PERITFBUXGBkaHB4fIiMmJyorLC0uLzAxMjM1Njg5PT9DRUlLTE5PUFFSVFVWV1hbXF5fY2ZoaWtsb3Bxc3d5e3x+f4CFhomLjo+RlKCjpairr7K0tbm6vsDDxcjKzs/R1dfa3N7g4uTm6Onr7e/x8/X3+fv9z9Cc+QAAAqdJREFUGBntwel3E1UAxuHfJE1ToGhAq+JSvHWtK1ZEC+JSd0VFwQ2tC6Ag1gWwpcWWJu9fLqeHgy90kjuZmXuOH/I8jIyMlJLNLq6rjN7SWzsoZtevKq93gCJ2rKqSIxTwrSqaJGq3qjpG1DFV1W0RMdZVZS8SMafqLhNxSTXYz0D7VYefGOhH1aLDAHeqHscZ4FOZxUeHMS/Ta9FXqytzL0P5TeYQfR2SucBwnpFZzugj+1vmaYbT2JCZoY8ZmfUGQ3pb5gx9nJZZYFg75faQa4/cToZ2SuZzcn0m8w3Du1+mN06O8Z7MPkr4Q+YwOeZlfqeM52RWMrbJVmSepYzmNZnH2eYxmWtNSvlA5me2OSvzHuVMyt3FbfbK7aKkRZmT3OaEzHeU9aBcm1u05R6gtL9kjnKLV2X+pLwDMqsZJrsi8zzljXVlnsQ8IbM5RgUfyZzD/CLzIVXcITfFTVNyu6nkB5mvuOlLme+pZlpughsm5B6iossyr3PDazKXqOqgzFrGlmxNZo6qWj2Zp9gyK9NtUdlxmfNsOS/zCdV15O7huim5DjU4I/M1130sc5o6PCI3BtmGzAx1yFZkZmFKZjmjFodlvoCXZF6hHm2Zq3BCZpyanJQZ55z+s9TJkREx2dnuqMxelhVxhMEmeorYR1cR600Gel8x0yhqnkHaPcUEFPVPkwHeVVRAcS/TX7urqIDirjbo6x3FBVTAQfoZ7youoALWGvSxoAICKmKOfK1NFRBQEasNcr2pIgIq5AXytDZVRECFXGmQ4w0VElAxS2dzbKqQgNILKL2A0gsovYDSCyi9gNILKL2A0gsovYDSCyi9gNILKL2A0gsovYDSCyi9gNILKL2Huajk7mNBqa01aF5QYtNAc+Gi0tk4dTcjIyP/F/8CKv8EnuWhuowAAAAASUVORK5CYII=">
          <div v-if="!activeFilter" class="message">There are no users yet.</div>
          <div v-if="activeFilter==='open'" class="message">There are no open chats.</div>
          <div v-if="activeFilter==='closed'" class="message">There are no closed chats.</div>
        </div>
        <div @click='goToUser(user)' v-for='user in filteredUsers' class='singleUser'>
          <div class='userHeader'>
            <div class='letterWrapper' :style="`background-color: ${user.color}`">
              <span class='letter'>{{ user.handle.slice(0, 1).toUpperCase() }}</span>
            </div>
            <span :class='{ dot: true, online: user.online }'></span> {{ user.handle }}
            <span class='time'>{{ formatTime(user.messages.slice(-1)[0].createdAt) }}</span>
          </div>
          <div v-if='user.messages.slice(-1)[0]' class='lastMessage'>
            {{ user.messages.slice(-1)[0].text.slice(0, 30) }}
            <span v-if='user.messages.slice(-1)[0].text.length > 30'>...</span>
          </div>
        </div>
      </div>
    </div>
    <User :user='user'></User>
  </div>
</template>

<script>
import User from './User';

export default {
  name: 'conversations',
  components: { User },
  data() {
    return {
      user: {},
      activeFilter: 'open',
      allUsers: [],
      filteredUsers: [],
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
    },
    filter(type) {
      this.$router.push('/');
      if (type === 'open') {
        this.activeFilter = 'open';
        this.filteredUsers = this.allUsers.filter(u => !u.closed);
      } else if (type === 'closed') {
        this.activeFilter = 'closed';
        this.filteredUsers = this.allUsers.filter(u => u.closed);
      }
    },
  },
  beforeMount() {
    const production = process.env.NODE_ENV === 'production';
    // const production = false;
    const domain = production ? '174.138.71.184' : 'localhost';
    this.$http.get(`http://${domain}:3000/users`).then((response) => {
      this.allUsers = response.body;
      this.filter('open');
    });
  },
  created() {
    // this.$socket.emit('joinRooms');
    this.$options.sockets.messageCreated = (message) => {
      const user = this.allUsers.filter(u => u.id === message.userId)[0];
      if (user) {
        if (user.messages) {
          user.messages.push(message);
        }
      }
    };
  },
};
</script>

<style scoped lang="scss">
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/conversation.scss';
</style>
