/**
 * Send message (payload) to all clients except the sender.
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

  // IMPORTANT!!! Set the message listener before the question is sent.
  testClient.on('message', (msg, msgSTR, msgBUF) => {
    console.log('msg::', msg);
    console.log('msgSTR::', msgSTR);
    console.log('msgBUF::', msgBUF);
    console.log('msgBUF stringified::', msgBUF.toString('hex').replace(/(.)(.)/g, '$1$2 '));
  });


  console.log('message broadcasted');
  await testClient.broadcast('Message to all clients except the sender');

  await lib.helper.sleep(1000);
  process.exit();
};



main().catch(err => console.log(err));
