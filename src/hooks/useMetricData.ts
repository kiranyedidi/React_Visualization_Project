import { useSubscription } from 'urql';
import { useRef } from 'react';

interface MetricDataType {
  metric: string;
  value: number;
  at: number;
}

const newMetricData = `
  subscription MetricData {
    newMeasurement {
        metric
        value
        at
      }
  }
`;

const handleSubscription = (prev: any, data: any) => {
  // console.log(prev);
  return data.newMeasurement;
};

export const useMetricData = (metric?: string) => {
  const prev = useRef<MetricDataType>();
  const [response] = useSubscription({ query: newMetricData }, handleSubscription);
  if (response && response.data && (!metric || response.data.metric === metric)) {
    prev.current = response.data;
    return response.data;
  }
  return prev.current;
};
