<template>
  <div class="wrapper">
    <div class="settingsHeader">
      Profile Settings for {{ path() }}
    </div>
    <div class="settings">
      <div class="setting">
        <span class="label">Profile Picture</span>
        <img :src="profilePic()" id="profilePic"></img>
      </div>
      <div class="setting">
        <span class="label">Name</span>
        <input :placeholder="name()" id="name"></input>
      </div>
      <div class="setting">
        <span class="label">Color</span>
        <input :placeholder="color()" id="color"></input>
      </div>
      <div class="setting">
        <span class="label">Email Address</span>
        <input :placeholder="emailAddress()" id="emailAddress"></input>
      </div>
      <div class="saveWrapper">
        <div @click="save()" class="save">Save</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'settings',
    methods: {
      path() {
        return window.location.hostname; // eslint-disable-line
      },
      name() {
        return 'Lev';
      },
      profilePic() {
        return 'data:image/png;base64,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';
      },
      color() {
        return '#9370DB';
      },
      emailAddress() {
        return 'kravinskylev@gmail.com';
      },
      save() {
        console.log('saving'); //eslint-disable-line
      },
    },
    beforeMount() {
      const production = process.env.NODE_ENV === 'production';
      // const production = false;
      const domain = production ? '174.138.71.184' : 'localhost';
      this.$http.get(`http://${domain}:3000/users`).then((response) => {
        this.users = response.body;
      });
    },
  };
</script>

<style lang='scss' scoped>
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/settings.scss';
</style>
