import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MainSection from './MainSection';
import WorkmateStore from '../stores/WorkmateStore';

function getState() {
  return { items: WorkmateStore.getAll() };
}

export default class WorkmatesApp extends React.Component {
  constructor(props) {
    super(props);

    WorkmateStore.addChangeListener(() => { this._onChange(); });
  }

  state = getState();

  componentWillUnmount() {
    WorkmateStore.removeChangeListener(() => { this._onChange(); });
  }

  _onChange() {
    this.setState(getState());
  }

  render() {
    return (
        <div>
          <Header />
          <MainSection
            items={this.state.items}
          />
          <Footer />
        </div>
    );
  }
}
