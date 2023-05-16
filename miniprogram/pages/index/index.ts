const app = getApp<IAppOption>();
const { accessModule, authModule } = requirePlugin("vation-mp-plugin");

Page({
  data: {
    email: "",
    code: "",
    auth_token: "",
    app_key: "",
    userInfo: {},
    readerList: [],
    log: "",
  },

  onLoad() {
    console.log(accessModule, "accessModule");
    console.log(authModule, "authModule");
    // 设置dev的api调用staging环境的接口
    if (wx.getAccountInfoSync().miniProgram.envVersion === "develop") authModule.setEnv("trial");
  },

  // 输入邮箱
  inputEmail(e: any) {
    this.setData({ email: e.detail.value });
  },

  // 输入验证码
  inputCode(e: any) {
    this.setData({ code: e.detail.value });
  },

  // 输入auth_token
  inputAuthToken(e: any) {
    this.setData({ auth_token: e.detail.value });
  },

  // 输入appkey
  inputAppKey(e: any) {
    this.setData({ app_key: e.detail.value });
  },

  // 获取验证码
  async getCode() {
    const { email } = this.data;
    const res = await authModule.getLoginCode(email);
    this.setData({ log: JSON.stringify(res) });
    console.log("获取验证码：", res); // 成功：'success'，失败：返回错误信息。
  },

  // 验证码登录
  async codeLogin() {
    const { email, code } = this.data;
    const res = await authModule.codeLogin(email, code);
    this.setData({ log: JSON.stringify(res) });
    console.log("验证码登录：", res); // 成功：'success'，失败：后端报错返回具体报错信息，其它报错返回‘fail'。
  },

  // 第三方登录
  async thirdPartyLogin() {
    const { app_key, auth_token } = this.data;
    const res = await authModule.thirdPartyLogin(app_key, auth_token);
    this.setData({ log: JSON.stringify(res) });
    console.log("第三方登录：", res); // 成功：'success'，失败：后端报错返回具体报错信息，其它报错返回‘fail'。
  },

  // 刷新token
  async refreshToken() {
    const { app_key } = this.data;
    const res = await authModule.refreshToken(app_key || ""); // 短信登录，直接刷新
    // const res = await VationXSDK.refreshToken(); // 短信登录，直接刷新
    // const res = await VationXSDK.refreshToken(app_key) // 第三方登录，需要传入app_key
    this.setData({ log: JSON.stringify(res) });
    console.log("刷新token：", res); // 成功：'success'，失败：后端报错返回具体报错信息，其它报错返回‘fail'。
  },

  // 刷新权限
  async refreshPermission() {
    const res = await authModule.refreshPermission();
    this.setData({ log: JSON.stringify(res) });
    console.log("刷新权限：", res);
  },

  // 检查登录状态
  async checkLogin() {
    const res = await authModule.checkLogin();
    this.setData({ log: JSON.stringify(res) });
    console.log("检查登录状态：", res); // true | false
  },

  // 获取用户信息
  getUser() {
    const res = authModule.getUserInfo();
    this.setData({ log: JSON.stringify(res.email) });
    console.log("用户信息：", res); // 在initSDK成功后再调用，成功：对应用户信息，失败：'fail'。
  },

  // 开启蓝牙服务并扫描周边设备
  async openBlueTooth() {
    // 开启蓝牙服务
    const startBlueToothScanRes = await accessModule.startBlueToothScan();
    console.log("开启蓝牙服务：", startBlueToothScanRes);
    this.setData({ log: JSON.stringify(startBlueToothScanRes) });

    if (startBlueToothScanRes.errCode === 0) {
      // 扫描附近可用读卡器
      accessModule.getReadersInRange(async (reader_list: any) => {
        console.log(reader_list, "reader_list");
        // 处理数据，显示扫描到的并且prefetch到的reader
        if (reader_list.readerWithPermission.length > 0) {
          this.setData({ readerList: reader_list.readerWithPermission });
        } else {
          this.setData({ readerList: [] });
        }
        this.setData({ log: JSON.stringify(reader_list) });
      });
    } else {
      console.log(startBlueToothScanRes, "startBlueToothScanRes");
    }
  },

  // 关闭蓝牙服务
  async closeBlueTooth() {
    const res = await accessModule.stopBlueToothScan(); // 成功：'success'，失败：如果是微信端报错返回具体报错信息，其它报错会提示对应错误。
    this.setData({ log: JSON.stringify(res) });
    console.log("关闭蓝牙服务：", res);
    if (res.errCode === 0) {
      this.setData({ readerList: [] });
    }
  },

  // 开门
  async unlock(event: any) {
    const id = event.currentTarget.dataset.id;
    const res = await accessModule.unlock(id);
    this.setData({ log: JSON.stringify(res) });
    console.log("开门：", res); // 成功：'success'，失败：如果是微信端报错返回具体报错信息，其它报错会提示对应错误。

    if (res.errCode === 10008) {
      await accessModule.stopBlueToothScan();
      await accessModule.refreshPermission();
      await this.openBlueTooth();
      await accessModule.retryUnlock(id);
    }
  },
});
