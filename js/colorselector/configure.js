/**
 * Created by 翔宇 on 14-3-12.
 */
if (typeof Product == 'undefined') {
    var Product = function () {
    };
}

Product.prototype = {
    /*
     * 初始化color选择的下拉菜单
     * */
    initialize: function (config) {
        var $ = jQuery;
        var _this = this;
        _this.config = config;
        _this.taxConfig = _this.config.taxConfig;
        if (config.containerId) {
            _this.settings = $('#' + config.containerId + ' ' + '.super-attribute-select');
        } else {
            _this.settings = $('.super-attribute-select');
        }

        this.state = {};
        this.priceTemplate = this.config.template;

        _this.settings.each(function (index) {
            if (index === 0) {
                _this.fillSelect(this);
            }
            else {
                $(this).attr('disabled', true);
            }
        });

        // fill state
        this.settings.each(function (index, element) {
            var attributeId = element.id.replace(/[a-z]*/, '');
            if (attributeId && this.config.attributes[attributeId]) {
                element.config = this.config.attributes[attributeId];
                element.attributeId = attributeId;
                this.state[attributeId] = false;
            }
        }.bind(this));

        // Init settings dropdown
        var childSettings = [];
        for (var i = this.settings.length - 1; i >= 0; i--) {
            var prevSetting = this.settings[i - 1] ? this.settings[i - 1] : false;
            var nextSetting = this.settings[i + 1] ? this.settings[i + 1] : false;
            if (i == 0) {
                this.fillSelect(this.settings[i])
            } else {
                this.settings[i].disabled = true;
                _this.disableColorSelect(this.settings[i]);
            }
            //$(this.settings[i]).childSettings = childSettings.clone();
            this.settings[i].childSettings = [];
            this.settings[i].prevSetting = prevSetting;
            this.settings[i].nextSetting = nextSetting;
            childSettings.push(this.settings[i]);
        }
    },
    /*
     * 往下拉菜单中生成option
     * */
    fillSelect: function (element) {
        var attributeId = element.id.replace(/[a-z]*/, '');
        var options = this.getAttributeOptions(attributeId);
        this.clearSelect(element);
        element.options[0] = new Option(this.config.chooseText, '');

        var prevConfig = false;
        if (element.prevSetting) {
            prevConfig = element.prevSetting.options[element.prevSetting.selectedIndex];
        }

        if (options) {
            var index = 1;
            for (var i = 0; i < options.length; i++) {
                var allowedProducts = [];
                if (prevConfig) {
                    for (var j = 0; j < options[i].products.length; j++) {
                        //先循环选中属性的option对应的product,然后对比当前属性option中的product,如果一致则显示可选，没有的则设置为不可选
                        if (prevConfig.config.allowedProducts
                            && prevConfig.config.allowedProducts.indexOf(options[i].products[j]) > -1) {
                            allowedProducts.push(options[i].products[j]);
                            //把可用的option显示为可用状态
                            jQuery("#" + options[i].id).parent().removeClass('disabledSelect');
                        }
                    }
                } else {
                    allowedProducts = options[i].products;
                }

                if (allowedProducts.length > 0) {
                    options[i].allowedProducts = allowedProducts;
                    element.options[index] = new Option(this.getOptionLabel(options[i], options[i].price), options[i].id);
                    if (typeof options[i].price != 'undefined') {
                        element.options[index].setAttribute('price', options[i].price);
                    }
                    element.options[index].config = options[i];
                    index++;
                }
            }
        }
    },
    /**
     * 清空select
     * @param element
     */
    clearSelect: function (element) {
        for (var i = element.options.length - 1; i >= 0; i--) {
            element.remove(i);
        }
    },
    /**
     * 把不可选的图片框设置为disable
     * @param element
     */
    disableColorSelect: function (element) {
        jQuery("#ul-" + element.id + ' .swatchContainer').addClass('disabledSelect');
        jQuery("#ul-" + element.id + ' .swatchContainer').removeClass('selected').find('i').remove();
    },
    /*
     * 根据attributeid来获取对应的options选项
     * */
    getAttributeOptions: function (attributeId) {
        if (this.config.attributes[attributeId]) {
            return this.config.attributes[attributeId].options;
        }
    },
    /*
     * 获取option的label
     * */
    getOptionLabel: function (option, price) {
        var price = parseFloat(price);
        if (this.taxConfig.includeTax) {
            var tax = price / (100 + this.taxConfig.defaultTax) * this.taxConfig.defaultTax;
            var excl = price - tax;
            var incl = excl * (1 + (this.taxConfig.currentTax / 100));
        } else {
            var tax = price * (this.taxConfig.currentTax / 100);
            var excl = price;
            var incl = excl + tax;
        }

        if (this.taxConfig.showIncludeTax || this.taxConfig.showBothPrices) {
            price = incl;
        } else {
            price = excl;
        }

        var str = option.label;
        if (price) {
            if (this.taxConfig.showBothPrices) {
                str += ' ' + this.formatPrice(excl, true) + ' (' + this.formatPrice(price, true) + ' ' + this.taxConfig.inclTaxTitle + ')';
            } else {
                str += ' ' + this.formatPrice(price, true);
            }
        }
        return str;
    },
    /**
     * 格式化价格
     * @param price
     * @param showSign
     * @returns {string}
     */
    formatPrice: function (price, showSign) {
        var str = '';
        price = parseFloat(price);
        if (showSign) {
            if (price < 0) {
                str += '-';
                price = -price;
            }
            else {
                str += '+';
            }
        }

        var roundedPrice = (Math.round(price * 100) / 100).toString();

        if (this.prices && this.prices[roundedPrice]) {
            str += this.prices[roundedPrice];
        }
        else {
            str += this.evaluatePrice(price.toFixed(INT_FIXED_LENGTH));
        }
        return str;
    },
    /**
     * 计算价格
     * @param price
     * @returns {replace|*|replace|XML|Node|string}
     */
    evaluatePrice: function (price) {
        return this.priceTemplate.replace('#{price}', price);
    },
    configureElement: function (element) {
        this.reloadOptionLabels(element);

        this.disableColorSelect(element.nextSetting);
        if (jQuery(element).val()) {
            this.state[element.config.id] = element.value;
            if (element.nextSetting) {
                element.nextSetting.disabled = false;
                this.fillSelect(element.nextSetting);
                this.resetChildren(element.nextSetting);
            }
        }
        else {
            this.resetChildren(element.nextSetting);
        }
        this.reloadPrice();
    },
    reloadOptionLabels: function (element) {
        var selectedPrice;
        if (element.options[element.selectedIndex].config && !this.config.stablePrices) {
            selectedPrice = parseFloat(element.options[element.selectedIndex].config.price)
        }
        else {
            selectedPrice = 0;
        }
        for (var i = 0; i < element.options.length; i++) {
            if (element.options[i].config) {
                element.options[i].text = this.getOptionLabel(element.options[i].config, element.options[i].config.price - selectedPrice);
            }
        }
    },
    /**
     * 重设子节点
     * @param element
     */
    resetChildren: function (element) {
        if (element.childSettings) {
            for (var i = 0; i < element.childSettings.length; i++) {
                element.childSettings[i].selectedIndex = 0;
                element.childSettings[i].disabled = true;
                if (element.config) {
                    this.state[element.config.id] = false;
                }
            }
        }
    },
    reloadPrice: function () {
        if (this.config.disablePriceReload) {
            return;
        }
        var price = 0;
        var oldPrice = 0;
        for (var i = this.settings.length - 1; i >= 0; i--) {
            var selected = this.settings[i].options[this.settings[i].selectedIndex];
            if (selected.config) {
                price += parseFloat(selected.config.price);
                oldPrice += parseFloat(selected.config.oldPrice);
            }
        }

        //optionsPrice.changePrice('config', {'price': price, 'oldPrice': oldPrice});
//        optionsPrice.reload();
        this.priceReload(price);

        return price;

//        if ($('product-price-' + this.config.productId)) {
//            $('product-price-' + this.config.productId).innerHTML = price;
//        }
//        this.reloadOldPrice();
    },
    priceReload: function (price) {
        var price = this.evaluatePrice((optionsPrice.productPrice + price).toFixed(INT_FIXED_LENGTH));
        var product_price = jQuery('#product-price-' + this.config.productId);
        if (product_price) {
            //如果下面有price这个元素则改变此元素就可以
            /*if(product_price.find(".price").length){
                product_price.find(".price").html(price);
            }
            else{
                product_price.html(price);
            }*/
            jQuery(".rmb-price").text(price);
        }
    }
}

