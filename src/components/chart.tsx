import { Chart, ArcElement, CategoryScale, registerables } from "chart.js";

Chart.register(...registerables, ArcElement, CategoryScale);

let chartInstance: Chart | null = null;

function renderChart(canvas: HTMLCanvasElement, config: any) {
  if (chartInstance) {
    chartInstance.destroy(); // Destroy existing chart
  }
  chartInstance = new Chart(canvas, config);
}

function cleanupChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

// ...existing code...
