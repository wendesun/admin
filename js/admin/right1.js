$(function(){
    var swd={
        init:function(){
            this.setStar();
            this.getStar();
            this.showBigImg();
            this.modify();
            this.textAreaHeigth();
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
            var html='<div class="showImg"><div class="mskeLayBg"></div><div class="mskelayBox"><div class="mske_html"><img class="img" src="" width="800" height="488" /></div><img class="mskeClaose" src="/images/mke_close.png" width="27" height="27" /></div></div>';

            $("body").on("click",".clickShowBigImg",function(){
                if($(".showImg").length === 0){
                    $("body").append(html);
                }
                $(".mske_html img").attr("src",$(this).attr("src"));$(".mskeLayBg").show();$(".mskelayBox").fadeIn(300)
            });
            $("body").on("click",".mskeClaose",function(){$(".mskeLayBg,.mskelayBox").hide()});
        },
        //列表more list更多操作
        moreList:function(more,list){
            $(more).click(function(){

                $(this).find("b").toggleClass("more-arrow-bottom more-arrow-right");
                $(list).toggle();

            });
        },
        //修改景区名称
        modify:function(){
            $(".editImg").click(function(){
                alert("aaa");
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
        }

    };

    $.swd=swd;
    $.swd.init;
}($));
