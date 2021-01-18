const nodeEnv = process.env.NODE_ENV;
const App = require(`./configs/${nodeEnv}/app.json`);
const DbMongo = require(`./configs/${nodeEnv}/dbMongoLog.json`);
const Fluent = require(`./configs/${nodeEnv}/fluent.json`)
const Slack = require(`./configs/${nodeEnv}/slack.json`)

module.exports = {
    App,
    DbMongo,
    Fluent,
    Slack
}