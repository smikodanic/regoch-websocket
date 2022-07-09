# regoch-websocket
> Websocket server made in NodeJS and websocket clients for NodeJS and Browser.

Small but very powerful, websocket library made according to [RFC6455 Standard](https://www.iana.org/assignments/websocket/websocket.xml).

Current websocket version: *13*

Library parts:
- **[Regoch Websocket Server (NodeJS)](https://github.com/smikodanic/regoch-websocket/tree/master/server)**
- **[Regoch Websocket Client (NodeJS)](https://github.com/smikodanic/regoch-websocket/tree/master/clientNodejs)**
- **[Regoch Websocket Client (Browser)](https://github.com/smikodanic/regoch-websocket/tree/master/clientBrowser)**
- *Regoch Websocket Client (Angular) - ToDo*
- *Regoch Websocket Client (React) - ToDo*
- *Regoch Websocket Client (Vue) - ToDo*
- *Regoch Websocket Client (JAVA) - ToDo*
- *Regoch Websocket Client (C++) - ToDo*


## Installation
```bash
npm install --save regoch-websocket
```


## Website
Visit the website [www.regoch.org](http://www.regoch.org) for more information !


## Websocket Server Features
- websocket version: **13**
- subprotocols: jsonRWS, raw
- chat,  rooms
- PING & PONG
- small file size
- very fast and reliable data transfer (use it directly in the "for" loop)
- **no npm dependencies**
- powerful API
- easy RxJS integration


## subprotocol "jsonRWS"
Basic subprotocol for message exchange between server & client is the **jsonRWS** &copy; subprotocol. It is the websocket subprotocol invented by the Regoch.org project.

*Subprotocol description:*
The subprotocol is created for communication between websocket server and client.

*Subprotocol definitons:*

a) Client have to send message in valid JSON format. Fields: **{id:string, from:string, to:string|string[], cmd:string, payload?:any}**

b) Server have to send message in valid JSON format. Fields: **{id:string, from:string, to:string|string[], cmd:string, payload?:any}**

c) The incoming message is converted from string to object.

d) The outgoing message is converted from object to string.


## TCPDUMP
Use *tcpdump* linux command to debug the messages sent from the server to the client.
For example ```sudo tcpdump -i any port 57190 -X -s0``` where 57190 is the client port i.e. **socket.localPort**


### Licence
“Freely you received, freely you give”, Matthew 10:5-8

Copyright (c) 2020 Saša Mikodanić licensed under [MIT](./LICENSE) .
