import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Chart = ({ type, data, title, className = '' }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
      },
    } : undefined,
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={options} />
      case 'bar':
        return <Bar data={data} options={options} />
      case 'doughnut':
        return <Doughnut data={data} options={options} />
      default:
        return <Bar data={data} options={options} />
    }
  }

  return (
    <div className={`chart-container ${className}`}>
      {renderChart()}
    </div>
  )
}

export default Chart