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


  // disconnect from websocket server after 3 seconds
  console.log('Wait for 3 seconds to disconnect...');
  await helper.sleep(3000);
  testClient.disconnect();
};

main();
