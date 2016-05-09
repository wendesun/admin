$(function(){
    var Right={
        init:function(){
            this.setStar();
            this.getStar();
            this.showBigImg();
            this.modify();
            //this.textAreaHeigth();
            //this.details();
            this.moreList();
            this.dateScroll();
        },
        //textArea 自动高度
        textAreaHeigth:function(){
            $("body").on(" keyup","textarea",function(){
                var h=$(this).get(0).scrollHeight;
                if(h>80){
                    $(this).css("height","0px");
                    //var h1=$(this).height()+$(this).get(0).scrollHeight;
                    var h1=$(this).get(0).scrollHeight;
                    $(this).css("height",h1);
                }
            });
        },
        //点击缩略图弹出浮层显示大图
        showBigImg:function(){
            var index=0;
            var size=0;
            var arrImg=[];
            function showMoveImg(url){
                var url=url || "";
                var html='<div id="showBigImg" name="pop_window" class="add-alter-user center-box well "><b class="center-hack"></b><div class="center-body"><div class="mskelayBox"><div class="mske_html"><img class="img" src='+url+'/></div><img class="mskeClaose" src="/images/mke_close.png" width="27" height="27" /><div class="btn btn_l">&lt;</div><div class="btn btn_r">&gt;</div></div></div></div>'

                if($("#showBigImg").length === 0){
                    $("body").append(html);
                }
                if(size == 1){
                    $(".btn.btn_l,.btn.btn_r").hide();
                }else{
                    $(".btn.btn_l,.btn.btn_r").show();
                }
                $("#showBigImg").show();
                $(".mske_html img").css({opacity: 0}).attr("src",url).animate({opacity: 1},300);
            }

            $("body").on("click",".btn.btn_l",function(){
                index--;
                if(index == -1){
                    index++;
                    TVC.showTip("已经是第一张");
                    return;
                }
                showMoveImg(arrImg[index]);
            });
            $("body").on("click",".btn.btn_r",function(){
                index++;
                if(index == size){
                    index--;
                    TVC.showTip("已经是最后一张");
                    return;
                }
                showMoveImg(arrImg[index]);
            });
            //点击当图片弹出浮层
            $("body").on("click",".clickShowBigImg",function(){
                arrImg=[];
                if(!!$(this).parent("div[name=img-list]")[0]){//多张图片左右切换
                    index=$(this).index();
                    console.log(index);
                    size=$(this).siblings().size()+1;
                    var arrTemp=$(this).parent("div[name=img-list]").find("img");
                    arrTemp.each(function(){
                        var url = $(this).attr("true-src") ? $(this).attr("true-src") : $(this).attr("src");
                        arrImg.push(url);
                    });
                }else{//兼容以前的单张图片，在图片外出没有包裹<div name="img-list"></div>
                    index=0;
                    size=1;
                    var url = $(this).attr("true-src") ? $(this).attr("true-src") : $(this).attr("src");
                    arrImg.push(url);
                }
                showMoveImg(arrImg[index]);
            });
            //故障图片
            $("a[name=faultPictures]").on("click",function(){
                arrImg=[];
                size= $(this).parent().next("div.img-list").find("img").size();
                var arrTemp=$(this).parent().next("div.img-list").find("img");
                arrTemp.each(function(){
                    var url = $(this).attr("true-src") ? $(this).attr("true-src") : $(this).attr("src");
                    arrImg.push(url);
                });
                showMoveImg(arrImg[0]);
            });

            $("body").on("click",".mskeClaose",function(){$("#showBigImg").remove()});
        },
        //列表more list更多操作
        moreList:function(){
            $("a[data-more]").click(function(){
                var more=$(this).attr("data-more");
                $(this).next("b").toggleClass("more-arrow-bottom more-arrow-right");
                $(this).siblings("ul[data-list="+more+"]").toggle();

            });
        },
        //修改景区名称
        modify:function(){
            $(".editImg").click(function(){
                //alert("aaa");
                //$(this).prev("input").removeAttr("disabled").focus();
                $("#abcd").removeAttr("disabled").focus();
                var text=$("#abcd").get(0);
                var len=$("#abcd").val().length;
                setCaretToPos(text,len);
            });
            $("body").on("blur","input[data-title='edit']",function(){
                $(this).attr("disabled","disabled");
                //$(this).next("img").css("visibility","hidden");

            });

            //input获得焦点，光标定位到最后面
            function setSelectionRange(input, selectionStart, selectionEnd) {
                if (input.setSelectionRange) {
                    input.focus();
                    input.setSelectionRange(selectionStart, selectionEnd);
                }
                else if (input.createTextRange) {
                    var range = input.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', selectionEnd);
                    range.moveStart('character', selectionStart);
                    range.select();
                }
            }
            function setCaretToPos (input, pos) {
                setSelectionRange(input, pos, pos);
            }

            //键盘enter事件
            document.onkeydown = function(e){
                var ev = document.all ? window.event : e;
                if(ev.keyCode==13) {
                    $("#abcd").attr("disabled","disabled");
                }
            }

        },
        //设置难易度打星评级
        setStar:function(){
            $(".difficulty > li").on("click",function(){
                var  n=$(this).index();
                //alert(n);
                $(this).removeClass("easy").addClass("hard").prevAll().removeClass("easy").addClass("hard");
                $(this).nextAll().removeClass("hard").addClass("easy");
                $("input[name='difficulty']").val(n+1);
            });

        },
        //编辑表单获取默认星星
        getStar: function () {
            var n = $("input[name=difficulty]").val();
            if (!n) {
                $(".difficulty").find("li").removeClass("hard").addClass("easy");
            } else {
                n -= 1;
                $(".difficulty").find("li").eq(n).removeClass("easy").addClass("hard").prevAll().removeClass("easy").addClass("hard");
                $(".difficulty").find("li").eq(n).nextAll().removeClass("hard").addClass("easy");
            }
        },
        //点击详情弹出浮层显示
        details:function(){

            var html='<div class="showImg"><div class="mskeLayBg"></div><div class="mskelayBox"><div class="mske_html"></div><img class="mskeClaose" src="/images/mke_close.png" width="27" height="27" /></div></div>';

            $("a[data-detail]").on("click",function(){
                if($(".showImg").length === 0){
                    $("body").append(html);
                }
                var txt=$(this).prev("span").html();
                //$(".mske_html img").attr("src",$(this).attr("src"));$(".mskeLayBg").show();$(".mskelayBox").fadeIn(300)
                $(".mske_html").html(txt);
                $(".mskeLayBg").show();
                $(".mskelayBox").fadeIn(300)
            });
            $(".mskeClaose").on("click",function(){$(".mskeLayBg,.mskelayBox").hide()});
        },
        //日期弹框滚动
        dateScroll:function(){
        var top1=0;
        var b;
        $("input[data-date-scroll]").on("focus click",function(){
            var temp=$("#right").scrollTop();
            if($("#laydate_box")){
                top1=parseInt($("#laydate_box").css("top"))+temp;
            }
            b=$(this).attr("data-date-scroll");
        });

        $("#right").on('scroll',function(){
            if(b == "true"){
                var top=0;
                var top2= $(this).scrollTop();
                top=top1-top2;
                $("#laydate_box").css({
                    "top": top+"px"
                })
            }else{
                return;
            }
        })
    }

    };

    $.Right=Right;
    $.Right.init();
}($));
