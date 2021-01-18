const logger = require('fluent-logger');
const configs = require('../configs.js');
const SlackHelper = require('./SlackHelper');

class FluentHelper {
    constructor() {
        this.logger = null;
    }

    async ready() {
        this.fluentConfig = configs.Fluent;

        if (!this.fluentConfig.useFluent) return;

        this.logger = logger.createFluentSender(
            this.fluentConfig.tag, {
                host: this.fluentConfig.host,
                port: this.fluentConfig.port,
                timeout: this.fluentConfig.timeout, // 1.0,
                reconnectInterval: this.fluentConfig.reconnectInterval // 600000 // 10 minutes
            });

        this.logger.on('error', (error) => {
            SlackHelper.sendMessage(`td-agent - ${error}`);
        });

        this.logger.on('connect', (error) => {
            SlackHelper.sendMessage(`connected - ${error}`);
        });
    }

    async sendLog(category, log) {
        if(!this.fluentConfig.useFluent) {
            console.log(`${category} - ${JSON.stringify(log)}`);
            return;
        }

        if (Array.isArray(log)) {
            for(const l of log) {
                await this.logger.emit(category, l);
            }
        }
        else if (typeof log === 'object') {
            await this.logger.emit(category, log);
            
        }
        else {
            console.error('not supported log')
        }
    }

    async sendProductLog(productLog) {
        await this.sendLog('product', productLog);
    }

    async sendInvenLog(invenLog) {
        await this.sendLog('inventory', invenLog);
    }

    async sendLoginLog(invenLog) {
        await this.sendLog('login', invenLog);
    }

    async sendNetworkLog(networkLog) {
        await this.sendLog('network', networkLog);
    }

    async sendStoryLog(story) {
        await this.sendLog('story', story);
    }
}

module.exports = new FluentHelper();