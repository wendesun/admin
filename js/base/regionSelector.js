TVC.regionSelector = function (selector_pro, callback) {

    var _province_list = _province_city_map;
    var _city_list = _city_region_map;

    initProvince();

    var _zoneChange = function(zone, zoneArr,selector, subSelector) {
        var option = '';
        if (zoneArr[zone]) {
            for (var i = 0; i < zoneArr[zone].length; ++i) {
                var childZone = zoneArr[zone][i];
                var childVal = $.isArray(childZone) ? childZone[0] : childZone;

                option += "<option value="+childVal+">"+childVal+"</option>";
            }
        }
        if (subSelector) {
            $(subSelector + " option[value!='']").remove();
        }
        $(selector + " option[value!='']").remove();
        $(selector).append(option);
    };

    /**
     * 省份发生变化
     * @param selector_province 省
     * @param selector_city    市
     */
    function provinceChanged(selector_province, selector_city, selector_region) {
        var province = $(selector_province).find("option:selected").val();
        _zoneChange(province, _province_list,selector_city, selector_region);
    }

    function cityChanged(selector_city, selector_region) {
        var city = $(selector_city).find("option:selected").val();
        _zoneChange(city, _city_list,selector_region);
    }

    /**
     * 初始化省份下拉框
     * @param selector
     * @param defaultVal
     */
    function initProvince() {
        if (!selector_pro) {
            return;
        }
        var option = "";
        for (var province in _province_list) {
            option += "<option value="+province+">"+province+"</option>";
        }
        $(selector_pro + " option[value!='']").remove();
        $(selector_pro).append(option);
        //callback && callback();
    }

    function initSelector(pro_selector, city_selector, region_selector) {
        selectZone(pro_selector, "");
        $(city_selector + " option[value!='']").remove();
        $(region_selector + " option[value!='']").remove();
    }

    /**
     * 根据城市初始化地区下拉框，并选中默认值
     * @param city
     * @param region
     * @param selector
     */
    function initRegionWithCity(city, region, selector) {
        _zoneChange(city, _city_list, selector);
        selectZone(selector, region);
    }
    /**
     * 根据特定的省市，初始化下拉框
     * @param pro_selector
     * @param city_selector
     * @param province
     * @param city
     */
    function setProvinceCitySelected(pro_selector, city_selector,region_selector, province, city,region) {
        selectZone(pro_selector, province);
        _zoneChange(province, _province_list,city_selector);
        selectZone(city_selector, city);
        if (!region_selector) {
            return;
        }
        _zoneChange(city, _city_list,region_selector);
        selectZone(region_selector, region);
    }

    function selectZone(selector, zone) {
        $(selector + " option[value="+zone + "]").attr("selected", true);
    }


    return {
        provinceChanged: provinceChanged,
        cityChanged: cityChanged,
        setProvinceCitySelected: setProvinceCitySelected,
        initRegionWithCity: initRegionWithCity,
        initSelector: initSelector
    };
};

