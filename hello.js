const { readFileSync } = require ('fs');
const graphql = require('graphql');
const express = require('express');
const server = require('express-graphql');
const { buildSchema } = require('graphql');


const schema = readFileSync("schema.graphql", "UTF8");



let handler = {
    get(target, name) {
        if (name === 'milongas') {
            return (args, context, info) => {
                // TODO ---------------------------------------------------------------------------
                // TODO Parsear info > operation > selectionSet > selections[n] > selectionSet ...
                // TODO convertir a JSON?
                // TODO ---------------------------------------------------------------------------
                console.log("ARGS: " + JSON.stringify(args, null, 2));
                console.log("INFO: " +  JSON.stringify(info, null, 2));
                return [
                    {id: args.id ? args.id : 99, name: "zzzzz"},
                    {id: `1`, name: "El Beso", address: "Riobamba 416"},
                    {id: `2`, name: "De Querusa", address: "Carlos Calvo 213"},
                ];
            }
        }
        else {
            return {id: `1000`, name: "El Beso", address: "Riobamba 416", culo: "xxxx"}
        }
    }
};

let proxy = new Proxy({}, handler);



const root = {
    me: () => {
        return {
            id: '1234ddd',
            name: "Fercho",
        }
    },
    milongas: (args, context, info) => {
        return [
            {id: args.id ? args.id : 99, name: "zzzzz"}
        ];
    }
};


const app = express();

app.use('/', server({
    schema: buildSchema(schema),
    rootValue: proxy,
    graphiql: true,
}));


app.listen(4000, () => console.log('Now browse to localhost:4000'));

/*
*

{
  milongas(first: 2) {
    id
    name
    habitues {
      name
    }
  }
}

*
* */