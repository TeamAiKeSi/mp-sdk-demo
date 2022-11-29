const app = getApp<IAppOption>()
const VationSDK = requirePlugin('vation-mp-plugin')
Page({
    data: {
        email: '',
        code: '',
        auth_token: '',
        app_key: '',
        userInfo: {},
        readerList: {},
        readers: [],
    },

    onLoad() {
        console.log(VationSDK, 'VationSDK');

        this.init()
    },

    init() {
        VationSDK.initSDK()
    },

    // 输入邮箱
    inputEmail(e: any) {
        this.setData({ email: e.detail.value })
    },

    // 输入验证码
    inputCode(e: any) {
        this.setData({ code: e.detail.value })
    },

    // 输入auth_token
    inputAuthToken(e: any) {
        this.setData({ auth_token: e.detail.value })
    },

    // 输入appkey
    inputAppKey(e: any) {
        this.setData({ app_key: e.detail.value })
    },

    // 获取验证码
    getCode() {
        const { email } = this.data
        VationSDK.authorizeWithEmail({
            email: email,
            success() { wx.hideLoading({ complete: () => { wx.showToast({ title: "验证码已发送", }) } }) },
            fail() { wx.hideLoading({ complete: () => { wx.showToast({ title: "验证码发送失败", }) } }) },
        });
    },

    // 验证码登录
    codeLogin() {
        const { code } = this.data
        VationSDK.loginWithCode({
            code,
            success() { wx.showToast({ title: "登录成功" }) },
            fail() { wx.showToast({ title: "登录失败" }) },
        });
    },

    // 第三方登录
    thirdPartyLogin() {
        const { app_key, auth_token } = this.data
        console.log(app_key, 'app_key');
        console.log(auth_token, 'auth_token');
        VationSDK.thirdPartyLogin({
            auth_token,
            authorization: app_key,
            success() { wx.showToast({ title: "登录成功" }) },
            fail() { wx.showToast({ title: "登录失败" }) },
        });
    },

    // 刷新token
    refreshToken() {
        VationSDK.refreshToken({
            success() { wx.showToast({ title: "刷新成功" }) },
            fail() { wx.showToast({ title: "刷新失败" }) },
        });
    },

    // 检查登录状态
    checkLogin() {
        const loginStatus = VationSDK.isLogin()
        wx.showToast({ title: loginStatus ? "已登录" : "未登录" })
    },

    // 获取用户信息
    getUser() {
        const user = VationSDK.getUser()
        console.log(user, 'user');
    },

    // 开启蓝牙服务
    openBlueTooth() {
        console.log('开启蓝牙');
        let { readerList } = this.data
        const _this = this
        readerList = {}
        this.setData({ readers: [] })
        VationSDK.onReadersInRange({
            callback(res: any) {
                readerList[res.fixtureId] = res
                let readers = []
                for (let i in readerList) {
                    readers.push(readerList[i]);
                }
                _this.setData({ readers: readers as any })
            },
        });

        VationSDK.startBleScan({
            success(res: any) { console.info("开始扫描蓝牙设备", res) },
            fail(res: any) { console.error("开始扫描蓝牙设备失败", res) },
        });
    },

    // 关闭蓝牙服务
    closeBlueTooth() {
        this.setData({ readers: [], readerList: {} })
        VationSDK.stopBleScan()
        wx.showToast({ title: "关闭蓝牙服务" })
    },

    // 开门
    unlock(event: any) {
        let dataset = event.currentTarget.dataset;
        VationSDK.unlock({
            fixtureId: dataset.id,
            success(res: any) { console.log(res, '开门成功') },
            fail(res: any) { console.error(res, '开门失败') },
        });
    }

})
