<template>
  <div class="wrapper">
    <div class="analyticsHeader">
      Analytics for {{ path() }}
      <div class='filter'>
        <span @click="days = 7" :class="{time: true, active: (days === 7)}">7 days</span>
        <span @click="days = 30" :class="{time: true, active: (days === 30)}">30 days</span>
        <span @click="days = 120" :class="{time: true, active: (days === 120)}">120 days</span>
      </div>
    </div>
    <div class="analytics">
      <span class="insight">
        <Chart class="chart" :id="1" :days=days :chartData="groupByDate(objectsSinceDate(allUsers))" />
        <span class='number'>{{ objectsSinceDate(allUsers).length }}</span>
        <span class='statWrapper'>
          <span class='stat'>New Users</span>
          <span class='statDescription'>Total number of new users</span>
        </span>
      </span>
      <span class="insight">
        <Chart class="chart" :id="2" :days=days :chartData="groupByDate(objectsSinceDate(messages()))" />
        <span class='number'>{{ messages().length }}</span>
        <span class='statWrapper'>
          <span class='stat'>New Messages</span>
          <span class='statDescription'>Total number of new messages</span>
        </span>
      </span>
      <span class="insight">
        <Chart class="chart" :id="3" :days=days :chartData="userReplyRateData()" />
        <span class='number'>{{ Math.round(users.length / allUsers.length * 100) }}%</span>
        <span class='statWrapper'>
          <span class='stat'>Active User Rate</span>
          <span class='statDescription'>Users who reply to an auto message</span>
        </span>
      </span>
      <span class="insight">
        <!-- <Chart class="chart" :id="4" :days=days :chartData="agentReplyRateData()" /> -->
        <span class='number'>{{ 0 }}</span>
        <span class='statWrapper'>
          <span class='stat'>???</span>
          <span class='statDescription'>???????????????</span>
        </span>
      </span>
      <span class="insight">
        <Chart class="chart" :id="5" :days=days :chartData="closedChats()" />
        <span class='number'>{{ users.filter(u => u.closed).length }}</span>
        <span class='statWrapper'>
          <span class='stat'>Closed Chats</span>
          <span class='statDescription'>Total number of closed chats</span>
        </span>
      </span>
      <span class="insight">
        <Chart class="chart" :id="6" :days=days :chartData="randomData()" />
        <span class='number'>{{ 0 }}</span>
        <span class='statWrapper'>
          <span class='stat'>Average Response Time</span>
          <span class='statDescription'>Average Response Time</span>
        </span>
      </span>
    </div>
  </div>
</template>

<script>
  import moment from 'moment';
  import Chart from './Chart';

  export default {
    name: 'analytics',
    components: { Chart },
    data() {
      return {
        users: [],
        allUsers: [],
        days: 7,
      };
    },
    methods: {
      randomData() {
        const empty = new Array(this.days);
        return empty.fill(1).map(() => Math.floor(Math.random() * 10));
      },
      messages() {
        return [].concat(...this.users.map(user => user.messages.filter(msg => msg.sender === 'customer')));
      },
      path() {
        return window.location.hostname; // eslint-disable-line
      },
      agentReplyRate() {
        const repliedUsers = this.users.filter((user) => {
          const replies = user.messages.filter(msg => msg.sender === 'company');
          return (replies.length > 1);
        });
        return Math.round((repliedUsers.length * 100) / this.users.length);
      },
      userReplyRateData() {
        const allUsersByDay = this.groupByDate(this.objectsSinceDate(this.allUsers));
        const activeUsersByDay = this.groupByDate(this.objectsSinceDate(this.users));
        return activeUsersByDay.map((count, i) => { //eslint-disable-line
          if (count === 0 && allUsersByDay[i] === 0) return 100;
          return (count * 100) / allUsersByDay[i];
        });
      },
      closedChats() {
        const closedChats = this.users.filter(u => u.closed);
        return this.groupByDate(this.objectsSinceDate(closedChats));
      },
      objectsSinceDate(objects) {
        const minDate = moment().subtract(this.days, 'days');
        return objects.filter((object) => { // eslint-disable-line
          return moment(object.createdAt).isAfter(minDate);
        });
      },
      groupByDate(collection) {
        const groups = {};

        new Array(this.days).fill('').forEach((_, i) => {
          groups[moment().subtract(i, 'days').format('YYYY-MMM-D')] = 0;
        });

        collection.forEach((object) => {
          groups[moment(object.createdAt).format('YYYY-MMM-D')] += 1;
        });

        return Object.values(groups).reverse();
      },
    },
    beforeMount() {
      const domain = (process.env.NODE_ENV === 'production') ? '174.138.71.184' : 'localhost';
      this.$http.get(`http://${domain}:3000/users`).then((response) => {
        this.users = response.body;
      });
      this.$http.get(`http://${domain}:3000/allUsers`).then((response) => {
        this.allUsers = response.body.users;
      });
    },
  };
</script>

<style lang='scss' scoped>
  @import '../assets/sass/variables.scss';
  @import '../assets/sass/analytics.scss';
</style>
