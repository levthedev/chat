<template>
  <div id="app">
    <NavBar></NavBar>
  </div>
</template>

<script>
import NavBar from './components/NavBar';

export default {
  name: 'app',
  components: {
    NavBar,
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
