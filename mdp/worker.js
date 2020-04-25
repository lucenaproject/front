const {Dealer} = require("zeromq");
const MDP = require("./mdp");


class Worker {

    constructor(address = "tcp://127.0.0.1:5555") {
        this.address = address;
        this.service = "";
        this.socket = new Dealer();
        this.socket.connect(address);
    }

    async start() {
        await this.socket.send([null, MDP.WORKER, MDP.READY, this.service]);

        const loop = async () => {
            for await (const [blank1, header, type, client, blank2, ...req] of this.socket) {
                const rep = await this.process(...req);
                try {
                    await this.socket.send([
                        null,
                        MDP.WORKER,
                        MDP.REPLY,
                        client,
                        null,
                        ...rep,
                    ])
                } catch (err) {
                    console.error(`unable to send reply for ${this.address}`)
                }
            }
        };
        loop()
    }

    async stop() {
        if (!this.socket.closed) {
            await this.socket.send([
                null,
                MDP.WORKER,
                MDP.DISCONNECT,
                this.service,
            ]);
            this.socket.close()
        }
    }

    async process(...req) {
        return req
    }
}

module.exports = Worker;
