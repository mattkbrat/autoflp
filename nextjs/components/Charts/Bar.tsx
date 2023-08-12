import { useEffect, useState } from 'react';

import RegisteredChart from '.';

// 20 random labels
const randomLabels = [...Array(20)].map(() =>
  Math.random().toString(36).substring(7),
);

function BarChart() {
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    // Chart with ID '0' must be destroyed before the canvas with ID 'myChart' can be reused.
    const myChart = new RegisteredChart(ctx, {
      type: 'bar',
      data: {
        labels: randomLabels,
        datasets: [
          {
            label: '# of Votes',
            data: [...Array(20)].map(() => Math.floor(Math.random() * 100)),
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      myChart.destroy();
    };
  }, [reload]);

  useEffect(() => {
    const interval = setInterval(() => {
      setReload(!reload);
    }, 500);
    return () => clearInterval(interval);
  }, [reload]);

  return <canvas id="myChart" width="400" height="400"></canvas>;
}

export default BarChart;

// Watch the chart update every 500ms.
// It's a hoot! 🤣

// q: Am I a nerd
// a: Yes
