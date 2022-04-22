# regoch-websocket / clientNodejs
> Websocket Client for nodeJS which works best with the Regoch Websocket Server.

Optimised, high speed, reliable and very powerful library made according to [RFC6455 Standard](https://www.iana.org/assignments/websocket/websocket.xml) for websocket version 13.

## Installation
```bash
npm install --save regoch-websocket
```

## Website
Documentation at [www.regoch.org](http://www.regoch.org/websocket/clients/nodejs)


## Websocket Client Features
- RFC6455, websocket v.13
- supported subprotocols: jsonRWS, raw
- automatic reconnect
- ping & pong
- questions - send request to server and receive answer (simmilar to HTTP request but on the websocket TCP level)
- rooms - send group message to a subscribed clients
- small file size, minified (*~9.8kB only*)
- powerful API which saves your development time
- easy integration with RxJS


## Development
```bash
$ cd examples/clientNodejs
$ nodemon 000dev.js
```


## API
- **connect()** - connect to the websocket server
- **disconnect()** - disconnect from the websocket server

- **sendOne(to:string, payload:any)** - send message to one websocket socket/client (parameter *to* is the socket ID)
- **send(to:string[], payload:any)** - send message to one or more clients
- **broadcast(payload:any)** - send message to all clients except the sender
- **sendAll(payload:any)** - send message to all clients and the sender
- **sendRaw(payload:string)** - send raw string message to server for test purposes

- **ping(ms:number, n:number)** - send PING to server n times, every ms miliseconds
- **pong()** - when PING is received from the server send PONG back.

- **questionSocketId()** - receive the client's socket id
- **questionSocketList()** - receive the list of sockets connected on the server
- **questionRoomList()** - receive the list of all rooms
- **questionRoomListmy()** - receive the list of subscribed rooms

- **roomEnter(roomName:string)** - enter the room and start to listen the room's messages
- **roomExit(roomName:string)** - exit from the room and stop to listen the room's messages
- **roomExitAll()** - exit from the all rooms
- **roomSend(roomName:string, payload:any)** - exit from the room and stop to listen the room's messages

- **setNick(nickname:string)** - set the client's nickname
- **route(uri:string, body?:any)** - send route to the server, for example: *{uri: '/login', body: {username: 'john', password: 'trtmrt'}}*

- **on(eventName:string, listener:Function)** - listen events: *'connected', 'disconnected', 'closed-by-server', 'ping', 'pong', 'message', 'message-error', 'question', 'route', 'server-error'*
- **once(eventName:string, listener:Function)** - listen event only once: *'connected', 'disconnected', 'closed-by-server', 'ping', 'pong', 'message', 'message-error', 'question', 'route', 'server-error'*
- **off(eventName:string, listener:Function)** - stop listening the event for specific listener


#### Notice
The 'message-error' event is error in the recived message. In most cases this error is generated when message doesn't satisfy jsonRWS subprotocol rules.


## How to use
```javascript
const { Client13jsonRWS, lib } = require('regoch-websocket');

class TestClient extends Client13jsonRWS {
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

  testClient.on('message', (msg, msgSTR, msgBUF) => {
    console.log('received message::', msgSTR);
  });

  await testClient.sendAll(to, 'ABC of the websocket');
};

main();
```
