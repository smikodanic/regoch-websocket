# regoch-websocket
> Websocket server made in NodeJS and websocket clients for NodeJS, Browser and other platforms.

Small but very powerful library made according to [RFC6455 Standard](https://www.iana.org/assignments/websocket/websocket.xml) for websocket version 13.

It consists of:
- Regoch Websocket Server (NodeJS)
- Regoch Websocket Client (NodeJS)
- Regoch Websocket Client (Browser)



## Installation
```
npm install --save regoch-websocket
```

## Website
[www.regoch.org](http://www.regoch.org/websocket)


## Websocket Server Features
- websocket version: **13**
- subprotocol: **[jsonRWS](http://www.regoch.org/websocket-protocol-jsonRWS)**
- chat in the rooms
- small file size
- **only one dependency: "regoch-router"**
- powerful API
- easy RxJS integration


## Development
```bash
## Regoch Websocket Server
npm run server

## Regoch Websocket Client (NodeJS)
npm run clientNodejs

## Regoch Websocket Client (Browser)
### open examples/001client.html
```


## subprotocol "jsonRWS"
Basic subprotocol for message exchange between server & client is the **jsonRWS** &copy; subprotocol. It's the new, invented websocket subprotocol.

*Subprotocol description:*
The subprotocol is created for communication between websocket server and client.

*Subprotocol definitons:*
a) Client have to send message in valid JSON format. Fields: **{id:number, from:number, to:number|string|number[], cmd:string, payload?:any}**
b) Server have to send message in valid JSON format. Fields: **{id:number, from:number, tonumber|string|number[], cmd:string, payload?:any}**
c) The incoming message is converted from string to object.
d) The outgoing message is converted from object to string.


## TCPDUMP
Use *tcpdump* command to debug the messages sent from the server to the client.
For example ```sudo tcpdump -i any port 57190 -X -s0``` where 57190 is the client port i.e. **socket.localPort**


### Licence
“Freely you received, freely you give”, Matthew 10:5-8

Copyright (c) 2020 Saša Mikodanić licensed under [MIT](./LICENSE) .
