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
      <span class="insight" @click="log(groupByDate(objectsSinceDate(users, 'lastMessageDate'), 'lastMessageDate'))">
        <Chart class="chart" :color="'4d9bd8'" :id="1" :days=days :chartData="groupByDate(objectsSinceDate(users, 'lastMessageDate'), 'lastMessageDate')" />
        <span class='number'>{{ objectsSinceDate(users, 'lastMessageDate').length }}</span>
        <span class='statWrapper'>
          <span class='stat'>All Chats</span>
          <span class='statDescription'>Number of users who have initiated a chat</span>
        </span>
      </span>
      <span class="insight" @click="log(closedChats())">
        <Chart class="chart" :color="'956bc3'" :id="2" :days=days :chartData="closedChats()" />
        <span class='number'>{{ users.filter(u => u.closed).length }}</span>
        <span class='statWrapper'>
          <span class='stat'>Closed Chats</span>
          <span class='statDescription'>Number of closed chats</span>
        </span>
      </span>
      <span class="insight" @click="log(groupByDate(objectsSinceDate(messages())))">
        <Chart class="chart" :color="'d95a88'" :id="3" :days=days :chartData="groupByDate(objectsSinceDate(messages()))" />
        <span class='number'>{{ objectsSinceDate(messages()).length }}</span>
        <span class='statWrapper'>
          <span class='stat'>New Messages</span>
          <span class='statDescription'>Number of new messages</span>
        </span>
      </span>
      <!-- <span class="insight" @click="log(randomData())">
        <Chart class="chart" :id="4" :days=days :chartData="randomData()" />
        <span class='number'>{{ 0 }}</span>
        <span class='statWrapper'>
          <span class='stat'>New Sessions</span>
          <span class='statDescription'>Number of new sessions</span>
        </span>
      </span> -->
      <span class="insight" @click="log(userReplyRateData())">
        {{log(userReplyRateData())}}
        <Chart class="chart" :color="'e6a56e'" :id="5" :days=days :chartData="userReplyRateData()" />
        <span class='number'>
          {{ Math.round(objectsSinceDate(users).length / objectsSinceDate(allUsers).length * 100) || 0 }}%
        </span>
        <span class='statWrapper'>
          <span class='stat'>Active User Rate</span>
          <span class='statDescription'>Percentage of users who begin a chat</span>
        </span>
      </span>
      <span class="insight" @click="log(averageResponseTimeByDay())">
        <Chart class="chart" :color="'3dc06c'" :id="6" :days=days :chartData="averageResponseTimeByDay()" />
        <span class='number'>{{ formatTime(averageResponseTime()) }}</span>
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
      formatTime(seconds) {
        const format = (length, word) => {
          const interval = Math.floor(seconds / length);
          return interval >= 1 ? `${interval} ${word}${interval > 1 ? 's' : ''}` : false;
        };
        return format(2592000, 'month') || format(604800, 'week') || format(86400, 'day') || format(3600, 'hour') || format(60, 'minute');
      },
      log(data) {
        console.log(data); //eslint-disable-line
      },
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
      userReplyRateData() {
        const allUsersByDay = this.groupByDate(this.objectsSinceDate(this.allUsers));
        const activeUsersByDay = this.groupByDate(this.objectsSinceDate(this.users));
        return activeUsersByDay.map((count, i) => { //eslint-disable-line
          if (count === 0 && allUsersByDay[i] === 0) return 100;
          return ((count * 100) / allUsersByDay[i]) || 0;
        });
      },
      closedChats() {
        const closedChats = this.users.filter(u => u.closed);
        return this.groupByDate(this.objectsSinceDate(closedChats, 'closedDate'), 'closedDate');
      },
      allThreads() {
        const removeFollowups = (msgs) => { //eslint-disable-line
          return msgs.filter((m, i) => i !== 0 && m.sender !== msgs[i - 1].sender);
        };

        return this.objectsSinceDate(this.users).map((user) => { //eslint-disable-line
          const replies = removeFollowups(user.messages);
          const userReplies = replies.filter(reply => reply.sender === 'customer');
          return userReplies.map((reply) => {
            let end = replies[(replies.indexOf(reply) + 1)];
            if (!end) end = { createdAt: moment() };
            return { start: reply.createdAt, end: end.createdAt };
          });
        });
      },
      averageResponseTime(daily) {
        const replyTimes = this.allThreads().map((userThreads) => { //eslint-disable-line
          return userThreads.map((thread) => { //eslint-disable-line
            return {
              start: thread.start,
              end: thread.end,
              difference: moment(thread.end).diff(moment(thread.start), 'seconds'),
            };
          });
        });
        const flattenedTimes = [].concat(...replyTimes);
        if (daily) return flattenedTimes;
        if (replyTimes.length === 0) return 0;
        const differences = flattenedTimes.map(x => x.difference);
        return Math.floor(differences.reduce((a, b) => a + b) / flattenedTimes.length);
      },
      averageResponseTimeByDay() {
        const groups = {};
        new Array(this.days).fill('').forEach((_, i) => {
          groups[moment().subtract(i, 'days').format('YYYY-MMM-D')] = [];
        });
        this.averageResponseTime(true).forEach((object) => {
          if (groups[moment(object.end).format('YYYY-MMM-D')]) {
            groups[moment(object.end).format('YYYY-MMM-D')].push(object.difference);
          }
        });
        return Object.values(groups).reverse().map((day) => {
          if (day.length > 0) {
            return day.reduce((a, b) => a + b) / day.length;
          }
          return 0;
        });
      },
      objectsSinceDate(objects, objectParam) {
        const minDate = moment().subtract(this.days, 'days');
        const param = (objectParam || 'createdAt');
        return objects.filter((object) => { // eslint-disable-line
          return moment(object[param]).isAfter(minDate);
        });
      },
      groupByDate(collection, dateParam) {
        const groups = {};
        const param = (dateParam || 'createdAt');

        new Array(this.days).fill('').forEach((_, i) => {
          groups[moment().subtract(i, 'days').format('YYYY-MMM-D')] = 0;
        });

        collection.forEach((object) => {
          if (parseInt(groups[moment(object[param]).format('YYYY-MMM-D')], 10) >= 0) {
            groups[moment(object[param]).format('YYYY-MMM-D')] += 1;
          } else {
            groups[moment(object[param]).format('YYYY-MMM-D')] = 0;
          }
        });

        return Object.values(groups).reverse();
      },
    },
    beforeMount() {
      const production = process.env.NODE_ENV === 'production'
      // const production = false;
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
