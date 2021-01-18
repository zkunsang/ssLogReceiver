const net = require('net');
const JsonSocket = require('json-socket');
const FluentHelper = require('./helper/FluentHelper');

const configs = require('./configs');
const MongoConnectionHelper = require('./MongoConnectionHelper');
const DateUtil = require('./utils/DateUtil');

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
    await FluentHelper.ready();
    
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

const dateProperty = {
    'inven': 'logDate',
    'login': 'loginDate',
    'story_log': 'updateDate',
    'picture': 'logDate',
    'product': 'purchaseDate'
}

class Parser {
    constructor({source, dataList, collectionName}) {
        this.source = source;
        this.dataList = dataList;
        this.collectionName = collectionName;
    }

    async startParse() {
        const collection = dbTarget.collection(this.source);
        const collectionDaily = dbTarget.collection(this.collectionName);

        for (const data of this.dataList) {
            try {
                await collection.insertOne(data)

                delete data._id;
                if(this.source == 'network') {
                    data.logDateTZ = DateUtil.utsToDate(data.res.common.serverTime).toISOString();
                }
                else {
                    data.logDateTZ = DateUtil.utsToDate(data[dateProperty[this.source]]).toISOString();
                }
                
                await FluentHelper.sendLog(this.source, data);

            }
            catch (err) {
                console.log(`collection - ${err}`);
            }

            try {
                await collectionDaily.insertOne(data)
            }
            catch (err) {
                console.log(`collectionDaily - ${err}`);
            }
        }

        client.sendMessage({ source: this.source });
    }
}
client.on('message', async (message) => {
    const parser = new Parser(message)
    await parser.startParse();
});

