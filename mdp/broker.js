const {Router} = require("zeromq");
const {Service} = require("./service");
const {Header, Message} = require("./types");


class Broker {
    // let address;
    // socket: Router = new Router({sendHighWaterMark: 1, sendTimeout: 1})
    // services: Map<string, Service> = new Map()
    // workers: Map<string, Buffer> = new Map()

    constructor(address = "tcp://127.0.0.1:5555") {
        this.socket = new Router({sendHighWaterMark: 1, sendTimeout: 1});
        this.services = new Map();
        this.workers = new Map();
        this.address = address;
    }

    async start() {
        console.log(`starting broker on ${this.address}`);
        await this.socket.bind(this.address);

        const loop = async () => {
            for await (const [sender, blank, header, ...rest] of this.socket) {
                switch (header.toString()) {
                    case Header.Client:
                        this.handleClient(sender, ...rest);
                        break;
                    case Header.Worker:
                        this.handleWorker(sender, ...rest);
                        break;
                    default:
                        console.error(`invalid message header: ${header}`)
                }
            }
        };
        loop()
    }

    async stop() {
        if (!this.socket.closed) {
            this.socket.close()
        }
    }

    handleClient(client, service, ...req) {
        if (service) {
            this.dispatchRequest(client, service, ...req)
        }
    }

    handleWorker(worker, type, ...rest) {
        switch (type && type.toString()) {
            case Message.Ready: {
                const [service] = rest;
                this.register(worker, service);
                break
            }

            case Message.Reply: {
                const [client, blank, ...rep] = rest;
                this.dispatchReply(worker, client, ...rep);
                break
            }

            case Message.Heartbeat:
                /* Heartbeats not implemented yet. */
                break;

            case Message.Disconnect:
                this.deregister(worker);
                break;

            default:
                console.error(`invalid worker message type: ${type}`)
        }
    }

    register(worker, service) {
        this.setWorkerService(worker, service);
        this.getService(service).register(worker)
    }

    dispatchRequest(client, service, ...req) {
        this.getService(service).dispatchRequest(client, ...req)
    }

    dispatchReply(worker, client, ...rep) {
        const service = this.getWorkerService(worker);
        this.getService(service).dispatchReply(worker, client, ...rep)
    }

    deregister(worker) {
        const service = this.getWorkerService(worker);
        this.getService(service).deregister(worker)
    }

    getService(name) {
        const key = name.toString();
        if (this.services.has(key)) {
            return this.services.get(key)
        } else {
            const service = new Service(this.socket, key);
            this.services.set(key, service);
            return service
        }
    }

    getWorkerService(worker) {
        return this.workers.get(worker.toString("hex"))
    }

    setWorkerService(worker, service) {
        this.workers.set(worker.toString("hex"), service)
    }
}

module.exports = Broker;
