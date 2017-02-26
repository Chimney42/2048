const synaptic = require('synaptic');
const Network = synaptic.Network;
const helper = require('./js/helper.js')();
let bot;

helper.loadFromCouch('network', 'firstIteration')
    .then(networkJSON => {
        const network = Network.fromJSON(networkJSON);
        const networkWrapper = require('./js/network.js')(network);
        bot = require('./js/bot.js')(networkWrapper);
        bot.run(100);
    });
