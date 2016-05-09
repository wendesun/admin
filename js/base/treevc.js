/**
 * Created by jhyang on 2015/12/25.
 */
(function () {
    function init() {
        //之所以又调用的TVC的方法，而不是在页面出来时初始化是因为有这样的需求：页面出现时该html并不存在，
        //而是后来某种操作后新出现的html，这时候要手动调用TVC的方法绑定该事件
        TVC.bindInputLimitEvent();
        TVC.bindChangeTextareaLeftWords();
    }

    $(document).ready(function(){
        init();
    });

    window['TVC'] = {
        debug: true,
        ajax_loading: {},
        getDate: function (format) {
            var myDate = new Date();
            var Y = myDate.getFullYear();
            var m = myDate.getMonth() + 1;
            m = (m < 10) ? "0" + m : m;
            var d = myDate.getDate();        //获取当前日(1-31)
            d = (d < 10) ? "0" + d : d;
            var H = myDate.getHours();       //获取当前小时数(0-23)
            H = (H < 10) ? "0" + H : H;
            var i = myDate.getMinutes();     //获取当前分钟数(0-59)
            i = (i < 10) ? "0" + i : i;
            var s = myDate.getSeconds();
            s = (s < 10) ? "0" + s : s;

            var string = format;
            string = string.replace(/Y/, Y);
            string = string.replace(/m/, m);
            string = string.replace(/d/, d);
            string = string.replace(/H/, H);
            string = string.replace(/i/, i);
            string = string.replace(/s/, s);
            return string;
        },

        showLoading: function (msg, delayhiding){
            msg = msg || "";
            delayhiding = delayhiding || 0;
            if ($("#_tmp_pop_loading").length === 0) {
                var html = '<div class="loading" id="_tmp_pop_loading" style="z-index:100000;"><div class="center-box well"><b class="center-hack"></b><div class="center-body"><img src="/images/line_loading.gif" />&nbsp;'+msg+'</div></div></div>';
                $(html).appendTo("#right");
            }
            $("#_tmp_pop_loading").find(".color-white").html(msg);
            $("#_tmp_pop_loading").show();
            if (delayhiding) {
                TVC.hideLoading(delayhiding);
            }
        },
        moreInfoTip:function(parentid,targetid){
            if(!!$(parentid)[0]){
                $(parentid).on("mouseover mousemove",targetid, function (e){
                    var defaultTop=defaultTop || 25;
                    var e = event || window.event || arguments.callee.caller.arguments[0];
                    var left=e.pageX;
                    var top=e.pageY;
                    var winWidth=$(window).width();
                    var winHeight=$(window).height();
                    var divWidth=parseInt($(this).next("div").outerWidth());
                    var divHeight=parseInt($(this).next("div").outerHeight());
                    if((winHeight - top) >=  divHeight){
                        $(this).next("div").find("div.tipBox").removeClass("arrows-bottom").addClass("arrows-top");
                        $(this).next("div").css({
                            "top": (top+defaultTop)+"px",
                            "left":(left-divWidth/2)+"px"
                        }).removeClass("hide");
                    }else{
                        $(this).next("div").find("div.tipBox").removeClass("arrows-top").addClass("arrows-bottom");
                        $(this).next("div").css({
                            "top": (top-defaultTop-divHeight)+"px",
                            "left":(left-divWidth/2)+"px"
                        }).removeClass("hide");
                    }
                }).on("mouseout", targetid,function (){
                    $(this).next("div").addClass("hide");
                });
            }
            else{
                $(targetid).on("mouseover mousemove", function (e){
                    var defaultTop=defaultTop || 25;
                    var e = event || window.event || arguments.callee.caller.arguments[0];
                    var left=e.pageX;
                    var top=e.pageY;
                    var winWidth=$(window).width();
                    var winHeight=$(window).height();
                    var divWidth=parseInt($(this).next("div").outerWidth());
                    var divHeight=parseInt($(this).next("div").outerHeight());
                    if((winHeight - top) >=  divHeight){
                        $(this).next("div").find("div.tipBox").removeClass("arrows-bottom").addClass("arrows-top");
                        $(this).next("div").css({
                            "top": (top+defaultTop)+"px",
                            "left":(left-divWidth/2)+"px"
                        }).removeClass("hide");
                    }else{
                        $(this).next("div").find("div.tipBox").removeClass("arrows-top").addClass("arrows-bottom");
                        $(this).next("div").css({
                            "top": (top-defaultTop-divHeight)+"px",
                            "left":(left-divWidth/2)+"px"
                        }).removeClass("hide");
                    }
                }).on("mouseout",function (){
                    $(this).next("div").addClass("hide");
                });
            }
        },

        hideLoading: function (delay) {
            delay = delay || 0;
            if (delay > 0) {
                setTimeout(function () {
                    $("#_tmp_pop_loading").remove();
                }, delay);
            } else {
                $("#_tmp_pop_loading").remove();
            }
        },
        showTip: function (msg, time, autohide, callback) {
            time = time || 1500;
            autohide = ("undefined" === typeof autohide) ? true : autohide;
            if ($("#_tmp_pop_message").length > 0) {
                $("#_tmp_pop_message").remove();
            }
            var html = '<div id="_tmp_pop_message" style="position:fixed;top:48%; text-align:center; background:rgba(0,0,0,.7); line-height:25px; color:#fff; padding:8px;z-index:10002;-webkit-border-radius:6px; min-width: 100px;">' + msg + '</div>';
            //$(html).appendTo("body").fadeOut(time);
            $(html).appendTo("body");
            var width=$("#_tmp_pop_message").width();
            var left = (document.documentElement.clientWidth- width)/ 2 + 'px';
            $("#_tmp_pop_message").css({"left":left}).show();
            if (autohide) {
                setTimeout(function () {
                    $("#_tmp_pop_message").remove();
                    callback && callback();
                }, time);
            }
        },
        showPopup: function(title) {
            var popup = '<div id="_popup_dialog_box" class="add-alter-user center-box well "><b class="center-hack"></b><div class="center-body"><div class="fb_Box"><div class="fb_header"><span>'+title+
                '</span><img src="/images/close2.png" width="30" height="30" alt="" name="popup_cancel" class="close"/></div><div class="fb_main" id="popup_content"><img src="/images/line_loading.gif" alt="" class="loadImg"/></div></div></div></div>';
            $(popup).appendTo("body").show();

            $("#_popup_dialog_box [name=popup_cancel]").click(function(){
                $("#_popup_dialog_box").remove();
            });
        },

        showMask: function () {
            $('#notice').click(function () {
                $('.bg-wrapper').fadeIn(1000);
            });
            $('.bg-wrapper').click(function () {
                $(this).fadeOut(1000);

            });

        },

        hideTip: function () {
            $("#_tmp_pop_message").remove();
        },

        alert: function (msg, callback) {
            if ($("#_tmp_alert_message").length > 0) {
                $("#_tmp_alert_message").remove();
            }
            var left = document.documentElement.clientWidth / 2 - 100 + 'px';
            var html = '<div id="_tmp_alert_message" class="floatBox"><div class="fb_bg"></div><div class="fb_Box"><div class="fb_header">提示</div><div class="fb_content">' + msg + '</div><div class="fb_footer"><input type="submit" name="yes" class="btn-green" value="确定" /></div></div></div>';
            $(html).css('left', left).appendTo("body").show();

            $("#_tmp_alert_message input[name=yes]").click(function(){
                $("#_tmp_alert_message").remove();
                callback && callback();
            });
        },

        confirm: function (msg, yes, no) {
            if ($("#_tmp_confirm_message").length > 0) {
                $("#_tmp_congirm_message").remove();
            }
            var left = document.documentElement.clientWidth / 2 - 100 + 'px';
            var html = '<div id="_tmp_confirm_message" class="floatBox"><div class="fb_bg"></div><div class="fb_Box"><div class="fb_header">提示</div><div id="fb_content" class="fb_content">' + msg + '</div><div class="fb_footer"><input type="submit" name="yes" class="btn-green" value="确定" id="pager" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="submit" name="no" class="btn-grey" value="取消" /></div></div></div>';
            $(html).css('left', left).appendTo("body").show();
            $("#_tmp_confirm_message input[name=yes]").click(function(){
                $("#_tmp_confirm_message").remove();
                yes && yes();
            });
            $("#_tmp_confirm_message input[name=no]").click(function(){
                $("#_tmp_confirm_message").remove();
                no && no();
            });
        },

        bindKeyboardEvent: function(callback) {
            if (!callback) {
                return;
            }
            document.onkeydown=function(event){
                var e = event || window.event || arguments.callee.caller.arguments[0];
                if(e && e.keyCode==13){
                    callback();
                }
            };
        },

        bindChangeTextareaLeftWords: function() {
            $("textarea[change-left-words]").on("keyup input change",function(){
                changeLeftWords($(this));
            });

            $("textarea[change-left-words]").each(function(){
                changeLeftWords($(this));
            });

            function changeLeftWords($textarea) {
                var $wordsContainer = $textarea.next("div").find("span[max-words]");
                var len = parseInt($textarea.val().length);
                TVC.changeTextareaLeftWords($wordsContainer, len);
            }
        },

        /**************改变textarea框中剩余字符数:
         *******$wordsContainer剩余字数容器的jquery对象,len已有字数*************************/
        changeTextareaLeftWords: function($wordsContainer, len) {
            var max = parseInt($wordsContainer.attr("max-words"));
            var leftWords = max - len;
            $wordsContainer.text(leftWords);
            var color = (leftWords < 0) ? "color-red" : "color-green";
            $wordsContainer.removeClass("color-red color-green");
            $wordsContainer.addClass(color);
        },

        bindInputLimitEvent: function() {
            //限制输入数字
            $("input[onlyNumber]").on("input", function () {
                var val = $(this).val();
                if (!(/^[0-9]*$/.test(val))) {
                    var len = $(this).val().length;
                    $(this).val($(this).val().substr(0, len - 1));
                }
                $(this).val($(this).val().replace(/[^\d]/g, ""));
            });

            //限制输入正整数
            $("input[onlyPositiveInt]").on("input", function () {
                var val = $(this).val();
                if (!(/^[1-9][0-9]*$/.test(val))) {
                    var len = $(this).val().length;
                    $(this).val($(this).val().substr(0, len - 1));
                }
                $(this).val($(this).val().replace(/[^0-9]/g, ""));
            });

            //限制输入金额
            $("input[onlyMoney]").on("input", function () {
                var val = $(this).val();
                if (!(/^[0-9]*\.?[0-9]{0,2}$/.test(val))) {
                    var len = $(this).val().length;
                    $(this).val($(this).val().substr(0, len - 1));
                }
                $(this).val($(this).val().replace(/[^\d\.]/g, ""));
            });
        },

        showLoginDialog: function() {
            TVC.hideLoading();
            var dialog = '<div id="_tmp_login_dialog" style=" position: fixed; top: 0; left: 0; bottom: 0; right: 0; background: rgba(0,0,0,.5); z-index: 9999;" class="hide "><div class="center-box well"><b class="center-hack"></b><div class="center-body"><div class="login2_container"><div class="login_title"><span>登录</span><img src="/images/close2.png" width="30" height="30" alt="" name="login_cancel" class="close2"/>'+
                '</div><div class="login2" ><div class="login_div" ><img src="/images/login_03.jpg" class="img_position"><input name="login_name" required required-msg="请输入用户名" data-error="login_error_box" type="text" class="login_input" placeholder="用户名" autocomplete="off"></div><div class="login_div"><img src="/images/login_05.jpg" class="img_position">'+
                '<input name="login_password" required required-msg="请输入密码" data-error="login_error_box" type="password" class="login_input" placeholder="密码" autocomplete="off"></div><div><input name="login_captcha" required required-msg="请输入验证码" data-error="login_error_box" type="text" class="login_input login_yzm" placeholder="验证码"><img name="img" src="/captcha/image" width="80" height="34" title="点击刷新验证码" class="pointer">'+
                '</div><div class="login_error"><div data-name="login_error_box" class=""></div></div><div><input name="login_submit" type="button" value="登&nbsp;&nbsp;录" class="login_button"></div><div class="wjmm"><a href="/admin/find_password" class="" target="_blank">忘记密码？</a></div></div></div></div></div></div>';
            $(dialog).appendTo("body").show();
            $("#_tmp_login_dialog [name=img]").click(function () {
                $(this).attr('src', "/captcha/image?_t=" + Math.random());
            });
            $("#_tmp_login_dialog [name=login_cancel]").click(function(){
                $("#_tmp_login_dialog").remove();
            });
            $("#_tmp_login_dialog [name=login_submit]").click(function(){
                doSubmit();
            });
            TVC.bindKeyboardEvent(doSubmit);

            function doSubmit() {
                $("#_tmp_login_dialog [data-name=login_error_box]").hide();
                if (!TVC.Validator.validateForm()) {
                    return;
                }
                var name = $("#_tmp_login_dialog input[name=login_name]").val();
                var password = $("#_tmp_login_dialog input[name=login_password]").val();
                var captcha = $("#_tmp_login_dialog input[name=login_captcha]").val();
                var data = {name: name, password: password, captcha: captcha};
                TVC.showLoading();
                TVC.postJson('/admin/login', data, loginSuccess, function(result){
                    TVC.hideLoading();
                    if (result.message == '-1') {
                        result.message = '用户名或密码错误，请检查';
                        $("#_tmp_login_dialog input[name=login_password]").val("");
                    }
                    $("#_tmp_login_dialog [data-name=login_error_box]").text(result.message).show();
                    $("#_tmp_login_dialog input[name=login_captcha]").val("");
                    $("#_tmp_login_dialog [name=img]").attr('src', "/captcha/image?_t=" + Math.random());
                });

                function loginSuccess(result) {
                    TVC.hideLoading();
                    $("#_tmp_login_dialog").remove();
                }
            }
        },

        redirect: function (url) {
            window.location.href = url;
        },

        reload: function () {
            window.location.reload();
        },

        ajax: function (url, data, type, dataType, success) {
            if (TVC.ajax_loading[url]) {
                return true;
            }

            TVC.ajax_loading[url] = true;

            var timeout = 10000;
            setTimeout(function () {
                TVC.ajax_loading[url] = false;
            }, timeout);

            $.ajax({
                "url": url,
                "data": data,
                "dateType": dataType,
                "type": type,
                "cache":false,
                "timeout":timeout,
                "success": function (rqData) {
                    TVC.ajax_loading[url] = false;
                    success && success(rqData);
                },
                "error": function () {
                    TVC.ajax_loading[url] = false;
                    TVC.hideLoading();
                    alert("网络异常");
                }
            });
        },

        getText: function (url, data, success) {
            TVC.ajax(url, data, "GET", "text", function(rqData){
                TVC.hideLoading();
                if (rqData.message && rqData.message === "login") {
                    TVC.showLoginDialog();
                }else {
                    success && success(rqData);
                }
            });
        },

        getJson: function (url, data, success, fail) {
            TVC.ajax(url, data, "GET", "json", function (rqData) {
                TVC.hideLoading();
                if (rqData.message === "success") {
                    success && success(rqData.data);
                } else if (rqData.message === "login"){
                    TVC.showLoginDialog();
                } else {
                    fail && fail(rqData.message);
                }
            });
        },

        postJson: function (url, data, success, fail) {
            TVC.ajax(url, data, "POST", "json", function (rqData) {
                TVC.hideLoading();
                if (rqData.message === "success") {
                    success && success(rqData.data);
                } else if (rqData.message === "login"){
                    TVC.showLoginDialog();
                } else {
                    fail && fail(rqData);
                }
            });
        },

        truncate: function (string, length, etc) {
            string = "" + string;
            etc = etc || "...";
            if (string.length > length) {
                return string.substr(0, length) + etc;
            } else {
                return string;
            }
        },

        setCookie: function (cName, cValue, cAge) {
            cAge = cAge || 60 * 60 * 24 * 365;
            cValue = encodeURI(cValue);
            document.cookie = cName + "=" + cValue +
                "; max-age=" + cAge +
                "; path=/";
        },

        getCookie: function (cName) {
            var cValue = "";
            var allCookie = document.cookie;
            var pos = allCookie.indexOf(cName + "=");
            if (pos !== -1) {
                var start = pos + cName.length + 1;
                var end = allCookie.indexOf(";", start);
                if (end === -1)
                    end = allCookie.length;
                cValue = decodeURI(allCookie.substring(start, end));
            }
            return cValue;
        },

        setCloseWindowTip:function(showObject){
            $(window).unbind("beforeunload");
            $(window).bind("beforeunload", function(){
                if (showObject.isShow) {
                    return "";
                }
                return;
            });
        }
    };

    TVC.Form = {
        //获取元素值,传入元素名称，如<input name=phone>,获取该input的值，传入phone即可
        elementValue: function(elementName) {
            var $element = $("[name="+elementName+"]");
            var type = $element[0].type;
            if (type === "radio") {              //单选框
                return $.trim($("[name="+elementName+"]:checked").val());
            } else if (type === "select-one") {  //select框
                return $.trim($element.find("option:selected").val());
            } else if (type === "checkbox") {     //复选框
                var val = [];
                $element.each(function(){
                    if ($(this).is(":checked")){
                        val.push($(this).val());
                    }
                });
                return val.join(",");
            } else {
                return $.trim($element.val());
            }
        }
    };

    TVC.Validator = {
        isEmail: function (text) {
            return /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9_])+\.)+([a-zA-Z0-9]{2,4})+$/i.test(text);
        },

        isLnglat: function (lnglat) {
            return /^[1-9]\d+\.\d+$/.test(lnglat);
        },

        validateForm: function () {
            var isLegal = true;
            $("[required]").each(function(){
                var name = $(this).attr("name");
                var value = getValue($(this));
                if (value === "" || typeof(value) === "undefined") {
                    isLegal = false;
                    var errorName = $(this).attr("data-error") ? $(this).attr("data-error") : name;
                    var msg = $(this).attr("required-msg");
                    if (!$("div[data-name=" + errorName).is(":hidden")) {
                        return;
                    }
                    $("div[data-name=" + errorName).text(msg).show();
                }
            });

            $("[data-pattern]").each(function(){
                var name = $(this).attr("name");
                var errorName = $(this).attr("data-error") ? $(this).attr("data-error") : name;
                if (!$("div[data-name=" + errorName).is(":hidden")) {
                    return;
                }

                var pattern = eval($(this).attr("data-pattern"));
                var value = getValue($(this));
                if (!pattern.test(value)) {
                    isLegal = false;
                    var msg = $(this).attr("data-msg");
                    $("div[data-name=" + errorName).text(msg).show();
                }
            });

            function getValue(obj) {
                var type = obj[0].type;
                if (type === "radio") {              //单选框
                    return $.trim(obj.find("[checked]").val());
                } else if (type === "select-one") {  //select框
                    return $.trim(obj.find("option:selected").val());
                } else if (type === "checkbox") {     //复选框
                    var val = [];
                    obj.each(function(){
                        if ($(this).is(":checked")){
                            val.push($(this).val());
                        }
                    });
                    return val.join(",");
                } else {
                    return $.trim(obj.val());
                }
            }

            return isLegal;
        }
    };
}());
