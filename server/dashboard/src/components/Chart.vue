<template>
  <div class="chart">
    <canvas :id="'chart-' + this.id"></canvas>
  </div>
</template>

<script>
  import Chart from 'chart.js';

  export default {
    name: 'Chart',
    props: ['chartData', 'days', 'id'],
    methods: {
      xLabels() {
        const padding = Math.round(this.days / 7);
        const emptyLabels = new Array(this.days + padding);
        return emptyLabels.fill('');
      },
      renderChart(data) {
        this.chart = new Chart(
          `chart-${this.id}`, {
            type: 'line',
            data: {
              labels: this.xLabels(),
              // labels: [1, 2, 3, 4, 5, 6, 7],
              datasets: [{
                data,
                fill: false,
                backgroundColor: 'transparent',
                pointBorderColor: 'transparent',
                pointBorderWidth: 'transparent',
                borderColor: `hsl(${(this.id - 1) * 60}, 100%, 87.5%)`,
                borderWidth: '7',
                lineTension: 0,
                borderJoinStyle: 'round',
                borderCapStyle: 'round',
                radius: 0,
              }],
            },
            options: {
              fill: false,
              scales: {
                yAxes: [{
                  display: false,
                  ticks: {
                    max: (Math.max(...data) + 1),
                    min: (((Math.min(...data)) - (Math.max(...data))) / 5),
                  },
                }],
                xAxes: [{ display: false }],
              },
              legend: { display: false },
            },
          },
        );
        this.chart.generateLegend();
      },
    },
    mounted() {
      this.renderChart(this.chartData);
    },
    watch: {
      chartData: {
        handler(newData, oldData) {
          if (oldData) {
            if (oldData.length === newData.length) {
              newData.forEach((data, i) => {
                this.chart.data.datasets[0].data[i] = data;
              });
              const ticks = this.chart.options.scales.yAxes[0].ticks;
              if (ticks) {
                ticks.max = (Math.max(...newData) + 1);
                ticks.min = (((Math.min(...newData)) - (Math.max(...newData))) / 5);
              }
              this.chart.update();
            } else {
              this.chart.destroy();
              this.renderChart(this.chartData);
            }
          }
        },
      },
    },
  };
</script>

<style scoped>
  .chart {
    width: 275px;
    /*width: 91%;
    height: 85%;*/
    height: 150px;
    opacity: 0.5;
  }
</style>
