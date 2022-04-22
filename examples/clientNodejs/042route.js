/**
 * Send route to the server. Integrate regoch-router on the server side and build complex, real-time, websocket API.
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

  // IMPORTANT!!! Set the message listener before the question is sent.
  testClient.on('message', msg => {
    console.log('msg::', msg);
  });


  console.log('sending route...');
  await testClient.route('shop/product/22', { limit: 15 });
};



main().catch(err => console.log(err));
