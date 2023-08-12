import { useEffect } from 'react';

import RegisteredChart from '.';
import { ChartTypeRegistry } from 'chart.js';

import { Box } from '@chakra-ui/react';
import { formatFinance } from '@/utils/finance';

const data = {
  //   backgroundColor: ["#080705", "#40434e", "#702632", "#912f40", "#b33a4f"],
  labels: ['Black', 'Dark Grey', 'Red', 'Pink', 'Light Pink'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [300, 50, 100, 40, 120],
      backgroundColor: ['#080705', '#40434e', '#702632', '#912f40', '#b33a4f'],
    },
    {
      label: 'Dataset 2',
      data: [100, 40, 120, 300, 50],
      backgroundColor: ['#702632', '#912f40', '#b33a4f', '#080705', '#40434e'],
    },
    {
      label: 'Dataset 3',
      data: [40, 120, 300, 50, 100],
      backgroundColor: ['#912f40', '#b33a4f', '#080705', '#40434e', '#702632'],
    },
  ],
};

type dataset = {
  label: string;
  data: number[];
  backgroundColor: string[];
};

type data = {
  labels: string[];
  datasets: dataset[];
};

const defaultConfig = {
  type: 'pie',
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Pie Chart',
      },
    },
  },
};

function generateConfig(dataset: data, title: string, options: any = {}) {
  return {
    type: 'pie' as keyof ChartTypeRegistry,
    data: {
      labels: dataset?.labels || defaultConfig.data.labels,
      datasets: dataset?.datasets || defaultConfig.data.datasets,
    },
    options: {
      ...options,
      responsive: true,
      toolTipEvents: ['mousemove', 'touchstart', 'touchmove'],
      showTooltips: true,
      // Set size
      onAnimationComplete: function () {
        this.showTooltip(this.segments, true);
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: title || 'Chart.js Pie Chart',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed !== null) {
                label += context.parsed;
              }
              return label;
            },
          },
        },
        datalabels: {
          formatter: (value, ctx) => {
            // Format as currency
            return formatFinance({
              num: value,
              withoutCurrency: true,
            });
            // let sum = 0;
            // const dataArr = ctx.chart.data.datasets[0].data;
            // dataArr.map((data) => {
            //   sum += data;
            // });
            // const percentage = ((value * 100) / sum).toFixed(2) + '%';
            // return percentage;
          },
          color: '#fff',
          backgroundColor: function (context) {
            return context.dataset.backgroundColor;
          },
        },
      },
    },
  };
}

function PieChart({
  data,
  title,
  options,
}: {
  data: data;
  title: string;
  options?: any;
}) {
  useEffect(() => {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    // Chart with ID '0' must be destroyed before the canvas with ID 'myChart' can be reused.
    const myChart = new RegisteredChart(ctx, generateConfig(data, title, options));

    return () => {
      myChart.destroy();
    };
  }, [data, options, title]);

  return (
    <Box w={{ base: 'full', md: '500px' }} h={{ base: 'full', md: '500px' }}>
      <canvas id="myChart"></canvas>
    </Box>
  );
}

export default PieChart;
