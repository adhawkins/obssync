import React, { useState } from 'react';

import OBSConfig from './OBSConfig.js';

import {
          Form,
          Row,
          Col,
          Button
      	} from 'react-bootstrap';

function Config(props) {
	const [config, setConfig] = useState(props.config);

	function configChanged(key, name, value) {
		if (name && value) {
			let newConfig = [...config];
			if (newConfig.length === 0) {
				newConfig.push({
												key: key,
												name: key,
												config: {
																	key: key,
					                        name: '',
					                        address: '',
					                        port: 4444,
					                        password: ''
												},
	                      state: {
	                        state: 'Unknown',
	                        scenes: [],
	                        currentScene: "Unknown",
	                        recording: false
	                      }
											});
			}

			if (value!==newConfig[key].config[name]) {
				newConfig[key].config[name] = value;
				setConfig(newConfig);
			}
		}
	}

	function configDeleted(deleteKey) {
		let newConfig = config.filter((item, key) => {
			return item.config.key !== deleteKey;
		});

		setConfig(newConfig);
	}

	function addItem() {
		let newConfig = [...config];
		newConfig.push(
                    {
                      config: {
                        key: newConfig.length,
                        name: '',
                        address: '',
                        port: 4444,
                        password: ''
                      },
                      state: {
                        state: 'Unknown',
                        scenes: [],
                        currentScene: "Unknown",
                        recording: false
                      }
                    }
                   );
		setConfig(newConfig);
	}

  const configList = config.length ? config.map((item, key) =>
        <OBSConfig index={key}
              key={key}
              name={key}
              config={item.config}
              onChanged={configChanged}
              onDeleted={configDeleted}
              />
  ) : (
        <OBSConfig index='0'
              key='0'
              name='0'
              config= {{
                        key: 0,
                        name: '',
                        address: '',
                        port: 4444,
                        password: ''
                      }}
              onChanged={configChanged}
              onDeleted={configDeleted}
              />
  )

	return (
	  <React.Fragment>
			<Form>
				{configList}
				<Row>
					<Col>
						<Button onClick={addItem}>Add Client</Button>
					</Col>
					<Col>
						<Button onClick={e => props.configChanged(config)}>Apply Config</Button>
					</Col>
				</Row>
			</Form>
		</React.Fragment>
	);
}

export default Config;
