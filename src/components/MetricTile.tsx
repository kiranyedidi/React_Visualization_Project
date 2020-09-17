import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useMetricData } from '../hooks/useMetricData';

interface MetricTileProps {
  metric: string;
}

const useStyles = makeStyles({
  metricContainer: {
    padding: '10px',
    backgroundColor: 'white',
    height: '100px',
    width: '200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  span: {
    display: 'block',
    padding: '5px',
    fontSize: '20px',
    fontWeight: 400,
  },
});

const MetricTile: React.FC<MetricTileProps> = ({ metric }) => {
  const metricData = useMetricData(metric);
  const classes = useStyles();

  return metricData ? (
    <div className={classes.metricContainer}>
      <span className={classes.span}>{metricData.metric}</span>
      <span className={classes.span}>{metricData.value}</span>
    </div>
  ) : null;
};

export default MetricTile;
