/**
 * Send question to list the server sockets.
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
  testClient.on('message', (msg, msgSTR, msgBUF) => {
    console.log('STRING message::', msgSTR);
  });


  // send question about the info
  const sockets = await testClient.questionSocketList();
  console.log('\nsockets::', sockets);
};



main().catch(err => console.log(err));
