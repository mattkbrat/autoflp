import BarChart from './Bar';
import PieChart from './Pie';
import StackedBarChart from './StackedBar';
import { registerables, Chart as RegisteredChart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

RegisteredChart.register(...registerables);
RegisteredChart.register(ChartDataLabels);

export default RegisteredChart;

export { BarChart as Bar, PieChart as Pie, StackedBarChart as StackedBar };
