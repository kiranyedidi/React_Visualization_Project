import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useQuery } from 'urql';
import moment from 'moment';
import { useMetricData } from '../hooks/useMetricData';

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
  const [chartMap, setChartMap] = useState<Map<number, any>>(new Map());
  const [metricUnitMap, setMetricUnitMap] = useState<Map<string, string>>(new Map());
  const [units, setUnits] = useState<Set<string>>(new Set());

  const newData = useMetricData();
  const { fetching, data } = results;

  useEffect(() => {
    if (newData) {
      setChartMap(prevMap => {
        if (prevMap.has(newData.at)) {
          // Append to existing data
          const existing = prevMap.get(newData.at);
          prevMap.set(newData.at, { ...existing, ...newData });
        } else {
          prevMap.set(newData.at, newData);
        }
        return prevMap;
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!fetching && data) {
      const tempChartMap = new Map<number, any>();
      const tempMetricUnitMap = new Map<string, string>();
      const tempUnits = new Set<string>();

      const chartData = data.getMultipleMeasurements;
      chartData.forEach((data: any) => {
        const measurements = data.measurements;
        const firstMetric = measurements[0];
        tempMetricUnitMap.set(firstMetric.metric, firstMetric.unit);
        measurements.forEach((measurement: any) => {
          if (!tempUnits.has(measurement.unit)) {
            tempUnits.add(measurement.unit);
          }
          const newData = { [measurement.metric]: measurement.value };
          if (tempChartMap.has(measurement.at)) {
            // Append to existing data
            const existing = tempChartMap.get(measurement.at);
            tempChartMap.set(measurement.at, { ...existing, ...newData });
          } else {
            tempChartMap.set(measurement.at, newData);
          }
          setChartMap(tempChartMap);
          setMetricUnitMap(tempMetricUnitMap);
          setUnits(tempUnits);
        });
      });
    }
  }, [fetching, data]);

  if (fetching || !data) {
    return null;
  }

  const charDataFinal = Array.from(chartMap).reduce(
    (newArray, cd) => {
      return [...newArray, { at: cd[0], ...cd[1] }];
    },
    [] as any,
  );

  return charDataFinal.length > 0 ? (
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
  ) : null;
};

export default React.memo(MetricVisualization);
