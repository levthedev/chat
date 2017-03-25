<template>
  <div class="chart">
    <canvas :id="'chart-' + this.id"></canvas>
  </div>
</template>

<script>
  import Chart from 'chart.js';

  export default {
    name: 'Chart',
    props: ['chartData', 'days', 'id', 'color'],
    methods: {
      renderChart(data) {
        const cleanData = data.filter(n => !isNaN(n));
        this.chart = new Chart(
          `chart-${this.id}`, {
            type: 'line',
            data: {
              labels: new Array((cleanData.length + 1) + Math.round(cleanData.length / 7)).fill(''),
              datasets: [{
                data: [undefined, ...data],
                fill: false,
                backgroundColor: 'transparent',
                pointBorderColor: 'transparent',
                pointBorderWidth: 'transparent',
                borderColor: `#${this.color}`,
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
                    max: ((Math.max(...cleanData) + (Math.max(...cleanData) / 10)) || 5),
                    min: ((((Math.min(...cleanData)) - (Math.max(...cleanData))) / 5) || -1),
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
          const cleanData = newData.filter(n => !isNaN(n));
          if (oldData) {
            if (oldData.length === newData.length) {
              newData.forEach((data, i) => {
                this.chart.data.datasets[0].data[i] = data;
              });
              const ticks = this.chart.options.scales.yAxes[0].ticks;
              if (ticks) {
                ticks.max = ((Math.max(...cleanData) + (Math.max(...cleanData) / 10)) || 5);
                ticks.min = ((((Math.min(...cleanData)) - (Math.max(...cleanData))) / 5) || -1);
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
