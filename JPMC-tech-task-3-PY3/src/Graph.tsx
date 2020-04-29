import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float', // needed for calcuting the ratios
      price_def: 'float',  // needed for calculating the ratios
      ratio: 'float',   // this will show the ratio between stocks
      timestamp: 'date',  // calcuation is w.r.t time
      upper_bound: 'float',  // the upper threshold
      lower_bound: 'float',  // the lower threshold
      trigger_alert: 'float',  // the alert when the correlations starts become weak
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      // now we don't need column-pivots , as now we are tracking ratios
      elem.load(this.table);
      elem.setAttribute('view', 'y_line'); // this is the view
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'float',
        price_def: 'float',
        ratio: 'float',
        timestamp: 'date',
        upper_bound: 'float',
        lower_bound: 'float',
        trigger_alert: 'float',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ]);
    }
  }
}

export default Graph;
