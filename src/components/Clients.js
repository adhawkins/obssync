import React from 'react';

import OBSClient from './OBSClient.js';

function Clients(props) {
  const clientList = props.clients.length ? props.clients.map((item, key) =>
          <OBSClient index={key}
                key={key}
                name={item.config.name}
                address={item.config.address}
                state={item.state.state}
                scenes={item.state.scenes}
                currentScene={item.state.currentScene}
                //onSceneClicked={changeSceneClicked}
                //onRecordingClicked={recordingClicked}
                recording={item.state.recording}/>
    ) : (
      <React.Fragment>
        No clients
      </React.Fragment>
    )

	return (
      <React.Fragment>
		{clientList}
      </React.Fragment>
	);
}

export default Clients;
