/**
 * An example with the built-in HTTP server.
 * Use it for the library developemnt.
 */
const { RWServer, RWHttpServer, lib } = require('../../index.js');
const helper = lib.helper;

const Router = require('regoch-router');
const router = new Router({ debug: false });


// start internal HTTP server
const httpOpts = {
  port: 3211,
  timeout: 0 // if 0 the socket connection will never timeout
};
const rwsHttpServer = new RWHttpServer(httpOpts);
const httpServer = rwsHttpServer.start(); // nodeJS HTTP server instance
setTimeout(() => {
  // rwsHttpServer.restart();
  // rwsHttpServer.stop();
}, 3400);



// websocket ultra
const wsOpts = {
  timeout: 5 * 60 * 1000,
  maxConns: 5,
  maxIPConns: 2,
  storage: 'memory',
  subprotocol: 'jsonRWS',
  tightening: 100,
  version: 13,
  debug: false
};
const rws = new RWServer(wsOpts);
rws.socketStorage.init(null);
rws.bootup(httpServer);



/*** socket stream ***/
rws.on('connection', async socket => {
  /* send message back to the client */
  const msgWelcome = 'New connection from socketID ' + socket.extension.id;
  // socket.extension.sendSelf({id: helper.generateID(), from: 0, cmd: 'info', payload: msgWelcome});

  // rws.dataTransfer.send(msgWelcome, socket);

  /* authenticate the socket */
  const authkey = 'TRTmrt'; // can be fetched from the database, usually 'users' table
  socket.extension.authenticate(authkey); // authenticate the socket: compare authkey with the sent authkey in the client request URL ws://localhost:3211/something?authkey=TRTmrt

  helper.sleep(1300);

  /* socketStorage test */
  // await new Promise(resolve => setTimeout(resolve, 5500));
  // const socketFound = rws.socketStorage.findOne({ip: '::1'});
  // if (!!socketFound && socketFound.extension) console.log('found socket.extension::', socketFound.extension);

});




/*** message stream ***/
rws.on('message', (msg, msgSTR, msgBUF, socket) => {
  // console.log('\nreceived message SUBPROTOCOL::', msg); // after subprotocol
  console.log('\nreceived message STRING::', msgSTR); // after DataParser
  // console.log('\nreceived message BUFFER::', msgBUF); // incoming buffer
  // console.log('\nsocketID', socket.extension.id);
  // rws.dataTransfer.sendOne(msg, socket); // return message back to the sender
});


rws.on('message-error', err => {
  console.log(`Received message-error:`, err);
});



/*** route stream ***/
rws.on('route', (msgObj, socket, dataTransfer, socketStorage, eventEmitter) => { // msgObj:: {id, from, to, cmd, payload: {uri, body}}
  console.log('routeStream::', msgObj);
  const payload = msgObj.payload;

  // router transitional variable
  router.trx = {
    uri: payload.uri,
    body: payload.body,
    msgObj,
    socket,
    dataTransfer: rws.dataTransfer
  };


  // route definitions
  router.def('/shop/login', (trx) => { console.log('trx::', trx.uri); });
  router.def('/shop/product/:id', (trx) => { console.log('trx.uri::', trx.uri, '\ntrx.query::', trx.query, '\ntrx.params::', trx.params); });
  router.def('/send/me/back', (trx) => {
    const id = trx.msgObj.id;
    const from = 0;
    const to = trx.msgObj.from;
    const cmd = 'route';
    const payload = { uri: '/returned/back/21', body: { x: 'something', y: 28 } };
    const msg = { id, from, to, cmd, payload };
    rws.dataTransfer.sendOne(msg, trx.socket);
  }); // send new route back to the client
  router.notfound((trx) => { console.log(`The URI not found: ${trx.uri}`); });

  // execute the router
  router.exe().catch(err => {
    console.log(err);
    rws.dataTransfer.sendOne({ cmd: 'error', payload: err.stack }, socket);
  });

});

