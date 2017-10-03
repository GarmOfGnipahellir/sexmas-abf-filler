import * as React from 'react';
import { Button } from '@blueprintjs/core';
import requestData from './sheets';

export class App extends React.Component<undefined, undefined> {
  handleRequest = () => {
    requestData('1T8mAeLsIIoxDmCLkllHiDlW80foFqNTC6jC8HB9qvbg', '10ZaSuEAhxxuF9lgJPLcbVIk5KugkJCUvSTJFG89KxA4');
  }

  render() {
    return (
      <div>
        <label className='pt-label'>
          Barlags Sheet 
          <span className='pt-text-muted'> (Required)</span>
          <input className='pt-input' type="text" placeholder="Sheet ID" />
        </label>
        <label className='pt-label'>
          Personal Sheet 
          <span className='pt-text-muted'> (Required)</span>
          <input className='pt-input' type="text" placeholder="Sheet ID" />
        </label>
        <Button text='Request' onClick={this.handleRequest} />
      </div>
    );
  }
}
