import React from 'react';

import {
				Row,
				Col
			} from 'react-bootstrap';

import RecordIndicator from './RecordIndicator.js';
import SceneList from './SceneList.js';

function OBSClient(props) {
	console.log(props);
	return (
		<React.Fragment>
			<Row>
			<Col>
				{props.name} - {props.state}
			</Col>
			</Row>
			<Row>
			<Col>
				<RecordIndicator index={props.index}
													recording={props.recording}
													onClicked={props.onRecordingClicked}/>
			</Col>
			<Col class='col-10'>
				<SceneList index={props.index}
									sceneList={props.scenes}
									currentScene={props.currentScene}
									onClicked={props.onSceneClicked}/>
			</Col>
			</Row>
		</React.Fragment>
	);
}

export default OBSClient;
