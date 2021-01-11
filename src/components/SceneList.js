import React from 'react';

import { Button } from 'react-bootstrap';

function SceneList(props) {
	const items = props.sceneList.length ? props.sceneList.map((item, key) =>
			<Button className={props.currentScene===item ? "btn-success" : "btn-secondary"}
							onClick = {e => props.onClicked(props.index, item)}>
								{item}&nbsp;
			</Button>
	) : (
			<Button>empty</Button>
	);

	return (
		<React.Fragment>
			{items}
		</React.Fragment>
	);
}

export default SceneList;
