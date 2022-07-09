# regoch-websocket / clientBrowser
> Websocket Client for browser which works best with the Regoch Websocket Server.

Small but very powerful library made according to [RFC6455 Standard](https://www.iana.org/assignments/websocket/websocket.xml) for websocket version 13.



## Website Documentation
[http://www.regoch.org/websocket/clients/browser](http://www.regoch.org/websocket/clients/browser)


## Websocket Client for Browser Features
- websocket version: **13**
- subprotocol: **jsonRWS**, raw
- automatic reconnect
- chat in the rooms
- small file size, minified (*~7.5kB only*)
- powerful API
- possible RxJS integration
- use it with webpack builds


## Installation
```
npm install --save regoch-websocket
```

## Howto
There are two ways to use it in your project:
- **import in JS**
```javascript
import { Client13jsonRWS } from '/node_modules/regoch-websocket/clientBrowser/index.js';

const wsClient = new Client13jsonRWS(wsOpts);
await wsClient.connect(); // open websocket connection
```

- **script in HTML**
```html
<script src="/node_modules/regoch-websocket/clientBrowser/dist/client13jsonRWS.min.js"></script>
```
```javascript
// now fetch it as window.regochWebsocket global variable
const wsClient = new window.regochWebsocket.Client13jsonRWS(wsOpts);
await wsClient.connect(); // open websocket connection
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



## Example
```javascript
import apiwsConst from '/client/conf/apiwsConst.js';
import { Client13jsonRWS } from '/node_modules/regoch-websocket/clientBrowser/index.js';


/**
 * Websocket client library.
 */
class WsLib {


  /**
   * Connect to the websocket server (API)
   * @param {object} trx - router transitional variable
   * @returns {void}
   */
  async konekt(auth, trx) {
    if (trx.uri === '/') { return; }

    const ctrl = trx.ctrl; // current controller instance

    // if the client is not connected try to connect to the WS server
    if (!window.regochGlob.wsClient) {
      const loggedUser = auth.getLoggedUserInfo();
      if (!loggedUser) { return; }
      const wsURL = `${apiwsConst.BASE_URL}?authkey=${apiwsConst.authkey}&clientType=panelUser&user_id=${loggedUser._id}&username=${loggedUser.username}`;
      const wsOpts = {
        wsURL,
        connectTimeout: 8000, // HTTP request timeout i.e. websocket connect timeout (when internet is down or on localhost $ sudo ip link set lo down)
        reconnectAttempts: 12, // try to reconnect n times
        reconnectDelay: 5000, // delay between reconnections
        questionTimeout: 13 * 1000, // wait for answer
        subprotocols: ['jsonRWS'],
        debug: false,
        debug_DataParser: false
      };
      // window.regochGlob.wsClient = new window.regochWebsocket.Client13jsonRWS(wsOpts); // app.html --> <script src="/node_modules/regoch-websocket/clientBrowser/dist/client13jsonRWS.min.js"></script>
      window.regochGlob.wsClient = new Client13jsonRWS(wsOpts);

      await window.regochGlob.wsClient.connect(); // open websocket connection
    }


    // disconnection listener
    window.regochGlob.wsClient.on('disconnected', () => {
      // console.log('Websocket is disconnected.');
      window.regochGlob.wsClient = undefined;
      ctrl.$model.isWSconnected = false;
    });

    // update header.html (reused in postflight rend_isWSconnected.js)
    ctrl.isWSconnected = true;
  }


  async dekonekt() {
    const wsClient = window.regochGlob.wsClient;
    if (!!wsClient) { wsClient.disconnect(); } // close websocket connection
    window.regochGlob.wsClient = undefined;
  }


}



export default new WsLib();

```


## Development and Build
If you want to participate in developing of the library:
```bash
$ cd clientBrowser
$ npm run inst  # Install required gulp packages needed for the development
$ npm run dev   # This command will watch for /src/ file changes and build in /dist/ folder by the gulp and browserify
```



### Licence
Copyright (c) 2020 Saša Mikodanić licensed under [MIT](../LICENSE) .
