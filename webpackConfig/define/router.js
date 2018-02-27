const Path = require('path');
const Var = require('./varPath.js');

// 页面和入口文件映射表
module.exports = {

  //chunkname: 入口JS
  	
	login: { // 登录
		entry: Path.resolve(Var.ENTRY_PATH, 'app/login/index.js'),
		chunkArr: ['base','login']
	}, 
	base: { // base
		entry: Path.resolve(Var.ENTRY_PATH, 'modules/base.js'),
		noHtml:true
	}, 
	getLogin: { // 注册
		entry: Path.resolve(Var.ENTRY_PATH, 'app/login/getLogin.js'),
		chunkArr: ['getLogin']
	}, 
	Swiper: { // swiper
		entry: Path.resolve(Var.ENTRY_PATH, 'plugins/swiper.min.js'),
		noHtml:true
	}, 
	register: { // 注册
		entry: Path.resolve(Var.ENTRY_PATH, 'app/register/index.js'),
		chunkArr: ['getLogin','register']
	}, 
	ajaxform: { // 弹窗登录注册
		entry: Path.resolve(Var.ENTRY_PATH, 'app/ajaxform/index.js'),
		chunkArr: ['ajaxform']
	}, 
	couponPromo: { // 促销优惠券
		entry: Path.resolve(Var.ENTRY_PATH, 'app/couponPromo/index.js'),
		chunkArr: ['Swiper','couponPromo']
	},
	addressPromo: { // 促销地址管理
		entry: Path.resolve(Var.ENTRY_PATH, 'app/addressPromo/index.js'),
		chunkArr: ['getLogin','addressPromo']
	},	
	userCenter: { // 用户中心
		entry: Path.resolve(Var.ENTRY_PATH, 'app/userCenter/index.js'),
		chunkArr: ['getLogin','Swiper','userCenter']
	},
	findPassword: { // 找回密码
		entry: Path.resolve(Var.ENTRY_PATH, 'app/findPassword/index.js'),
		chunkArr: ['getLogin','findPassword', 'style']
	},
	Security: { // 安全中心
		entry: Path.resolve(Var.ENTRY_PATH, 'app/Security/index.js'),
		chunkArr: ['getLogin','Security', 'style']
	}
	// address: { // 地址管理
	// 	entry: Path.resolve(Var.ENTRY_PATH, 'app/address/index.js'),
	// 	chunkArr: ['getLogin','address']
	// }

}