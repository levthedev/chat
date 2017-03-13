<template>
  <div class="wrapper">
    <div class="navbar">
      <router-link class='title' to='/'>OpenChat</router-link>
      <span class='navbarLinks'>
        <span @click='filter("all")' :class='{"active": (activeFilter === false), "navbarLink": true}'>
          All Chats
        </span>
        <span @click='filter("open")' :class='{"active": (activeFilter === "open"), "navbarLink": true}'>
          Open
        </span>
        <span @click='filter("closed")' :class='{"active": (activeFilter === "closed"), "navbarLink": true}'>
          Closed
        </span>
      </span>
    </div>
    <Conversations :users='users' :filter='activeFilter'></Conversations>
  </div>
</template>

<script>
  import Conversations from './Conversations';

  export default {
    name: 'navbar',
    components: {
      Conversations,
    },
    data() {
      return {
        allUsers: [],
        users: [],
        activeFilter: false,
      };
    },
    methods: {
      filter(type) {
        this.$router.push('/');
        if (type === 'open') {
          this.users = this.allUsers.filter(u => !u.closed);
          this.activeFilter = 'open';
        } else if (type === 'closed') {
          this.users = this.allUsers.filter(u => u.closed);
          this.activeFilter = 'closed';
        } else {
          this.users = this.allUsers;
          this.activeFilter = false;
        }
      },
    },
    beforeMount() {
      this.$http.get('http://localhost:3000/users').then((response) => {
        this.allUsers = response.body;
        this.users = response.body;
      });
    },
  };
</script>

<style lang='scss' scoped>
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/navbar.scss';
</style>
