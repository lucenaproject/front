// export enum Header
// {
//     Client = "MDPC02",
//         Worker = "MDPW02",
// }

// export enum Message
// {
//     Ready = "\x01",
//         Request = "\x02",
//         Reply = "\x03",
//         Heartbeat = "\x04",
//         Disconnect = "\x05"
// }

const Message = Object.freeze({
    Ready: Symbol("\x01"),
    Request: Symbol("\x02"),
    Reply: Symbol("\x03"),
    Heartbeat: Symbol("\x04"),
    Disconnect: Symbol("\x05"),

});


const Header = Object.freeze({
    Client: Symbol("MDPC02"),
    Worker: Symbol("MDPW02"),
});
