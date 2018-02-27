/**
 * Magento
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License (AFL 3.0)
 * that is bundled with this package in the file LICENSE_AFL.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/afl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    design
 * @package     base_default
 * @copyright   Copyright (c) 2012 Magento Inc. (http://www.magentocommerce.com)
 * @license     http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 */
if(typeof Bundle=='undefined') {
    var Bundle = function(){
    };
}
/**************************** BUNDLE PRODUCT **************************/
//Product.Bundle = Class.create();
Bundle.prototype = {
    initialize: function(config){
        this.config = config;

        // Set preconfigured values for correct price base calculation
        if (config.defaultValues) {
            for (var option in config.defaultValues) {
                if (this.config['options'][option].isMulti) {
                    var selected = new Array();
                    for (var i = 0; i < config.defaultValues[option].length; i++) {
                        selected.push(config.defaultValues[option][i]);
                    }
                    this.config.selected[option] = selected;
                } else {
                    this.config.selected[option] = new Array(config.defaultValues[option] + "");
                }
            }
        }

        this.reloadPrice();
    },
    /**
     * 验证必选项是否选中
     */
    validateRequireSelect:function(){
        var result = true;
        jQuery('.require-item').each(function(){
            var requireBundleItem = jQuery(this).find(".bundle-item:checked");
            if(requireBundleItem.length==0){
                jQuery(this).addClass("require");
                result = false;
            }
            else{
                jQuery(this).removeClass("require");
            }
        });
        return result;
    }
    ,
    changeSelection: function(selection){
        var parts = selection.id.split('-');
//        alert(jQuery('#bundle-option-' + parts[2] + '-qty-input').val());
        if (this.config['options'][parts[2]].isMulti) {
            selected = new Array();
            if (selection.tagName == 'SELECT') {
                for (var i = 0; i < selection.options.length; i++) {
                    if (selection.options[i].selected && selection.options[i].value != '') {
                        selected.push(selection.options[i].value);
                    }
                }
            } else if (selection.tagName == 'INPUT') {
                selector = parts[0]+'-'+parts[1]+'-'+parts[2];
                selections = $$('.'+selector);
                for (var i = 0; i < selections.length; i++) {
                    if (selections[i].checked && selections[i].value != '') {
                        selected.push(selections[i].value);
                    }
                }
            }
            this.config.selected[parts[2]] = selected;
        } else {
            if (selection.value != '') {
                this.config.selected[parts[2]] = new Array(selection.value);
            } else {
                this.config.selected[parts[2]] = new Array();
            }
            this.populateQty(parts[2], selection.value);
        }
        this.reloadPrice();
    },

    reloadPrice: function() {
        var calculatedPrice = 0;
        var dispositionPrice = 0;
        var includeTaxPrice = 0;
        for (var option in this.config.selected) {
            if (this.config.options[option]) {
                for (var i=0; i < this.config.selected[option].length; i++) {
                    var prices = this.selectionPrice(option, this.config.selected[option][i]);
                    //如果该option已选中则增加价格
                    calculatedPrice += Number(prices[0]);
                    dispositionPrice += Number(prices[1]);
                    includeTaxPrice += Number(prices[2]);
                }
            }
        }
        //把计算后的价格写入到页面
        if(calculatedPrice!==0 && !isNaN(calculatedPrice)){
            var specialPriceRate = this.config.specialPrice ==null || this.config.specialPrice>100?100:this.config.specialPrice;
            var price = this.config.basePrice * specialPriceRate/100;
            price = price + calculatedPrice;
            var priceHtml = this.config.priceFormat.pattern.replace("%s",price.toFixed(INT_FIXED_LENGTH));
            jQuery('.price-box .regular-price .price').remove();
            jQuery('.price-box .regular-price').append("<span class='price' data-item-price='"+price+"'>"+priceHtml+"</span>");
        }

//        var event = $(document).fire('bundle:reload-price', {
//            price: calculatedPrice,
//            priceInclTax: includeTaxPrice,
//            dispositionPrice: dispositionPrice,
//            bundle: this
//        });
//        if (!event.noReloadPrice) {
//            optionsPrice.specialTaxPrice = 'true';
//            optionsPrice.changePrice('bundle', calculatedPrice);
//            optionsPrice.changePrice('nontaxable', dispositionPrice);
//            optionsPrice.changePrice('priceInclTax', includeTaxPrice);
//            optionsPrice.reload();
//        }

        return calculatedPrice;
    },

    selectionPrice: function(optionId, selectionId) {
        if (selectionId == '' || selectionId == 'none') {
            return 0;
        }
        var qty = null;
        if (this.config.options[optionId].selections[selectionId].customQty == 1 && !this.config['options'][optionId].isMulti) {
            if (jQuery('#bundle-option-' + optionId + '-qty-input').length!==0) {
                qty = jQuery('#bundle-option-' + optionId + '-qty-input').val();
            } else {
                qty = 1;
            }
        } else {
            qty = this.config.options[optionId].selections[selectionId].qty;
        }

        if (this.config.priceType == '0') {
            price = this.config.options[optionId].selections[selectionId].price;
            tierPrice = this.config.options[optionId].selections[selectionId].tierPrice;

            for (var i=0; i < tierPrice.length; i++) {
                if (Number(tierPrice[i].price_qty) <= qty && Number(tierPrice[i].price) <= price) {
                    price = tierPrice[i].price;
                }
            }
        } else {
            selection = this.config.options[optionId].selections[selectionId];
            if (selection.priceType == '0') {
                price = selection.priceValue;
            } else {
                price = (this.config.basePrice*selection.priceValue)/100;
            }
        }
        //price += this.config.options[optionId].selections[selectionId].plusDisposition;
        //price -= this.config.options[optionId].selections[selectionId].minusDisposition;
        //return price*qty;
        var disposition = this.config.options[optionId].selections[selectionId].plusDisposition +
            this.config.options[optionId].selections[selectionId].minusDisposition;

        if (this.config.specialPrice) {
            newPrice = (price*this.config.specialPrice)/100;
            newPrice = (Math.round(newPrice*100)/100).toString();
            price = Math.min(newPrice, price);
        }

        selection = this.config.options[optionId].selections[selectionId];
        if (selection.priceInclTax !== undefined) {
            priceInclTax = selection.priceInclTax;
            price = selection.priceExclTax !== undefined ? selection.priceExclTax : selection.price;
        } else {
            priceInclTax = price;
        }

        var result = new Array(price*qty, disposition*qty, priceInclTax*qty);
        return result;
    },

    populateQty: function(optionId, selectionId){
        if (selectionId == '' || selectionId == 'none') {
            this.showQtyInput(optionId, '0', false);
            return;
        }
        if (this.config.options[optionId].selections[selectionId].customQty == 1) {
            this.showQtyInput(optionId, this.config.options[optionId].selections[selectionId].qty, true);
        } else {
            this.showQtyInput(optionId, this.config.options[optionId].selections[selectionId].qty, false);
        }
    },

    showQtyInput: function(optionId, value, canEdit) {
        elem = jQuery('#bundle-option-' + optionId + '-qty-input');
        elem.val(value);
        elem.attr('disabled',!canEdit);
        if (canEdit) {
            elem.removeClass('qty-disabled');
        } else {
            elem.addClass('qty-disabled');
        }
    },
    /**
     * 选款弹层
     */
    showOptionsDiv:function(_this){
        // clone the parent ul element
        var ul = jQuery(_this).parents('ul'),
            clonedul = ul.clone(),
            radio = clonedul.find(':radio'),
            clickedIndex = 0;
        clonedul.find(":radio").removeAttr("name");
        ul.after(clonedul);

        ul.parents('.pack-item').css('z-index', '10');

        // find elements should be shown
        clonedul.addClass('clonedul').find('li').show().find('.select-type').hide();
        radio.show();

        // remove radio button's onclick handler
        //radio.prop('checked', false).removeAttr('onclick');
        
        // add a shrink button
        clonedul.append('<a class="select-type-hide" href="javascript:;" onclick="bundle.hideOptionsDiv(this)">收起</a>');
        
        // find the selected radio's index
        radio.click(function () {
            clickedIndex = radio.index(this);

            // find original ul radios and find specific radio and checked
            ul.find(':radio').prop('checked', false).eq(clickedIndex).prop('checked', true);

            // find original ul lis and hide specific li
            ul.find('li').hide();
            ul.find(':radio').eq(clickedIndex).parents('li').show();

            // removed the cloned ul
            clonedul.remove();
            ul.parents('.pack-item').css('z-index', '0');

            //parents node remove class
            ul.parents('.pack-item').removeClass("require");
        });
    },
    
    hideOptionsDiv: function (_this) {
        // find this cloned ul and pack-item
        var clonedul = jQuery(_this).parents('.clonedul'),
            packItem = jQuery(_this).parents('.pack-item');
        // remove it
        clonedul.remove();
        // set z-index to 0 to solve IE's bug
        packItem.css('z-index', 0);
    },

    changeOptionQty: function (element, event) {
        var checkQty = true;
        if (typeof(event) != 'undefined') {
            if (event.keyCode == 8 || event.keyCode == 46) {
                checkQty = false;
            }
        }
        if (checkQty && (Number(element.value) == 0 || isNaN(Number(element.value)))) {
            element.value = 1;
        }
        parts = element.id.split('-');
        optionId = parts[2];
        if (!this.config['options'][optionId].isMulti) {
            selectionId = this.config.selected[optionId][0];
            this.config.options[optionId].selections[selectionId].qty = element.value*1;
            this.reloadPrice();
        }
    },

    validationCallback: function (elmId, result){
        if (elmId == undefined || jQuery(elmId) == undefined) {
            return;
        }
        var container = jQuery(elmId).up('ul.options-list');
        if (typeof container != 'undefined') {
            if (result == 'failed') {
                container.removeClassName('validation-passed');
                container.addClassName('validation-failed');
            } else {
                container.removeClassName('validation-failed');
                container.addClassName('validation-passed');
            }
        }
    }
}
