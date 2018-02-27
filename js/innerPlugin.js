/**
 * 提示弹出插件
 * 加入购物车按钮等弹出提示框的地方
 **/
/**
 * easyDialog v2.0
 * Url : http://stylechen.com/easydialog-v2.0.html
 * Author : chenmnkken@gmail.com
 * Date : 2011-08-30
 */
(function(win, undefined) {

	var doc = win.document,
		docElem = doc.documentElement;

	var easyDialog = function() {

		var body = doc.body,
			isIE = !-[1, ], // 判断IE6/7/8 不能判断IE9
			isIE6 = isIE && /msie 6/.test(navigator.userAgent.toLowerCase()), // 判断IE6
			uuid = 1,
			expando = 'cache' + (+new Date() + "").slice(-8), // 生成随机数
			cacheData = {
				/**
				 *  1 : {
				 *      eclick : [ handler1, handler2, handler3 ];
				 *      clickHandler : function(){ //... };
				 *  }
				 */
			};

		var Dialog = function() {};

		Dialog.prototype = {
			// 参数设置
			getOptions: function(arg) {
				var i,
					options = {},
					// 默认参数
					defaults = {
						container: null, // string / object   弹处层内容的id或内容模板
						overlay: true, // boolean        是否添加遮罩层
						drag: true, // boolean           是否绑定拖拽事件
						fixed: true, // boolean          是否静止定位
						follow: null, // string / object   是否跟随自定义元素来定位
						followX: 0, // number            相对于自定义元素的X坐标的偏移
						followY: 0, // number            相对于自定义元素的Y坐标的偏移
						autoClose: 0, // number            自动关闭弹出层的时间
						lock: false, // boolean           是否允许ESC键来关闭弹出层
						callback: null // function          关闭弹出层后执行的回调函数
						/**
						 *  container为object时的参数格式
						 *  container : {
						 *      header : '弹出层标题',
						 *      content : '弹出层内容',
						 *      yesFn : function(){},       // 确定按钮的回调函数
						 *      noFn : function(){} / true, // 取消按钮的回调函数
						 *      yesText : '确定',         // 确定按钮的文本，默认为‘确定’
						 *      noText : '取消'           // 取消按钮的文本，默认为‘取消’
						 *  }
						 */
					};

				for(i in defaults) {
					options[i] = arg[i] !== undefined ? arg[i] : defaults[i];
				}
				Dialog.data('options', options);
				return options;
			},

			// 防止IE6模拟fixed时出现抖动
			setBodyBg: function() {
				if(body.currentStyle.backgroundAttachment !== 'fixed') {
					body.style.backgroundImage = 'url(about:blank)';
					body.style.backgroundAttachment = 'fixed';
				}
			},

			// 防止IE6的select穿透
			appendIframe: function(elem) {
				elem.innerHTML = '<iframe style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:-1;border:0 none;filter:alpha(opacity=0)"></iframe>';
			},

			/**
			 * 设置元素跟随定位
			 * @param { Object } 跟随的DOM元素
			 * @param { String / Object } 被跟随的DOM元素
			 * @param { Number } 相对于被跟随元素的X轴的偏移
			 * @param { Number } 相对于被跟随元素的Y轴的偏移
			 */
			setFollow: function(elem, follow, x, y) {
				follow = typeof follow === 'string' ? doc.getElementById(follow) : follow;
				var style = elem.style;
				style.position = 'absolute';
				style.left = Dialog.getOffset(follow, 'left') + x + 'px';
				style.top = Dialog.getOffset(follow, 'top') + y + 'px';
			},

			/**
			 * 设置元素固定(fixed) / 绝对(absolute)定位
			 * @param { Object } DOM元素
			 * @param { Boolean } true : fixed, fasle : absolute
			 */
			setPosition: function(elem, fixed) {
				var style = elem.style;
				style.position = isIE6 ? 'absolute' : fixed ? 'fixed' : 'absolute';
				if(fixed) {
					if(isIE6) {
						style.setExpression('top', 'fuckIE6=document.documentElement.scrollTop+document.documentElement.clientHeight/2+"px"');
					} else {
						style.top = '50%';
					}
					style.left = '50%';
				} else {
					if(isIE6) {
						style.removeExpression('top');
					}
					style.top = docElem.clientHeight / 2 + Dialog.getScroll('top') + 'px';
					style.left = docElem.clientWidth / 2 + Dialog.getScroll('left') + 'px';
				}
			},

			/**
			 * 创建遮罩层
			 * @return { Object } 遮罩层
			 */
			createOverlay: function() {
				var overlay = doc.createElement('div'),
					style = overlay.style;

				style.cssText = 'margin:0;padding:0;border:none;width:100%;height:100%;background:#333;opacity:0.6;filter:alpha(opacity=60);z-index:9999;position:fixed;top:0;left:0;';

				// IE6模拟fixed
				if(isIE6) {
					body.style.height = '100%';
					style.position = 'absolute';
					style.setExpression('top', 'fuckIE6=document.documentElement.scrollTop+"px"');
				}

				overlay.id = 'overlay';
				return overlay;
			},

			/**
			 * 创建弹出层
			 * @return { Object } 弹出层
			 */
			createDialogBox: function() {
				var dialogBox = doc.createElement('div');
				dialogBox.style.cssText = 'margin:0;padding:0;border:none;z-index:10000;';
				dialogBox.id = 'easyDialogBox';
				return dialogBox;
			},

			/**
			 * 创建默认的弹出层内容模板
			 * @param { Object } 模板参数
			 * @return { Object } 弹出层内容模板
			 */
			createDialogWrap: function(tmpl) {
				// 弹出层标题
				var header = tmpl.header ?
					'<h4 class="easyDialog_title" id="easyDialogTitle"><a href="javascript:void(0)" title="关闭窗口" class="close_btn" id="closeBtn">&times;</a>' + tmpl.header + '</h4>' :
					'',
					// 确定按钮
					yesBtn = typeof tmpl.yesFn === 'function' ?
					'<button class="btn_highlight" id="easyDialogYesBtn">' + (typeof tmpl.yesText === 'string' ? tmpl.yesText : '确定') + '</button>' :
					'',
					// 取消按钮
					noBtn = typeof tmpl.noFn === 'function' || tmpl.noFn === true ?
					'<button class="btn_normal" id="easyDialogNoBtn">' + (typeof tmpl.noText === 'string' ? tmpl.noText : '取消') + '</button>' :
					'',
					// footer
					footer = yesBtn === '' && noBtn === '' ? '' :
					'<div class="easyDialog_footer">' + noBtn + yesBtn + '</div>',

					dialogTmpl = [
						'<div class="easyDialog_content">',
						header,
						'<div class="easyDialog_text">' + tmpl.content + '</div>',
						footer,
						'</div>'
					].join(''),

					dialogWrap = doc.getElementById('easyDialogWrapper'),
					rScript = /<[\/]*script[\s\S]*?>/ig;

				if(!dialogWrap) {
					dialogWrap = doc.createElement('div');
					dialogWrap.id = 'easyDialogWrapper';
					dialogWrap.className = 'easyDialog_wrapper';
				}
				dialogWrap.innerHTML = dialogTmpl.replace(rScript, '');
				return dialogWrap;
			}
		};

		/**
		 * 设置并返回缓存的数据 关于缓存系统详见：http://stylechen.com/cachedata.html
		 * @param { String / Object } 任意字符串或DOM元素
		 * @param { String } 缓存属性名
		 * @param { Anything } 缓存属性值
		 * @return { Object }
		 */
		Dialog.data = function(elem, val, data) {
			if(typeof elem === 'string') {
				if(val !== undefined) {
					cacheData[elem] = val;
				}
				return cacheData[elem];
			} else if(typeof elem === 'object') {
				// 如果是window、document将不添加自定义属性
				// window的索引是0 document索引为1
				var index = elem === win ? 0 :
					elem.nodeType === 9 ? 1 :
					elem[expando] ? elem[expando] :
					(elem[expando] = ++uuid),

					thisCache = cacheData[index] ? cacheData[index] : (cacheData[index] = {});

				if(data !== undefined) {
					// 将数据存入缓存中
					thisCache[val] = data;
				}
				// 返回DOM元素存储的数据
				return thisCache[val];
			}
		};

		/**
		 * 删除缓存
		 * @param { String / Object } 任意字符串或DOM元素
		 * @param { String } 要删除的缓存属性名
		 */
		Dialog.removeData = function(elem, val) {
			if(typeof elem === 'string') {
				delete cacheData[elem];
			} else if(typeof elem === 'object') {
				var index = elem === win ? 0 :
					elem.nodeType === 9 ? 1 :
					elem[expando];

				if(index === undefined) return;
				// 检测对象是否为空
				var isEmptyObject = function(obj) {
						var name;
						for(name in obj) {
							return false;
						}
						return true;
					},
					// 删除DOM元素所有的缓存数据
					delteProp = function() {
						delete cacheData[index];
						if(index <= 1) return;
						try {
							// IE8及标准浏览器可以直接使用delete来删除属性
							delete elem[expando];
						} catch(e) {
							// IE6/IE7使用removeAttribute方法来删除属性(document会报错)
							elem.removeAttribute(expando);
						}
					};

				if(val) {
					// 只删除指定的数据
					delete cacheData[index][val];
					if(isEmptyObject(cacheData[index])) {
						delteProp();
					}
				} else {
					delteProp();
				}
			}
		};

		// 事件处理系统
		Dialog.event = {

			bind: function(elem, type, handler) {
				var events = Dialog.data(elem, 'e' + type) || Dialog.data(elem, 'e' + type, []);
				// 将事件函数添加到缓存中
				events.push(handler);
				// 同一事件类型只注册一次事件，防止重复注册
				if(events.length === 1) {
					var eventHandler = this.eventHandler(elem);
					Dialog.data(elem, type + 'Handler', eventHandler);
					if(elem.addEventListener) {
						elem.addEventListener(type, eventHandler, false);
					} else if(elem.attachEvent) {
						elem.attachEvent('on' + type, eventHandler);
					}
				}
			},

			unbind: function(elem, type, handler) {
				var events = Dialog.data(elem, 'e' + type);
				if(!events) return;

				// 如果没有传入要删除的事件处理函数则删除该事件类型的缓存
				if(!handler) {
					events = undefined;
				}
				// 如果有具体的事件处理函数则只删除一个
				else {
					for(var i = events.length - 1, fn = events[i]; i >= 0; i--) {
						if(fn === handler) {
							events.splice(i, 1);
						}
					}
				}
				// 删除事件和缓存
				if(!events || !events.length) {
					var eventHandler = Dialog.data(elem, type + 'Handler');
					if(elem.addEventListener) {
						elem.removeEventListener(type, eventHandler, false);
					} else if(elem.attachEvent) {
						elem.detachEvent('on' + type, eventHandler);
					}
					Dialog.removeData(elem, type + 'Handler');
					Dialog.removeData(elem, 'e' + type);
				}
			},

			// 依次执行事件绑定的函数
			eventHandler: function(elem) {
				return function(event) {
					event = Dialog.event.fixEvent(event || win.event);
					var type = event.type,
						events = Dialog.data(elem, 'e' + type);

					for(var i = 0, handler; handler = events[i++];) {
						if(handler.call(elem, event) === false) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			},

			// 修复IE浏览器支持常见的标准事件的API
			fixEvent: function(e) {
				// 支持DOM 2级标准事件的浏览器无需做修复
				if(e.target) return e;
				var event = {},
					name;
				event.target = e.srcElement || document;
				event.preventDefault = function() {
					e.returnValue = false;
				};
				event.stopPropagation = function() {
					e.cancelBubble = true;
				};
				// IE6/7/8在原生的window.event中直接写入自定义属性
				// 会导致内存泄漏，所以采用复制的方式
				for(name in e) {
					event[name] = e[name];
				}
				return event;
			}
		};

		/**
		 * 首字母大写转换
		 * @param { String } 要转换的字符串
		 * @return { String } 转换后的字符串 top => Top
		 */
		Dialog.capitalize = function(str) {
			var firstStr = str.charAt(0);
			return firstStr.toUpperCase() + str.replace(firstStr, '');
		};

		/**
		 * 获取滚动条的位置
		 * @param { String } 'top' & 'left'
		 * @return { Number }
		 */
		Dialog.getScroll = function(type) {
			var upType = this.capitalize(type);
			return docElem['scroll' + upType] || body['scroll' + upType];
		};

		/**
		 * 获取元素在页面中的位置
		 * @param { Object } DOM元素
		 * @param { String } 'top' & 'left'
		 * @return { Number }
		 */
		Dialog.getOffset = function(elem, type) {
			var upType = this.capitalize(type),
				client = docElem['client' + upType] || body['client' + upType] || 0,
				scroll = this.getScroll(type),
				box = elem.getBoundingClientRect();

			return Math.round(box[type]) + scroll - client;
		};

		/**
		 * 拖拽效果
		 * @param { Object } 触发拖拽的DOM元素
		 * @param { Object } 要进行拖拽的DOM元素
		 */
		Dialog.drag = function(target, moveElem) {
			// 清除文本选择
			var clearSelect = 'getSelection' in win ? function() {
					win.getSelection().removeAllRanges();
				} : function() {
					try {
						doc.selection.empty();
					} catch(e) {};
				},

				self = this,
				event = self.event,
				isDown = false,
				newElem = isIE ? target : doc,
				fixed = moveElem.style.position === 'fixed',
				_fixed = Dialog.data('options').fixed;

			// mousedown
			var down = function(e) {
				isDown = true;
				var scrollTop = self.getScroll('top'),
					scrollLeft = self.getScroll('left'),
					edgeLeft = fixed ? 0 : scrollLeft,
					edgeTop = fixed ? 0 : scrollTop;

				Dialog.data('dragData', {
					x: e.clientX - self.getOffset(moveElem, 'left') + (fixed ? scrollLeft : 0),
					y: e.clientY - self.getOffset(moveElem, 'top') + (fixed ? scrollTop : 0),
					// 设置上下左右4个临界点的位置
					// 固定定位的临界点 = 当前屏的宽、高(下、右要减去元素本身的宽度或高度)
					// 绝对定位的临界点 = 当前屏的宽、高 + 滚动条卷起部分(下、右要减去元素本身的宽度或高度)
					el: edgeLeft, // 左临界点
					et: edgeTop, // 上临界点
					er: edgeLeft + docElem.clientWidth - moveElem.offsetWidth, // 右临界点
					eb: edgeTop + docElem.clientHeight - moveElem.offsetHeight // 下临界点
				});

				if(isIE) {
					// IE6如果是模拟fixed在mousedown的时候先删除模拟，节省性能
					if(isIE6 && _fixed) {
						moveElem.style.removeExpression('top');
					}
					target.setCapture();
				}

				event.bind(newElem, 'mousemove', move);
				event.bind(newElem, 'mouseup', up);

				if(isIE) {
					event.bind(target, 'losecapture', up);
				}

				e.stopPropagation();
				e.preventDefault();

			};

			event.bind(target, 'mousedown', down);

			// mousemove
			var move = function(e) {
				if(!isDown) return;
				clearSelect();
				var dragData = Dialog.data('dragData'),
					left = e.clientX - dragData.x,
					top = e.clientY - dragData.y,
					et = dragData.et,
					er = dragData.er,
					eb = dragData.eb,
					el = dragData.el,
					style = moveElem.style;

				// 设置上下左右的临界点以防止元素溢出当前屏
				style.marginLeft = style.marginTop = '0px';
				style.left = (left <= el ? el : (left >= er ? er : left)) + 'px';
				style.top = (top <= et ? et : (top >= eb ? eb : top)) + 'px';
				e.stopPropagation();
			};

			// mouseup
			var up = function(e) {
				isDown = false;
				if(isIE) {
					event.unbind(target, 'losecapture', arguments.callee);
				}
				event.unbind(newElem, 'mousemove', move);
				event.unbind(newElem, 'mouseup', arguments.callee);
				if(isIE) {
					target.releaseCapture();
					// IE6如果是模拟fixed在mouseup的时候要重新设置模拟
					if(isIE6 && _fixed) {
						var top = parseInt(moveElem.style.top) - self.getScroll('top');
						moveElem.style.setExpression('top', "fuckIE6=document.documentElement.scrollTop+" + top + '+"px"');
					}
				}
				e.stopPropagation();
			};
		};

		var timer, // 定时器
			// ESC键关闭弹出层
			escClose = function(e) {
				if(e.keyCode === 27) {
					extend.close();
				}
			},
			// 清除定时器
			clearTimer = function() {
				if(timer) {
					clearTimeout(timer);
					timer = undefined;
				}
			};

		var extend = {
			open: function() {
				var $ = new Dialog(),
					options = $.getOptions(arguments[0] || {}), // 获取参数
					event = Dialog.event,
					self = this,
					overlay,
					dialogBox,
					dialogWrap,
					boxChild;

				clearTimer();

				// ------------------------------------------------------
				// ---------------------插入遮罩层-----------------------
				// ------------------------------------------------------

				// 如果页面中已经缓存遮罩层，直接显示
				if(options.overlay) {
					overlay = doc.getElementById('overlay');
					if(!overlay) {
						overlay = $.createOverlay();
						body.appendChild(overlay);
						if(isIE6) {
							$.appendIframe(overlay);
						}
					}
					overlay.style.display = 'block';
				}

				if(isIE6) {
					$.setBodyBg();
				}

				// ------------------------------------------------------
				// ---------------------插入弹出层-----------------------
				// ------------------------------------------------------

				// 如果页面中已经缓存弹出层，直接显示
				dialogBox = doc.getElementById('easyDialogBox');
				if(!dialogBox) {
					dialogBox = $.createDialogBox();
					body.appendChild(dialogBox);
				}

				if(options.follow) {
					$.setFollow(dialogBox, options.follow, options.followX, options.followY);
					if(overlay) {
						overlay.style.display = 'none';
					}
					options.fixed = false;
				} else {
					$.setPosition(dialogBox, options.fixed);
				}
				dialogBox.style.display = 'block';

				// 确保弹出层绝对定位时放大缩小窗口也可以垂直居中显示
				if(!options.follow && !options.fixed) {
					var resize = function() {
						$.setPosition(dialogBox, false);
					};
					event.bind(win, 'resize', resize);
					Dialog.data('resize', resize);
				}

				// ------------------------------------------------------
				// -------------------插入弹出层内容---------------------
				// ------------------------------------------------------

				// 判断弹出层内容是否已经缓存过
				dialogWrap = typeof options.container === 'string' ?
					doc.getElementById(options.container) :
					$.createDialogWrap(options.container);

				boxChild = dialogBox.getElementsByTagName('*')[0];

				if(!boxChild) {
					dialogBox.appendChild(dialogWrap);
				} else if(boxChild && dialogWrap !== boxChild) {
					boxChild.style.display = 'none';
					body.appendChild(boxChild);
					dialogBox.appendChild(dialogWrap);
				}

				dialogWrap.style.display = 'block';

				var eWidth = dialogWrap.offsetWidth,
					eHeight = dialogWrap.offsetHeight;

				// 强制去掉自定义弹出层内容的margin
				dialogWrap.style.marginTop = dialogWrap.style.marginRight = dialogWrap.style.marginBottom = dialogWrap.style.marginLeft = '0px';

				// 居中定位
				if(!options.follow) {
					dialogBox.style.marginLeft = '-' + eWidth / 2 + 'px';
					dialogBox.style.marginTop = '-' + eHeight / 2 + 'px';
				} else {
					dialogBox.style.marginLeft = dialogBox.style.marginTop = '0px';
				}

				// 防止select穿透固定宽度和高度
				if(isIE6 && !options.overlay) {
					dialogBox.style.width = eWidth + 'px';
					dialogBox.style.height = eHeight + 'px';
				}

				// ------------------------------------------------------
				// --------------------绑定相关事件----------------------
				// ------------------------------------------------------
				var closeBtn = doc.getElementById('closeBtn'),
					dialogTitle = doc.getElementById('easyDialogTitle'),
					dialogYesBtn = doc.getElementById('easyDialogYesBtn'),
					dialogNoBtn = doc.getElementById('easyDialogNoBtn');

				// 绑定确定按钮的回调函数
				if(dialogYesBtn) {
					event.bind(dialogYesBtn, 'click', function(event) {
						if(options.container.yesFn.call(self, event) !== false) {
							self.close();
						}
					});
				}

				// 绑定取消按钮的回调函数
				if(dialogNoBtn) {
					var noCallback = function(event) {
						if(options.container.noFn === true || options.container.noFn.call(self, event) !== false) {
							self.close();
						}
					};
					event.bind(dialogNoBtn, 'click', noCallback);
					// 如果取消按钮有回调函数 关闭按钮也绑定同样的回调函数
					if(closeBtn) {
						event.bind(closeBtn, 'click', noCallback);
					}
				}
				// 关闭按钮绑定事件
				else if(closeBtn) {
					event.bind(closeBtn, 'click', self.close);
				}

				// ESC键关闭弹出层
				if(!options.lock) {
					event.bind(doc, 'keyup', escClose);
				}
				// 自动关闭弹出层
				if(options.autoClose && typeof options.autoClose === 'number') {
					timer = setTimeout(self.close, options.autoClose);
				}
				// 绑定拖拽
				if(options.drag && dialogTitle) {
					dialogTitle.style.cursor = 'move';
					Dialog.drag(dialogTitle, dialogBox);
				}
				// 缓存相关元素以便关闭弹出层的时候进行操作
				Dialog.data('dialogElements', {
					overlay: overlay,
					dialogBox: dialogBox,
					closeBtn: closeBtn,
					dialogTitle: dialogTitle,
					dialogYesBtn: dialogYesBtn,
					dialogNoBtn: dialogNoBtn
				});
			},

			close: function() {
				var options = Dialog.data('options'),
					elements = Dialog.data('dialogElements'),
					event = Dialog.event;

				clearTimer();
				//  隐藏遮罩层
				if(options.overlay && elements.overlay) {
					elements.overlay.style.display = 'none';
				}
				// 隐藏弹出层
				elements.dialogBox.style.display = 'none';
				// IE6清除CSS表达式
				if(isIE6) {
					elements.dialogBox.style.removeExpression('top');
				}

				// ------------------------------------------------------
				// --------------------删除相关事件----------------------
				// ------------------------------------------------------
				if(elements.closeBtn) {
					event.unbind(elements.closeBtn, 'click');
				}

				if(elements.dialogTitle) {
					event.unbind(elements.dialogTitle, 'mousedown');
				}

				if(elements.dialogYesBtn) {
					event.unbind(elements.dialogYesBtn, 'click');
				}

				if(elements.dialogNoBtn) {
					event.unbind(elements.dialogNoBtn, 'click');
				}

				if(!options.follow && !options.fixed) {
					var resize = Dialog.data('resize');
					event.unbind(win, 'resize', resize);
					Dialog.removeData('resize');
				}
				if(!options.lock) {
					event.unbind(doc, 'keyup', escClose);
				}
				// 执行callback
				if(typeof options.callback === 'function') {
					//alert( self );
					options.callback.call(extend);
				}
				// 清除缓存
				Dialog.removeData('options');
				Dialog.removeData('dialogElements');
			}
		};

		return extend;

	};

	// ------------------------------------------------------
	// ---------------------DOM加载模块----------------------
	// ------------------------------------------------------
	var loaded = function() {
			win.easyDialog = easyDialog();
		},

		doScrollCheck = function() {
			if(doc.body) return;

			try {
				docElem.doScroll("left");
			} catch(e) {
				setTimeout(doScrollCheck, 1);
				return;
			}
			loaded();
		};

	(function() {
		if(doc.body) {
			loaded();
		} else {
			if(doc.addEventListener) {
				doc.addEventListener('DOMContentLoaded', function() {
					doc.removeEventListener('DOMContentLoaded', arguments.callee, false);
					loaded();
				}, false);
				win.addEventListener('load', loaded, false);
			} else if(doc.attachEvent) {
				doc.attachEvent('onreadystatechange', function() {
					if(doc.readyState === 'complete') {
						doc.detachEvent('onreadystatechange', arguments.callee);
						loaded();
					}
				});
				win.attachEvent('onload', loaded);
				var toplevel = false;
				try {
					toplevel = win.frameElement == null;
				} catch(e) {}

				if(docElem.doScroll && toplevel) {
					doScrollCheck();
				}
			}
		}
	})();

})(window, undefined);

/**
 *单列商品轮播插件
 * use in：首页、商品详情页
 */
(function($) {
	$.extend($.easing, {
		easeInSine: function(x, t, b, c, d) {
			return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
		}
	});

	$.fn.Xslider = function(settings) {
		settings = $.extend({}, $.fn.Xslider.sn.defaults, settings);
		this.each(function() {
			var scrollobj = settings.scrollobj ? $(this).find(settings.scrollobj) : $(this).find("ul"),
				viewedSize = settings.viewedSize || (settings.dir == "H" ? scrollobj.parent().width() : scrollobj.parent().height()), //length of the wrapper visible;
				scrollunits = scrollobj.find("li"), //units to move;
				unitlen = settings.unitlen || (settings.dir == "H" ? scrollunits.eq(0).outerWidth() : scrollunits.eq(0).outerHeight()),
				unitdisplayed = settings.unitdisplayed, //units num displayed;
				numtoMove = settings.numtoMove > unitdisplayed ? unitdisplayed : settings.numtoMove,
				scrollobjSize = settings.scrollobjSize || scrollunits.length * unitlen, //length of the scrollobj;
				offset = 0, //max width to move;
				offsetnow = 0, //scrollobj now offset;
				movelength = unitlen * numtoMove,
				pos = settings.dir == "H" ? "left" : "top",
				moving = false, //moving now?;
				btnright = $(this).find("a.aright"),
				btnleft = $(this).find("a.aleft");

			btnright.unbind("click");
			btnleft.unbind("click");

			settings.dir == "H" ? scrollobj.css("left", "0px") : scrollobj.css("top", "0px");

			if(scrollobjSize > viewedSize) {
				if(settings.loop == "cycle") {
					btnleft.removeClass("agrayleft");
					if(scrollunits.length < 2 * numtoMove + unitdisplayed - numtoMove) {
						scrollobj.find("li").clone().appendTo(scrollobj);
					}
				} else {
					btnleft.addClass("agrayleft");
					offset = scrollobjSize - viewedSize;
				}
				btnright.removeClass("agrayright");
			} else {
				btnleft.addClass("agrayleft");
				btnright.addClass("agrayright");
			}

			btnleft.click(function() {
				if($(this).is("[class*='agrayleft']")) {
					return false;
				}

				if(!moving) {
					moving = true;

					if(settings.loop == "cycle") {
						scrollobj.find("li:gt(" + (scrollunits.length - numtoMove - 1) + ")").prependTo(scrollobj);
						scrollobj.css(pos, "-" + movelength + "px");
						$.fn.Xslider.sn.animate(scrollobj, 0, settings.dir, settings.speed, function() {
							moving = false;
						});
					} else {
						offsetnow -= movelength;
						if(offsetnow > unitlen * unitdisplayed - viewedSize) {
							$.fn.Xslider.sn.animate(scrollobj, -offsetnow, settings.dir, settings.speed, function() {
								moving = false;
							});
						} else {
							$.fn.Xslider.sn.animate(scrollobj, 0, settings.dir, settings.speed, function() {
								moving = false;
							});
							offsetnow = 0;
							$(this).addClass("agrayleft");
						}
						btnright.removeClass("agrayright");
					}
				}

				return false;
			});
			btnright.click(function() {
				if($(this).is("[class*='agrayright']")) {
					return false;
				}

				if(!moving) {
					moving = true;

					if(settings.loop == "cycle") {
						var callback = function() {
							scrollobj.find("li:lt(" + numtoMove + ")").appendTo(scrollobj);
							scrollobj.css(pos, "0px");
							moving = false;
						}
						$.fn.Xslider.sn.animate(scrollobj, -movelength, settings.dir, settings.speed, callback);
					} else {
						offsetnow += movelength;
						if(offsetnow < offset - (unitlen * unitdisplayed - viewedSize)) {
							$.fn.Xslider.sn.animate(scrollobj, -offsetnow, settings.dir, settings.speed, function() {
								moving = false;
							});
						} else {
							$.fn.Xslider.sn.animate(scrollobj, -offset, settings.dir, settings.speed, function() {
								moving = false;
							}); //滚动到最后一个位置;
							offsetnow = offset;
							$(this).addClass("agrayright");
						}
						btnleft.removeClass("agrayleft");
					}
				}

				return false;
			});

			if(settings.autoscroll) {
				$.fn.Xslider.sn.autoscroll($(this), settings.autoscroll);
			}
		})
	};

	$.fn.Xslider.sn = {
		defaults: {
			dir: "H",
			speed: 500
		},
		animate: function(obj, w, dir, speed, callback) {
			if(dir == "H") {
				obj.animate({
					left: w
				}, speed, "easeInSine", callback);
			} else if(dir == "V") {
				obj.animate({
					top: w
				}, speed, "easeInSine", callback);
			}
		},
		autoscroll: function(obj, time) {
			var vane = "right";

			function autoscrolling() {
				if(vane == "right") {
					if(!obj.find("a.agrayright").length) {
						obj.find("a.aright").trigger("click");
					} else {
						vane = "left";
					}
				}
				if(vane == "left") {
					if(!obj.find("a.agrayleft").length) {
						obj.find("a.aleft").trigger("click");
					} else {
						vane = "right";
					}
				}
			}

			var scrollTimmer = setInterval(autoscrolling, time);
			obj.hover(function() {
				clearInterval(scrollTimmer);
			}, function() {
				scrollTimmer = setInterval(autoscrolling, time);
			});
		}
	}
})(jQuery);


var H_slider = (function($) {
	function H_slider(selector, show_num, time, width) {
		return new H_slider.fn.init(selector, show_num, time, width);
	}

	H_slider.fn = H_slider.prototype;
	H_slider.fn.init = function(selector, show_num, time, width) {
		this.ct = $(selector); //最外层容器
		this.sg = this.ct.find(".slider_single");
		this.w = width || this.sg.eq(0).width(); //单个元素宽度
		this.inner = this.ct.find(".inner"); //移动容器
		this.inner.css({ left: 0 }); //防止获取left为auto
		this.step = 0; //切换计数
		this.max = 0; //切换计数最大值
		this.min = -(this.sg.length - show_num); //切换计数最小值
		this.time = time;
	};
	H_slider.fn.init.prototype = H_slider.prototype;

	H_slider.prototype.slide = function(type, num) {
		//type left为左
		num = num || 1;
		//获取即将改变的状态值
		this.step = this.step + (type == "left" ? -num : num);
		this.step = this.step > this.max ? this.min : this.step;
		this.step = this.step < this.min ? this.max : this.step;

		this.inner.stop().animate({ left: this.step * this.w + "px" }, this.time, function() {});
	};
	return H_slider
}(jQuery));

/**
 * 商品水平滚动轮播插件
 * Date : 2017.08.30
 * Use  :
 *        new horSlider({
 *           selector: '.container',  //容器     注： selector值的规范跟jQUery选择器里面的规范一样
 *           show_num: 5,    //滚动展示的数量
 *           slide_num: 5,   //每次滚动数
 *           speed: 400      //速度
 *        })
 */
~function(win,$){
    if(typeof win.horSlider !== "undefined"){
    	console.warn("horSlider is already defined!");
    	return false;
    }else{
 		win.horSlider=horSlider;
    }
	function horSlider(o) {
        this.init(o);
	}
	horSlider.prototype={
        init: function(o) {
			this.ct = $(o.selector) || o.selector; //最外层容器
			this.inner = this.ct.find(".inner"); //移动容器
			this.inner.css({ "left": 0 }); //防止获取left为auto
			this.speed = o.speed || 400;//滚动时间
			this.show_num=o.show_num || 5; //显示个数
			this.slide_num=o.slide_num || 5; //滚动个数
			this.sg = this.inner.find(".slideItem").length ? this.inner.find(".slideItem") : this.inner.children(); //全部个数
			this.w = o.item_width || this.sg.eq(0).outerWidth(true); //单个的宽度
			this.ct.css({  //根据显示个数(show_num),设置最外层容器的的宽度
				"width":this.w*this.show_num,
				"overflow":"hidden"
			}) 
			this.page = parseInt(this.sg.length/this.slide_num)+(this.sg.length%this.slide_num >0 ? 1 : 0)-1; //可切换的总次数
			this.current_page=0;  //初始化切换页码
			if(this.initShowArrow()){  //初始化是否需要切换
	          	this.initEvent();  //初始化绑定事件
			}
		},
	   	slide: function(type) {
			 this.current_page = this.current_page + (type == "left" ? -1 : 1);
			 if(this.current_page < 0){
	               this.current_page = this.page;
			 }
			 if(this.current_page > this.page){
	               this.current_page = 0;
			 }
			 this.inner.stop().animate({ left: -this.current_page * this.w * this.slide_num + "px" }, this.speed, function() {});
		},
		initEvent: function(type) {
			var _self=this;
			this.ct.find(".left-arrow").on("click", function () {
	            _self.slide("left"); 
	        });
	        this.ct.find(".right-arrow").on("click", function () {
	            _self.slide("right");
	        });
		},
		initShowArrow: function(type, num) {
			if(this.sg.length <= this.show_num){    
	            this.ct.find('.left-arrow,.right-arrow').hide();
	            return false;
	        }else{
	        	return true;
	        }
		}
	}
}(window,jQuery);



(function($) {

	$.fn.easyTooltip = function(options) {

		// default configuration properties
		var defaults = {
			xOffset: -50,
			yOffset: 35,
			tooltipId: "easyTooltip",
			clickRemove: false,
			content: "",
			useElement: ""
		};

		var options = $.extend(defaults, options);
		var content;

		this.each(function() {
			var title = $(this).attr("title");
			$(this).hover(function(e) {
					content = (options.content != "") ? options.content : title;
					content = (options.useElement != "") ? $("#" + options.useElement).html() : content;
					$(this).attr("title", "");
					if(content != "" && content != undefined) {
						$("body").append("<div id='" + options.tooltipId + "'>" + content + "</div>");
						$("#" + options.tooltipId)
							.css("position", "absolute")
							.css("top", (e.pageY - options.yOffset) + "px")
							.css("left", (e.pageX + options.xOffset) + "px")
							.css("display", "none")
							.fadeIn("fast")
					}
				},
				function() {
					$("#" + options.tooltipId).remove();
					$(this).attr("title", title);
				});
			$(this).mousemove(function(e) {
				$("#" + options.tooltipId)
					.css("top", (e.pageY - options.yOffset) + "px")
					.css("left", (e.pageX + options.xOffset) + "px")
			});
			if(options.clickRemove) {
				$(this).mousedown(function(e) {
					$("#" + options.tooltipId).remove();
					$(this).attr("title", title);
				});
			}
		});

	};

})(jQuery);

/** 未登录提示框 **/
var LogBox = {};
LogBox.openLogin = function() {
	easyDialog.open({
		container: {
			header: '提示',
			content: '<p>您还未登录，请登录后继续操作！</p>',
			yesFn: function() {
				window.location.href = ROOT_URL + 'customer/account/login/';
			},
			noFn: false
		}
	});
};
/** end **/

// 约定：以 /\$\w+/ 表示的字符，比如 $item 表示的是一个 jQuery Object
~ function($) {

	var patterns, fields, errorElement, addErrorClass, removeErrorClass, novalidate, validateForm, validate, validateFields, removeFromUnvalidFields, asyncValidate, getVal, aorbValidate, validateReturn, unvalidFields = [],
		sensorsRun

	// 类型判断
	patterns = {

		// 当前校验的元素，默认没有，在 `validate()` 方法中传入
		// $item: {},

		email: function(text) {
			return /^(?:[a-z0-9]+[_\-+.]+)*[a-z0-9]+@(?:([a-z0-9]+-?)*[a-z0-9]+.)+([a-z]{2,})+$/i.test(text)
		},

		// 仅支持 8 种类型的 day
		// 20120409 | 2012-04-09 | 2012/04/09 | 2012.04.09 | 以上各种无 0 的状况
		date: function(text) {
			var reg = /^([1-2]\d{3})([-/.])?(1[0-2]|0?[1-9])([-/.])?([1-2]\d|3[01]|0?[1-9])$/,
				taste, d, year, month, day

			if(!reg.test(text)) {
				return false
			}

			taste = reg.exec(text)
			year = +taste[1]
			month = +taste[3] - 1
			day = +taste[5]
			d = new Date(year, month, day)

			return year === d.getFullYear() && month === d.getMonth() && day === d.getDate()
		},

		// 手机：仅中国手机适应；以 1 开头，第二位是 3-9，并且总位数为 11 位数字
		mobile: function(text) {
			return /^1[3-9]\d{9}$/.test(text)
		},

		// 座机：仅中国座机支持；区号可有 3、4位数并且以 0 开头；电话号不以 0 开头，最 8 位数，最少 7 位数
		//  但 400/800 除头开外，适应电话，电话本身是 7 位数
		// 0755-29819991 | 0755 29819991 | 400-6927972 | 4006927927 | 800...
		tel: function(text) {
			return /^(?:(?:0\d{2,3}[- ]?[1-9]\d{6,7})|(?:[48]00[- ]?[1-9]\d{6}))$/.test(text)
		},

		number: function(input) {
			var min = $.trim(this.$item.attr('min')),
				max = $.trim(this.$item.attr('max')),
				result = /^\-?(?:[1-9]\d*|0)(?:[.]\d+)?$/.test(input),
				text = +input,
				step = $.trim(this.$item.attr('step'))

			// ignore invalid range silently
			min = min === '' || isNaN(min) ? text - 1 : +min
			max = max === '' || isNaN(max) ? text + 1 : +max

			step = step === '' || isNaN(step) ? 0 : +step

			// 目前的实现 step 不能小于 0
			return result && (0 >= step ?
				(text >= min && text <= max) : 0 === (text + min) % step && (text >= min && text <= max))
		},

		// 判断是否在 min / max 之间
		range: function(text) {
			return this.number(text)
		},

		// 支持类型:
		// http(s)://(username:password@)(www.)domain.(com/co.uk)(/...)
		// (s)ftp://(username:password@)domain.com/...
		// git://(username:password@)domain.com/...
		// irc(6/s)://host:port/... // 需要测试
		// afp over TCP/IP: afp://[<user>@]<host>[:<port>][/[<path>]]
		// telnet://<user>:<password>@<host>[:<port>/]
		// smb://[<user>@]<host>[:<port>][/[<path>]][?<param1>=<value1>[;<param2>=<value2>]]
		url: (function() {
			var protocols = '((https?|s?ftp|irc[6s]?|git|afp|telnet|smb):\\/\\/)?',
				userInfo = '([a-z0-9]\\w*(\\:[\\S]+)?\\@)?',
				domain = '(?:localhost|(?:[a-z0-9]+(?:[-\\w]*[a-z0-9])?(?:\\.[a-z0-9][-\\w]*[a-z0-9])*)*\\.[a-z]{2,})',
				port = '(:\\d{1,5})?',
				ip = '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
				address = '(\\/\\S*)?',
				domainType = [protocols, userInfo, domain, port, address],
				ipType = [protocols, userInfo, ip, port, address],
				rDomain = new RegExp('^' + domainType.join('') + '$', 'i'),
				rIP = new RegExp('^' + ipType.join('') + '$', 'i')

			return function(text) {
				return rDomain.test(text) || rIP.test(text)
			}
		})(),

		// 密码项目前只是不为空就 ok，可以自定义
		password: function(text) {
			return this.text(text)
		},

		checkbox: function() {
			return patterns._checker('checkbox')
		},

		// radio 根据当前 radio 的 name 属性获取元素，只要 name 相同的这几个元素中有一个 checked，则验证难过
		radio: function() {
			return patterns._checker('radio')
		},

		_checker: function(type) {
			// TODO: a better way?!
			var form = this.$item.parents('form').eq(0),
				identifier = 'input[type=' + type + '][name="' + this.$item.attr('name') + '"]',
				result = false,
				$items = $(identifier, form)

			// TODO: a faster way?!
			$items.each(function(i, item) {
				if(item.checked && !result) {
					return(result = true)
				}
			})

			return result
		},

		// text[notEmpty] 表单项不为空
		// [type=text] 也会进这项
		text: function(text) {

			if(!(text = $.trim(text)).length) return;

			var max = parseInt(this.$item.attr('maxlength'), 10),
				min = parseInt(this.$item.attr('minlength'), 10),
				range

			range = function() {
				var ret = true,
					length = text.length

				if(min) ret = length >= min
				if(max) ret = ret && (length <= max)

				return ret
			}

			return range()
		}
	}

	// 异步验证
	asyncValidate = function($item, klass, isErrorOnParent) {
		var data = $item.data(),
			url = data.url,
			method = data.method || 'get',
			key = data.key || 'key',
			text = getVal($item),
			params = {}

		params[key] = text

		$[method](url, params).success(function(isValidate) {
			var message = isValidate ? 'IM VALIDED' : 'unvalid'
			return validateReturn.call(this, $item, klass, isErrorOnParent, message)
		}).error(function() {
			// 异步错误，供调试用，理论上线上不应该继续运行
		})
	}

	// 二选一：二个项中必须的一个项是已经填
	// <input data-aorb="a" >
	// <input data-aorb="b" >
	aorbValidate = function($item, klass, isErrorOnParent) {
		var id = $item.data('aorb') === 'a' ? 'b' : 'a',
			$pair = $('[data-aorb=' + id + ']', $item.parents('form').eq(0)),
			a = [$item, klass, isErrorOnParent],
			b = [$pair, klass, isErrorOnParent],
			result = 0

		result += validateReturn.apply(this, a) ? 0 : 1
		result += validateReturn.apply(this, b) ? 0 : 1

		result = result > 0 ? (removeErrorClass.apply(this, a), removeErrorClass.apply(this, b), false) :
			validateReturn.apply(this, a.concat('unvalid'))

		// 通过则返回 false
		return result
	}

	// 验证后的返回值
	validateReturn = function($item, klass, parent, message) {

		if(!$item) {
			return 'DONT VALIDATE UNEXIST ELEMENT'
		}

		var pattern, type, val, ret, event

		pattern = $item.attr('pattern')
		pattern && pattern.replace('\\', '\\\\')
		type = $item.attr('type') || 'text'
		// hack ie: 像 select 和 textarea 返回的 type 都为 NODENAME 而非空
		type = patterns[type] ? type : 'text'
		val = (getVal($item))
		event = $item.data('event')

		// HTML5 pattern 支持
		message = message ? message :
			pattern ? ((new RegExp(pattern)).test(val) || 'unvalid') :
			patterns[type](val) || 'unvalid'

		// 返回的错误对象 = {
		//    $el: {jQuery Element Object} // 当前表单项
		//  , type: {String} //表单的类型，如 [type=radio]
		//  , message: {String} // error message，只有两种值
		// }
		// NOTE: 把 jQuery Object 传到 trigger 方法中作为参数，会变成原生的 DOM Object
		if(message === 'unvalid') {
			removeErrorClass($item, klass, parent)
		}

		return /^(?:unvalid|empty)$/.test(message) ? (ret = {
				$el: addErrorClass.call(this, $item, klass, parent, message),
				type: type,
				error: message
			}, $item.trigger('after:' + event, $item), ret) :
			(removeErrorClass.call(this, $item, klass, parent), $item.trigger('after:' + event, $item), false)
	}

	// 获取待校验的项
	fields = function(identifie, form) {
		return $(identifie, form)
	}

	// 获取待校验项的值
	getVal = function($item) {
		return $item.val() || ($item.is('[contenteditable]') ? $item.text() : '')
	}

	// 校验一个表单项
	// 出错时返回一个对象，当前表单项和类型；通过时返回 false
	validate = function($item, klass, parent) {
		var async, aorb, type, val, commonArgs, event

		// 把当前元素放到 patterns 对象中备用
		patterns.$item = $item
		type = $item.attr('type')
		val = getVal($item)

		async = $item.data('url')
		aorb = $item.data('aorb')
		event = $item.data('event')

		commonArgs = [$item, klass, parent]

		// 当指定 `data-event` 的时候在检测前触发自定义事件
		// NOTE: 把 jQuery Object 传到 trigger 方法中作为参数，会变成原生的 DOM Object
		event && $item.trigger('before:' + event, $item)

		// 所有都最先测试是不是 empty，checkbox 是可以有值
		// 但通过来说我们更需要的是 checked 的状态
		// 暂时去掉 radio/checkbox/linkage/aorb 的 notEmpty 检测
		if(!(/^(?:radio|checkbox)$/.test(type) || aorb) && !patterns.text(val)) {
			return validateReturn.call(this, $item, klass, parent, val.length ? 'unvalid' : 'empty')
		}

		// 二选一验证：有可能为空
		if(aorb) {
			return aorbValidate.apply(this, commonArgs)
		}

		// 异步验证则不进行普通验证
		if(async) {
			return asyncValidate.apply(this, commonArgs)
		}

		// 正常验证返回值
		return validateReturn.call(this, $item, klass, parent)
	}

	// 校验表单项
	validateFields = function($fields, method, klass, parent) {
		// TODO：坐成 delegate 的方式？
		var reSpecialType = /^radio|checkbox/,
			field
		$.each($fields, function(i, f) {
			$(f).on(reSpecialType.test(f.type) || 'SELECT' === f.tagName ? 'change blur' : method, function() {
				// 如果有错误，返回的结果是一个对象，传入 validedFields 可提供更快的 `validateForm`
				var $items = $(this)
				if(reSpecialType.test(this.type)) {
					$items = $('input[type=' + this.type + '][name=' + this.name + ']',
						$items.closest('form'))
				}
				$items.each(function() {
					(field = validate.call(this, $(this), klass, parent)) && unvalidFields.push(field)
				})
			})
		})
	}

	// 校验表单：表单通过时返回 false，不然返回所有出错的对象
	validateForm = function($fields, method, klass, parent) {
		if(method && !validateFields.length) {
			return true
		}

		unvalidFields = $.map($fields, function(el) {
			var field = validate.call(null, $(el), klass, parent)
			if(field) {
				return field
			}
		})

		return validateFields.length ? unvalidFields : false
	}

	// 从 unvalidField 中删除
	removeFromUnvalidFields = function($item) {
		var obj, index

		// 从 unvalidFields 中删除
		obj = $.grep(unvalidFields, function(item) {
			return(item.$el = $item)
		})[0]

		if(!obj) {
			return
		}
		index = $.inArray(obj, unvalidFields)
		unvalidFields.splice(index, 1)
		return unvalidFields
	}

	// 添加/删除错误 class
	// @param `$item` {jQuery Object} 传入的 element
	// @param [optional] `klass` {String} 当一个 class 默认值是 `error`
	// @param [optional] `parent` {Boolean} 为 true 的时候，class 被添加在当前出错元素的 parentNode 上
	errorElement = function($item, parent) {
		return $item.data('parent') ? $item.closest($item.data('parent')) : parent ? $item.parent() : $item
	}

	addErrorClass = function($item, klass, parent, emptyClass) {
		return errorElement($item, parent).addClass(klass + ' ' + emptyClass)
	}

	removeErrorClass = function($item, klass, parent) {
		removeFromUnvalidFields.call(this, $item)
		return errorElement($item, parent).removeClass(klass + ' empty unvalid')
	}

	// 添加 `novalidate` 到 form 中，防止浏览器默认的校验（样式不一致并且太丑）
	novalidate = function($form) {
		return $form.attr('novalidate') || $form.attr('novalidate', 'true')
	}
	// 登录注册神策埋点
	sensorsRun = function($form, type) {
		var msg = [];
		$form.find(".error").each(function() {
			var m = $(this).find(".error-tips").text();
			msg.push(m);
		})
		if(sa_enabled) { //神策登录信息埋点
			type == 'login' ? indexSensors.login('union', msg) : indexSensors.register('union', msg);
		}
	}
	// 真正的操作逻辑开始，yayayayayayaya!
	// 用法：$form.validator(options)
	// 参数：options = {
	//    identifie: {String}, // 需要校验的表单项，（默认是 `[required]`）
	//    klass: {String}, // 校验不通过时错误时添加的 class 名（默认是 `error`）
	//    isErrorOnParent: {Boolean} // 错误出现时 class 放在当前表单项还是（默认是 element 本身）
	//    method: {String | false}, // 触发表单项校验的方法，当是 false 在点 submit 按钮之前不校验（默认是 `blur`）
	//    errorCallback(unvalidFields): {Function}, // 出错时的 callback，第一个参数是出错的表单项集合
	//
	//    before: {Function}, // 表单检验之前
	//    after: {Function}, // 表单校验之后，只有返回 True 表单才可能被提交
	//  }
	$.fn.validator = function(_options) {
		var $form = this,
			options = _options || {},
			identifie = options.identifie || '[required]',
			klass = options.klass || 'error',
			isErrorOnParent = options.isErrorOnParent || false,
			method = options.method || 'blur',
			before = options.before || function() {
				return true;
			},
			after = options.after || function() {
				return true;
			},
			errorCallback = options.errorCallback || function() {},
			$items = fields(identifie, $form)

		// 防止浏览器默认校验
		novalidate($form)

		// 表单项校验
		method && validateFields.call(this, $items, method, klass, isErrorOnParent)

		// 当用户聚焦到某个表单时去除错误提示
		$form.on('focusin', identifie, function() {
			removeErrorClass.call(this, $(this), 'error unvalid empty', isErrorOnParent)
		})

		// 提交校验
		$form.on('submit', function(e) {
			var type = $form.data("form-type");
			before.call(this, $items)
			validateForm.call(this, $items, method, klass, isErrorOnParent)

			// 当指定 options.after 的时候，只有当 after 返回 true 表单才会提交
			if(!unvalidFields.length && $('#registerForm').length) { //注册调用dsp
				if(pyRegisterCvt) {
					pyRegisterCvt();
				}
			}

			if(unvalidFields.length && type) {
				if(type == "login") {
					sensorsRun($form, type);
				} else if(type == "register") {
					sensorsRun($form, type);
				}
			}
			return unvalidFields.length ?
				(e.preventDefault(), errorCallback.call(this, unvalidFields)) :
				after.call(this, e, $items);

		})
	}
}(window.jQuery || window.Zepto);

//**************************************************************
// jQZoom allows you to realize a small magnifier window,close
// to the image or images on your web page easily.
//
// jqZoom version 2.2
// Author Doc. Ing. Renzi Marco(www.mind-projects.it)
// First Release on Dec 05 2007
// i'm looking for a job,pick me up!!!
// mail: renzi.mrc@gmail.com
//**************************************************************
!
function(a) {
	a.fn.jqueryzoom = function(b) {
		var c = {
			xzoom: 200,
			yzoom: 200,
			offset: 10,
			position: "right",
			lens: 1,
			preload: 1
		};
		b && a.extend(c, b);
		var d = "";
		a(this).hover(function() {
			function i(a) {
				this.x = a.pageX, this.y = a.pageY
			}
			var b = a(this).offset().left,
				e = a(this).offset().top,
				f = a(this).children("img").get(0).offsetWidth,
				g = a(this).children("img").get(0).offsetHeight;
			d = a(this).children("img").attr("alt");
			var h = a(this).children("img").attr("jqimg");
			a(this).children("img").attr("alt", ""), 0 == a("div.zoomdiv").get().length && (a(this).after("<div class='zoomdiv'><img class='bigimg' src='" + h + "'/></div>"), a(this).append("<div class='jqZoomPup'>&nbsp;</div>")), "right" == c.position ? leftpos = b + f + c.offset + c.xzoom > screen.width ? b - c.offset - c.xzoom : b + f + c.offset : (leftpos = b - c.xzoom - c.offset, 0 > leftpos && (leftpos = b + f + c.offset)), a("div.zoomdiv").css({
				top: e,
				left: leftpos
			}), a("div.zoomdiv").width(c.xzoom), a("div.zoomdiv").height(c.yzoom), a("div.zoomdiv").show(), c.lens || a(this).css("cursor", "crosshair"), a(document.body).mousemove(function(d) {
				mouse = new i(d);
				var h = a(".bigimg").get(0).offsetWidth,
					j = a(".bigimg").get(0).offsetHeight,
					k = "x",
					l = "y";
				if(isNaN(l) | isNaN(k)) {
					var l = h / f,
						k = j / g;
					a("div.jqZoomPup").width(c.xzoom / l), a("div.jqZoomPup").height(c.yzoom / k), c.lens && a("div.jqZoomPup").css("visibility", "visible")
				}
				xpos = mouse.x - a("div.jqZoomPup").width() / 2 - b, ypos = mouse.y - a("div.jqZoomPup").height() / 2 - e, c.lens && (xpos = mouse.x - a("div.jqZoomPup").width() / 2 < b ? 0 : mouse.x + a("div.jqZoomPup").width() / 2 > f + b ? f - a("div.jqZoomPup").width() - 2 : xpos, ypos = mouse.y - a("div.jqZoomPup").height() / 2 < e ? 0 : mouse.y + a("div.jqZoomPup").height() / 2 > g + e ? g - a("div.jqZoomPup").height() - 2 : ypos), c.lens && a("div.jqZoomPup").css({
					top: ypos,
					left: xpos
				}), scrolly = ypos, a("div.zoomdiv").get(0).scrollTop = scrolly * k, scrollx = xpos, a("div.zoomdiv").get(0).scrollLeft = scrollx * l
			})
		}, function() {
			a(this).children("img").attr("alt", d), a(document.body).unbind("mousemove"), c.lens && a("div.jqZoomPup").remove(), a("div.zoomdiv").remove()
		}), count = 0, c.preload && (a("body").append("<div style='display:none;' class='jqPreload" + count + "'>haituncun</div>"), a(this).each(function() {
			var b = a(this).children("img").attr("jqimg"),
				c = jQuery("div.jqPreload" + count).html();
			jQuery("div.jqPreload" + count).html(c + '<img src="' + b + '">')
		}))
	}
}(jQuery);

/*
 SlidesJS 3.0.4 http://slidesjs.com
 (c) 2013 by Nathan Searles http://nathansearles.com
 Updated: June 26th, 2013
 Apache License: http://www.apache.org/licenses/LICENSE-2.0
 */
(function() {
	(function(e, t, n) {
		var r, i, s;
		s = "slidesjs";
		i = {
			width: 940,
			height: 528,
			start: 1,
			navigation: { active: !0, effect: "slide" },
			pagination: { active: !0, effect: "slide" },
			play: {
				active: !1,
				effect: "slide",
				interval: 5e3,
				auto: !1,
				swap: !0,
				pauseOnHover: !1,
				restartDelay: 2500
			},
			effect: { slide: { speed: 500 }, fade: { speed: 300, crossfade: !0 } },
			callback: {
				loaded: function() {},
				start: function() {},
				complete: function() {}
			}
		};
		r = function() {
			function t(t, n) {
				this.element = t;
				this.options = e.extend(!0, {}, i, n);
				this._defaults = i;
				this._name = s;
				this.init()
			}

			return t
		}();
		r.prototype.init = function() {
			var n, r, i, s, o, u, a = this;
			n = e(this.element);
			this.data = e.data(this);
			e.data(this, "animating", !1);
			e.data(this, "total", n.children().not(".slidesjs-navigation", n).length);
			e.data(this, "current", this.options.start - 1);
			e.data(this, "vendorPrefix", this._getVendorPrefix());
			if(typeof TouchEvent != "undefined") {
				e.data(this, "touch", !0);
				this.options.effect.slide.speed = this.options.effect.slide.speed / 2
			}
			n.css({ overflow: "hidden" });
			n.slidesContainer = n.children().not(".slidesjs-navigation", n).wrapAll("<div class='slidesjs-container'>", n).parent().css({
				overflow: "hidden",
				position: "relative"
			});
			e(".slidesjs-container", n).wrapInner("<div class='slidesjs-control'>", n).children();
			e(".slidesjs-control", n).css({ position: "relative", left: 0 });
			e(".slidesjs-control", n).children().addClass("slidesjs-slide").css({
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				zIndex: 0,
				display: "none",
				webkitBackfaceVisibility: "hidden"
			});
			e.each(e(".slidesjs-control", n).children(), function(t) {
				var n;
				n = e(this);
				return n.attr("slidesjs-index", t)
			});
			if(this.data.touch) {
				e(".slidesjs-control", n).on("touchstart", function(e) {
					return a._touchstart(e)
				});
				e(".slidesjs-control", n).on("touchmove", function(e) {
					return a._touchmove(e)
				});
				e(".slidesjs-control", n).on("touchend", function(e) {
					return a._touchend(e)
				})
			}
			n.fadeIn(0);
			this.update();
			this.data.touch && this._setuptouch();
			e(".slidesjs-control", n).children(":eq(" + this.data.current + ")").eq(0).fadeIn(0, function() {
				return e(this).css({ zIndex: 10 })
			});
			if(this.options.navigation.active) {
				o = e("<a>", {
					"class": "slidesjs-previous slidesjs-navigation",
					href: "#",
					title: "Previous",
					text: "Previous"
				}).appendTo(n);
				r = e("<a>", {
					"class": "slidesjs-next slidesjs-navigation",
					href: "#",
					title: "Next",
					text: "Next"
				}).appendTo(n)
			}
			e(".slidesjs-next", n).click(function(e) {
				e.preventDefault();
				a.stop(!0);
				return a.next(a.options.navigation.effect)
			});
			e(".slidesjs-previous", n).click(function(e) {
				e.preventDefault();
				a.stop(!0);
				return a.previous(a.options.navigation.effect)
			});
			if(this.options.play.active) {
				s = e("<a>", {
					"class": "slidesjs-play slidesjs-navigation",
					href: "#",
					title: "Play",
					text: "Play"
				}).appendTo(n);
				u = e("<a>", {
					"class": "slidesjs-stop slidesjs-navigation",
					href: "#",
					title: "Stop",
					text: "Stop"
				}).appendTo(n);
				s.click(function(e) {
					e.preventDefault();
					return a.play(!0)
				});
				u.click(function(e) {
					e.preventDefault();
					return a.stop(!0)
				});
				this.options.play.swap && u.css({ display: "none" })
			}
			if(this.options.pagination.active) {
				i = e("<ul>", { "class": "slidesjs-pagination" }).appendTo(n);
				e.each(new Array(this.data.total), function(t) {
					var n, r;
					n = e("<li>", { "class": "slidesjs-pagination-item" }).appendTo(i);
					r = e("<a>", { href: "#", "data-slidesjs-item": t, html: t + 1 }).appendTo(n);
					return r.click(function(t) {
						t.preventDefault();
						a.stop(!0);
						return a.goto(e(t.currentTarget).attr("data-slidesjs-item") * 1 + 1)
					})
				})
			}
			e(t).bind("resize", function() {
				return a.update()
			});
			this._setActive();
			this.options.play.auto && this.play();
			return this.options.callback.loaded(this.options.start)
		};
		r.prototype._setActive = function(t) {
			var n, r;
			n = e(this.element);
			this.data = e.data(this);
			r = t > -1 ? t : this.data.current;
			e(".active", n).removeClass("active");
			return e(".slidesjs-pagination li:eq(" + r + ") a", n).addClass("active")
		};
		r.prototype.update = function() {
			var t, n, r;
			t = e(this.element);
			this.data = e.data(this);
			e(".slidesjs-control", t).children(":not(:eq(" + this.data.current + "))").css({
				display: "none",
				left: 0,
				zIndex: 0
			});
			r = t.width();
			n = this.options.height / this.options.width * r;
			this.options.width = r;
			this.options.height = n;
			return e(".slidesjs-control, .slidesjs-container", t).css({ width: r, height: n })
		};
		r.prototype.next = function(t) {
			var n;
			n = e(this.element);
			this.data = e.data(this);
			e.data(this, "direction", "next");
			t === void 0 && (t = this.options.navigation.effect);
			return t === "fade" ? this._fade() : this._slide()
		};
		r.prototype.previous = function(t) {
			var n;
			n = e(this.element);
			this.data = e.data(this);
			e.data(this, "direction", "previous");
			t === void 0 && (t = this.options.navigation.effect);
			return t === "fade" ? this._fade() : this._slide()
		};
		r.prototype.goto = function(t) {
			var n, r;
			n = e(this.element);
			this.data = e.data(this);
			r === void 0 && (r = this.options.pagination.effect);
			t > this.data.total ? t = this.data.total : t < 1 && (t = 1);
			if(typeof t == "number") return r === "fade" ? this._fade(t) : this._slide(t);
			if(typeof t == "string") {
				if(t === "first") return r === "fade" ? this._fade(0) : this._slide(0);
				if(t === "last") return r === "fade" ? this._fade(this.data.total) : this._slide(this.data.total)
			}
		};
		r.prototype._setuptouch = function() {
			var t, n, r, i;
			t = e(this.element);
			this.data = e.data(this);
			i = e(".slidesjs-control", t);
			n = this.data.current + 1;
			r = this.data.current - 1;
			r < 0 && (r = this.data.total - 1);
			n > this.data.total - 1 && (n = 0);
			i.children(":eq(" + n + ")").css({ display: "block", left: this.options.width });
			return i.children(":eq(" + r + ")").css({ display: "block", left: -this.options.width })
		};
		r.prototype._touchstart = function(t) {
			var n, r;
			n = e(this.element);
			this.data = e.data(this);
			r = t.originalEvent.touches[0];
			this._setuptouch();
			e.data(this, "touchtimer", Number(new Date));
			e.data(this, "touchstartx", r.pageX);
			e.data(this, "touchstarty", r.pageY);
			return t.stopPropagation()
		};
		r.prototype._touchend = function(t) {
			var n, r, i, s, o, u, a, f = this;
			n = e(this.element);
			this.data = e.data(this);
			u = t.originalEvent.touches[0];
			s = e(".slidesjs-control", n);
			if(s.position().left > this.options.width * .5 || s.position().left > this.options.width * .1 && Number(new Date) - this.data.touchtimer < 250) {
				e.data(this, "direction", "previous");
				this._slide()
			} else if(s.position().left < -(this.options.width * .5) || s.position().left < -(this.options.width * .1) && Number(new Date) - this.data.touchtimer < 250) {
				e.data(this, "direction", "next");
				this._slide()
			} else {
				i = this.data.vendorPrefix;
				a = i + "Transform";
				r = i + "TransitionDuration";
				o = i + "TransitionTimingFunction";
				s[0].style[a] = "translateX(0px)";
				s[0].style[r] = this.options.effect.slide.speed * .85 + "ms"
			}
			s.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function() {
				i = f.data.vendorPrefix;
				a = i + "Transform";
				r = i + "TransitionDuration";
				o = i + "TransitionTimingFunction";
				s[0].style[a] = "";
				s[0].style[r] = "";
				return s[0].style[o] = ""
			});
			return t.stopPropagation()
		};
		r.prototype._touchmove = function(t) {
			var n, r, i, s, o;
			n = e(this.element);
			this.data = e.data(this);
			s = t.originalEvent.touches[0];
			r = this.data.vendorPrefix;
			i = e(".slidesjs-control", n);
			o = r + "Transform";
			e.data(this, "scrolling", Math.abs(s.pageX - this.data.touchstartx) < Math.abs(s.pageY - this.data.touchstarty));
			if(!this.data.animating && !this.data.scrolling) {
				t.preventDefault();
				this._setuptouch();
				i[0].style[o] = "translateX(" + (s.pageX - this.data.touchstartx) + "px)"
			}
			return t.stopPropagation()
		};
		r.prototype.play = function(t) {
			var n, r, i, s = this;
			n = e(this.element);
			this.data = e.data(this);
			if(!this.data.playInterval) {
				if(t) {
					r = this.data.current;
					this.data.direction = "next";
					this.options.play.effect === "fade" ? this._fade() : this._slide()
				}
				e.data(this, "playInterval", setInterval(function() {
					r = s.data.current;
					s.data.direction = "next";
					return s.options.play.effect === "fade" ? s._fade() : s._slide()
				}, this.options.play.interval));
				i = e(".slidesjs-container", n);
				if(this.options.play.pauseOnHover) {
					i.unbind();
					i.bind("mouseenter", function() {
						return s.stop()
					});
					i.bind("mouseleave", function() {
						return s.options.play.restartDelay ? e.data(s, "restartDelay", setTimeout(function() {
							return s.play(!0)
						}, s.options.play.restartDelay)) : s.play()
					})
				}
				e.data(this, "playing", !0);
				e(".slidesjs-play", n).addClass("slidesjs-playing");
				if(this.options.play.swap) {
					e(".slidesjs-play", n).hide();
					return e(".slidesjs-stop", n).show()
				}
			}
		};
		r.prototype.stop = function(t) {
			var n;
			n = e(this.element);
			this.data = e.data(this);
			clearInterval(this.data.playInterval);
			this.options.play.pauseOnHover && t && e(".slidesjs-container", n).unbind();
			e.data(this, "playInterval", null);
			e.data(this, "playing", !1);
			e(".slidesjs-play", n).removeClass("slidesjs-playing");
			if(this.options.play.swap) {
				e(".slidesjs-stop", n).hide();
				return e(".slidesjs-play", n).show()
			}
		};
		r.prototype._slide = function(t) {
			var n, r, i, s, o, u, a, f, l, c, h = this;
			n = e(this.element);
			this.data = e.data(this);
			if(!this.data.animating && t !== this.data.current + 1) {
				e.data(this, "animating", !0);
				r = this.data.current;
				if(t > -1) {
					t -= 1;
					c = t > r ? 1 : -1;
					i = t > r ? -this.options.width : this.options.width;
					o = t
				} else {
					c = this.data.direction === "next" ? 1 : -1;
					i = this.data.direction === "next" ? -this.options.width : this.options.width;
					o = r + c
				}
				o === -1 && (o = this.data.total - 1);
				o === this.data.total && (o = 0);
				this._setActive(o);
				a = e(".slidesjs-control", n);
				t > -1 && a.children(":not(:eq(" + r + "))").css({ display: "none", left: 0, zIndex: 0 });
				a.children(":eq(" + o + ")").css({ display: "block", left: c * this.options.width, zIndex: 10 });
				this.options.callback.start(r + 1);
				if(this.data.vendorPrefix) {
					u = this.data.vendorPrefix;
					l = u + "Transform";
					s = u + "TransitionDuration";
					f = u + "TransitionTimingFunction";
					a[0].style[l] = "translateX(" + i + "px)";
					a[0].style[s] = this.options.effect.slide.speed + "ms";
					return a.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function() {
						a[0].style[l] = "";
						a[0].style[s] = "";
						a.children(":eq(" + o + ")").css({ left: 0 });
						a.children(":eq(" + r + ")").css({ display: "none", left: 0, zIndex: 0 });
						e.data(h, "current", o);
						e.data(h, "animating", !1);
						a.unbind("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd");
						a.children(":not(:eq(" + o + "))").css({ display: "none", left: 0, zIndex: 0 });
						h.data.touch && h._setuptouch();
						return h.options.callback.complete(o + 1)
					})
				}
				return a.stop().animate({ left: i }, this.options.effect.slide.speed, function() {
					a.css({ left: 0 });
					a.children(":eq(" + o + ")").css({ left: 0 });
					return a.children(":eq(" + r + ")").css({
						display: "none",
						left: 0,
						zIndex: 0
					}, e.data(h, "current", o), e.data(h, "animating", !1), h.options.callback.complete(o + 1))
				})
			}
		};
		r.prototype._fade = function(t) {
			var n, r, i, s, o, u = this;
			n = e(this.element);
			this.data = e.data(this);
			if(!this.data.animating && t !== this.data.current + 1) {
				e.data(this, "animating", !0);
				r = this.data.current;
				if(t) {
					t -= 1;
					o = t > r ? 1 : -1;
					i = t
				} else {
					o = this.data.direction === "next" ? 1 : -1;
					i = r + o
				}
				i === -1 && (i = this.data.total - 1);
				i === this.data.total && (i = 0);
				this._setActive(i);
				s = e(".slidesjs-control", n);
				s.children(":eq(" + i + ")").css({ display: "none", left: 0, zIndex: 10 });
				this.options.callback.start(r + 1);
				if(this.options.effect.fade.crossfade) {
					s.children(":eq(" + this.data.current + ")").stop().fadeOut(this.options.effect.fade.speed);
					return s.children(":eq(" + i + ")").stop().fadeIn(this.options.effect.fade.speed, function() {
						s.children(":eq(" + i + ")").css({ zIndex: 0 });
						e.data(u, "animating", !1);
						e.data(u, "current", i);
						return u.options.callback.complete(i + 1)
					})
				}
				return s.children(":eq(" + r + ")").stop().fadeOut(this.options.effect.fade.speed, function() {
					s.children(":eq(" + i + ")").stop().fadeIn(u.options.effect.fade.speed, function() {
						return s.children(":eq(" + i + ")").css({ zIndex: 10 })
					});
					e.data(u, "animating", !1);
					e.data(u, "current", i);
					return u.options.callback.complete(i + 1)
				})
			}
		};
		r.prototype._getVendorPrefix = function() {
			var e, t, r, i, s;
			e = n.body || n.documentElement;
			r = e.style;
			i = "transition";
			s = ["Moz", "Webkit", "Khtml", "O", "ms"];
			i = i.charAt(0).toUpperCase() + i.substr(1);
			t = 0;
			while(t < s.length) {
				if(typeof r[s[t] + i] == "string") return s[t];
				t++
			}
			return !1
		};
		return e.fn[s] = function(t) {
			return this.each(function() {
				if(!e.data(this, "plugin_" + s)) return e.data(this, "plugin_" + s, new r(this, t))
			})
		}
	})(jQuery, window, document)
}).call(this);