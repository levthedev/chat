<template>
  <div class="wrapper">
    <div class="navbar">
      <router-link class='title' to='/'>HumbleChat</router-link>
      <span class='navbarLinks'>
          <router-link class='navbarLink' to='/'>Chats</router-link>
          <router-link class='navbarLink' to='/triggers'>Triggers</router-link>
          <router-link class='navbarLink' to='/analytics'>Analytics</router-link>
      </span>
    </div>
    <Conversations :allUsers='users'></Conversations>
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
        users: [],
      };
    },
    beforeMount() {
      const production = process.env.NODE_ENV === 'production';
      const domain = production ? '174.138.71.184' : 'localhost';

      this.$http.get(`http://${domain}:3000/users`).then((response) => {
        this.users = response.body;
      });
    },
  };
</script>

<style lang='scss' scoped>
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/navbar.scss';
</style>
