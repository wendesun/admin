$(function(){
    var AB ={};
    AB.Address = function(input, result, clear, hide_input, addr_url, field, onSelect){
        var cache = {};
        var inputSelector = input;
        var resultSelector = result;
        var clearButton = clear;
        var hideInput = hide_input;
        var addr = addr_url;
        var field = field;
        function init(){
            $(inputSelector).on("keyup focus propertychange", function(e){
                if (keyPress(e.keyCode, resultSelector)) {
                    return false;
                }
                var value = $.trim($(this).val());
                placeSearch(value);
            }).blur(function(){
                setTimeout(function () {
                    $(resultSelector).hide();
                }, 200);

                $("li.focus").removeClass("focus");
            });

            $(clearButton).on("click", function(){
                $(inputSelector).removeAttr("disabled");
                $(inputSelector).val("");
                $(this).addClass("hide");
                $(hideInput).val("");
            })
        }

        function keyPress(keyCode, selector)
        {
            var focus = $(resultSelector).find("li.focus");
            var up = focus.length > 0 ? focus.prev() : focus;
            var down = focus.length > 0 ? focus.next() : $(selector).find("li").eq(0);
            if (keyCode == 38){
                if (up.length > 0){
                    focus.removeClass("focus");
                    up.addClass("focus");
                }

                return true;
            }else if (keyCode == 40){
                if (down.length > 0){
                    focus.removeClass("focus");
                    down.addClass("focus");
                }
                return true;
            }else if (keyCode == 13){
                $(resultSelector).find("li.focus").click();
                return true;
            }

            return false;
        }

        function placeSearch(query) {
            query = $.trim(query);
            if (query === ""){
                cache[query] = [];
            }
            if (cache[query]){
                updateSuggestBox(cache[query]);
                return;
            }

            var keyword = encodeURI(query);
            var url = addr+"?keyword="+keyword;
            $.getJSON(url,function(rqData){
                if (rqData.message == "success"){
                    cache[query] = rqData.data;
                    updateSuggestBox(rqData.data);
                }
            });
        }

        function updateSuggestBox(data){
            var box = $(resultSelector).find("ul");
            box.html("");
            var html = [];
            if(data) {
                for (var i = 0; i < data.length && i < 10; i++) {
                    var name = data[i][field];
                    var id = data[i].id;
                    html.push("<li data-id='"+id+"'>"+"<span class='color-black'>"+name+"</span>"+"</li>");
                }
            } else {
                html.push("<div>未查询到相关结果</div>")
            }
            box.html(html.join(""));
            $(resultSelector).show();
            box.find("li").click(function () {
                $(inputSelector).val($(this).text());
                $(hideInput).val($(this).attr("data-id"));
                $(inputSelector).attr("disabled", "disabled");
                $(clearButton).removeClass("hide");
                $(resultSelector).hide();
            }).on("hover",function(){
                $("li.focus").removeClass("focus");
                $(this).addClass("focus");
            });
        }

        /* return {
         init:init
         };*/
        init();
    };
    window['AB'] = AB;
});
