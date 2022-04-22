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
  const socket = await testClient.connect();

  console.log('---SOCKET---');
  console.log('readyState::', socket.readyState);
  console.log('writable::', socket.writable);
  console.log('readable::', socket.readable);

  testClient.on('closed-by-server', msgSTR => {
    console.log('Received closed-by-server::', msgSTR);
  });

  testClient.on('server-error', (msg, msgSTR, msgBUF) => {
    console.log(`Received server-error:`, msgSTR);
  });

};

main();
