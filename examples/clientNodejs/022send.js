/**
 * Send to one or many clients.
 * Open multiple clients for leistening messages in the another terminal with $node 010onMessage.js
 */
const { RWClientNodejs, lib } = require('../../index.js');


class TestClient extends RWClientNodejs {
  constructor(wcOpts) {
    super(wcOpts);
  }
}


const main = async () => {
  // connect to websocket server
  const wcOpts = {
    wsURL: 'ws://localhost:3211?authkey=TRTmrt',
    connectTimeout: 8000,
    reconnectAttempts: 6, // try to reconnect n times
    reconnectDelay: 5000, // delay between reconnections
    questionTimeout: 13000, // wait for answer
    subprotocols: ['jsonRWS', 'raw'],
    autodelayFactor: 500,
    debug: false,
    debug_DataParser: false
  };
  const testClient = new TestClient(wcOpts);
  await testClient.connect();


  console.log('Message sent to multiple clients.');
  await testClient.send(['20220422141130406426', '20220422140401422390', '20220422141130406246'], 'Some message to multiple clients');

  await lib.helper.sleep(1000);
  process.exit();
};



main().catch(err => console.log(err));
