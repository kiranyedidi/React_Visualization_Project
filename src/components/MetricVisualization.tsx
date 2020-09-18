import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useQuery } from 'urql';
import moment from 'moment';

interface MetricVisualizationProps {
  metrics: string[];
}

const query = `
query ($input: [MeasurementQuery]) {
    getMultipleMeasurements(input: $input) {
      measurements {
        metric
        value
        unit
        at
      }
    }
  }
`;
const pastHalfAnHour = moment()
  .subtract(30, 'minutes')
  .valueOf();
const MetricVisualization: React.FC<MetricVisualizationProps> = ({ metrics }) => {
  const [results] = useQuery({
    query,
    variables: {
      input: metrics.map(metric => ({
        metricName: metric,
        after: pastHalfAnHour,
      })),
    },
  });
  const { fetching, data } = results;

  if (fetching || !data) {
    return null;
  }

  const chartData = data.getMultipleMeasurements;
  const units = new Set<string>();
  const chartMap = new Map<number, any>();
  const metricUnitMap = new Map<string, string>();
  chartData.forEach((data: any) => {
    const measurements = data.measurements;
    const firstMetric = measurements[0];
    metricUnitMap.set(firstMetric.metric, firstMetric.unit);
    measurements.forEach((measurement: any) => {
      if (!units.has(measurement.unit)) {
        units.add(measurement.unit);
      }
      const newData = { [measurement.metric]: measurement.value };
      if (chartMap.has(measurement.at)) {
        // Append to existing data
        const existing = chartMap.get(measurement.at);
        chartMap.set(measurement.at, { ...existing, ...newData });
      } else {
        chartMap.set(measurement.at, newData);
      }
    });
  });

  const charDataFinal = Array.from(chartMap).reduce(
    (newArray, cd) => {
      return [...newArray, { at: cd[0], ...cd[1] }];
    },
    [] as any,
  );

  return (
    <LineChart
      width={1200}
      height={500}
      data={charDataFinal}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis tickFormatter={value => moment(value).format('hh:mm')} dataKey="at" />
      {Array.from(units).map((unit: string) => (
        <YAxis key={unit} yAxisId={unit} label={unit} />
      ))}
      <Tooltip labelFormatter={label => moment(label).format('MMM DD YYYY h:mm:ss a')} />
      <Legend />
      {metrics.map(metric => (
        <Line
          key={metric}
          yAxisId={metricUnitMap.get(metric)}
          dot={false}
          name={metric}
          type="linear"
          dataKey={metric}
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      ))}
    </LineChart>
  );
};

export default React.memo(MetricVisualization);
