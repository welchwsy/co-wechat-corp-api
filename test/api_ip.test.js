var config = require('./config');
var API = require('../');
var expect = require('expect.js');

describe('api_ip', function () {
    var api = new API(config.corpid, config.corpsecret);

    describe('getCallbackIP', function () {
        it('should ok', async () => {
            var data = await api.getCallbackIP();
            expect(data).to.only.have.keys('ip_list');
        });

    });
});
