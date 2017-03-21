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
      renderChart(data) {
        this.chart = new Chart(
          `chart-${this.id}`, {
            type: 'line',
            data: {
              labels: new Array((this.days + 1) + Math.round(this.days / 7)).fill(''),
              datasets: [{
                data: [undefined, ...data],
                fill: false,
                backgroundColor: 'transparent',
                pointBorderColor: 'transparent',
                pointBorderWidth: 'transparent',
                borderColor: `hsl(${(this.id + 1) * 50}, 100%, 85%)`,
                borderWidth: '7',
                lineTension: 0.1,
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
                    max: ((Math.max(...data) + (Math.max(...data) / 10)) || 5),
                    min: ((((Math.min(...data)) - (Math.max(...data))) / 5) || -1),
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
                ticks.max = ((Math.max(...newData) + (Math.max(...newData) / 10)) || 5);
                ticks.min = ((((Math.min(...newData)) - (Math.max(...newData))) / 5) || -1);
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
