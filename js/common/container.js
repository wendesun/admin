// JavaScript Document
(function($){
	var Win={
		init:function(){

			this.setLoadHeight();
			this.resizeHeight();
			this.showHideLeft();
			this.leftMenu();
			//this.clickMenu();
			this.firstMenu();

		},
		//在刷新及页面加载较慢(比如图片较多,获取的right高度可能不包括图片的高度，用load可以在页面加载完毕后获取准确的高度)
		setLoadHeight:function(){

			window.onload=function(){
				//Win.setHeight();
				Win.setPageWidth();
			}
		},
		//监听浏览器窗口大小发生改变自适应大小
		resizeHeight:function(){
			$(window).resize(function(){
				//Win.setHeight();
				Win.setPageWidth();
			});	
		},
		setHeight:function(){
			var headerHeight=$("#header").outerHeight(true);
			var bodyHeight=$(window).height();
			$("#left, .left_container").css("height",bodyHeight-headerHeight);
			$("#right").css("height",bodyHeight-headerHeight);
		},
		//列表分页固定底部显示
		setPageWidth:function() {
			var left= $("#left").outerWidth()+14;
			var right= 26;
			var h1=$("#right > div").outerHeight()+41;
			var h2=$('#right')[0].clientHeight;
			if(h1 > h2){
				$("#foot_box").css( {"position":"fixed","bottom":"0px","left":left});
				var scrollbarWidth = $('#right')[0].offsetWidth - $('#right')[0].clientWidth;
				right=right+scrollbarWidth;
				$("#foot_box").css( {"right":right});
			}else{
				$("#foot_box").removeAttr("style");
			}


		},
		//影藏和展示左侧菜单按钮
		showHideLeft:function(){
			$(".leftMenuBtnHide").click(function(){
				$(".leftMenuBtnHide,.leftMenuBtnShow").toggleClass("hide show");
				$("#left").stop().animate({width:"0px"},300,function(){
					Win.setPageWidth();
				});
				$("#middle").stop().animate({left:"0px"},300);
				$("#right").stop().animate({left:"0px"},300);


			});
			$(".leftMenuBtnShow").click(function(){
				$(".leftMenuBtnHide,.leftMenuBtnShow").toggleClass("hide show");
				$("#left").stop().animate({width:"150px"},300,function(){
					Win.setPageWidth();
				});
				$("#middle").stop().animate({left:"150px"},300);
				$("#right").stop().animate({left:"150px"},300);

			});
		},
		leftMenu:function(){
			//自己写的左侧导航菜单
			$("body").on("click",".subNav",function(){
				$(this).find("b").toggleClass("arrow-right arrow-bottom");
				//$(this).siblings(".subNav").find("b").removeClass("arrow-bottom").addClass("arrow-right");
				// 修改数字控制速度， slideUp(500)控制卷起速度
				//$(this).next(".navContent").slideToggle(500).siblings(".navContent").slideUp(500);
				$(this).next(".navContent").slideToggle(500);
			})
		},
		clickMenu:function(){
			$("body").on("click","a[data-url]",function(){
				if( $(this).attr("data-url") !== "undefined"){
					var url= $(this).attr("data-url");
					//alert(url);
					TVC.loadHTML(url);//调用base_m.js中的方法
				}

			});
		},
		//一级导航切换
		firstMenu:function(url){
			$("body").on("click","a[data-menu]",function(){
				if( $(this).attr("data-menu") !== "undefined"){
					var url= $(this).attr("data-menu");
					//alert(url);
					$(this).toggleClass("selected").siblings().removeClass("selected");

					$("#left").load(url,function(){
						TVC.showTip("正在加载中。。。");
					});
				}

			});
		}
	}

	$.Win=Win;
	$.Win.init();
})($);





