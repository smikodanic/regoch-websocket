/**
 * Exit from one room.
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
  testClient.on('message', msg => {
    console.log('msg::', msg);
  });


  console.log('entering the room...');
  await testClient.roomEnter('sasa');

  console.log('\nlisting rooms...');
  const rooms1 = await testClient.questionRoomList();
  console.log('rooms before exit::', rooms1);

  // await lib.helper.sleep(1300);

  console.log('\nexiting the room...');
  await testClient.roomExit('sasa');

  console.log('\nlisting my rooms...');
  const rooms2 = await testClient.questionRoomList();
  console.log('rooms after exit::', rooms2);
};



main().catch(err => console.log(err));
