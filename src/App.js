import './App.css';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
          Navbar,
          Container,
          Row,
          Col,
          Form
        } from 'react-bootstrap';

import OBSClient from './components/OBSClient.js';

import OBSWebSocket from 'obs-websocket-js'

//let OBS = new OBSWebSocket();
let OBS = [];

function App() {
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = JSON.stringify(value);
    });
    return ref.current;
  }

  const [clients, setClients] = useState(
                                          [
                                            {
                                              config: {
                                                key: 0,
                                                name: 'Andy',
                                                address: 'andy-pc-new.gently.org.uk',
                                                port: 4444,
                                                password: 'topsecret'
                                              },
                                              state: {
                                                state: 'Unknown',
                                                scenes: [],
                                                currentScene: "Unknown",
                                                recording: false
                                              }
                                            },
                                            {
                                              config: {
                                                key: 1,
                                                name: 'John',
                                                address: '192.168.202.67',
                                                port: 4444,
                                                password: 'topsecret'
                                              },
                                              state: {
                                                state: 'Unknown',
                                                scenes: [],
                                                currentScene: "Unknown",
                                                recording: false
                                              }
                                            }
                                          ]
                                        );
  const previousClients = usePrevious(clients);

  const updateStatusCallback = useCallback((key, status) =>{
    const newClients = [...clients];
    newClients[key].state.state = status;
    setClients(newClients);
  }, [clients]);

  const updateScenesCallback = useCallback((key, scenes, currentScene) =>{
    const newClients = [...clients];
    newClients[key].state.scenes = scenes.map((thisItem, thisKey)  => {
       return thisItem.name;
    });
    newClients[key].state.currentScene = currentScene;
    setClients(newClients);
  }, [clients]);

  const updateCurrentSceneCallback = useCallback((key, currentScene) =>{
    const newClients = [...clients];
    newClients[key].state.currentScene = currentScene;
    setClients(newClients);
  }, [clients]);

  const updateRecordingCallback = useCallback((key, recording) =>{
    const newClients = [...clients];
    newClients[key].state.recording = recording;
    setClients(newClients);
  }, [clients]);

  const connectCallback = useCallback(
    async (key, info) => {
    try {
      updateStatusCallback(key, 'Connecting');
      await OBS[key].connect({ address: info.address+':'+info.port, password: info.password });
    } catch (e) {
      console.log(e);
      updateStatusCallback(key, 'Connect error: \'' + e.error + ' - ' + e.status + '\'');
    }
  }, [updateStatusCallback]);

  async function sendCommand(key, command, params) {
   try {
      return await OBS[key].send(command, params || {});
    } catch (e) {
      console.log('Error sending command', command, ' - error is:', e);
      return {};
    }
  }

  useEffect(() => {
      function isArray(value) {
        return Array.isArray(value);
      }

      let changed = false;
      let prevClientsParsed = []

      if (previousClients) {
        prevClientsParsed = JSON.parse(previousClients);
      }

       if (isArray(clients) !== isArray(prevClientsParsed)) {
        changed = true;
      } else if (isArray(clients) && isArray(prevClientsParsed)) {
        if (clients.length !== prevClientsParsed.length) {
          console.log("Size has changed");
          changed = true;
        } else {
          clients.forEach((item, key) => {
            //console.log("Comparing: '" + JSON.stringify(item.config) + "' with '" + JSON.stringify(prevClientsParsed[key].config) + "'");

            if (JSON.stringify(item.config) !== JSON.stringify(prevClientsParsed[key].config)) {
              console.log ("Item " + key + " has changed");
              changed = true;
            }
          });
        }
      }

      if (changed) {
        console.log("Changed - recreating");

        clients.forEach((item, key) => {
        OBS.forEach((item, key) => {
          OBS[key].disconnect();
          OBS[key]=null;
        });

        OBS=[];

        clients.forEach((item, key) => {
          console.log("Processing '" + key + "', '" + item + "'");

          OBS.push(new OBSWebSocket());
          OBS[key].on('ConnectionClosed', () => {
            updateStatusCallback(key, 'Connection closed');
            updateScenesCallback(key, [], '');
            console.log("Connection to '" + clients[key].config.address + "' closed");
          });
          OBS[key].on('AuthenticationSuccess', async () => {
            updateStatusCallback(key, 'Auth successful');
            console.log("Authentication successful");
            let scenes = await sendCommand(key, "GetSceneList");
            updateScenesCallback(key, scenes.scenes, scenes['current-scene']);
          });

          OBS[key].on('SwitchScenes', (data) => {
            console.log("New scene for '" + key + "' - '" + data.sceneName + "'");
            updateCurrentSceneCallback(key, data.sceneName);
            clients.forEach( async (clientInfo, clientKey) => {
              console.log("Comparing with '" + clientKey + "' - current scene '" + clientInfo.state.currentScene + "'");
              if (clientKey !== key && clientInfo.state.currentScene !== data.sceneName) {
                console.log("Switching client '" + clientKey + "'");
                await sendCommand(clientKey, "SetCurrentScene", {'scene-name': data.sceneName});
              }
            });
          });

          OBS[key].on('ScenesChanged', async() => {
            console.log("Scenes changed for '" + key + "'");
            let scenes = await sendCommand(key, "GetSceneList");
            updateScenesCallback(key, scenes.scenes, scenes['current-scene']);
          });

          OBS[key].on('RecordingStarted', (data) => {
            console.log("Recording started for '" + key + "'");
            updateRecordingCallback(key, true);
          });

          OBS[key].on('RecordingStopped', (data) => {
            console.log("Recording stopped for '" + key + "'");
            updateRecordingCallback(key, false);
          });

          async function doConnect(key, item) {
            await connectCallback(key, item);
          }

          doConnect(key, item.config);
        });
      });
    }
  }, [
        clients,
        connectCallback,
        previousClients,
        updateStatusCallback,
        updateCurrentSceneCallback,
        updateScenesCallback,
        updateRecordingCallback
    ]
  );

  async function changeSceneClicked(key, scene) {
    console.log("Scene changed for '" + key + "' to '" + scene + "'");
    await sendCommand(key, "SetCurrentScene", {'scene-name': scene});
  }

  async function recordingClicked(key, record) {
    console.log("Record for '" + key + "' changed to '" + record + "'");
    await sendCommand(key, record ? "StartRecording" : "StopRecording");
  }

  const clientList = clients.length ? clients.map((item, key) =>
      <React.Fragment>
          <OBSClient index={key}
                key={key}
                name={item.config.name}
                address={item.config.address}
                state={item.state.state}
                scenes={item.state.scenes}
                currentScene={item.state.currentScene}
                recording={item.state.recording}
                onSceneClicked={changeSceneClicked}
                onRecordingClicked={recordingClicked}/>
      </React.Fragment>
    ) : (
      <React.Fragment>
        No clients
      </React.Fragment>
    )

  return (
    <div className="App">
      <Navbar>
          <Navbar.Brand>OBS Scene Sync</Navbar.Brand>
      </Navbar>
      <Container fluid>
        <Form>
          <Row>
            <Col>
              {clientList}
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
}

export default App;
