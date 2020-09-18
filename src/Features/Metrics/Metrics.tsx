import React, { useEffect, useState, useCallback } from 'react';
import Select from '@material-ui/core/Select';
import { MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { useDispatch, useSelector } from 'react-redux';
import { actions } from './reducer';
import { useQuery } from 'urql';

import { IState } from '../../store';
import MetricTile from '../../components/MetricTile';
import MetricVisualization from '../../components/MetricVisualization';

const useStyles = makeStyles({
  select: {
    width: '80%',
  },
  grid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px !important',
  },
});

const query = `
query {
    getMetrics
}
`;

const getMetrics = (state: IState) => state.metrics;

const Metrics: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const metrics = useSelector(getMetrics);

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const [result] = useQuery({ query });
  const { fetching, data, error } = result;

  useEffect(() => {
    if (error) {
      dispatch(actions.metricsApiErrorReceived({ error: error.message }));
      return;
    }
    if (!data) return;
    const { getMetrics } = data;
    dispatch(actions.metricsDataRecevied(getMetrics));
  }, [dispatch, data, error]);

  const handleChange = useCallback(event => {
    setSelectedMetrics(event.target.value);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  if (fetching || !data) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid className={classes.grid} item xs={12}>
        <Select
          className={classes.select}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          multiple
          displayEmpty
          renderValue={value =>
            value instanceof Array && value.length > 0 && typeof value[0] === 'string' ? (
              <span>{value.join(', ')}</span>
            ) : (
              <span>Select...</span>
            )
          }
          value={selectedMetrics}
          onChange={handleChange}
        >
          {metrics.map(metric => (
            <MenuItem key={metric} value={metric}>
              {metric}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      {selectedMetrics.map(selectedMetric => (
        <Grid key={selectedMetric} item xs={2}>
          <Grid className={classes.grid} container spacing={3}>
            <Grid className={classes.grid} item xs={12}>
              <MetricTile metric={selectedMetric} />
            </Grid>
          </Grid>
        </Grid>
      ))}
      {selectedMetrics.length > 0 && (
        <Grid className={classes.grid} item xs={12}>
          <MetricVisualization metrics={selectedMetrics} />
        </Grid>
      )}
    </Grid>
  );
};

export default Metrics;
