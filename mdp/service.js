const {Router} = require("zeromq");
const {Header, Message} = require("./types");


class Service {
    // name: string
    // socket: Router
    // workers: Map<string, Buffer> = new Map()
    // requests: Array<[Buffer, Buffer[]]> = []

    constructor(socket, name) {
        this.name = name;
        this.requests = [];
        this.socket = socket;
        this.workers = new Map();
    }

    dispatchRequest(client, ...req) {
        this.requests.push([client, req]);
        this.dispatchPending()
    }

    async dispatchReply(worker, client, ...rep) {
        this.workers.set(worker.toString("hex"), worker);
        console.log(
            `dispatching '${this.name}' ` +
            `${client.toString("hex")} <- rep ${worker.toString("hex")}`,
        );
        await this.socket.send([client, null, Header.Client, this.name, ...rep]);
        this.dispatchPending()
    }

    async dispatchPending() {
        while (this.workers.size && this.requests.length) {
            const [key, worker] = this.workers.entries().next().value;
            this.workers.delete(key);
            const [client, req] = this.requests.shift();

            console.log(
                `dispatching '${this.name}' ` +
                `${client.toString("hex")} req -> ${worker.toString("hex")}`,
            );

            await this.socket.send([
                worker,
                null,
                Header.Worker,
                Message.Request,
                client,
                null,
                ...req,
            ])
        }
    }

    register(worker) {
        console.log(
            `registered worker ${worker.toString("hex")} for '${this.name}'`,
        );
        this.workers.set(worker.toString("hex"), worker);
        this.dispatchPending()
    }

    deregister(worker) {
        console.log(`deregistered worker ${worker.toString("hex")} for '${this.name}'`,);
        this.workers.delete(worker.toString("hex"));
        this.dispatchPending()
    }
}


module.exports = Service;
