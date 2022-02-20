/**
 * Send to one or many clients.
 * Open multiple clients for leistening messages in the another terminal with $node 010onMessage.js
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
    questionTimeout: 3 * 1000,
    reconnectAttempts: 5, // try to reconnect 5 times
    reconnectDelay: 3000, // delay between reconnections is 3 seconds
    subprotocols: ['jsonRWS'],
    debug: false,
    debug_DataParser: false
  };
  const testClient = new TestClient(wcOpts);
  await testClient.connect();


  console.log('Message sent to multiple clients.');
  await testClient.send([210728101524655740, 210728102105725060, 210728102125198270], 'Some message to multiple clients');
};



main().catch(err => console.log(err));
