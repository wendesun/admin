$(function(){
    var AB ={};
    AB.Address = function(input, result, onSelect){
        var cache = {};
        var inputSelector = input;
        var resultSelector = result;
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

            var region = encodeURI("北京");
            var keyword = encodeURI(query);
            var url = "http://apis.map.qq.com/ws/place/v1/suggestion/?keyword="+keyword+"&region="+region+"&output=jsonp&key=3JLBZ-B7PRJ-CHRFM-KNZKB-UARAH-72FFF&callback=?";
            $.getJSON(url,function(rqData){
                if (rqData.status === 0){
                    cache[query] = rqData.data;
                    updateSuggestBox(rqData.data);
                }
            });
        }

        function updateSuggestBox(data){
            var box = $(resultSelector).find("ul");
            box.html("");
            var html = [];
            for (var i = 0; i < data.length && i < 10; i++) {
                var name = data[i].title;
                var province = data[i].province;
                var city = data[i].city;
                var region = data[i].district;
                var address = data[i].address;
                var latlng = "";
                if (data[i].location) {
                    latlng = data[i].location.lat + "," + data[i].location.lng;
                }else {
                    continue;
                }
            html.push("<li data-name='"+name+"' data-city='" + city + "' data-region='" + region + "' data-province='" + province + "' data-address='" + address + "' data-latlng='" + latlng + "'>"+"<span class='color-black'>"+name+"</span>"+"&nbsp;&nbsp;&nbsp;"+address+"</li>");
            }
            box.html(html.join(""));
            if(box.find("li").length > 0){
                $(resultSelector).show();
            }else{
                $(resultSelector).hide();
            }
            box.find("li").click(function () {
                var latlng = $(this).attr("data-latlng");
                var $address = $(this);
                var url = "http://apis.map.qq.com/ws/coord/v1/translate?locations="+latlng+"&type=3&output=jsonp&key=3JLBZ-B7PRJ-CHRFM-KNZKB-UARAH-72FFF&callback=?"
                $.getJSON(url, function(rqData){
                    if (rqData.status != 0) {
                        return;
                    }
                    var lnglat = rqData.locations[0]['lng'] + "," + rqData.locations[0]['lat'];
                    var name = $address.attr("data-name");
                    var city = $address.attr("data-city").replace("市", "");
                    var region = $address.attr("data-region");

                    var province = $address.attr("data-province").replace("市", "");
                    province = province.replace("省", "");
                    var address = $address.attr("data-address");
                    var retData = {'name': name,'province':province,'city':city,'region':region,'address':address,'lnglat':lnglat};
                    onSelect && onSelect(retData);
                });
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
