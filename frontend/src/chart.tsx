import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, registerables, ChartConfiguration } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, ...registerables); // Ensure all components are registered

let chartInstance: ChartJS | null = null;

function renderChart(ctx: CanvasRenderingContext2D, config: ChartConfiguration) {
  if (chartInstance) {
    chartInstance.destroy(); // Destroy the previous chart instance
  }
  chartInstance = new ChartJS(ctx, config); // Create a new chart instance
}

export { renderChart };