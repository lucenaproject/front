const {Request} = require("zeromq");
const {Worker} = require("./worker");
const {Broker} = require("./broker");


async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec))
}


class TeaWorker extends Worker {
    service = "mdp-echo";

    constructor(address="tcp://127.0.0.1:5555") {
        super(address);
    }

    async process(...msgs) {
        await sleep(Math.random() * 500);
        return msgs;
    }
}


class CoffeeWorker extends Worker {
    service = "mdp-echo";

    constructor(address="tcp://127.0.0.1:5555") {
        super(address);
    }

    async process(...msgs) {
        await sleep(Math.random() * 200);
        return msgs;
    }
}


const broker = new Broker();
const workers = [new TeaWorker(), new CoffeeWorker(), new TeaWorker()];


async function request(service, ...req) {
    const socket = new Request({receiveTimeout: 2000});
    socket.connect(broker.address);
    console.log(`requesting '${req.join(", ")}' from '${service}'`);
    await socket.send(["MDPC02", service, ...req]);

    try {
        const [blank, header, ...res] = await socket.receive();
        console.log(`received '${res.join(", ")}' from '${service}'`);
        return res
    } catch (err) {
        console.log(`timeout expired waiting for '${service}'`)
    }
}


async function main() {
    for (const worker of workers) worker.start()
    broker.start();

    /* Requests are issued in parallel. */
    await Promise.all([
        request("soda", "cola"),
        request("tea", "oolong"),
        request("tea", "sencha"),
        request("tea", "earl grey", "with milk"),
        request("tea", "jasmine"),
        request("coffee", "cappuccino"),
        request("coffee", "latte", "with soy milk"),
        request("coffee", "espresso"),
        request("coffee", "irish coffee"),
    ]);

    for (const worker of workers) worker.stop()
    broker.stop()
}


main().catch(err => {
    console.error(err);
    process.exit(1)
});
