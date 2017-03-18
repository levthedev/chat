<template>
  <div class="analytics">
    <span class="insight totalUsers">USERS: {{ allUsersLength }}</span>
    <span class="insight totalUsers">USERS WITH MESSGAES: {{ users.length }}</span>
    <!-- <span class="insight newMessages">NEW MESSAGES{{ messages.length }}</span> -->
    <!-- <span class="insight closedMessages">{{ messages.filter(m => m.user.closed)}}</span> -->
    <div class="stats">
      <span class="insight">{{'responsetime'}}</span>
      <span class="insight">{{'responsetime'}}</span>
      <span class="insight">{{'responsetime'}}</span>
      <span class="insight">{{'responsetime'}}</span>
    </div>
    <!-- number who engaged with chat
    number of new messages per day/week/month
    number of closed messages per day/week/month
    average/min/max/median response time


    number who engaged with chat and came back
    those who didn't engage and came back
    average session length for chat users vs non -->
  </div>
</template>

<script>
  export default {
    name: 'analytics',
    data() {
      return {
        users: [],
        allUsersLength: 0,
      };
    },
    beforeMount() {
      const production = process.env.NODE_ENV === 'production';
      const domain = production ? '174.138.71.184' : 'localhost';
      this.$http.get(`http://${domain}:3000/users`).then((response) => {
        this.users = response.body;
      });
      this.$http.get(`http://${domain}:3000/allUsersLength`).then((response) => {
        this.allUsersLength = response.body;
      });
    },
  };
</script>

<style lang='scss' scoped>
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/analytics.scss';
</style>
