# regoch-websocket / clientBrowser
> Websocket Client for browser which works best with the Regoch Websocket Server.

Small but very powerful library made according to [RFC6455 Standard](https://www.iana.org/assignments/websocket/websocket.xml) for websocket version 13.

## Installation
```
npm install --save regoch-websocket
```

## Website
[www.regoch.org](http://www.regoch.org)


## Websocket Client for Browser Features
- websocket version: **13**
- subprotocol: **jsonRWS**, raw
- automatic reconnect
- chat in the rooms
- small file size, minified (*~7.5kB only*)
- powerful API
- possible RxJS integration
- [browserify](http://browserify.org/)



## Development && Build
Make changes in the code and run a gulp build:
```bash
npm run inst  # Install required gulp packages needed for the development
npm run dev   # This command will watch for /src/ file changes and build in /dist/ folder by the gulp and browserify
```


## API
- **connect()** - connect to the websocket server
- **disconnect()** - disconnect from the websocket server

- **sendOne(to:number, msg:any)** - send message to one websocket socket/client (parameter *to* is the socket ID)
- **send(to:number[], msg:any)** - send message to one or more clients
- **broadcast(msg:any)** - send message to all clients except the sender
- **sendAll(msg:any)** - send message to all clients and the sender

- **questionSocketId()** - receive the client's socket id
- **questionSocketList()** - receive the list of sockets connected on the server
- **questionRoomList()** - receive the list of all rooms
- **questionRoomListmy()** - receive the list of subscribed rooms

- **roomEnter(roomName:string)** - enter the room and start to listen the room's messages
- **roomExit(roomName:string)** - exit from the room and stop to listen the room's messages
- **roomExitAll()** - exit from the all rooms
- **roomSend(roomName:string, msg:any)** - exit from the room and stop to listen the room's messages

- **setNick(nickname:string)** - set the client's nickname
- **route(uri:string, body?:any)** - send route to the server, for example: *{uri: '/login', body: {username: 'john', password: 'trtmrt'}}*

- **on(eventName:string, listener:Function)** - listen events: *'connected', 'disconnected', 'message', 'message-error', 'route', 'question', 'server-error'*
- **once(eventName:string, listener:Function)** - listen events: *'connected', 'disconnected', 'message', 'message-error', 'route', 'question', 'server-error'* only once
- **off(eventName:string, listener:Function)** - stop listening the event for specific listener
- **offAll(eventName:string)** - stop listening all the events



## How to use in pure Javascript ?
It's very simple. Include *client13jsonRWS.js* in your HTML file
```html
<script src="node_modules/regoch-websocket/clientBrowser/dist/client13jsonRWS/client13jsonRWS.js"></script>
or
<script src="https://unpkg.com/regoch-websocket@1.5.2/clientBrowser/dist/client13jsonRWS/client13jsonRWS.js"></script>
```

and extend your JS class with the *window.regochWebsocket.Client13jsonRWS*.
```javascript
class TestClient extends window.regochWebsocket.Client13jsonRWS {
  constructor(wcOpts) {
    super(wcOpts);
  }
}

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

const testCB = new TestClient(wcOpts);
```


## How to use in Browserify ?
If your frontend project is created by the Browserify you can include the client with:
```javascript
const { RWClientBrowser } = require('regoch-websocket);

class TestClient extends RWClientBrowser {
  constructor(wcOpts) {
    super(wcOpts);
  }
}

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

const testCB = new TestClient(wcOpts);
```

then in your HTML use:
```html
<button onclick="testCB.connect()">Connect</button>
<button onclick="testCB.disconnect()">Disconnect</button>
```
