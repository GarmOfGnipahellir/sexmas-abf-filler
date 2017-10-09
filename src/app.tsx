import * as React from 'react';
import { Button } from '@blueprintjs/core';
import requestData from './sheets';

export interface State {
  barlagSheetID: string;
  personalSheetID: string;
}

export class App extends React.Component<any, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      barlagSheetID: '1T8mAeLsIIoxDmCLkllHiDlW80foFqNTC6jC8HB9qvbg',
      personalSheetID: '10ZaSuEAhxxuF9lgJPLcbVIk5KugkJCUvSTJFG89KxA4'
    }
  }

  handleRequest = () => {
    requestData(this.state.barlagSheetID, this.state.personalSheetID);
  }

  handleBarlagChange = (event: any) => {
    this.setState({
      barlagSheetID: event.target.value,
      personalSheetID: this.state.personalSheetID
    })
  }

  handlePersonalChange = (event: any) => {
    this.setState({
      barlagSheetID: this.state.barlagSheetID,
      personalSheetID: event.target.value
    })
  }

  render() {
    return (
      <div>
        <h3>Data order should be:</h3>
        <h6>Namn, Mail, Telefon, Presonnummer, Address, Postnummer</h6>
        <label className='pt-label'>
          Barlags Sheet 
          <span className='pt-text-muted'> (Required)</span>
          <input className='pt-input pt-fill' type='text' placeholder='Sheet ID' value={this.state.barlagSheetID} onChange={this.handleBarlagChange} />
        </label>
        <label className='pt-label'>
          Personal Sheet 
          <span className='pt-text-muted'> (Required)</span>
          <input className='pt-input pt-fill' type='text' placeholder='Sheet ID' value={this.state.personalSheetID} onChange={this.handlePersonalChange} />
        </label>
        <Button text='Request' onClick={this.handleRequest} />
      </div>
    );
  }
}
