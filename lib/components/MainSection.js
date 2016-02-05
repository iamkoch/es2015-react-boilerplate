import React from 'react';

export default class MainSection extends React.Component {
  static propTypes = {
    items: React.PropTypes.object.isRequired,
  };

  render() {
    const lis = this.props.items.map(x => <li>{x.term}</li>);

    return (
        <main>
          <ul>
            {lis}
          </ul>
        </main>
    );
  }
}
