<template>
  <div class="wrapper">
    <div class="navbar">
      <router-link class='title' to='/'>OpenChat</router-link>
      <span class='navbarLinks'>
        <span @click='filter("all")' class='navbarLink'>
          All
        </span>
        <span @click='filter("open")' class='navbarLink'>
          Open
        </span>
        <span @click='filter("closed")' class='navbarLink'>
          Closed
        </span>
      </span>
    </div>
    <Conversations :users='users'></Conversations>
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
      };
    },
    methods: {
      filter(type) {
        this.$router.push('/');
        if (type === 'open') {
          this.users = this.allUsers.filter(u => !u.closed);
        } else if (type === 'closed') {
          this.users = this.allUsers.filter(u => u.closed);
        } else {
          this.users = this.allUsers;
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
