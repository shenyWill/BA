jQuery(function() {
    var $ = jQuery,
    curUrl = window.location.href;
    var loadBox = $(".loader-box");
    if ($("#isListView").length){
        var ajaxApi = window.listUrl;

    }else {
        var ajaxApi = SEARCH_API;
    }
    var searchArr = window.location.search.replace('?', '').split('&'),
        globalOptions = {
            resetPage: true,
            inStock: 0,
            cateId: 0,
            brand: 0,
            priceRange: ''
        },
        kw;

    //处理地址获取关键字
    $.each(searchArr, function(index, value) {
        if (value.split('=')[0] === 'q') {
            kw = value.split('=')[1];
            $('.js-search-q').val(decodeURIComponent(kw));
        }
    });

    //各种条件筛选
    allSort();
    //绑定是否有库存的筛选
    stockFilter();
    //获取结果
    getResult();
    //清空所有筛选
    clearFilters();
    //列表清空筛选项
    listDeleteSelectedItem();

    //获取搜索结果的函数
    function getResult(options) {
        //获取参数
        //若当前页面为专题详情页
        if(curUrl.indexOf("/o_special/special")>-1){
            options = $.extend({
                specialId:ParamId,
                page: 1,
                pageSize: 40,
                sort: 0,
                filter: '0_0_0',
                source: USER_SOURCE || ''
            }, options, { filter: globalOptions.inStock + '_' + globalOptions.cateId + '_' + globalOptions.brand });
            $.ajax({
                type: 'get',
                url: SEARCH_API,
                data: options,
                dataType: 'jsonp',
                success: function (resJson) {
                    var resData = resJson.data;
                    //如果返回结果是空
                    if (!resJson.data.length) {
                        $('.pl-grid-ctn').find('ul').html('<div class="empty-tip">' + '抱歉,该专题下没有产品,请查看其它专题' + '</div>');
                        return;
                    }
                    /*//显示结果总数量
                     $('.pl-qty').find('em').text(resData.pagination.total);*/
                    //显示结果页
                    generateProductList(resJson);
                    //如果页面没有页码，就显示页码
                    if (!$('.col-main').find('.simple-pagination').length) {
                        generatePagination(resJson.pagination);
                    }
                    //如果要重置页码，就重新生成
                    if (globalOptions.resetPage) {
                        generatePagination(resJson.pagination);
                        globalOptions.resetPage = false;
                        location.hash = '#page=1';
                    }
                }
            });
        }else {
            if ($("#isListView").length) {
                options = $.extend({
                    listCid: window.LISTCID,
                    cid: window.CATEGORYID,
                    page: 1,
                    pageSize: 24,
                    sort: 0,
                    filter: '0_0_0',
                    source: USER_SOURCE || ''
                }, options, {filter: globalOptions.inStock + '_' + globalOptions.cateId + '_' + globalOptions.brand});
            } else {
                options = $.extend({
                    kw: kw,
                    page: 1,
                    pageSize: 24,
                    sort: 0,
                    filter: '0_0_0',
                    source: USER_SOURCE || ''
                }, options, {filter: globalOptions.inStock + '_' + globalOptions.cateId + '_' + globalOptions.brand});
            }
            loadBox.show();
            $.ajax({
                type: 'get',
                url: ajaxApi,
                data: options,
                dataType: 'jsonp'
            }).success(function (resJson) {
                loadBox.hide();
                if (sa_enabled) { //神策搜索信息埋点
                    indexSensors.search(_sensorsSearchParamsFilter(options), resJson);
                }
                //如果返回结果是空
                if (!resJson.data.length) {
                    if ($("#isListView").length) {
                        noListResult(resJson);
                    } else {
                        noResult(resJson);
                    }
                    return;
                }
                //设置criteo所需数据
                setCriteoData(resJson.data);

                if ($("#isListView").length) {
                    $('.pl-category').text($('.breadcrumbs-last').text());
                } else {
                    //显示结果标题
                    $('h1.query-text').text('"' + decodeURIComponent(kw).replace(/\+/g, ' ').substring(0, 20) + '"的搜索结果');
                    $('.breadcrumbs-last').text('搜索结果："' + decodeURIComponent(kw).replace(/\+/g, ' ').substring(0, 20) + '"');
                }
                //显示结果总数量
                $('.pl-qty').find('em').text(resJson.pagination.totalCount);
                //显示结果页
                generateProductList(resJson);
                if ($("#isListView").length) {
                    //如果页面没有页码，就显示页码
                    if (!$('.col-main').find('.simple-pagination').length) {
                        generatePaginationList(resJson.pagination);
                    }
                    //如果要重置页码，就重新生成
                    if (globalOptions.resetPage) {
                        generatePaginationList(resJson.pagination);
                        globalOptions.resetPage = false;
                        location.hash = '#page=1';
                    }
                } else {
                    //如果页面没有页码，就显示页码
                    if (!$('.col-main').find('.simple-pagination').length) {
                        generatePagination(resJson.pagination);
                    }
                    //如果要重置页码，就重新生成
                    if (globalOptions.resetPage) {
                        generatePagination(resJson.pagination);
                        globalOptions.resetPage = false;
                        location.hash = '#page=1';
                    }
                }

                //生成侧边栏的分类数据
                if (!$('#filter-cates').data('init')) {
                    if ($("#isListView").length) {
                        generateBrandsList(resJson.facets.brandId);
                        generatePricesList(resJson.facets.priceRange);
                        generateCategoriesList(resJson.facets);
                    } else {
                        generateBrands(resJson.facets.brandId);
                        generateCategories(resJson.facets);
                        generatePriceRange(resJson.facets.priceRange);
                    }
                    //生成侧边栏的交互
                    if (!$("#isListView").length) {
                        sidebarInteract();
                    }
                }
            });
        }
    }
    /*过滤神策埋点的参数*/
    function _sensorsSearchParamsFilter(senPar) {
        switch(Number(senPar.sort)) {
            case 0:
                senPar.search_sort = "0";
                break;
            case 3:
                senPar.search_sort = "p_a";
                break;
            case 4:
                senPar.search_sort = "p_d";
                break;
            case 6:
                senPar.search_sort = "ot_d";
                break;
            case 7:
                senPar.search_sort = "sv_d";
                break;
            case 8:
                senPar.search_sort = "s_d";
                break;
        }
        return senPar;
    }
    function setCriteoData(productItems) {
        var criteoConfig = window.CRITEO_CONFIG || {};
        if (!criteoConfig.isEnabled || criteoConfig.isSetted) {
            return false;
        } else {
            criteoConfig.isSetted = true;
            window.criteo_q = window.criteo_q || [];
            var criteoItem = [];
            for (var i = 0; i < productItems.length && i < 3; i++) {
                criteoItem.push(productItems[i]["sku_full"]);
            }
            window.criteo_q.push({
                event: "setAccount",
                account: criteoConfig.account
            }, {
                event: "setHashedEmail",
                email: jQuery.cookie(criteoConfig.emailKey)
            }, {
                event: "setSiteType",
                type: criteoConfig.siteType
            }, {
                event: "viewList",
                item: criteoItem
            });
        }
    }
    //显示空结果的函数
    function noResult(resJson) {
        $('.query-text').html('“' + decodeURIComponent(kw).replace(/\+/g, ' ').substring(0, 20) + '”的搜索结果');
        $('.breadcrumbs-last').text('搜索结果："' + decodeURIComponent(kw).replace(/\+/g, ' ').substring(0, 20) + '"');
        $('.pl-qty').find('em').text(resJson.pagination.totalCount);
        $('.pl-grid-ctn').find('ul').html('<div class="search-no-result"><div class="empty-result"><p class="result-title"><strong>Oh！真遗憾......</strong></p><p>您搜索的<b>“' + decodeURIComponent(kw).replace(/\+/g, ' ') + '”</b>暂时没有结果，建议您：</p><ul><li>| 看看输入的文字是否正确</li><li>| 尝试减少筛选条件</li><li>| 尝试用其他关键词搜索</li><li>| 不同关键词之间加上空格</li></ul></div></div>');
        $('.pages').removeClass().addClass('pages').empty();
    }
    //列表页筛选为空函数
    function noListResult(resJson) {
        $('.pl-qty').find('em').text(resJson.pagination.totalCount);
        $('.pl-grid-ctn').find('ul').html('<div class="search-no-result"><div class="empty-result"><p class="result-title"><strong>Oh！真遗憾......</strong></p><p>您筛选的条件暂时没有结果，建议您：</p><ul><li>| 重新选择筛选条件</li></ul></div></div>');
        $('.pages').removeClass().addClass('pages').empty();
    }
    //加上商品展示位
    function productListPosition(resJson) {
        var row = 0,
            column = 0,
            row_sum = 4,
            leg = resJson.data.length;
        for (var i = 0; i < leg; i++) {
            if (resJson.data[i]["type_id"] == "bundle") {
                resJson.data[i]["isBundle"] = 1;
            }
            //折扣标记
            if (resJson.data[i]["sales"] == "0" || resJson.data[i]["sales"] < window.salesTag) {
                resJson.data[i]["sales"] = 0;
            }
            if (parseFloat(resJson.data[i]["price"]) > 0 && parseFloat(resJson.data[i]["price"]) > parseFloat(resJson.data[i]["final_price"])) {
                resJson.data[i]["hasSpecialPrice"] = 1;
            }
            if (row % row_sum == 0 & row !== 0) {
                row = 0;
                column++;
            }
            resJson.data[i]["number"] = i;
            resJson.data[i]["row"] = row;
            resJson.data[i]["column"] = column;
            row++;
        }
        return resJson;
    }
    //显示结果页的函数
    function generateProductList(resJson) {
        var itemData = productListPosition(resJson);
        var source = $('#single-product').html(),
            template = Handlebars.compile(source),
            html = template(itemData);
        $('#pl-grid-ctn').find('ul').html(html);
    }

    // 显示价格用的Helper
    Handlebars.registerHelper('ifDiscount', function(discount, options) {
        if (discount - 0 !== 0) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper('ifBundle', function(type_id, options) {
        if (type_id === 'bundle') {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    //显示页码用的函数
    function generatePagination(pagination) {
        $('.pages').pagination({
            items: pagination.totalCount,
            itemsOnPage: pagination.defaultPageSize,
            displayedPages: 6,
            hrefTextPrefix: '#' + pagination.pageParam + '-',
            prevText: '上一页',
            nextText: '下一页',
            edges: 1,
            onPageClick: function(pageNumber, event) {
                var top = $('.breadcrumbs').offset().top;
                globalOptions.page = pageNumber;
                getResult(globalOptions);

                if (!$('html, body').is(':animated')) {
                    $('html, body').animate({
                        scrollTop: top
                    }, 400);
                }
            }
        });
    }
    //列表显示页码用的函数
    function generatePaginationList(pagination) {
        $('.pages').pagination({
            items: pagination.totalCount,
            itemsOnPage: pagination.defaultPageSize,
            displayedPages: 5,
            hrefTextPrefix: '#' + pagination.pageParam + '-',
            prevText: '上一页',
            nextText: '下一页',
            edges: 0,
            onPageClick: function(pageNumber, event) {
                var top = $('.breadcrumbs').offset().top;
                globalOptions.page = pageNumber;
                getResult(globalOptions);

                if (!$('html, body').is(':animated')) {
                    $('html, body').animate({
                        scrollTop: top
                    }, 400);
                }
                return false
            }
        });
    }

    //生成侧边栏分类数据
    function generateCategories(data) {
        var source = $('#sidebar-category').html(),
            template = Handlebars.compile(source),
            html = template(data);

        $('#filter-cates').find('ul').html(html);
        $('#filter-cates').data('init', 1);

        $('#filter-cates').off('click').on('click', 'li', function() {
            $(this).addClass('current').siblings().removeClass('current');

            globalOptions.cateId = $(this).data('cateid');
            globalOptions.page = 1;
            globalOptions.resetPage = true;

            getResult(globalOptions);
        });
    }
    //列表删除筛选项
    function listDeleteSelectedItem() {
        $("#selectedItemCtn").on("click",function(event){
            var $target = $(event.target);
            if($target.is(".after")){
                $target = $target.closest(".selected-item");
                var selectedType = $target.attr("data-type");
                var selectedValue = $target.attr("data-value");
                var filterItemToFire = $("[data-filter-type='"+selectedType+"']").filter("[data-filter-value='"+selectedValue+"']");
                filterItemToFire.attr('data-filte-flag',0);
                filterItemToFire.trigger("click",[filterItemToFire,true]);
                if($target.closest('.selected-item').attr('data-type') == "priceRange") {
                    $("#filter-price-range").show();
                }else if($target.closest('.selected-item').attr('data-type') == "brandId") {
                    $("#filter-brands").show();
                }
                $target.closest('.selected-item').remove();
                if($('#selectedItemCtn').children().length == 0) {
                    $("#clear-filter").hide();
                }else {
                    $("#clear-filter").show();
                }

            }
        });
    }
    //生成列表侧边栏的分类数据
    function generateCategoriesList(data) {
        var _data = data;
        var _calCate = function (resData) {
            var _cateTitle = resData.cateId[0].name;
            var _cateResult;
            if(resData.cateId[0]._child.length){
                _cateResult = resData.cateId[0]._child;
            }else  {
                _cateResult = null;
            }
            return {
                cateTitle: _cateTitle,
                cateResult: _cateResult
            }
        }
        var _dataList = _calCate(_data);
        var source = $('#sidebar-category-list').html(),
            template = Handlebars.compile(source),
            html = template(_dataList);

        $('#filter-cates').html(html);
        $('#filter-cates').data('init', 1);

        $('#filter-cates').off('click').on('click', 'li', function() {
            $(this).addClass('current').siblings().removeClass('current');
            globalOptions.cateId = $(this).data('cateid');
            globalOptions.page = 1;
            globalOptions.resetPage = true;
            getResult(globalOptions);
        });
    }
    //生成列表侧边栏的价格数据
    function generatePricesList(data) {
        var brands = data;
        var formattedBrands = [];
        if(brands && !$.isArray(brands)){
            for(var brandId in brands ){
                formattedBrands.push({
                    "brandId" : brandId,
                    "name" : brands[brandId]
                });
            }
        }
        _data = {brands : formattedBrands};
        var html = '';
        for (var i in _data.brands) {
            html += '<li data-filter-type="priceRange" data-filter-value="' + _data.brands[i].brandId + '">' + _data.brands[i].name + '</li>';
        }
        $('#filter-price-range').find('ul').html(html);

        $('#filter-price-range').off('click').on('click', 'li', function(event, isDel) {
            var $target = $(event.target);

            $target.addClass('current').siblings().removeClass('current');
            if(!isDel) {
                var selectedItem = "<a class='tag selected-item' data-type='priceRange' data-value='"+$target.attr("data-filter-value")+"'  href='javascript:void(0)' ><span>"+ $target.html() +"</span><i class='after'></i></a>";
                $("#selectedItemCtn").append(selectedItem);
            }
            // globalOptions.priceRange = $(this).data('price');

            globalOptions.priceRange = ($target.attr("data-filte-flag") == 0) ? 0 : $(this).attr('data-filter-value');
            // globalOptions.priceRange = $(this).attr('data-filter-value');

            globalOptions.page = 1;
            globalOptions.resetPage = true;

            getResult(globalOptions);
            $target.attr("data-filte-flag",1);
              if($('#selectedItemCtn').children().length == 0) {
                $("#clear-filter").hide();
            }else {
                $("#clear-filter").show();
            }
            $("#filter-price-range").hide();

        });
    }

    //生成列表侧边栏的品牌数据
    function generateBrandsList(data) {
        var html = '';
        for (var i in data) {
            html += '<li data-filter-type="brandId" data-filter-value="' + data[i].key + '">' + data[i].name + '</li>';
        }
        $('#filter-brands').find('ul').html(html);

        $('#filter-brands').off('click').on('click', 'li', function(event, isDel) {
            var $target = $(event.target);
            if(!isDel) {
                $target.addClass('current').siblings().removeClass('current');
                var selectedItem = "<a class='tag selected-item' data-type='brandId' data-value='"+$target.attr("data-filter-value")+"' href='javascript:void(0)'><span>"+ $target.html() +"</span><i class='after'></i></a>";
                $("#selectedItemCtn").append(selectedItem);
            }
            // globalOptions.brand = $(this).data('brand');
            // globalOptions.brand = $(this).attr('data-filter-value');
            globalOptions.brand = ($target.attr("data-filte-flag") == 0) ? 0 : $(this).attr('data-filter-value');
            globalOptions.page = 1;
            globalOptions.resetPage = true;

            getResult(globalOptions);
            $target.attr("data-filte-flag",1);
            if($('#selectedItemCtn').children().length == 0) {
                $("#clear-filter").hide();
            }else {
                $("#clear-filter").show();
            }
            $("#filter-brands").hide();
        });
    }
    function generateBrands(data) {
        var html = '';
        for (var i in data) {
            html += '<li data-brand="' + data[i].key + '">' + data[i].name + '</li>';
        }
        $('#filter-brands').find('ul').html(html);

        $('#filter-brands').off('click').on('click', 'li', function() {
            $(this).addClass('current').siblings().removeClass('current');

            globalOptions.brand = $(this).data('brand');
            globalOptions.page = 1;
            globalOptions.resetPage = true;

            getResult(globalOptions);
        });
    }

    //生成侧边栏价格区间的函数
    function generatePriceRange(data) {
        var html = '';
        for (var i in data) {
            html += '<li data-range="' + i + '">' + data[i] + '</li>';
        }
        $('#filter-price-range').find('ul').html(html);
        $('#filter-price-range').off('click').on('click', 'li', function() {
            $(this).addClass('current').siblings().removeClass('current');

            globalOptions.priceRange = $(this).data('range');
            globalOptions.resetPage = true;

            getResult(globalOptions);
        });

        $('#filter-price-range').find('.range-submit').off('click').on('click', function() {
            var a = $('#range-a').val() - 0,
                b = $('#range-b').val() - 0,
                arr;

            if ($.type(a) !== 'number') {
                a = 0;
            }

            if ($.type(b) !== 'number') {
                b = 0;
            }

            a = Math.abs(a);
            b = Math.abs(b);
            arr = [a, b].sort(function(a, b) {
                return a - b;
            });

            $('#range-a').val(arr[0]);
            $('#range-b').val(arr[1]);

            globalOptions.priceRange = arr.join(',');
            globalOptions.page = 1;
            globalOptions.resetPage = true;
            getResult(globalOptions);
        });
    }

    //处理侧边栏的展开和收起
    function sidebarInteract() {
        $('.side-block').each(function() {
            var $this = $(this),
                $title = $this.find('h3'),
                $ul = $this.find('ul');

            if ($ul.find('li').length > 10) {
                if (!$title.find('span').length) {
                    $title.append('<span class="view-all">查看所有</span>');
                }
                $ulHide = $ul.find('li:gt(9)').hide();
                $this.data('ulhide', $ulHide);
            } else {
                $title.find('span').remove();
            }
        });

        $('.side-block').on('click', 'h3 span', function() {
            var $ulHide = $(this).parents('.side-block').data('ulhide');

            if ($(this).hasClass('view-all')) {
                $(this).removeClass('view-all').addClass('shrink').text('收起');
                $ulHide.show();

            } else {
                $(this).removeClass('shrink').addClass('view-all').text('查看所有');
                $ulHide.hide();
            }
        });
    }

    //库存筛选的函数
    function stockFilter() {
        $('#filter-stock').click(function(e) {
            e.preventDefault();

            if ($(this).hasClass('selected')) {
                globalOptions.inStock = 0;
                $(this).removeClass('selected');
            } else {
                globalOptions.inStock = 1;
                $(this).addClass('selected');
            }

            globalOptions.resetPage = true;
            globalOptions.page = 1;

            getResult(globalOptions);
        });
    }

    //各种排序筛选的集合
    function allSort() {
        sortRelevance();
        sortPrice();
        sortDiscount();
        sortSales();
        sortRecent();
    }

    //关联排序
    function sortRelevance() {
        $('#filter-relevance').click(function() {
            if ($(this).hasClass('selected')) {
                return;
            }

            globalOptions.sort = 0;
            globalOptions.page = 1;
            globalOptions.resetPage = true;
            getResult(globalOptions);
            //去掉其他筛选的样式
            $('.pl-sort-type').removeClass('selected')
                .end().find('.after').remove();
            //给自己添加被选中的样式
            $(this).addClass('selected');
        });
    }

    //价格排序
    function sortPrice() {
        $('#filter-price').click(function() {
            if ($(this).hasClass('selected')) {
                if ($(this).hasClass('pl-sort-asc')) {
                    $(this).removeClass('pl-sort-asc').addClass('pl-sort-desc');
                    globalOptions.sort = 4;
                } else {
                    $(this).removeClass('pl-sort-desc').addClass('pl-sort-asc');
                    globalOptions.sort = 3;
                }
            } else {
                $(this).addClass('pl-sort-asc selected').append('<i class="after"></i>');
                globalOptions.sort = 3;
            }
            globalOptions.page = 1;
            globalOptions.resetPage = true;
            getResult(globalOptions);
            //去掉其他筛选的样式
            $('.pl-sort-type').not($(this)).removeClass('selected');
            $('.pl-sort-type').not($(this)).find('.after').remove();
        });
    }

    //折扣排序
    function sortDiscount() {
        $('#filter-discount').click(function() {
            if ($(this).hasClass('selected')) {
                return;
            }

            globalOptions.sort = 8;
            globalOptions.page = 1;
            globalOptions.resetPage = true;
            getResult(globalOptions);
            //去掉其他筛选的样式
            $('.pl-sort-type').removeClass('selected')
                .end().find('.after').remove();
            //给自己添加被选中的样式
            $(this).addClass('selected');
        });
    }

    //销量排序
    function sortSales() {
        $('#filter-sales').click(function() {
            if ($(this).hasClass('selected')) {
                return;
            }

            globalOptions.sort = 7;
            globalOptions.page = 1;
            globalOptions.resetPage = true;
            getResult(globalOptions);
            //去掉其他筛选的样式
            $('.pl-sort-type').removeClass('selected')
                .end().find('.after').remove();
            //给自己添加被选中的样式
            $(this).addClass('selected');
        });
    }

    //上架时间排序
    function sortRecent() {
        $('#filter-recent').click(function() {
            if ($(this).hasClass('selected')) {
                if ($(this).hasClass('pl-sort-asc')) {
                    $(this).removeClass('pl-sort-asc').addClass('pl-sort-desc');
                    globalOptions.sort = 6;
                } else {
                    $(this).removeClass('pl-sort-desc').addClass('pl-sort-asc');
                    globalOptions.sort = 5;
                }
            } else {
                $(this).addClass('pl-sort-desc selected').append('<i class="after"></i>');
                globalOptions.sort = 6;
            }
            globalOptions.resetPage = true;
            globalOptions.page = 1;
            getResult(globalOptions);
            //去掉其他筛选的样式
            $('.pl-sort-type').not($(this)).removeClass('selected');
            $('.pl-sort-type').not($(this)).find('.after').remove();
        });
    }

    //清空全部筛选条件
    function clearFilters() {
        $('#clear-filter').find('a').click(function() {
            //还原边栏构造的参数
            $('#filter-cates').data('init', 0);
            $('#filter-stock').removeClass('selected');
            //还原筛选条件
            globalOptions.sort = 0;
            globalOptions.salesRange = 0;
            globalOptions.inStock = 0;
            globalOptions.cateId = 0;
            globalOptions.brand = 0;
            globalOptions.page = 1;
            globalOptions.priceRange = '';
            globalOptions.resetPage = true;
            //还原过滤器显示
            $('#filter-relevance').addClass('selected').siblings().removeClass('selected').find('.after').remove();
            $('#range-a, #range-b').val('');
            //获取结果
            getResult(globalOptions);
            //列表
            if ($("#isListView").length){
                $('#selectedItemCtn').empty();
                if($('#selectedItemCtn').children().length == 0) {
                    $("#clear-filter").hide();
                }else {
                    $("#clear-filter").show();
                }
                $("#filter-price-range").show();
                $("#filter-brands").show();
            }
        });
    }
});

/**
 * simplePagination.js v1.6
 * A simple jQuery pagination plugin.
 * http://flaviusmatis.github.com/simplePagination.js/
 *
 * Copyright 2012, Flavius Matis
 * Released under the MIT license.
 * http://flaviusmatis.github.com/license.html
 */

;
(function($) {

    var methods = {
        init: function(options) {
            var o = $.extend({
                items: 1,
                itemsOnPage: 1,
                pages: 0,
                displayedPages: 5,
                edges: 2,
                currentPage: 0,
                hrefTextPrefix: '#page-',
                hrefTextSuffix: '',
                prevText: 'Prev',
                nextText: 'Next',
                ellipseText: '&hellip;',
                cssStyle: 'light-theme',
                listStyle: '',
                labelMap: [],
                selectOnClick: true,
                nextAtFront: false,
                invertPageOrder: false,
                useStartEdge: true,
                useEndEdge: true,
                onPageClick: function(pageNumber, event) {
                    // Callback triggered when a page is clicked
                    // Page number is given as an optional parameter
                },
                onInit: function() {
                    // Callback triggered immediately after initialization
                }
            }, options || {});

            var self = this;

            o.pages = o.pages ? o.pages : Math.ceil(o.items / o.itemsOnPage) ? Math.ceil(o.items / o.itemsOnPage) : 1;
            if (o.currentPage)
                o.currentPage = o.currentPage - 1;
            else
                o.currentPage = !o.invertPageOrder ? 0 : o.pages - 1;
            o.halfDisplayed = o.displayedPages / 2;

            this.each(function() {
                self.addClass(o.cssStyle + ' simple-pagination').data('pagination', o);
                methods._draw.call(self);
            });

            o.onInit();

            return this;
        },

        selectPage: function(page) {
            methods._selectPage.call(this, page - 1);
            return this;
        },

        prevPage: function() {
            var o = this.data('pagination');
            if (!o.invertPageOrder) {
                if (o.currentPage > 0) {
                    methods._selectPage.call(this, o.currentPage - 1);
                }
            } else {
                if (o.currentPage < o.pages - 1) {
                    methods._selectPage.call(this, o.currentPage + 1);
                }
            }
            return this;
        },

        nextPage: function() {
            var o = this.data('pagination');
            if (!o.invertPageOrder) {
                if (o.currentPage < o.pages - 1) {
                    methods._selectPage.call(this, o.currentPage + 1);
                }
            } else {
                if (o.currentPage > 0) {
                    methods._selectPage.call(this, o.currentPage - 1);
                }
            }
            return this;
        },

        getPagesCount: function() {
            return this.data('pagination').pages;
        },

        setPagesCount: function(count) {
            this.data('pagination').pages = count;
        },

        getCurrentPage: function() {
            return this.data('pagination').currentPage + 1;
        },

        destroy: function() {
            this.empty();
            return this;
        },

        drawPage: function(page) {
            var o = this.data('pagination');
            o.currentPage = page - 1;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        redraw: function() {
            methods._draw.call(this);
            return this;
        },

        disable: function() {
            var o = this.data('pagination');
            o.disabled = true;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        enable: function() {
            var o = this.data('pagination');
            o.disabled = false;
            this.data('pagination', o);
            methods._draw.call(this);
            return this;
        },

        updateItems: function(newItems) {
            var o = this.data('pagination');
            o.items = newItems;
            o.pages = methods._getPages(o);
            this.data('pagination', o);
            methods._draw.call(this);
        },

        updateItemsOnPage: function(itemsOnPage) {
            var o = this.data('pagination');
            o.itemsOnPage = itemsOnPage;
            o.pages = methods._getPages(o);
            this.data('pagination', o);
            methods._selectPage.call(this, 0);
            return this;
        },

        getItemsOnPage: function() {
            return this.data('pagination').itemsOnPage;
        },

        _draw: function() {
            var o = this.data('pagination'),
                interval = methods._getInterval(o),
                i,
                tagName;

            methods.destroy.call(this);

            tagName = (typeof this.prop === 'function') ? this.prop('tagName') : this.attr('tagName');

            var $panel = tagName === 'UL' ? this : $('<ul' + (o.listStyle ? ' class="' + o.listStyle + '"' : '') + '></ul>').appendTo(this);

            // Generate Prev link
            if (o.prevText) {
                methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage - 1 : o.currentPage + 1, { text: o.prevText, classes: 'prev' });
            }

            // Generate Next link (if option set for at front)
            if (o.nextText && o.nextAtFront) {
                methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage + 1 : o.currentPage - 1, { text: o.nextText, classes: 'next' });
            }

            // Generate start edges
            if (!o.invertPageOrder) {
                if (interval.start > 0 && o.edges > 0) {
                    if (o.useStartEdge) {
                        var end = Math.min(o.edges, interval.start);
                        for (i = 0; i < end; i++) {
                            methods._appendItem.call(this, i);
                        }
                    }
                    if (o.edges < interval.start && (interval.start - o.edges != 1)) {
                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                    } else if (interval.start - o.edges == 1) {
                        methods._appendItem.call(this, o.edges);
                    }
                }
            } else {
                if (interval.end < o.pages && o.edges > 0) {
                    if (o.useStartEdge) {
                        var begin = Math.max(o.pages - o.edges, interval.end);
                        for (i = o.pages - 1; i >= begin; i--) {
                            methods._appendItem.call(this, i);
                        }
                    }

                    if (o.pages - o.edges > interval.end && (o.pages - o.edges - interval.end != 1)) {
                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                    } else if (o.pages - o.edges - interval.end == 1) {
                        methods._appendItem.call(this, interval.end);
                    }
                }
            }

            // Generate interval links
            if (!o.invertPageOrder) {
                for (i = interval.start; i < interval.end; i++) {
                    methods._appendItem.call(this, i);
                }
            } else {
                for (i = interval.end - 1; i >= interval.start; i--) {
                    methods._appendItem.call(this, i);
                }
            }

            // Generate end edges
            if (!o.invertPageOrder) {
                if (interval.end < o.pages && o.edges > 0) {
                    if (o.pages - o.edges > interval.end && (o.pages - o.edges - interval.end != 1)) {
                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                    } else if (o.pages - o.edges - interval.end == 1) {
                        methods._appendItem.call(this, interval.end);
                    }
                    if (o.useEndEdge) {
                        var begin = Math.max(o.pages - o.edges, interval.end);
                        for (i = begin; i < o.pages; i++) {
                            methods._appendItem.call(this, i);
                        }
                    }
                }
            } else {
                if (interval.start > 0 && o.edges > 0) {
                    if (o.edges < interval.start && (interval.start - o.edges != 1)) {
                        $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
                    } else if (interval.start - o.edges == 1) {
                        methods._appendItem.call(this, o.edges);
                    }

                    if (o.useEndEdge) {
                        var end = Math.min(o.edges, interval.start);
                        for (i = end - 1; i >= 0; i--) {
                            methods._appendItem.call(this, i);
                        }
                    }
                }
            }

            // Generate Next link (unless option is set for at front)
            if (o.nextText && !o.nextAtFront) {
                methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage + 1 : o.currentPage - 1, { text: o.nextText, classes: 'next' });
            }
        },

        _getPages: function(o) {
            var pages = Math.ceil(o.items / o.itemsOnPage);
            return pages || 1;
        },

        _getInterval: function(o) {
            return {
                start: Math.ceil(o.currentPage > o.halfDisplayed ? Math.max(Math.min(o.currentPage - o.halfDisplayed, (o.pages - o.displayedPages)), 0) : 0),
                end: Math.ceil(o.currentPage > o.halfDisplayed ? Math.min(o.currentPage + o.halfDisplayed, o.pages) : Math.min(o.displayedPages, o.pages))
            };
        },

        _appendItem: function(pageIndex, opts) {
            var self = this,
                options, $link, o = self.data('pagination'),
                $linkWrapper = $('<li></li>'),
                $ul = self.find('ul');

            pageIndex = pageIndex < 0 ? 0 : (pageIndex < o.pages ? pageIndex : o.pages - 1);

            options = {
                text: pageIndex + 1,
                classes: ''
            };

            if (o.labelMap.length && o.labelMap[pageIndex]) {
                options.text = o.labelMap[pageIndex];
            }

            options = $.extend(options, opts || {});

            if (pageIndex == o.currentPage || o.disabled) {
                if (o.disabled || options.classes === 'prev' || options.classes === 'next') {
                    $linkWrapper.addClass('disabled');
                } else {
                    $linkWrapper.addClass('active');
                }
                $link = $('<span class="current">' + (options.text) + '</span>');
            } else {
                $link = $('<a href="' + o.hrefTextPrefix + (pageIndex + 1) + o.hrefTextSuffix + '" class="page-link">' + (options.text) + '</a>');
                $link.click(function(event) {
                    return methods._selectPage.call(self, pageIndex, event);
                });
            }

            if (options.classes) {
                $link.addClass(options.classes);
            }

            $linkWrapper.append($link);

            if ($ul.length) {
                $ul.append($linkWrapper);
            } else {
                self.append($linkWrapper);
            }
        },

        _selectPage: function(pageIndex, event) {
            var o = this.data('pagination');
            o.currentPage = pageIndex;
            if (o.selectOnClick) {
                methods._draw.call(this);
            }
            return o.onPageClick(pageIndex + 1, event);
        }

    };

    $.fn.pagination = function(method) {

        // Method calling logic
        if (methods[method] && method.charAt(0) != '_') {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.pagination');
        }

    };

})(jQuery);
