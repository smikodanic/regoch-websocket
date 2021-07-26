/**
 * Send to one client several consecutive messages.
 * Open in another terminal $node 010onMessage.js
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
    questionTimeout: 3*60*1000, // wait 3secs for answer
    reconnectAttempts: 5, // try to reconnect 5 times
    reconnectDelay: 3000, // delay between reconnections is 3 seconds
    subprotocols: ['jsonRWS'],
    debug: false
  };
  const testClient = new TestClient(wcOpts);
  const socket = await testClient.connect();

  for (let i = 1; i <= 100; i++) {
    const payload = `${i}. consecutive message`;
    console.log(payload);
    await testClient.sendOne(210726163624219170, payload); // NOTICE: Will not work well if await is not used !!!
  }


  await helper.sleep(5500);
  console.log('A 100 messages sent');
  process.exit();
};



main().catch(err => console.log(err));
