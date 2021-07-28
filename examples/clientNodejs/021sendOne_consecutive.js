/**
 * $node 021sendOne_consecutive.js 210727090438377820
 * Send to one client several consecutive messages.
 * Open client listener in another terminal $node 010onMessage.js
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
  const to = +process.argv[2];

  for (let i = 1; i <= 100; i++) {
    const payload = `${i}. consecutive message`;
    console.log(payload);

    await testClient.sendOne(to, payload); // NOTICE: Will not work well if await is not used !!!
  }


  console.log('A 100 messages sent');
  await helper.sleep(8000);
  process.exit();
};



main().catch(err => console.log(err));
