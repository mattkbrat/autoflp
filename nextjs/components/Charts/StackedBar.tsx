import { useEffect } from 'react';

import RegisteredChart from '.';
import { ChartTypeRegistry } from 'chart.js';

import { Box } from '@chakra-ui/react';
import collapseArray from '@/utils/collapseArray';

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
  backgroundColor: string;
};

type data = {
  labels: string[];
  datasets: dataset[];
};

const defaultConfig = {
  type: 'bar',
  data: data,
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Bar Chart - Stacked',
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  },
};

function generateConfig(dataset: data, title: string, options: any = {}) {
  return {
    type: 'bar' as keyof ChartTypeRegistry | 'line',
    data: {
      labels: collapseArray(dataset?.labels || defaultConfig.data.labels),
      datasets: dataset?.datasets || defaultConfig.data.datasets,
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: title || 'Chart.js Bar Chart - Stacked',
        },
        datalabels: {
          // backgroundColor: function (context) {
          //   return context.dataset.backgroundColor;
          // },
          display: 'auto',
          color: 'white',
          font: {
            weight: 'lighter',
          },
          formatter: Math.round,
          // padding: 6,
        },
      },
      scales: {
        x: {
          stacked: true,
        },
      },
    },
  };
}

function StackedBarChart({
  data,
  title,
  options,
  id,
}: {
  data: data;
  title: string;
  options?: any;
  id: string;
}) {
  useEffect(() => {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!id) {
      return;
    }
    // Chart with ID '0' must be destroyed before the canvas with ID 'myChart' can be reused.
    const myChart = new RegisteredChart(ctx, generateConfig(data, title, options));

    return () => {
      myChart.destroy();
    };
  }, [data, id, options, title]);

  if (!id) {
    return (
      <Box
        outline={'1px solid red'}
        h="min-content"
        p={2}
        w="full"
        textAlign="center"
      >
        <p>Chart ID not found</p>
      </Box>
    );
  }

  return (
    <Box
      position={'relative'}
      id="stackedBarChartContainer"
      w="50%"
      h="full"
      // maxH={{ base: "100px", lg: "1000px" }}
      //  h={{ base: "min-content", lg: "max-content" }}
    >
      <canvas id={id} />
    </Box>
  );
}

export default StackedBarChart;
