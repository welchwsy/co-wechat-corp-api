// 本文件用于wechat API，基础文件，主要用于Token的处理和mixin机制
const urllib = require('urllib');
const streamx = require('streamx');
const util = require('util');
const extend = require('util')._extend;

const postJSON = util.postJSON;

class AccessToken {
  constructor(accessToken, expireTime) {
    this.accessToken = accessToken;
    this.expireTime = expireTime;
  }
  isValid() {
    return !!this.accessToken && Date.now() < this.expireTime;
  }
};

class API {
  /**
 * 根据appid和appsecret创建API的构造函数
 * CorpID是企业号的标识，每个企业号拥有一个唯一的CorpID；Secret是管理组凭证密钥。
 * 系统管理员可通过管理端的权限管理功能创建管理组，分配管理组对应用、通讯录的访问权限。
 * 完成后，管理组即可获得唯一的secret。
 * 系统管理员可通过权限管理查看所有管理组的secret，其他管理员可通过设置中的开发者凭据查看。
 * 当企业应用调用企业号接口时，企业号后台为根据此次访问的AccessToken,校验访问的合法性以及所对应的管理组的管理权限以返回相应的结果。
 * 注：你应该审慎配置管理组的权限，够用即好，权限过大会增加误操作可能性及信息安全隐患。
 * 如需跨进程跨机器进行操作Wechat API（依赖access token），access token需要进行全局维护
 * 使用策略如下： 
 * 1. 调用用户传入的获取token的异步方法，获得token之后使用
 * 2. 使用corpid/corpsecret获取token。并调用用户传入的保存token方法保存 * Tips: * - 如果跨机器运行wechat模块，需要注意同步机器之间的系统时间。 * Examples:
 * ```
 * var API = require('co-wechat-enterprise-api');
 * var api = new API('corpid', 'corpsecret');
 * ```
 * 以上即可满足单进程使用。
 * 当多进程时，token需要全局维护，以下为保存token的接口。
 * 以下的例子使用了文本文件，实际使用中建议放到数据库中。
 * saveToken 方法接受的参数数据结构： { accessToken: 'aJvlZe6Q_vpYfdTFXWCSbJ7mVuMSXKvVGJU7BNy1wWBVE_41yOTM-ZE-axbsjNxWIWraYoOyJbcqIeyVpBHWtg' }
 * getToken 方法要保证返回的数据结构同上。
 * 
 * ```
 * var api = new API('corpid', 'corpsecret', async () => {
 *   // 传入一个获取全局token的方法
 *   var txt = await fs.readFile('access_token.txt', 'utf8');
 *   return JSON.parse(txt);
 * }, async (token) {
 *   // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
 *   // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
 *   await fs.writeFile('access_token.txt', JSON.stringify(token));
 * });
 * ```
 * @param {String} corpid 企业号的 corpid
 * @param {String} corpsecret 在公众平台上申请得到的corpsecret
 * @param {Generator} getToken 可选的。获取全局token对象的方法，多进程模式部署时需在意
 * @param {Generator} saveToken 可选的。保存全局token对象的方法，多进程模式部署时需在意
 */

  constructor (corpid, corpsecret, getToken, saveToken) {
    this.corpid = corpid;
    this.corpsecret = corpsecret;
    this.store = null;
  
    this.getToken = getToken || async function () {
      return this.store;
    };
    this.saveToken = saveToken || async function (token) {
      this.store = token;
      if (process.env.NODE_ENV === 'production') {
        console.warn('Don\'t save token in memory, when cluster or multi-computer!');
      }
    };
    this.prefix = 'https://qyapi.weixin.qq.com/cgi-bin/';
    // this.mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/';
    // this.fileServerPrefix = 'http://file.api.weixin.qq.com/cgi-bin/';
    // this.payPrefix = 'https://api.weixin.qq.com/pay/';
    // this.merchantPrefix = 'https://api.weixin.qq.com/merchant/';
    // this.customservicePrefix = 'https://api.weixin.qq.com/customservice/';
    this.defaults = {};
    // set default js ticket handle
    // this.registerTicketHandle();
  }

  /**
   * 用于设置urllib的默认options * Examples:
   * ```
   * api.setOpts({timeout: 15000});
   * ```
   * @param {Object} opts 默认选项
   */
  setOpts(opts) {
    this.defaults = opts;
  }

   /**
   * 设置urllib的hook
   */
  async request(url, opts, retry = 3) {
    var options = {
      dataType: 'json'
    };
    Object.assign(options, this.defaults);
    opts || (opts = {});
    var keys = Object.keys(opts);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key !== 'headers') {
        options[key] = opts[key];
      } else {
        if (opts.headers) {
          options.headers = options.headers || {};
          Object.assign(options.headers, opts.headers);
        }
      }
    }
    // 调用用户传入的获取token的异步方法，获得token之后使用（并缓存它）。
    const token = await this.getToken()
    if (token && token.isValid()) {
      // 有token并且token有效直接调用
      this.accessToken = new AccessToken(token)
    } else {
      await this.getAccessToken()
    }
    const res = await urllib.request(url, options)

    if (res.statusCode < 200 || res.statusCode > 204) {
      var err = new Error(`url: ${url}, status code: ${res.statusCode}`);
      err.name = 'WeChatAPIError';
      throw err;
    }
    const contentType = res.headers['content-type'] || '';
    if (contentType.indexOf('application/json') !== -1) {
      const data = res.data
      if (data && data.errcode) {
        let err = new Error(data.errmsg);
        err.name = 'WeChatAPIError';
        err.code = data.errcode;

        if ((err.code === 40001 || err.code === 42001) && retry > 0 && !this.tokenFromCustom) {
          // 销毁已过期的token
          await this.saveToken(null);
          await this.getSuiteToken();
          let urlobj = new URL(url);
          urlobj.searchParams.set('access_token', this.token.accessToken)
          return this.request(urlobj.href, opts, retry - 1);
        }

        throw err;
      } else {
        return data
      }
    } else {
      return await streamx.read(res);
    }
  }


  async preRequest(url, opts = {dataType: 'json'}, retry = 3) {
    // 调用用户传入的获取token的异步方法，获得token之后使用（并缓存它）。
    const token = await this.getToken()
    if (token && token.isValid()) {
      // 有token并且token有效直接调用
      this.suiteToken = new AccessToken(token)
    } else {
      await this.getAccessToken()
    }
    let urlobj = new URL(url);
    urlobj.searchParams.set('access_token', this.token.accessToken)
    return await this.request(urlobj.href, opts, retry);
  }

  async getAccessToken () {
    const url = this.prefix + 'gettoken?corpid=' + this.corpid + '&corpsecret=' + this.corpsecret;
    const response = await urllib.request(url, {
      dataType: 'json'
    });
    const data = response.data
    // 过期时间，因网络延迟等，将实际过期时间提前10秒，以防止临界点
    var expireTime = Date.now() + (data.expires_in - 10) * 1000;
    var token = new AccessToken(data.access_token, expireTime);
    this.token = token;
    await this.saveToken(token);
    return token;
  };

  async ensureAccessToken () {
    // 调用用户传入的获取token的异步方法，获得token之后使用（并缓存它）。
    var token = await this.getToken();
    
    if (token && token.accessToken) {
      return new AccessToken(token.accessToken);
    } else {
      return await this.getAccessToken();
    }
  };
}

/**
 * 用于支持对象合并。将对象合并到API.prototype上，使得能够支持扩展
 * Examples:
 * ```
 * // 媒体管理（上传、下载）
 * API.mixin(require('./lib/api_media'));
 * ```
 * @param {Object} obj 要合并的对象
 */
API.mixin = function (obj) {
  for (var key in obj) {
    if (API.prototype.hasOwnProperty(key)) {
      throw new Error('Don\'t allow override existed prototype method. method: '+ key);
    }
    API.prototype[key] = obj[key];
  }
};

API.AccessToken = AccessToken;

module.exports = API;
