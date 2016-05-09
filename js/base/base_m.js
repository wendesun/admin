$(function () {
    var AB = {
        debug:true,
        ajax_loading:{},
        log:function(msg){
            AB.debug && window.console.log(msg);
        },
        getCurrentDate:function(format){
            var myDate = new Date();   
            var Y = myDate.getFullYear();
            var m = myDate.getMonth() + 1;
            m = (m < 10) ? "0"+m : m;
            var d = myDate.getDate();        //获取当前日(1-31)  
            d = (d < 10) ? "0"+d : d;
            var H = myDate.getHours();       //获取当前小时数(0-23) 
			H = (H<10) ? "0"+H : H;
            var i = myDate.getMinutes();     //获取当前分钟数(0-59) 
            i = (i<10) ? "0"+i : i;
            var s = myDate.getSeconds();  
            s = (s<10) ? "0"+s : s;
            
            var string = format;
            string = string.replace(/Y/,Y);   
            string = string.replace(/m/,m);
            string = string.replace(/d/,d);
            string = string.replace(/H/,H);
            string = string.replace(/i/,i);
            string = string.replace(/s/,s);
            return string;
        },
        showTip:function(msg,time, autohide, callback){
            time = time || 2000;
            autohide = ("undefined" === typeof autohide) ? true : autohide;
            if ($("#_tmp_pop_message").length > 0) {
                $("#_tmp_pop_message").remove();
            }

            var left=document.documentElement.clientWidth/2-100+'px';
            var html ='<div id="_tmp_pop_message" style="width:200px;position:fixed;left:20%;top:20%; z-index:9999;background:#589ac1;"><div style=" position:relative; height:100%; "><div style=" position:absolute; padding:10px; width:180px;top:0; left:0; z-index:99; background:#000; opacity:0.7; border:1px solid #000;border-radius:6px;-webkit-border-radius:6px; " content="">'+msg+'</div><div style=" padding:10px; position:absolute; width:180px;color:#fff; font-size:14px;z-index:999; text-align:center;">'+msg+'</div></div></div>';  
            //$(html).appendTo("body").fadeOut(time);
            //$(html).css('left',left).appendTo("body").show();
			$(html).appendTo("body").show();
            if (autohide){
                setTimeout(function () {
                    $("#_tmp_pop_message").remove();
                    callback && callback();
                }, time);
            }
        },
        hideTip:function(){
            $("#_tmp_pop_message").remove();
        },
        redirect:function(url){
            window.location.href = url;
        },
		trBg:function(){
			//table隔行变色
			 $(".table-list >tbody >tr").mouseover(function(){
				 $(this).addClass("trbg");
			 }).mouseout(function(){
				 $(this).removeClass("trbg");
			 })
		},
		loadHTML:function(url){
			//url = url || "../../error.html";
			$("#loading").show();
			$("#right").load(url,function(){
					$("#loading").hide();
					AB.trBg();
			});	
		},
        ajax:function(url,data,type, dataType, success,error){
            if (AB.ajax_loading[url]){
                return true;
            }
            
            AB.ajax_loading[url] = true;
            $.ajax({
                "url":url,
                "data":data,
                "dateType":dataType,
                "type":type,
                "success":function(rqData){
                    AB.ajax_loading[url] = false;
                    success && success(rqData);
                },
                "error":function(){
                    AB.ajax_loading[url] = false;
                    error && error();
                }
            });
        },
        getText:function(url,data,success,error){
            AB.ajax(url,data,"GET","text", success,error);
        },
        getJson:function(url,data,success,error){
            AB.ajax(url,data,"GET","json", success,error);
        },
        postJson:function(url, data, success, error){
            AB.ajax(url,data,"POST","json", success,error);
        },
        truncate:function(string, length, etc){
            string = "" + string;
            etc = etc || "...";
            if (string.length > length){
                return string.substr(0, length) + etc;
            }else {
                return string;
            }
        },
        setCookie:function(cName, cValue, cAge){
            cAge = cAge || 60*60*24*365;
            cValue = encodeURI(cValue);
            document.cookie = cName + "=" + cValue + 
            "; max-age=" + cAge +
            "; path=/";
        },
        getCookie:function(cName){
            var cValue = "";
            var allCookie = document.cookie;
            var pos = allCookie.indexOf(cName+"=");
            if(pos !== -1) {
                var start = pos + cName.length + 1;
                var end = allCookie.indexOf(";", start);
                if(end === -1)	end = allCookie.length;
                cValue = decodeURI(allCookie.substring(start, end));
            }
            return cValue;
        },
        getRefer:function(){
            return window.top.document.referrer;
        },
        bindInputClearEvent: function (options) {
            options = options || {};
            $("input[required]").each(function () {
                var next = $(this).next();
                var input = $(this);
                if (next.hasClass("clear")) {
                    next.click(function () {
                        input.val("");
                        next.css("display", "none");
                        options.onClear && options.onClear($(this))
                    });

                    input.focus(function () {
                        if ($(this).val() !== "") {
                            next.css("display", "inline-block");
                        }

                        options.onFocus && options.onFocus($(this));
                    }).blur(function () {
                        setTimeout(function () {
                            next.css("display", "none");
                        }, 120);

                        options.onBlur && options.onBlur($(this));
                    }).bind("input propertychange keyup", function () {
                        if ($(this).val() !== "") {
                            next.css("display", "inline-block");
                        } else {
                            next.css("display", "none");
                        }

                        options.onChange && options.onChange($(this));
                    });
                }
            });
        },
        bindLoadMoreEvent:function(uri, data, callback){
            data = data || {};
            $("#loadMore").click(function(){
                $("#loadMore a").hide();
                $("#loadMore div").show();
                
                var start = $("#resultList").children("li").length;
                AB.getText(uri+"?start="+start, data, function (html) {
                    $("#resultList").append(html); 
                    callback && callback(html);
                    var last = $("#resultList").children("li:last");
                    if (last.hasClass("data-more")){
                        $("#loadMore a").show();
                        $("#loadMore div").hide();
                    }else{
                        $("#loadMore").hide();
                    }
                }, function () {
                    $("#loadMore a").show();
                    $("#loadMore div").hide();
                });
            });
        },
        checkOrder:function(orderNumber, tryTime, callback){
            AB.showTip("支付成功，正在跳转...", 5000, false);
            tryTime = tryTime || 5; // 重试5次
            // 检测订单状态
            AB.getJson("/weixin/my/order/check", {"order_number":orderNumber}, function(rqData){
                tryTime--;
                if (rqData.message === 'success' && rqData.data.status == 1){
                    callback && callback(orderNumber);
                }else if (tryTime > 0) {
                    setTimeout(function () {
                        AB.checkOrder(orderNumber, tryTime, callback);
                    }, 1000);
                }
            },function(){
                tryTime--;
                setTimeout(function () {
                    AB.checkOrder(orderNumber, tryTime, callback);
                }, 1000);
            });
        },
        isWeixin:function(){
            var ua = navigator.userAgent.toLowerCase();
            return /micromessenger/.test(ua);
        },
        isIphone:function(){
            var ua = navigator.userAgent.toLowerCase();
            return /iphone/.test(ua);
        },
        isAndroid:function(){
            var ua = navigator.userAgent.toLowerCase();
            return /android/.test(ua);
        },
		clickShow:function(id1,id2){
			$(id1).click(function(){
				$(id2).removeClass("hide").addClass("show");
			});	
		},
		clickHide:function(id1,id2){
			$(id1).click(function(){
				$(id2).removeClass("show").addClass("hide");
			
			});	
		}
    };
/************AB结束**************/


/************AB.Order开始**************/
    AB.Order = {};
    AB.Order.Ticket = {
        clear:function(){
            this.setBusid("",1);
            this.setUp("",1);
            this.setDown("",1);
            this.setFreeType(0,1);
            this.setDiscountNumber("",1);
            this.setCardCount(0,1);
            this.setCardNumber("",1);
        },
        getBusCount:function(){
            var busid = AB.getCookie("o.ticket.busid");
            if (busid === ""){
                return 0;
            }
            return busid.split(",").length;
        },
        getBusid:function(){
            return AB.getCookie("o.ticket.busid");
        },
        setBusid:function(cValue,cAge){
            AB.setCookie("o.ticket.busid", cValue,cAge);
        },
        getUp:function(){
            return AB.getCookie("o.ticket.up");
        },
        setUp:function(cValue,cAge){
            AB.setCookie("o.ticket.up", cValue,cAge);
        },
        getDown:function(){
            return AB.getCookie("o.ticket.down");
        },
        setDown:function(cValue,cAge){
            AB.setCookie("o.ticket.down", cValue,cAge);
        },
        getFreeType:function(){
            return AB.getCookie("o.ticket.freetype");
        },
        setFreeType:function(cValue,cAge){
            AB.setCookie("o.ticket.freetype", cValue,cAge);
        },
        getDiscountNumber:function(){
            return AB.getCookie("o.ticket.disnumber");
        },
        setDiscountNumber:function(cValue,cAge){
            AB.setCookie("o.ticket.disnumber", cValue,cAge);
        },
        getCardCount:function(){
            return AB.getCookie("o.ticket.cardcnt");
        },
        setCardCount:function(cValue,cAge){
            AB.setCookie("o.ticket.cardcnt", cValue,cAge);
        },
        getCardNumber:function(){
            return AB.getCookie("o.ticket.cards");
        },
        setCardNumber:function(cValue,cAge){
            AB.setCookie("o.ticket.cards", cValue,cAge);
        }
    };
    
    AB.Order.Card = {
        setBackup:function(backurl){
            AB.setCookie("o.card.backup", backurl);
        },
        getBackup:function(){
            return AB.getCookie("o.card.backup");
        }
    };
/************AB.Order结束**************/
	
    //通用表单验证
    AB.Validater = {
		isNull:function(text){
			return  /^\S$/.test(text);
		},
		isIntegerNumber:function(text){//正整数
			//var text=parseInt(text);
			return /^[0-9]*$/.test(text);
		},
		isArithmeticNumber:function(text){//正实数
			//var text=parseInt(text);
			return /^[0-9]+(.[0-9]{2})?$/.test(text);
		},
        isPhoneNumber:function(text){
			return /^1[3-9][0-9]{9}$/.test(text);
        },
        isSmsCaptcha:function(text){
            return /^[0-9]{4}$/.test(text);
        },
		compare:function(start,end){
			if(start > end){
				return false;
			}
		},
		limitWord:function(){
		  $("textarea").each(function(){
				$(this).bind('propertychange focus keyup input paste',function(){
					var maxLength=parseInt($(this).attr("maxlength")); 
					var curLength=$(this).val().length;	
					if(curLength > maxLength){
						var num=$(this).val().substr(0,curLength);
						$("#xlms").val(num);
						alert("超过字数限制，多出的字将被截断！" );
					}
					else{
						$(this).next(".textCount").text( curLength+"/"+maxLength)
					}
				}); 
			});	
		},
		resetForm:function(id){
			 $("#reset").click(function(){
			   var allInput=$(id).find("input:not(':submit,:reset'),textarea");
				for( var i=0; i<allInput.length; i++){
					allInput.val("");
				}
			 });
		},
		
		formList:function(id){
		  $(id).submit(function(){
		   //所有的input、select类型
		    var allInput=$(this).find("input:not(':submit,:reset,:button'),select");
			for( var i=0; i<allInput.length; i++){

				//var method=$(allInput[i]).next("input[type='hidden']");
				var inputId=$(allInput[i]).attr("name");
				var text=$(allInput[i]).val();
				var method=$(allInput[i]).attr("data-method");
				var tip=$(allInput[i]).attr("data-tip");
				
					
				if( "undefined" !== typeof method && "undefined" !== typeof tip && method !=="" && tip !==""){
					var methodList=method.split("-");
					for(var n=0; n< methodList.length; n++){
						if(methodList[n]=="isNull"){
							if(text == ""){
								AB.showTip(tip+"不能为空");
								return false;
							}
						}	
						
					}
				}
				
				if("undefined" !== typeof method && "undefined" !== typeof tip && method !=="" && tip !=="" && text !==""){
						var methodList=method.split("-");
						for(var j=0; j< methodList.length; j++){
						if(methodList[j]=="isPhoneNumber"){
								if(!AB.Validater.isPhoneNumber(text)){
									AB.showTip(tip+"格式不正确");
									return false;
								}
						}
						if(methodList[j]=="isIntegerNumber"){
							if(!AB.Validater.isIntegerNumber(text)){
								AB.showTip(tip+"必须是正整数");
								return false;
							}
						}
						if(methodList[j]=="isArithmeticNumber"){
							if(!AB.Validater.isArithmeticNumber(text)){
								AB.showTip(tip+"只能是最多带两位小数的数字");
								return false;
							}
						}
						
						//数值大小比较
						if(methodList[j]=="compare"){	
							if(inputId.indexOf("End")>0){
								var end=inputId.substring(0,inputId.indexOf("End"));
								var endValue=parseInt($("input[name='"+inputId+"']").val());
								
								for(var k=0; k<allInput.length; k++ ){
									if(k==i)continue;
									var startID=$(allInput[k]).attr("name");
									var start=startID.substring(0,startID.indexOf("Start"));
									var startValue=parseInt($("input[name='"+startID+"']").val());
									if(start==end && startValue !=="" && endValue !==""){
										if(startValue > endValue){
											AB.showTip(tip+"必须大于等于起始值");
											return false;
										}
									}	 
								}
							}
						}
   
					}
				}	
			};
			//AB.showTip("提交成功！");
			//return true;
		 })
		}		
    };
	//通用confirm提示
    AB.confirmModal={
		createConfirm:function(id,msg,url){
			
		$("#mylist").on('click',id,function(){	
		var method=$(id).attr("data-method");
		var modal=$(id).attr("data-modal") || "modal2";
		
		if( "undefined" !== typeof method  && method !==""){
			var deleteTip='<div class="confirm-container"><p class="confirm-header"><a href="#" title="Close" id="close" class="modal-close simplemodal-close float-right confirm-close">x</a>Confirm</p><p class="confirm-msg">'+msg+'</p></div>';
			var editTip='<div class="confirm-container"><p class="confirm-header"><a href="#" title="Close" id="close" class="modal-close simplemodal-close float-right confirm-close">x</a>Confirm</p><p class="confirm-msg">'+msg+'</p><p class="confirm-footer" ><input type="buttom" id="yes" class="confirm-buttom" value="YES" />&nbsp;&nbsp;<input  id="no" class="confirm-buttom" type="buttom" value="NO" /></p></div>';
			var formTip='<div class="confirm-container"><p class="confirm-header"><a href="#" title="Close" id="close" class="modal-close simplemodal-close float-right confirm-close">x</a>Confirm</p><p class="confirm-msg">'+msg+'</p><p class="confirm-footer" ><input type="submit" id="yes" class="confirm-buttom" value="YES" />&nbsp;&nbsp;<input  id="no" class="confirm-buttom" type="buttom" value="NO" /></p></div>';
			
			var methodList=method.split("-");
			for(var n=0; n< methodList.length; n++){
				if(methodList[n]=="confirmTip" && $(".confirm-container").length==0){
					if($.trim(modal)=="editTip"){$(editTip).appendTo("body").show();AB.confirmModal.yes(url);};
					if($.trim(modal)=="deleteTip"){$(deleteTip).appendTo("body").show();AB.confirmModal.yes(url);};
					if($.trim(modal)=="formTip"){$(formTip).appendTo("body").show();AB.confirmModal.form(myForm);};	
				}
			}
			AB.confirmModal.no();
		}
		});
		},
		form:function(myForm){
			$("#yes").click(function(){
				document.myForm.submit();
				//$(".confirm-container").remove();
			});
		},
		yes:function(url){
			$("#yes").click(function(){
				document.location.href = url;
				//$(".confirm-container").remove();
			});
		},
		no:function(){
			$("#close,#no").click(function(){
				$(".confirm-container").remove();
			});
		}

	};


    window['AB'] = AB;
});