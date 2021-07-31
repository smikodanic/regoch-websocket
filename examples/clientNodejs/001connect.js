/**
 * Connect example.
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
    questionTimeout: 3*1000, // wait for answer
    reconnectAttempts: 3, // try to reconnect n times
    reconnectDelay: 3000, // delay between reconnections
    subprotocols: ['jsonRWS'],
    debug: false
  };
  const testClient = new TestClient(wcOpts);
  const socket = await testClient.connect();

  console.log('---SOCKET---');
  console.log('readyState::', socket.readyState);
  console.log('writable::', socket.writable);
  console.log('readable::', socket.readable);

  testClient.on('closed-by-server', msgSTR => {
    console.log('Received closed-by-server::', msgSTR);
  });

  testClient.on('error', (msg, msgSTR, msgBUF) => {
    console.log(`Received error:`, msgSTR);
  });

};

main();
