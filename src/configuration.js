const vscode = require('vscode');

class Configuration {

    /**
     * @private
     */
    static stockBarConfig() {
        return vscode.workspace.getConfiguration('stock-bar')
    }

    static getShowTime(){
        return Configuration.stockBarConfig().get('showTime');
    }

    static getStocks(){
        return Configuration.stockBarConfig().get('stocks');
    }

    static getUpdateInterval(){
        return Configuration.stockBarConfig().get('updateInterval');
    }

    static getRiseColor(){
        return Configuration.stockBarConfig().get('riseColor');
    }

    static getFallColor(){
        return Configuration.stockBarConfig().get('fallColor');
    }
}

module.exports.Configuration = Configuration;
