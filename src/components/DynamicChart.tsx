'use client'

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, QueryResult } from '@/types'

interface DynamicChartProps {
  config: ChartConfig
  data: QueryResult['data']
  className?: string
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
]

export function DynamicChart({ config, data, className }: DynamicChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{config.title || 'Chart'}</CardTitle>
          <CardDescription>Keine Daten verfügbar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Keine Daten zum Anzeigen
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      if (value > 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      }
      if (value > 1000) {
        return `${(value / 1000).toFixed(1)}k`
      }
      return value.toLocaleString()
    }
    return value
  }

  const formatTooltipValue = (value: any, name: string) => {
    return [formatValue(value), name]
  }

  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={config.xAxis} 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelStyle={{ color: '#374151' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={config.yAxis} 
                stroke={COLORS[0]} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={config.xAxis} 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelStyle={{ color: '#374151' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={config.yAxis || 'value'} 
                stroke={COLORS[0]} 
                fill={COLORS[0]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={config.xAxis} 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelStyle={{ color: '#374151' }}
              />
              <Legend />
              <Bar 
                dataKey={config.yAxis} 
                fill={COLORS[0]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        const pieData = data.map((item, index) => ({
          ...item,
          value: config.dataKey ? item[config.dataKey] : Object.values(item)[1],
          name: config.xAxis ? item[config.xAxis] : Object.values(item)[0]
        }))

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [formatValue(value), 'Wert']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={config.xAxis} 
                tick={{ fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <YAxis 
                dataKey={config.yAxis}
                tick={{ fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelStyle={{ color: '#374151' }}
              />
              <Legend />
              <Scatter 
                dataKey={config.yAxis}
                fill={COLORS[0]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Unbekannter Chart-Typ: {config.type}
          </div>
        )
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{config.title || `${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Chart`}</CardTitle>
        <CardDescription>
          {data.length} Datenpunkte • {config.type === 'pie' ? 'Verteilung' : `${config.xAxis} vs ${config.yAxis}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
} 