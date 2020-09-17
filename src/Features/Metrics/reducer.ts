import { createSlice, PayloadAction } from 'redux-starter-kit';

export type ApiErrorAction = {
  error: string;
};

export type Metrics = Array<string>;

const initialState: Metrics = [];

const slice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    metricsDataRecevied: (state, action: PayloadAction<Metrics>) => {
      state = action.payload;
      return state;
    },
    metricsApiErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
  },
});

export const reducer = slice.reducer;
export const actions = slice.actions;
