/**
 * Created by jhyang on 2015/12/2.
 * 统一列表页操作
 */

function bind_list_table_operate() {
    listTable.bindListTableOperate();
}

$(function() {
    var _query = {};
    var _operateName = "";

    function init() {
        bindRefreshEvent();
        bindSortListByField();
        bindEditContent();
        bindSearchEvent();
        bindPagingEvent();
        bindFilterList();
        bindKeyboardEvent();
        bindPopup();
        bindRecentDays();
    }

    /*******键盘事件（翻页和编辑字段拥有该响应）********/
    function bindKeyboardEvent() {
        TVC.bindKeyboardEvent(pressEnter);
        function pressEnter() {
            var current = $(":focus");
            var name = current.attr("name");
            if (name === "page_index") {       //跳转页面
                searchWithInputPage();
            }else if (name === "data_edit") {  //编辑列表字段
                current.blur();
                submitEditedContent(current.prev('span'), current);
            }
            return false;
        }
    }

    //（查询区）最近多少天功能（看下产品需求即了解该功能）
    function bindRecentDays() {
        $("[data-type=quick_date]").click(function(){
            if ($(this).hasClass("btn-white")) {
                $("input[data-time-start]").val('');
                $("input[data-time-end]").val('');
                $(this).removeClass("btn-white").addClass("btn-grey");
                return;
            }
            $(".btn-white").removeClass("btn-white").addClass("btn-grey");
            $(this).removeClass("btn-grey").addClass("btn-white");
            var date = new Date();
            var t = date.getTime();
            var day = ($(this).attr("data-value") - 1);
            var recent = day*24*60*60*1000;
            var num = t-recent;
            var recentdate = new Date(num);
            var mr = (recentdate.getMonth() < 9) ? "0" + (recentdate.getMonth()+1) : (recentdate.getMonth()+1);
            var dr = (recentdate.getDate() < 9) ? "0" + recentdate.getDate() : recentdate.getDate();
            var mn = (date.getMonth() < 9) ? "0" + (date.getMonth()+1) : (date.getMonth()+1);
            var dn = (date.getDate() < 9) ? "0" + date.getDate() : date.getDate();
            $("input[data-time-start]").val(recentdate.getFullYear()+'-'+mr+'-'+dr);
            $("input[data-time-end]").val(date.getFullYear()+'-'+mn+'-'+dn);
        });

        $("input[data-time-start],input[name=data-time-end]").on("input change",function(){
            $(".btn-white").removeClass("btn-white").addClass("btn-grey");
        })
    }

    /****列表刷新，刷新后进入列表首页*****/
    function bindRefreshEvent() {
        $("#refresh").click(function(){
            _query['p'] = 1;
            searchTableList();
        });
    }

    /****重置排序字段的排序规则*****/
    function setOderByRule(currentField, currentOderBy) {
        $('a[data-type="order_by"]').each(function() {
            //若为当前排序字段，则将该字段的排序规则置为反序（正->反，反->正）
            if($(this).attr('data-field') == currentField) {
                if(currentOderBy == 'asc') {
                    $(this).attr('data-order', 'desc');
                    setOrderFieldAscClass($(this));
                } else if (currentOderBy == 'desc') {
                    $(this).attr('data-order', 'asc');
                    setOrderFieldDescClass($(this));
                }
            }else {  //非当前字段将其排序规则置为默认顺序
                var defaultOrder = $(this).attr("default-order");
                $(this).attr('data-order', defaultOrder);
                setOrderFieldDefaultClass($(this));
            }
        });
    }

    /****点击字段排序，对列表按该字段规则进行排序****/
    function bindSortListByField() {
        $('a[data-type="order_by"]').on('click', function() {
            _query['sort'] = $(this).attr('data-field');  //排序字段名
            _query['order'] = $(this).attr('data-order'); //排序规则（order）
            _query['p'] = 1;                              //排序后进入列表首页

            searchTableList();
            setOderByRule(_query['sort'], _query['order']);
        });
    }

    /****更新列表操作（查询，刷新，翻页，排序后自动刷新，筛选后自动刷新）****/
    function searchTableList() {
        var searchUrl = $("#zink_search").attr("search-url");
        var url = searchUrl ? searchUrl : location.pathname;  //查询的url
        clearTableList();             //清空列表
        TVC.showLoading();
        TVC.getText(url, _query, refreshTableList);
    }

    /****对列表可编辑字段修改操作（点击钢笔图标）**********/
    function bindEditContent() {
        $('span[data-type="edit"]').unbind("click").bind('click', function() {
            $(this).children("img").removeClass("editImg").addClass("editImg2"); //隐藏铅笔图标
            var dom = $(this).prev('span');            //铅笔图标前的可编辑字段jquery对象
            var val = dom.text();                      //可编辑字段值
            //隐藏可编辑字段的span，显示输入框
            $('<input type="text" name="data_edit" class="lt_input_text" />').on('blur',function(){
                submitEditedContent(dom, $(this));
            }).insertAfter(dom).val(val).focus();
            $(dom).hide();
            return false;
        });
    }

    /***保存对可编辑字段的修改操作（回车或输入框失去焦点时调用）*****
     *$span为可编辑字段的span jquery对象，$input为输入框的jquery对象**/
    function submitEditedContent($span, $input) {
        var val = $span.text(),                             //修改前的值
            field = $span.attr('data-field'),               //修改的当前字段名
            id = $span.attr('data-id'),                     //修改的记录id
            requiredError = $span.attr('required-error'),   //必填错误信息，存在则表明该字段为必填项
            rule = eval($span.attr('rule')),                //对新值验证的正则表达式
            errMsg = $span.attr('errMsg');                  //验证不通过时的错误信息

        var newVal = $.trim($input.val());                  //编辑后的新值
        if (requiredError && newVal === "") {               //验证是否是必填
            showEditError(requiredError);
        }else if (!rule.test(newVal)) {                     //验证是否通过正则验证
            showEditError(errMsg);
        }else if(newVal != val) {                           //新旧值不同时，向服务器保存新值
            var url = $("#edit_url").val();                 //保存的url
            TVC.showLoading();
            TVC.postJson(url,{id: id, field: field, val: newVal},function(rqData){
               TVC.hideLoading();
                $input.prev('span').show().text(newVal);
                $input.remove();
                $("#index_" + id).html($(rqData).html());
                bindOperateEvent();
            }, function(result){
                TVC.hideLoading();
                showEditError(result.message);
            });
        }else if (newVal == val) {                          //新旧值相等时，不需要保存
            $input.prev('span').show().text(val);
            $input.remove();
            // $span.next('span').children("img").css("visibility","visible");
            $span.next('span').children("img").removeClass("editImg2").addClass("editImg");
        }

        function showEditError(msg) {
            var len=$("#_tmp_alert_message").length;
            if(len<=0){
                TVC.alert(msg, function(){
                    //$input.val("").focus().val(newVal);
                    $input.focus();
                });
            }
        }
    }

    /*****根据筛选字段对列表进行筛选******/
    function bindFilterList() {
        //控制筛选字段下拉框的显示与隐藏
        $('a[data-type="show_down_list"]').unbind("click").bind('click', function(){
            var name=$(this).next().attr("data-field");
            var list=[];
            $('ul[data-field]').each(function(){
                list.push($(this).attr("data-field"));
            });
            var len=list.length;
            for(var i=0; i<len;i++){
                if(list[i] !=name ){
                  $("ul[data-field="+list[i]+"]").hide();
                }else{
                  $("ul[data-field="+name+"]").toggle();
                }
            }
        });

        //点击页面其他区域筛选下拉框隐藏
        $(document).unbind("click").bind('click', function(e){
            if($(e.target).closest($('a[data-type="show_down_list"]')).length == 0 ){
                $('ul[data-field]').hide();
            }
        });

        //选中某一筛选项
        $('li[data-type="filter_with"]').unbind("click").bind('click', function() {
            $(this).parent().find("li").each(function(){
                $(this).removeClass("li-bg");
            });
            $(this).addClass("li-bg");                       //该选项处于选中状态
            var field = $(this).parent().attr("data-field"); //筛选字段名
            _query[field] = $(this).attr("data-val");        //筛选值
            _query['p'] = 1;                                 //筛选后进入列表首页
            //列表table head中筛选字段后面的括号显示选中项：如状态（已审核）
            $(this).parent().parent().find("span[name=current_filter]").text($(this).text());
            //$("#current_filter").text($(this).text());
            $(this).parent().hide();                         //隐藏下拉框
            searchTableList();
        });
    }

    /************全选反选**********
    /*function bindCheckAllEvent() {
         $('.Z_checkall').on('click', function () {
            $('.Z_checkitem').attr('checked', this.checked);
            $('.Z_checkall').attr('checked', this.checked);
         });

         $(".Z_checkitem").click(function(){
            if ($('.Z_checkitem:checked').length == $('.Z_checkitem').length) {
                $('.Z_checkall').prop("checked", true);
            }else {
                $('.Z_checkall').prop("checked", false);
            }
        });
     }*/

    /**********批量操作***************
    function bindBatchAction() {
        $('input[data-type="batch_action"]').on('click', function() {
            var that = this;
            if($('.Z_checkitem:checked').length == 0){
                TVC.alert("请选择要操作的对象");
                return false;
            }
            var ids = [];
            $('.Z_checkitem:checked').each(function(){
                ids.push($(this).val());
            });
            var url = $(that).attr('data-uri') + '?id=' + ids.join(","),
                msg = $(that).attr('data-msg');        //批量操作前给用户的提示
            //title = ($(that).attr('data-title') != undefined) ? $(this).attr('data-title') : "默认";
            if (msg) {                                 //若有提示则弹框提示
                TVC.confirm(msg, doBatchAction);
            }else {
                doBatchAction();
            }

            function doBatchAction() {
                TVC.showLoading();
                TVC.postJson(url, {}, function(rqData){
                    searchTableList();                 //操作成功后刷新列表
                },function(result){TVC.alert(result.message);});
            }
        });
    }*/

    /****查询操作********/
    function bindSearchEvent() {
        //刚进入页面时默认去查询一次列表
        setQueryData();
        _query['p'] = 1;
        searchTableList();
        $("#zink_search").click(function(){    //点击查询按钮
            doSearch();
        });
    }

    //查询实际的操作
    function doSearch() {
        resetTableHead();
        setQueryData();
        searchTableList();
    }

    /*********将查询条件赋到_query对象上,供该页面全局使用***********/
    function setQueryData() {
        var queryArr = $("#search_form").length > 0 ? $("#search_form").serializeArray() : {};
        var query = {};
        for (var i = 0; i < queryArr.length; ++i) {
            query[queryArr[i]['name']] = queryArr[i]['value'];
        }
        _query = query;
    }

    /*********重置表头（排序字段、筛选字段）***********/
    function resetTableHead() {
        //筛选字段后面的括号显示默认的筛选项：如状态（全部）
        $("[name=current_filter]").text($("[name=current_filter]").attr("default"));
        $("[data-type=filter_with]").each(function(){ //移除所有筛选项的选中效果
            $(this).removeClass("li-bg");
        });
        $("[default-filter]").each(function(){        //给默认选中的筛选项添加选中效果
            $(this).addClass("li-bg");
        });
        //重置所有的排序字段的排序规则及排序图标
        $("a[data-type=order_by]").each(function(){
            setOrderFieldDefaultClass($(this));
            var defaultOrder = $(this).attr("default-order");
            $(this).attr('data-order', defaultOrder);
        });

        //对默认排序字段设置排序规则及排序图标
        $("a[data-default-field]").each(function(){
            if ($(this).attr("default-order") === "desc") {
                $(this).attr("data-order", "asc");
                setOrderFieldDescClass($(this));
            }else {
                $(this).attr("data-order", "desc");
                setOrderFieldAscClass($(this));
            }
        });

    }

    //使排序字段的排序图标置为灰色
    function setOrderFieldDefaultClass(obj) {
        obj.removeClass("sort_desc sort_asc sort_desc_grey");
        obj.addClass("sort_desc_grey");
    }

    //将排序字段排序图标置升序
    function setOrderFieldAscClass(obj) {
        obj.removeClass("sort_desc sort_asc sort_desc_grey");
        obj.addClass("sort_asc");
    }

    //将排序字段排序图标置降序
    function setOrderFieldDescClass(obj) {
        obj.removeClass("sort_desc sort_asc sort_desc_grey");
        obj.addClass("sort_desc");
    }

    /**********绑定列表中的操作*************/
    function bindOperateEvent() {
        bindEditContent();
        pageCallback();
        bindPopup();

        //列表操作栏中的操作
        $('a[data-type="operate"]').unbind("click").bind("click",function(){
            var id = $(this).attr("dataid"),               //操作的记录id
                name = $(this).attr("name"),               //操作名称，与服务器端controller中的action同名
                text = $(this).html(),                     //操作的中文名：如“发布”，用于操作成功或失败后的提示
                tip = $(this).attr("data-msg"),            //操作前给用户的提示
                redirectUrl = $(this).attr("redirect_url"), //重定向url
                searchUrl = location.pathname;
            _operateName = text;
            var url = searchUrl.replace(/list$/, name);   //实际操作的url
            if (tip) {                                     //若存在提示，则弹框显示
                TVC.confirm(tip,function(){
                    operateRecord();
                });
            }else {
                operateRecord();
            }

            function operateRecord() {
                if (redirectUrl) {                      //若存在重定向url则重定向到该url
                    window.open(redirectUrl);
                }else {
                    doOperateJob(url,id);
                }
            }
        });
    }

    /************列表操作栏中的操作**************
     *isForce：是否强制执行该操作****************/
    function doOperateJob(url, id, isForce) {
        var data = isForce ? {id: id,isForce: 1} : {id: id};
        TVC.showLoading();
        TVC.postJson(url, data, operateSuccess, operateFail);
        function operateSuccess(result) {
            //刷新当前操作行
            TVC.showTip(_operateName + "成功");
            $("#index_" + id).html($(result).html());   //替换原有列表中的该行数据
            bindOperateEvent();                         //重新绑定列表操作
        }

        function operateFail(result) {
            TVC.hideLoading();
            switch (result.message)
            {
                case "confirm" :                //是否强制进行此操作
                    TVC.confirm(result.data.tip,function(){
                        doOperateJob(url, id, true);
                    });
                    break;
                case "refresh" :                 //刷新整个列表
                    TVC.showTip(_operateName + "成功");
                    searchTableList();
                    break;
                case "delete" :                   //将当前操作记录删除
                    $("#index_" + id).remove();
                    break;
                case "add":                      //将新添加的记录插入到列表中
                    break;
                case "redirect":
                    if (result.data.self) {//在当前页面打开url
                        window.open(result.data.url, "_self");
                    }else {
                        window.open(result.data.url, "_blank");
                    }

                    break;
                case "alert":
                    TVC.alert(result.data.message, function(){
                        if (result.data.refresh) { //刷新页面
                            searchTableList();
                        }
                    });
                    break;
                default :
                    TVC.alert(result.message);
            }
        }
    }

    /****列表中的弹窗操作，此操作只负责拉取框内html片段，显示出完整弹窗，对于弹窗内的操作不负责**
     ****弹窗内的操作可通过将js写到返回的html后实现**********/
    function bindPopup() {
        $("[data-type=popup]").unbind("click").bind("click",function(){
            var title = $(this).attr("data-title"),         //弹窗的标题，如：添加备注
                url = $(this).attr("data-url"),             //获取弹窗内html片段的url
                id = $(this).attr("data-id"),               //操作的记录id
                category = $(this).attr("data-category");   //忘了，想起来再补
            var data = {id: id, popup: true, category: category};
            TVC.showPopup(title);                           //显示弹窗框架（只有框架，框内为空）
            TVC.postJson(url, data, function(rqData){
                $("#popup_content").html(rqData);            //将获取的框内html片段赋到框内
            },function(result){
                TVC.alert(result.message);
            });
        });
    }

    /************清空列表*************/
    function clearTableList() {
        $("table[name='table_list'] tbody").html("");
        $("#foot_box").html("").hide();
    }

    /************刷新列表**************/
    function refreshTableList(html) {
        TVC.hideLoading();
        var dom = $("<div>"+html+"</div>");

        //刷新主列表数据，即查询得到的一条条数据
        $("#table_list tbody").html(dom.find("#search_list").html());
        //刷新其他部分：如列表中的统计信息等
        dom.find("[name=other-part]").each(function(){
            var name = $(this).attr("data-name");   //通过data-name为选择器刷新对应的页面部分
            var html = $(this).html();
            $("[data-name="+name+"]").html(html);
        });
        //刷新页面foot部分，包括批量操作区和页码区
        $("#foot_box").html(dom.find("#page_html").html()).show();
        bindOperateEvent();
        bindPagingEvent();
        $.Win.setPageWidth();//调用container.js中的方法
    }

    /*****查询回调函数，查询后执行当前列表自己js中的search_success_callback()函数****
     *****页面js中需将该函数置为全局函数**********/
    function pageCallback() {
        if (window.search_success_callback) {
            search_success_callback();
        }
    }

    /********翻页操作********/
    function bindPagingEvent() {
        //查询对应页码的数据
        $("#pages a").click(function(){
            _query['p'] = $(this).attr("p");
            searchTableList();
        });
        //查询输入的页码的数据
        $("#zink_page_box input[name=page_index]").on("input", function () {
            var val = $(this).val();
            if (!(/^[1-9][0-9]*$/.test(val))) {       //只能输入数字
                var len = $(this).val().length;
                $(this).val($(this).val().substr(0, len - 1));
            }
            $(this).val($(this).val().replace(/[^\d]/g, ""));
        });

        $("#zink_page_box [name=confirm]").click(function () {
            searchWithInputPage()
        });
    }

    function searchWithInputPage() {
        var total = $("#zink_page_box [name=confirm]").attr("total_page"); //总页数
        var index = $("#zink_page_box input[name=page_index]").val();      //用户输入的页码
        if (index === "") {
            return;
        }
        if (parseInt(index) < 1) {
            index = 1;
        }
        if (parseInt(index) > total) {
            index = total;
        }
        _query['p'] = index;
        searchTableList();
    }

    var page = {
        bindListTableOperate: bindOperateEvent
    };
    window['listTable'] = page;
    init();
});
