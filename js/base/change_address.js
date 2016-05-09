TVC.provinceChangedInSelect = function (selector_pro, callback) {

    var _province_list = null;

    TVC.postJson("/common/citys", {}, function(result){
        _province_list = result;
        initProvince();
        callback && callback();
    });

    /**
     * 选择省后,城市下拉框的变化
     * @param province  选中的省
     * @param selector_city  市选择器
     * @private
     */
    function _provinceChange(province, selector_city) {
        var option = "";
        if (_province_list[province]) {
            for (var i = 0; i < _province_list[province].length; ++i) {
                var city = _province_list[province][i];
                option += "<option value="+city[0]+">"+city[0]+"</option>";
            }
        }
        $(selector_city + " option[value!='']").remove();
        $(selector_city).append(option);
    }


    /**
     * 省份发生变化
     * @param selector_province 省
     * @param selector_city    市
     */
    function provinceChanged(selector_province, selector_city) {
        var province = $(selector_province).find("option:selected").val();
        _provinceChange(province, selector_city);
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
    }



    function setProvinceSelected(selector, province) {
        if (!(selector && province)) {
            return;
        }
        $(selector + " option").each(function(){
            if ($(this).val() === province) {
                $(this).attr("selected", true);
            }
            return;
        });
    }

    function setCitySelected(selector, province, city) {
        if (!(selector && city && province)) {
            return;
        }
        _provinceChange(province, selector);
        $(selector + " option").each(function(){
            if ($(this).val() === city) {
                $(this).attr("selected", true);
            }
            return;
        });
    }

    /**
     * 根据特定的省市，初始化下拉框
     * @param pro_selector
     * @param city_selector
     * @param province
     * @param city
     */
    function setProvinceCitySelected(pro_selector, city_selector, province, city) {
        $(pro_selector + " option").each(function(){
            if ($(this).val() === province) {
                $(this).attr("selected", true);
            }
            return;
        });
        _provinceChange(province, city_selector);
        $(city_selector + " option").each(function(){
            if ($(this).val() === city) {
                $(this).attr("selected", true);
            }
            return;
        });
    }


    return {
        provinceChanged: provinceChanged,
        setProvinceSelected: setProvinceSelected,
        setCitySelected: setCitySelected,
        setProvinceCitySelected: setProvinceCitySelected
    };
};

