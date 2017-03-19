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
        <Chart class="chart" :id="3" :days=days :chartData="randomData()" />
        <span class='number'>{{ Math.round(users.length / allUsers.length * 100) }}%</span>
        <span class='statWrapper'>
          <span class='stat'>User Reply Rate</span>
          <span class='statDescription'>Users who reply to an auto message</span>
        </span>
      </span>
      <span class="insight">
        <Chart class="chart" :id="4" :days=days :chartData="randomData()" />
        <span class='number'>{{ agentReplyRate() }}%</span>
        <span class='statWrapper'>
          <span class='stat'>Agent Reply Rate</span>
          <span class='statDescription'>Percentage of users who get a reply from an agent</span>
        </span>
      </span>
      <span class="insight">
        <Chart class="chart" :id="5" :days=days :chartData="randomData()" />
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
      objectsSinceDate(objects) {
        const today = moment();
        const minDate = today.subtract(this.days, 'days');
        return objects.filter((object) => { // eslint-disable-line
          return moment(object.createdAt).isAfter(minDate);
        });
      },
      groupByDate(collection) {
        const today = moment();
        const groups = {};
        groups[today.format('dddd, MMMM Do YYYY')] = 0;
        const days = new Array(this.days);

        days.fill('foo').map(() => {
          groups[today.subtract(1, 'days').format('dddd, MMMM Do YYYY')] = 0;
          return true;
        });

        collection.map((object) => {
          const day = moment(object.createdAt).format('dddd, MMMM Do YYYY');
          groups[day] += 1;
          return groups[day];
        });

        const sortedGroups = Object.keys(groups).sort((day, nextDay) => { //eslint-disable-line
          return day - nextDay;
        });
        return sortedGroups.map(sg => groups[sg]).reverse();
      },
      randomColor() {
        return `hsl(${Math.floor(Math.random() * 360)}, 100%, 87.5%)`;
      },
    },
    beforeMount() {
      const production = process.env.NODE_ENV === 'production';
      const domain = production ? '174.138.71.184' : 'localhost';
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
