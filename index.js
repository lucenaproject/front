const MDP = require('./mdp.js');
const { v4: uuid_v4 } = require('uuid');
const zmq = require("zeromq");


class Dealer extends zmq.Dealer {
    get identity() {
        return this.getStringOption(5)
    }

    set identity(value) {
        this.setStringOption(5, value)
    }
}


async function run(service, message) {
    const socket = new Dealer();

    socket.linger = 1;
    socket.identity = 'client-' + uuid_v4();
    socket.connect("tcp://127.0.0.1:5555");

    let frames = [];
    frames[0] = '';      // empty
    frames[1] = MDP.CLIENT;  // header
    frames[2] = MDP.REQUEST;
    frames[3] = service;      // service name
    frames[4] = message;      // request body
    console.log("sending...");
    await socket.send(frames);
    const [result] = await socket.receive();

    console.log(result);
}

run('mdp-echo', 'culo');



/*
client.on('response', (response) => {
    console.log('Client received message: ', response.body);
    client.stop();
    worker.stop();
});

// worker.start();

client.start();
console.log('Client saying hello');
client.send('mdp-echo', 'hello');
*/

