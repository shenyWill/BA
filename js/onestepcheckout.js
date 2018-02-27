$(function() {
	var onestepcheckout = new OneStepCheckout();
	onestepcheckout.initAddNewAddressHandler();
	onestepcheckout.initCancelAddNewAddressHandler();
	onestepcheckout.initToggleAddressEvent();
	onestepcheckout.initNewAddressValidate();
	onestepcheckout.initMoreAddressEvent();
	onestepcheckout.initValidateEvent();
	onestepcheckout.initConfirmOrderEvent();
	onestepcheckout.checkDefaultAddressIdentity();
});
var OneStepCheckout = function() {
	this.initAddNewAddressHandler = initAddNewAddressHandler; //绑定新增收货地址按钮事件
	this.initCancelAddNewAddressHandler = initCancelAddNewAddressHandler; //绑定取消新增收货地址按钮事件
	this.initToggleAddressEvent = initToggleAddressEvent; //切换地址事件
	this.initNewAddressValidate = initNewAddressValidate; //新增收货地址表单验证
	this.initMoreAddressEvent = initMoreAddressEvent; //更多地址事件
	this.initValidateEvent = initValidateEvent; //提交身份验证事件
	this.initConfirmOrderEvent = initConfirmOrderEvent; //提交订单
	this.checkDefaultAddressIdentity = checkDefaultAddressIdentity; //页面加载完成判断默认地址是否已验证(触发地址切换事件);
	var _self = this;
	_self.$addressList = $("#addressList");
	_self.$addressItem = _getAddressItem;

	function _getAddressItem() {
		return _self.$addressList.find(".address-item");
	}

	function _getDefaultAddressItem() {
		return _getAddressItem().filter(".default");
	}

	function _getSelectedAddressItem() {
		return _getAddressItem().filter(".selected");
	}
	/*<新增地址弹窗>*/
	function initAddNewAddressHandler() {
		var $btnNewAddress = $("#btnNewAddress");
		$btnNewAddress.on("click", function(event) {
			_resetAddressForm();
			_setNewAddressDialogTitle("add");
			easyDialog.open({
				container: "newAddressCtn"
			});
		});
	}

	function initCancelAddNewAddressHandler() {
		$("#btnCancel").on("click", function(event) {
			easyDialog.close();
		});
	}

	function _setNewAddressDialogTitle(type) {
		type = type || "add";
		var $addressTitle = $("#newAddressCtn").find(".newaddress-title");
		var $addressTitleToShow = $addressTitle.filter("." + type).show();
		$addressTitle.not($addressTitleToShow).hide();
		if(type == "verified") {
			$("#newAddressCtn").find("#firstname").attr("readonly", "readonly");
		} else {
			$("#newAddressCtn").find("#firstname").removeAttr("readonly");
		}
	}
	/*</新增地址弹窗>*/
	function checkDefaultAddressIdentity() {
		_getAddressItem().first().trigger("click");
	}
	/*<切换地址>*/
	function initToggleAddressEvent() {
		_self.$addressList.on("click", function(event) {
			var $target = $(event.target);
			if($target.is(event.currentTarget)) {
				return false;
			}
			if(!$target.is(".address-item")) { //点击地址内部元素时，找到对应的item
				$target = $target.parentsUntil(".address-list").filter(".address-item");
			}
			if($target.is(".newaddress-item") || $target.length == 0) { //已经是被选择或是新增地址按钮，终止
				return false;
			} else {
				_toggleAddress($target);
			}

			var $isCtrlTarget = $(event.target);
			if($isCtrlTarget.is(".ctrl-setdefault")) { //点击设置默认
				var addressId = $isCtrlTarget.attr("data-address-id");
				_setDefaultAddress(addressId);
			} else if($isCtrlTarget.is(".ctrl-edit")) { //点击编辑
				var addressId = $isCtrlTarget.attr("data-address-id");
				var isVerified = $isCtrlTarget.attr("data-verify");
				_editAddress(addressId, isVerified);
			} else if($isCtrlTarget.is(".ctrl-delete")) { //点击删除
				var addressId = $isCtrlTarget.attr("data-address-id");
				_deleteAddress(addressId);
			}

		});
	}

	function _toggleAddress($targetAddress) {
		_self.identityXhr && _self.identityXhr.abort(); //切换时，如果正在验证，取消
		$targetAddress.addClass("selected").siblings().removeClass("selected");
		$targetAddress.find(".address-ctrl").show().parents(".address-item").siblings().find(".address-ctrl").hide();
		_checkIsVerified($targetAddress);
	}

	function _isRealVerify() { //是否开启身份验证
		return $("#verifyType").val() != 3;
	}

	function _checkIsVerified($item) { //判断是否验证
		if(_isRealVerify() && $item.length) {
			_setIdentityName($item.find("[name='addressName']").val());
			var isVerified = $item.find("[name='isVerified']").val();
			if(isVerified == 0) {
				_showIdentity();
			} else {
				_hideIdentity();
			}
		} else {
			_setIdentityName("");
			_showIdentity();
		}

	}

	function _setIdentityName(identityName) { //设置验证人
		$("#identityName").text(identityName);
	}

	function _showIdentity() { //显示验证区
		$("#identityInfo").show();
		$("#identityPass").hide();
	}

	function _hideIdentity() { //隐藏验证区
		$("#identityInfo").hide();
		$("#identityPass").show();
	}
	/*</切换地址>*/

	/*<保存地址>*/
	function initNewAddressValidate() {
		$("#newAddressForm").validator({
			isErrorOnParent: true,
			after: function() {
				if($("#btnSaveAddress").is(".disabled") || $("#btnSaveAddress").is(":disabled")) {
					return false;
				}
				if(!_extraAddressValidate()) {
					return false;
				}
				_saveAddress();
				return false;
			}
		});
	}

	function _extraAddressValidate() {
		var postcode = $.trim($("#postcode").val());
		if($("#country").val() == "中国大陆" && (postcode == "000000" || postcode.length != 6)) {
			$("#postcode").parent().addClass("error unvalid");
			return false;
		} else {
			return true;
		}
	}

	function _saveAddress() {
		var addressParams = _getAddressParams();
		var isEdit = addressParams.id ? true : false;
		$.ajax({
			url: "/customer/address/saveAddress",
			type: "post",
			dataType: "json",
			data: addressParams,
			beforeSend: function(xhr) {
				$("#btnSaveAddress").showBtnLoading();
				_self.saveAddressXhr && _self.saveAddressXhr.abort();
				_self.saveAddressXhr = xhr;
			}
		}).done(function(data) {
			easyDialog.close();
			if(data.ret == 0) {
				addressParams["id"] = data.addressid;
				_updateAddressList(addressParams, isEdit);
			} else {
				easyDialog.open({
					container: {
						header: "提示",
						content: data.msg,
						yesFn: true
					}
				})
			}
		}).always(function() {
			$("#btnSaveAddress").hideBtnLoading();
		});
	}

	function _updateAddressList(addressParams, isEdit) {
		var addressItemTemplate = $("#addressItemTemplate").html();
		for(var addressKey in addressParams) {
			var addressRegExp = new RegExp("{{" + addressKey + "}}", "g");
			addressItemTemplate = addressItemTemplate.replace(addressRegExp, addressParams[addressKey]);
		}
		var $newAddressItem = $(addressItemTemplate);
		if(isEdit) {
			var $editAddressItem = _self.$addressItem().filter("[data-address-id='" + addressParams["id"] + "']");
			$editAddressItem.replaceWith($newAddressItem);
		} else {
			if(_getAddressItem().length) {
				_getAddressItem().first().before($newAddressItem);
			} else {

				$("#btnNewAddress").before($newAddressItem);
			}
		}
		if(addressParams["default"]) {
			$newAddressItem.siblings().removeClass("default");
		}
		_toggleAddress($newAddressItem);

	}

	function _resetAddressForm() {
		var $newAddressForm = $("#newAddressForm");
		$newAddressForm.find(".address-group").removeClass("error unvalid empty");
		$newAddressForm.get(0).reset();
		$newAddressForm.find("#addressId").val("");
		$newAddressForm.find("#setDefault").removeAttr("checked");
		$newAddressForm.find(".error").removeClass("error");
		$newAddressForm.find("#country").find("[value='国家、地域']").attr("selected", "selected");
		change(0);
	}

	function _getAddressParams() {
		var specialCountry = {
			"香港": "HK",
			"澳门": "MO",
			"台湾": "TW"
		};
		var $newAddressForm = $("#newAddressForm");
		var addressParams = {};
		addressParams["firstname"] = $newAddressForm.find("#firstname").val();
		addressParams["lastname"] = "."; //$newAddressForm.find("#lastname").val();
		addressParams["region"] = $newAddressForm.find("#region_id").val();
		addressParams["city"] = $newAddressForm.find("#city").val();
		addressParams["county"] = $newAddressForm.find("#s_county").val();
		addressParams["street[]"] = $newAddressForm.find("#street").val();
		addressParams["postcode"] = $newAddressForm.find("#postcode").val();
		addressParams["telephone"] = $newAddressForm.find("#telephone").val();
		addressParams["email"] = $newAddressForm.find("#email").val();
		addressParams["form_key"] = $newAddressForm.find("#formkey").val();
		addressParams["country_id"] = specialCountry[addressParams["region"]] ? specialCountry[addressParams["region"]] : "CN";
		addressParams["default_shipping"] = $newAddressForm.find("#setDefault").is(":checked") ? 1 : 0;
		addressParams["default"] = $newAddressForm.find("#setDefault").is(":checked") ? "default" : "";
		addressParams["streetinfo"] = addressParams["region"] + addressParams["city"] + addressParams["county"] + addressParams["street[]"];
		addressParams["isVerified"] = $newAddressForm.find("#verify").val();
		if($("#addressId").val()) {
			addressParams["id"] = $("#addressId").val();
		}
		if(_self.$addressItem().length == 0) {
			addressParams["default_shipping"] = 1;
			addressParams["default"] = "default";
		}
		return addressParams;
	}

	function _nullAddressParams() {
		var $seletAddressForm = $(".address-item.selected");
		var nulladdressParams,
			firstname = $seletAddressForm.find(".firstname").val(),
			region = $seletAddressForm.find(".region").val(),
			city = $seletAddressForm.find(".city").val(),
			s_county = $seletAddressForm.find(".s_county").val(),
			street = $seletAddressForm.find(".street").val(),
			postcode = $seletAddressForm.find(".postcode").val(),
			telephone = $seletAddressForm.find(".telephone").val(),
			email = $seletAddressForm.find(".email").val(),
			country_id = $seletAddressForm.find(".country_id").val();
		if(firstname == "") {
			nulladdressParams = '0';
		}
		if(region == "省份" || city == "地级市" || s_county == "市、县级市" || street == "") {
			nulladdressParams = '0';
		}
		if(postcode == "" || telephone == "" || email == "" || country_id == "") {
			nulladdressParams = '0';
		}
		return nulladdressParams;
	}

	function _setAddressFormParams(address) {
		if(address.countryId == "HK" || address.countryId == "MO" || address.countryId == "TW") {
			address.countryId = "港澳台";
		} else {
			address.countryId = "中国大陆";
		}
		var $newAddressForm = $("#newAddressForm");
		var selection = [$newAddressForm.find("#country"), $newAddressForm.find("#region_id"), $newAddressForm.find("#city"), $newAddressForm.find("#s_county")];
		var selectionVal = [address.countryId, address.region, address.city, address.county];
		for(var i = 0; i < selection.length; i++) {
			change(i); //func in area.js
			selection[i].find("[value='" + selectionVal[i] + "']").attr("selected", "selected");
		}
		$newAddressForm.find("#addressId").val(address.addressId);
		$newAddressForm.find("#firstname").val(address.firstname);
		$newAddressForm.find("#street").val(address.street);
		$newAddressForm.find("#postcode").val(address.postcode);
		$newAddressForm.find("#telephone").val(address.telephone);
		$newAddressForm.find("#email").val(address.email);
		$newAddressForm.find("#country").val(address.countryId);
		$newAddressForm.find("#verify").val(address.isVerified);
		if(address.isDefault) {
			$newAddressForm.find("#setDefault").attr("checked", "checked");
		}
		if(address.isVerified == 1) {
			$newAddressForm.find("#firstname").attr("readonly", "readonly");
		}

	}
	/*</保存地址>*/
	/*<设为默认地址>*/
	function _setDefaultAddress(addressId) {
		var $lastDefaultAddressId = _getDefaultAddressItem().attr("data-address-id");
		$.ajax({
			url: "/customer/address/setAddressDefault",
			type: "post",
			dataType: "json",
			data: {
				addressId: addressId
			},
			beforeSend: function(xhr) {
				_self.setDefaultXhr && _self.setDefaultXhr.abort();
				_self.setDefaultXhr = xhr;
				_toggleToDefaultAddress(addressId); //直接显示为默认地址，设置失败再重置
			}
		}).done(function(data) {
			if(data.ret == 1) { //设置失败，页面展示还原之前的显示效果
				_toggleToDefaultAddress($lastDefaultAddressId);
				easyDialog.open({ //设置失败，提醒用户。成功不提醒。
					container: {
						header: "提示",
						content: data.msg,
						yesFn: function() {}
					}
				});
			}
		});
	}

	function _toggleToDefaultAddress(addressId) { //页面地址样式切换
		_self.$addressItem().filter("[data-address-id='" + addressId + "']").addClass("default")
			.siblings(".default").removeClass("default");
	}
	/*</设为默认地址>*/
	/*<删除地址>*/
	function _deleteAddress(addressId) {
		easyDialog.open({
			container: {
				header: "提示",
				content: "确认要删除该地址?",
				yesFn: function() {
					var $deleteAddressItem = _self.$addressItem().filter("[data-address-id='" + addressId + "']");
					$.ajax({
						url: "/customer/address/delAddress",
						type: "post",
						dataType: "json",
						data: {
							addressId: addressId
						},
						beforeSend: function(xhr) {
							_self.deleteAddressXhr && _self.deleteAddressXhr.abort();
							_self.deleteAddressXhr = xhr
						}
					}).done(function(data) {
						if(data.ret == 0) {
							_deleteAddressItemReally($deleteAddressItem)
						} else if(data.ret == 1) {
							easyDialog.open({
								container: {
									header: "提示",
									content: data.msg,
									yesFn: function() {}
								}
							})
						}
					})
				},
				noFn: true
			}
		})
	}

	function _hideAddressItemTemporary($deleteAddressItem) {
		if($deleteAddressItem.is(".selected")) { //如果删除的是选中的，则删除后选中第一个
			var $newSelectedAddressItem = _self.$addressItem().not($deleteAddressItem).first();
			_toggleAddress($newSelectedAddressItem);
		}
		if($deleteAddressItem.is(".default")) { //如果删除的是默认的，则删除后id最小为新的默认
			var $newDefaultAddressItem = _getNewDefaultAddressItem($deleteAddressItem);
			if($newDefaultAddressItem) {
				$newDefaultAddressItem.addClass("default");
			}
			$deleteAddressItem.removeClass("default").addClass("last-default");
		}
		$deleteAddressItem.addClass("wait-for-delete").fadeOut();
	}

	function _deleteAddressItemReally($deleteAddressItem) {
		$deleteAddressItem.remove();
	}

	function _recoveryDeleteAddressItem($deleteAddressItem) {
		$deleteAddressItem.removeClass("wait-for-delete").fadeIn();
		if($deleteAddressItem.is(".last-default")) { //删除时是默认的，删除失败，恢复其默认的身份地位~~
			$deleteAddressItem.addClass("default").siblings().removeClass(".default");
		}
	}

	function _getNewDefaultAddressItem($deleteAddressItem) { //id小的将为新的默认地址
		var $surplusAddressItem = _self.$addressItem().not($deleteAddressItem);
		if($surplusAddressItem.length > 0) {
			var addressIdArray = [];
			$surplusAddressItem.each(function(index, ele) {
				addressIdArray.push(parseInt($(ele).attr("data-address-id")));
			});
			var newDefaultAddressId = addressIdArray.sort()[0];
			return $surplusAddressItem.filter("[data-address-id='" + newDefaultAddressId + "']");
		} else {
			return false;
		}
	}
	/*</删除地址>*/
	/*<编辑地址>*/
	function _editAddress(addressId, isVerified) {
		$.ajax({
			url: "/customer/address/getUserAddressInfo",
			type: "get",
			dataType: "json",
			data: {
				addressId: addressId
			},
			beforeSend: function(xhr) {
				_self.getUserAddressInfoXhr && _self.getUserAddressInfoXhr.abort();
				_self.getUserAddressInfoXhr = xhr;
			}
		}).done(function(data) {
			if(data.ret == 0) {
				data.address.isVerified = isVerified;
				_openEditAddressDialog(data.address);
			} else {
				easyDialog.open({
					container: {
						header: "提示",
						content: "获取地址信息失败，请稍后再试",
						yesFn: function() {}
					}
				});
			}
		});
	}

	function _openEditAddressDialog(address) {
		_setAddressFormParams(address);
		if(address.isVerified == 0) {
			_setNewAddressDialogTitle("edit");
		} else {
			_setNewAddressDialogTitle("verified");
		}
		easyDialog.open({
			container: "newAddressCtn"
		});
	}
	/*</编辑地址>*/
	/*<更多地址>*/
	function initMoreAddressEvent() {
		$("#btnMoreAddress").on("click", function(event) {
			if(_self.$addressList.is(".open")) {
				_self.$addressList.scrollTop(0).removeClass("open");
				var $selectedAddressItem = _getSelectedAddressItem();
				if($selectedAddressItem.index() > 2) {
					$selectedAddressItem.insertBefore(_self.$addressItem().first());
				}
				$(this).text("查看更多地址");
			} else {
				_self.$addressList.addClass("open");
				$(this).text("收起更多地址");
			}
		});
	}
	/*</更多地址>*/

	/*<身份验证>*/
	function initValidateEvent() {
		$("#btnValidate").on("click", function(event) {
			event.preventDefault();
			var $target = $(event.currentTarget);
			if($target.is(".disabled") || $target.is(":disabled")) {
				return false;
			}
			var identityNo = $("#identityNo").val();
			var $selectedAddressItem = _getSelectedAddressItem(); //传递地址id，防止验证过程中切换地址
			if(!$selectedAddressItem.length) {
				easyDialog.open({
					container: {
						header: "提示",
						content: "请先填写配送信息",
						yesFn: function() {}
					}
				});
			} else {
				if(_isIdentityNo(identityNo).isTrue) {
					_validateIdentityNo(identityNo, $selectedAddressItem);
				} else {
					easyDialog.open({
						container: {
							header: "提示",
							content: "请填写正确的身份证号码",
							yesFn: function() {}
						}
					});
				}
			}
		});
	}

	function _validateIdentityNo(identityNo, $selectedAddressItem) {
		$.ajax({
			url: "/authenticate/check/ajaxIdCheck",
			type: "POST",
			dataType: "json",
			data: _getIdentityParams(identityNo, $selectedAddressItem),
			beforeSend: function(xhr) {
				_self.identityXhr && _self.identityXhr.abort();
				_self.identityXhr = xhr;
				_resetIdentityStatus();
				$("#btnValidate").showBtnLoading();
			}
		}).done(function(data) {
			if(data.ret == 0) {
				_setValidatePassStatus($selectedAddressItem);
			} else {
				$("#tipsError").html(data.msg).show();
			}
		}).fail(function() {
			easyDialog.open({
				container: {
					header: "提示",
					content: "未知错误，请稍后重试",
					yesFn: function() {}
				}
			});
		}).always(function() {
			$("#btnValidate").hideBtnLoading();
		});
	}

	function _resetIdentityStatus() {
		//$("#tipsValidating").show();
		$("#tipsError").hide();
	}

	function _setValidatePassStatus($selectedAddressItem) {
		$selectedAddressItem.find("[name='isVerified']").val(1);
		//$("#tipsValidating").hide();
		$("#identityPass").show();
		_hideIdentity();
	}

	function _getIdentityParams(identityNo, $selectedAddressItem) {
		return {
			/*            id_no: identityNo,
			            customer_address_id: $selectedAddressItem.attr("data-address-id"),
			            name: $selectedAddressItem.find("[name='addressName']").val(),
			            mail: $selectedAddressItem.find("[name='addressEmail']").val(),
			            phone: $selectedAddressItem.find("[name='addressTelephone']").val()*/
			identity: identityNo,
			addressid: $selectedAddressItem.attr("data-address-id")
		}
	}

	function _isIdentityNo(a) {
		var b = { isTrue: !1, year: null, month: null, day: null, isMale: !1, isFemale: !1 };
		if(!a || 15 != a.length && 18 != a.length) return b.isTrue = !1, b;
		if(15 == a.length) {
			var c = a.substring(6, 8),
				d = a.substring(8, 10),
				e = a.substring(10, 12),
				f = a.substring(14, 15),
				g = new Date(c, parseFloat(d) - 1, parseFloat(e));
			return g.getYear() != parseFloat(c) || g.getMonth() != parseFloat(d) - 1 || g.getDate() != parseFloat(e) ? b.isTrue = !1 : (b.isTrue = !0, b.year = g.getFullYear(), b.month = g.getMonth() + 1, b.day = g.getDate(), f % 2 == 0 ? (b.isFemale = !0, b.isMale = !1) : (b.isFemale = !1, b.isMale = !0)), b
		}
		if(18 == a.length) {
			var c = a.substring(6, 10),
				d = a.substring(10, 12),
				e = a.substring(12, 14),
				f = a.substring(14, 17),
				g = new Date(c, parseFloat(d) - 1, parseFloat(e));
			if(g.getFullYear() != parseFloat(c) || g.getMonth() != parseFloat(d) - 1 || g.getDate() != parseFloat(e)) return b.isTrue = !1, b;
			var h = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1],
				i = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2],
				j = 0,
				k = a.split("");
			"x" == k[17].toLowerCase() && (k[17] = 10);
			for(var l = 0; 17 > l; l++) j += h[l] * k[l];
			var l = j % 11;
			return k[17] != i[l] ? b.isTrue = !1 : (b.isTrue = !0, b.year = g.getFullYear(), b.month = g.getMonth() + 1, b.day = g.getDate(), f % 2 == 0 ? (b.isFemale = !0, b.isMale = !1) : (b.isFemale = !1, b.isMale = !0), b)
		}
		return b;
	}
	/*</身份验证>*/

	/*<确定订单>*/
	function initConfirmOrderEvent() {
		$("#btnConfirm").removeClass("disabled").removeAttr("disabled")
			.on("click", function(event) {
				event.preventDefault();
				var $target = $(event.currentTarget);
				if($target.is(".disabled") || $target.is(":disabled")) {
					return false;
				}
				if(_canSubmit()) {
					_submitOrder();
				}
			});
	}

	function _canSubmit() {
		return _checkAddress() && _checkIdentity() && _checkPayment() && _addressAll();
	}

	function _checkAddress() {
		if(_getAddressItem().filter(".selected").length) {
			return true;
		} else {
			easyDialog.open({
				container: {
					header: "提示",
					content: "请选择配送地址",
					yesFn: function() {}
				}
			});
			if(sa_enabled) { //神策确认订单埋点
				indexSensors.onestepcheckout('请选择配送地址');
			}
			return false;
		}
	}

	function _addressAll() {
		if(_nullAddressParams() != '0') {
			return true;
		} else {
			easyDialog.open({
				container: {
					header: "提示",
					content: "请完善收货地址",
					yesFn: function() {}
				}
			});
			if(sa_enabled) { //神策确认订单埋点
				indexSensors.onestepcheckout('请完善收货地址');
			}
			return false;
		}
	}

	function _checkIdentity() {
		if(_isRealVerify()) {
			if(_getAddressItem().filter(".selected").find("[name='isVerified']").val() == 0) {
				easyDialog.open({
					container: {
						header: "提示",
						content: "您未通过实名认证",
						yesFn: function() {}
					}
				});
				if(sa_enabled) { //神策确认订单埋点
					indexSensors.onestepcheckout('您未通过实名认证');
				}
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	}

	function _checkPayment() {
		if($("[name='payment[method]']").filter(":checked").length) {
			return true;
		} else {
			easyDialog.open({
				container: {
					header: "提示",
					content: "请选择支付方式",
					yesFn: function() {}
				}
			});
			if(sa_enabled) { //神策确认订单埋点
				indexSensors.onestepcheckout('请选择支付方式');
			}
		}
	}

	function _submitOrder() {
		var customer_address_id = _getSelectedAddressItem().attr("data-address-id");
		$.ajax({
			url: "/checkout/cart/check",
			type: "post",
			dataType: "json",
			data: {
				type: 1,
				customer_address_id: customer_address_id
			},
			beforeSend: function(xhr) {
				$("#btnConfirm").showBtnLoading();
				$("#billingAddressId").val(customer_address_id);
			}
		}).done(function(data) {
			if(data.ret == 0) {
				$("#btnConfirm").hideBtnLoading();
				easyDialog.open({
					container: {
						header: "提示",
						content: data.message,
						yesFn: function() {}
					}
				});
			} else if(data.ret == 1) {
				if(typeof $.htagLogOrder === "function") {
					$.htagLogOrder(data.htagLogOrder);
				}
				var totalQty = $(".total-qty");
				if(totalQty.length > 0) {
					var num = totalQty.attr("data-buy-item") - 0 || 0;
					var cartItemCount = $.cookie('cartItemCount') - 0;
					num = cartItemCount - num;
					num < 0 ? num = 0 : num = num;
					$.cookie('cartItemCount', num, { path: '/' });
				}
				if(sa_enabled) { //神策确认订单埋点
					indexSensors.onestepcheckout("", "200");
				}
				$("#onestepcheckoutForm").submit();
			}
		}).fail(function() {
			easyDialog.open({
				container: {
					header: "提示",
					content: "位置错误，请稍后重试",
					yesFn: function() {}
				}
			});
		});
	}
	/*</确认订单>*/

};