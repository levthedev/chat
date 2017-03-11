<template>
  <div id="app">
    <Conversations></Conversations>
    <router-view></router-view>
  </div>
</template>

<script>
import Conversations from './components/Conversations';

export default {
  name: 'app',
  components: {
    Conversations,
  },
};
</script>

<style>
  body {
    margin: 0;
    padding: 0;
    font-family: Roboto, sans-serif;
  }

  /** { outline: 1px solid red !important }*/
</style>
