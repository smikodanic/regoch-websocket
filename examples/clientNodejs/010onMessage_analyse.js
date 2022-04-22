/**
 * Catch all 3 forms of message:
 * - msg -> message after DataParser and subprotocol
 * - msgSTR -> message after DataParser
 * - msgBUF -> message as buffer
 * Send messages by using 023broadcat.js in another terminal.
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


  /** IMPORTANT!!! Set the message listener before the question is sent. **/

  // 1) This is the best way because it will catch messages after reconnection
  testClient.on('message', (msg, msgSTR, msgBUF) => {
    console.log('\n-------------- 1.st way (on message) -------------------');
    console.log('OBJECT message', msg);
    console.log('STRING message', msgSTR);
    console.log('BUFFER message', msgBUF);
    console.log('msgBUF stringified::', msgBUF.toString('hex').replace(/(.)(.)/g, '$1$2 '));
    console.log('-------------------------------------------');
  });


  // 2) This will not work after reconnection because "socket" will not be same after reconnection. It's only receiving message in buffer format. (not recommended)
  socket.on('data', msgBUF => {
    console.log('\n-------------- 2.nd way (on data) -------------------');
    console.log('msgBUF::', msgBUF);
    console.log('-------------------------------------------');
  });


};



main().catch(err => console.log(err));
