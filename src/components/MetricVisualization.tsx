import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useQuery } from 'urql';
import moment from 'moment';

interface MetricVisualizationProps {
  metric: string;
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
const MetricVisualization: React.FC<MetricVisualizationProps> = ({ metric }) => {
  console.log(pastHalfAnHour);
  const [result] = useQuery({
    query,
    variables: {
      input: [
        {
          metricName: metric,
          after: pastHalfAnHour,
        },
      ],
    },
  });
  const { fetching, data } = result;

  useEffect(() => {
    console.log('result is changing');
  }, [result]);

  if (fetching || !data) {
    return null;
  }

  const chartData = data.getMultipleMeasurements[0].measurements;
  const unit = chartData[0].unit;

  return (
    <LineChart
      width={500}
      height={300}
      data={chartData}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis tickFormatter={value => moment(value).format('hh:mm')} dataKey="at" />
      <YAxis label={unit} />
      <Tooltip labelFormatter={label => moment(label).format('MMM DD YYYY h:mm:ss a')} />
      <Legend />
      <Line dot={false} name={metric} type="linear" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
    </LineChart>
  );
};

export default React.memo(MetricVisualization);
