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
  </div>
</template>

<script>
  export default {
    name: 'navbar',
  };
</script>

<style lang='scss' scoped>
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/navbar.scss';
</style>
