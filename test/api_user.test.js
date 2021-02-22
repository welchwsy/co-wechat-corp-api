var config = require('./config');
var API = require('../');
var expect = require('expect.js');

describe('api_user', function () {
    var api = new API(config.corpid, config.corpsecret);

    describe('createUser', function () {
        it('create user should ok', async () => {
            var user_info = config.test_user;
            var ret = await api.createUser(config.test_user);
            expect(ret).to.only.have.keys(['errcode', 'errmsg']);
            expect(ret.errcode).to.be(0);
            expect(ret.errmsg).to.be("created");
        });
        it('check creation should ok', async () => {
            var ret = await api.getUser(config.test_user.userid);
            expect(ret.userid).to.eql(config.test_user.userid);
        });
    });
    describe('updateUser', function () {
        it('should ok', async () => {
            var user_info = {
                userid: config.test_user.userid,
                name: '张三疯'
            };
            var ret = await api.updateUser(user_info);
            expect(ret).to.only.have.keys(['errcode', 'errmsg']);
        });
        it('check updation should ok', async () => {
            var ret = await api.getUser(config.test_user.userid);
            expect(ret.name).to.eql('张三疯');
        });
    });
    describe('deleteUser', function () {
        it('should ok', async () => {
            var ret = await api.deleteUser(config.test_user.userid);
            expect(ret).to.only.have.keys(['errcode', 'errmsg']);
        });
        it('check deletion should ok', async () => {
            try {
                var ret = await api.getUser(config.test_user.userid);
            } catch (err) {
                expect(err).to.have.property('name', 'WeChatAPIError');
                expect(err).to.have.property('message', 'userid not found');
            }
        });
    });
});
