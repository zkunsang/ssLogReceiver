const { IncomingWebhook } = require('@slack/webhook');
const configs = require('../configs');

class SlackHelper {
    constructor() {
        this.webhook = null;
        this.slackConfig = null;
    }

    async ready() {
        this.slackConfig = configs.Slack;
        if (!this.slackConfig.useSlack) return;
        this.webhook = new IncomingWebhook(this.slackConfig.webhookUrl);
    }

    sendMessage(message) {
        if (!this.slackConfig.useSlack) return;
        try {
            this.webhook.send(`[${process.env.NODE_ENV}]\n${message}`)
        }
        catch (err) {
            console.error('slack error', err);
        }
    }
}

module.exports = new SlackHelper();
