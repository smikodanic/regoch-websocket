/**
 * Connect and disconnect after delay example.
 */
const { RWClientNodejs, lib } = require('../../index.js');
const helper = lib.helper;


class TestClient extends RWClientNodejs {
  constructor(wcOpts) {
    super(wcOpts);
  }
}



const main = async () => {
  // connect to websocket server
  const wcOpts = {
    wsURL: 'ws://localhost:3211?authkey=TRTmrt',
    questionTimeout: 3*1000, // wait for answer
    reconnectAttempts: 0, // try to reconnect n times
    reconnectDelay: 3000, // delay between reconnections
    subprotocols: ['jsonRWS'],
    debug: false
  };
  const testClient = new TestClient(wcOpts);
  await testClient.connect();


  // disconnect from websocket server after 3 seconds
  console.log('Waiting for 3 seconds to disconnect...');
  await helper.sleep(3000);
  testClient.disconnect();
};

main();
