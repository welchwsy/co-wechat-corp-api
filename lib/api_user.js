var util = require('./util');
var querystring = require('querystring');
var postJSON = util.postJSON;

/**
 * 创建成员
 * 详细请看：http://qydev.weixin.qq.com/wiki/index.php?title=管理成员
 *
 * Examples:
 * ```
 * var result = await api.createUser(user);
 * ```
 * User:
 * ```
 * {
 *   "userid": "zhangsan",
 *   "name": "张三",
 *   "department": [1, 2],
 *   "position": "产品经理",
 *   "mobile": "15913215421",
 *   "gender": 1,
 *   "tel": "62394",
 *   "email": "zhangsan@gzdev.com",
 *   "weixinid": "zhangsan4dev"
 * }
 * ```
 *
 * Result:
 * ```
 * {
 *   "errcode": 0,
 *   "errmsg": "created"
 * }
 * ```
 * @param {Object} user 成员信息
 */
exports.createUser = async (user) => {
  var token = await this.ensureAccessToken();
  var url = this.prefix + 'user/create?access_token=' + token.accessToken;
  return await this.request(url, postJSON(user));
};

/**
 * 更新成员
 *
 * Examples:
 * ```
 * var result = await api.updateUser(user);
 * ```
 * User:
 * ```
 * {
 *   "userid": "zhangsan",
 *   "name": "李四",
 *   "department": [1],
 *   "position": "后台工程师",
 *   "mobile": "15913215421",
 *   "gender": 1,
 *   "tel": "62394",
 *   "email": "zhangsan@gzdev.com",
 *   "weixinid": "lisifordev",
 *   "enable": 1
 * }
 * ```
 *
 * Result:
 * ```
 * {
 *  "errcode": 0,
 *  "errmsg": "updated"
 * }
 * ```
 * @param {Object} user 成员信息
 */
exports.updateUser = async (user) => {
  var token = await this.ensureAccessToken();
  var url = this.prefix + 'user/update?access_token=' + token.accessToken;
  return await this.request(url, postJSON(user));
};

/**
 * 删除成员
 *
 * Examples:
 * ```
 * var result = await api.deleteUser(userid);
 * ```
 *
 * Result:
 * ```
 * {
 *  "errcode": 0,
 *  "errmsg": "deleted"
 * }
 * ```
 * @param {Number} id 成员ID
 */
exports.deleteUser = async (userid) => {
  var token = await this.ensureAccessToken();
  var url = this.prefix + 'user/delete?access_token=' + token.accessToken + '&userid=' + userid;
  var opts = {dataType: 'json'};
  return await this.request(url, opts);
};

/**
 * 获取成员
 *
 * Examples:
 * ```
 * var result = await api.getUser(userid);
 * ```
 *
 * Result:
 * ```
 * {
 *   "errcode": 0,
 *   "errmsg": "ok",
 *   "userid": "zhangsan",
 *   "name": "李四",
 *   "department": [1, 2],
 *   "position": "后台工程师",
 *   "mobile": "15913215421",
 *   "gender": 1,
 *   "tel": "62394",
 *   "email": "zhangsan@gzdev.com",
 *   "weixinid": "lisifordev",
 *   "avatar": "http://wx.qlogo.cn/mmopen/ajNVdqHZLLA3WJ6DSZUfiakYe37PKnQhBIeOQBO4czqrnZDS79FH5Wm5m4X69TBicnHFlhiafvDwklOpZeXYQQ2icg/0",
 *   "status": 1
 * }
 * ```
 * @param {Number} userid 成员ID
 */
exports.getUser = async (userid) => {
  var token = await this.ensureAccessToken();
  var url = this.prefix + 'user/get?access_token=' + token.accessToken + '&userid=' + userid;
  var opts = {dataType: 'json'};
  return await this.request(url, opts);
};

/**
 * 获取部门成员
 *
 * Examples:
 * ```
 * var result = await api.getDepartmentUsers(departmentId, fetchChild, status);
 * ```
 *
 * Result:
 * ```
 * {
 *   "errcode": 0,
 *   "errmsg": "ok",
 *   "userlist": [
 *     {
 *       "userid": "zhangsan",
 *       "name": "李四"
 *     }
 *   ]
 * }
 * ```
 * @param {Number} departmentId 部门ID
 * @param {Number} fetchChild 值：1/0，是否递归获取子部门下面的成员
 * @param {Number} status 0获取全部员工，1获取已关注成员列表，2获取禁用成员列表，4获取未关注成员列表。status可叠加
 */
exports.getDepartmentUsers = async (departmentId, fetchChild, status) => {
  var token = await this.ensureAccessToken();
  var url = this.prefix + 'user/simplelist?access_token=' + token.accessToken;
  url += '&' + querystring.stringify({
    department_id: departmentId,
    fetch_child: fetchChild,
    status: status
  });
  var opts = {
    dataType: 'json',
  };
  return await this.request(url, opts);
};
/**
 * 获取部门成员(详情)
 *
 * Examples:
 * ```
 * var result = await api.getDepartmentUsersDetail(departmentId, fetchChild, status);
 * ```
 *
 * Result:
 * ```
 * {
 *  "errcode": 0,
 *  "errmsg": "ok",
 *  "userlist": [
 *    {
 *      "userid": "zhangsan",
 *      "name": "李四",
 *      "department": [1, 2],
 *      "position": "后台工程师",
 *      "mobile": "15913215421",
 *      "email": "zhangsan@gzdev.com",
 *      "weixinid": "lisifordev",
 *      "avatar": "http://wx.qlogo.cn/mmopen/ajNVdqHZLLA3WJ6DSZUfiakYe37PKnQhBIeOQBO4czqrnZDS79FH5Wm5m4X69TBicnHFlhiafvDwklOpZeXYQQ2icg/0",
 *      "status": 1,
 *      "extattr": {"attrs":[{"name":"爱好","value":"旅游"},{"name":"卡号","value":"1234567234"}]}
 *    }
 *  ]
 * }
 * ```
 * @param {Number} departmentId 部门ID
 * @param {Number} fetchChild 值：1/0，是否递归获取子部门下面的成员
 * @param {Number} status 0获取全部员工，1获取已关注成员列表，2获取禁用成员列表，4获取未关注成员列表。status可叠加
 */
exports.getDepartmentUsersDetail = async (departmentId, fetchChild, status) => {
  var token = await this.ensureAccessToken();
  var url = this.prefix + 'user/list?access_token=' + token.accessToken;
  url += '&' + querystring.stringify({
    department_id: departmentId,
    fetch_child: fetchChild,
    status: status
  });
  var opts = {
    dataType: 'json',
  };
  return await this.request(url, opts);
};

/**
 * 邀请成员关注
 *
 * 详情：http://qydev.weixin.qq.com/wiki/index.php?title=%E7%AE%A1%E7%90%86%E6%88%90%E5%91%98#.E9.82.80.E8.AF.B7.E6.88.90.E5.91.98.E5.85.B3.E6.B3.A8
 * Examples:
 * ```
 * var result = await api.inviteUser(userid, invite_tips);
 * ```
 *
 * Callback:
 *
 * - `err`, 调用失败时得到的异常
 * - `result`, 调用正常时得到的对象
 *
 * Result:
 * ```
 * {
 *  "errcode": 0,
 *  "errmsg": "ok",
 *  "type":1
 * }
 * ```
 * @param {String} userid userid
 * @param {String} invite_tips 邀请的一句话
 */
exports.inviteUser = async (userid, invite_tips) => {
  var token = await this.ensureAccessToken();
  var url = this.prefix + 'invite/send?access_token=' + token.accessToken;
  var data= {
      userid: userid,
      invite_tips: invite_tips
  };
  return await this.request(url, postJSON(data));
};

/**
 * 根据Code获取用户ID
 *
 * 详情：http://qydev.weixin.qq.com/wiki/index.php?title=根据code获取成员信息
 * Examples:
 * ```
 * var result = await api.getUserIdByCode(code, agentid);
 * ```
 *
 * Result:
 * ```
 * {
 *   "UserId": "USERID"
 * }
 * ```
 * @param {String} code OAuth授权获取的code
 * @param {String} agentid APP
 */
exports.getUserIdByCode = async (code, agentid) => {
  var token = await this.ensureAccessToken();
  var url = this.prefix + 'user/getuserinfo?access_token=' + token.accessToken;
  url += '&' + querystring.stringify({
  	code: code,
    agentid: agentid
  });
  var opts = {
    dataType: 'json'
  };
  return await this.request(url, opts);
};

/**
 * 获取授权页面的URL地址
 * @param {String} redirect 授权后要跳转的地址
 * @param {String} state 开发者可提供的数据
 * @param {String} scope 作用范围，值为snsapi_userinfo和snsapi_base，前者用于弹出，后者用于跳转
 */
exports.getAuthorizeURL = function (redirect, state, scope) {
  var url = 'https://open.weixin.qq.com/connect/oauth2/authorize';
  var info = {
    appid: this.corpid,
    redirect_uri: redirect,
    response_type: 'code',
    scope: scope || 'snsapi_base',
    state: state || ''
  };

  return url + '?' + querystring.stringify(info) + '#wechat_redirect';
};
