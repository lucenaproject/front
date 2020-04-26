const { readFileSync } = require ('fs');
const graphql = require('graphql');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');


const schema = readFileSync("schema.graphql", "UTF8");


const root = {
    me: () => {
        return {
            id: '1234ddd',
            name: "Fercho",
        }
    },
    milongas: (args, context, info) => {
        console.log("XXXXXX");
        return [
            {id: args.id ? args.id : 99, name: "zzzzz"},
            {id: 23, name: "xxxxx"}
        ];
    }
};


const app = express();


let handler = {
    get(target, name) {
        return async (args, context, info) => {
            console.log('XXXX-' + name);
            // console.log("ARGS: " + JSON.stringify(args, null, 2));
            // console.log("INFO: " +  JSON.stringify(info, null, 2));
            return [
                {id: args.id ? args.id : 99, name: "zzzzz"},
                {id: 23, name: "xxxxx"}
            ];
        };
    }
};

const proxy = new Proxy({}, handler);


function resolver() {
    return proxy;
}



app.use('/', graphqlHTTP((request, response, graphQLParams) => ({
    schema: buildSchema(schema),
    rootValue: resolver(),
    graphiql: true,
})));


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