const app = getApp<IAppOption>();
const VationXSDK = requirePlugin("vation-mp-plugin");
Page({
    data: {
        email: "zekun@vationx.com",
        code: "828466",
        auth_token: "",
        app_key: "",
        userInfo: {},
        readerList: [],
    },

    onLoad() {
        console.log(VationXSDK, "VationXSDK");
        this.init();
    },

    init() {
        VationXSDK.initSDK(); // 成功：'success'，失败：'fail'，注意：初始化成功后，才能正常开门。
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
        const res = await VationXSDK.getLoginCode(email);
        console.log("获取验证码：", res); // 成功：'success'，失败：返回错误信息。
    },

    // 验证码登录
    async codeLogin() {
        const { email, code } = this.data;
        const res = await VationXSDK.codeLogin(email, code);
        console.log("验证码登录：", res); // 成功：'success'，失败：后端报错返回具体报错信息，其它报错返回‘fail'。
    },

    // 第三方登录
    async thirdPartyLogin() {
        const { app_key, auth_token } = this.data;
        const res = await VationXSDK.thirdPartyLogin(app_key, auth_token);
        console.log("第三方登录：", res); // 成功：'success'，失败：后端报错返回具体报错信息，其它报错返回‘fail'。
    },

    // 刷新token
    async refreshToken() {
        const res = await VationXSDK.refreshToken(); // 短信登录，直接刷新
        // const res = await VationXSDK.refreshToken(app_key) // 第三方登录，需要传入app_key
        console.log("刷新token：", res); // 成功：'success'，失败：后端报错返回具体报错信息，其它报错返回‘fail'。
    },

    // 检查登录状态
    async checkLogin() {
        const res = await VationXSDK.checkLogin();
        console.log("检查登录状态：", res); // true | false
    },

    // 获取用户信息
    getUser() {
        const res = VationXSDK.getUserInfo();
        console.log("用户信息：", res); // 在initSDK成功后再调用，成功：对应用户信息，失败：'fail'。
    },

    // 开启蓝牙服务并扫描周边设备
    async openBlueTooth() {
        // 开启蓝牙服务
        const res = await VationXSDK.startBlueToothScan();
        console.log("开启蓝牙服务：", res); // 成功：'success'，失败：如果是微信端报错返回具体报错信息，其它报错会提示对应错误。

        // 扫描附近可用读卡器，返回有权限的读卡器列表，频率较高，可根据根据业务需求做节流处理。
        VationXSDK.getReadersInRange((readerList: any) => {
            console.log(readerList, "readerList");
            this.setData({ readerList });
        });
    },

    // 关闭蓝牙服务
    async closeBlueTooth() {
        const res = await VationXSDK.stopBlueToothScan(); // 成功：'success'，失败：如果是微信端报错返回具体报错信息，其它报错会提示对应错误。
        console.log("关闭蓝牙服务：", res);
        if (res.errCode === 0) {
            this.setData({ readerList: [] });
        }
    },

    // 开门
    async unlock(event: any) {
        const id = event.currentTarget.dataset.id;
        const res = await VationXSDK.unlock(id);
        console.log("开门：", res); // 成功：'success'，失败：如果是微信端报错返回具体报错信息，其它报错会提示对应错误。
        if (res.errCode === 10008) {
            await VationXSDK.stopBlueToothScan()
            await VationXSDK.refreshPermission()
            await this.openBlueTooth()
            await VationXSDK.retryUnlock(id) // 重试开门，成功会返回 success 超时返回 timeout 失败返回对应错误。
          }
    },
});
