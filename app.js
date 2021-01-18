const net = require('net');
const JsonSocket = require('json-socket');

const configs = require('./configs');
const MongoConnectionHelper = require('./MongoConnectionHelper');

const TARGET_DB = 'log_backup';

let dbConnection = null;
let dbTarget = null;

const client = new JsonSocket(new net.Socket());

client.on('close', () => {
    console.log('server closed');
});

client.on('error', (err) => {
    console.log('connection error', err);
    console.log(new Error().stack);
});

client.connect(configs.App.port, configs.App.uri, async () => {
    dbConnection = await MongoConnectionHelper.setConnection(configs.DbMongo);
    dbTarget = dbConnection.db(TARGET_DB);
})

async function tryCatchWrapper(collection, fn, data, source) {
    let success = false;
    try {
        await fn.bind(collection)(data);
        success = true;
    }
    catch(err) {
        console.log(`${source} - ${data._id} ${err.message}`);
        success = false;
    }

    return success;
}

client.on('message', async (message) => {
    const { source, dataList, collectionName } = message;
    const collection = dbTarget.collection(source);
    const collectionDaily = dbTarget.collection(collectionName);

    for(data of dataList) {
        let success = false;
        success = await tryCatchWrapper(collection, collection.insertOne, data, source);
        if(success) {
            // fluentd send
            // fluentd s3 send
        }
        await tryCatchWrapper(collection, collectionDaily.insertOne, data, collectionName);        
    }
    
    client.sendMessage({ source });
});

