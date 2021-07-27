/**
 * Send to one client.
 */
const { RWClientNodejs } = require('../../index.js');


class TestClient extends RWClientNodejs {
  constructor(wcOpts) {
    super(wcOpts);
  }
}


const main = async () => {
  // connect to websocket server
  const wcOpts = {
    wsURL: 'ws://localhost:3211?authkey=TRTmrt',
    questionTimeout: 3*1000,
    reconnectAttempts: 5, // try to reconnect 5 times
    reconnectDelay: 3000, // delay between reconnections is 3 seconds
    subprotocols: ['jsonRWS'],
    debug: false
  };
  const testClient = new TestClient(wcOpts);
  await testClient.connect();


  console.log('message sent');
  await testClient.sendOne(210726155519554340, 'some message');
};



main().catch(err => console.log(err));
