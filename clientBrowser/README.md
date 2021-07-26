# regoch-websocket (clientBrowser)
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
- chat in the rooms
- small file size, minified (*~7.5kB only*)
- powerful API
- possible RxJS integration
- [browserify](http://browserify.org/)



## Development && Build
Make changes in the code and run a gulp build:
```bash
npm run inst  # Install required gulp packages needed for the development
npm run dev   # This command will watch for file "Client13jsonRWS.js" changes and build in /dist/ folder by the gulp and browserify.
```


## API
- **connect()** - connect to the websocket server
- **disconnect()** - disconnect from the websocket server

- **infoSocketId()** - receive the client's socket id
- **infoSocketList()** - receive the list of sockets connected on the server
- **infoRoomList()** - receive the list of all rooms
- **infoRoomListmy()** - receive the list of subscribed rooms

- **sendOne(to:number, msg:any)** - send message to one websocket socket/client (parameter *to* is the socket ID)
- **send(to:number[], msg:any)** - send message to one or more clients
- **broadcast(msg:any)** - send message to all clients except the sender
- **sendAll(msg:any)** - send message to all clients and the sender

- **roomEnter(roomName:string)** - enter the room and start to listen the room's messages
- **roomExit(roomName:string)** - exit from the room and stop to listen the room's messages
- **roomExitAll()** - exit from the all rooms
- **roomSend(roomName:string, msg:any)** - exit from the room and stop to listen the room's messages

- **setNick(nickname:string)** - set the client's nickname
- **route(uri:string, body?:any)** - send route to the server, for example: *{uri: '/login', body: {username: 'john', password: 'trtmrt'}}*

- **on(eventName:string, listener:Function)** - listen events: *'connected', 'message', 'route'*
- **once(eventName:string, listener:Function)** - listen events: *'connected', 'message', 'route'* only once



## How to use in pure Javascript ?
It's very simple. Include *client13jsonRWS-min.js* in your HTML file
```html
<script src="node_modules/regoch-websocket/clientBrowser/dist/client13jsonRWS/client13jsonRWS-min.js"></script>
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
  questionTimeout: 3*1000, // wait 3secs for answer
  reconnectAttempts: 5, // try to reconnect 5 times
  reconnectDelay: 3000, // delay between reconnections is 3 seconds
  subprotocols: ['jsonRWS'],
  debug: false
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
  questionTimeout: 3*1000, // wait 3secs for answer
  reconnectAttempts: 5, // try to reconnect 5 times
  reconnectDelay: 3000, // delay between reconnections is 3 seconds
  subprotocols: ['jsonRWS'],
  debug: false
};

const testCB = new TestClient(wcOpts);
```

then in your HTML use:
```html
<button onclick="testCB.connect()">Connect</button>
<button onclick="testCB.disconnect()">Disconnect</button>
```
