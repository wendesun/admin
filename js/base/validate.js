/**
 * Created by jhyang on 2016/1/18.
 */
$(function(){
    TVC.FormValidator = {
        checkForm: function(form) {
            var legal = true,
                that = this,
                items = this.elements(form);
            items.each(function(){
                if (!that.check( this )) {
                    legal = false;
                }
            });
            return legal;
        },

        elements: function(form) {
            if (form) {
                var items = $(form).find("input, select, textarea").not(":submit, :reset, :image, [disabled]");
            }else { //没有传入表单选择器，则默认当前页所有
                var items = $("input, select, textarea").not(":submit, :reset, :image, [disabled]")
            }
            return items;
        },

        elementValue: function( element ) {
            var type = $(element).attr("type"),
                name = $(element).attr("name"),
                val = $(element).val();

            if ( type === "radio" || type === "checkbox" ) {
                return $("input[name='" + $(element).attr("name") + "']:checked").val();
            }

            if ( typeof val === "string" ) {
                return val.replace(/\r/g, "");
            }
            return val;
        },

        rules: function(element) {
            var data = this.normalizeRules(
                $.extend(
                    {},
                    this.attributeRules(element),
                    this.dataRules(element),
                    this.customRules(element)
                ), element);

            if ( data.required ) {          //确保require第一个验证
                var param = data.required;
                delete data.required;
                data = $.extend({required: param}, data);
            }

            return data;
        },

        check: function( element ) {
            var rules = this.rules(element),
                val = this.elementValue(element);

            for (var method in rules ) {
                var rule = { method: method, parameters: rules[method] };
                if (!this.methods[method].call( this, val, element, rule.parameters )) {
                    this.showError(element, method);
                    return false;
                }
            }

            return true;
        },

        showError: function(element, method) {
            var name = $(element).attr("name");
            var errorName = $(element).attr("data-error") ? $(element).attr("data-error") : name;
            if (!$("div[data-name=" + errorName).is(":hidden")) {
                return;
            }
            var errorMsg = this.customDataMessage(element,method);
            $("div[data-name=" + errorName).text(this.customDataMessage(element,method)).show();
        },

        customDataMessage: function( element, method ) {
            return $(element).attr("data-msg-" + method.toLowerCase());
        },

        checkable: function( element ) {
            return (/radio|checkbox/i).test(element.type);
        },

        findByName: function( name ) {
            return $(this.currentForm).find("[name='" + name + "']");
        },

        getLength: function( value, element ) {
            switch( element.nodeName.toLowerCase() ) {
                case "select":
                    return $("option:selected", element).length;
                case "input":
                    if ( this.checkable( element) ) {
                        return this.findByName(element.name).filter(":checked").length;
                    }
            }
            return value.length;
        },

        optional: function( element ) {
            var val = this.elementValue(element);
            return !this.methods.required.call(this, val, element);
        },

        attributeRules: function( element ) {  //属性即条件，如 required、minlength=3、min=2等
            var rules = {};
            var $element = $(element);
            var type = $element[0].getAttribute("type");

            for (var method in this.methods) {
                var value;
                // support for <input required> in both html5 and older browsers
                if ( method === "required" ) {
                    value = $element.get(0).getAttribute(method);
                    // Some browsers return an empty string for the required attribute
                    // and non-HTML5 browsers might have required="" markup
                    if ( value === "" ) {
                        value = true;
                    }
                    // force non-HTML5 browsers to return bool
                    value = !!value;
                } else {
                    value = $element.attr(method);
                }

                // convert the value to a number for number inputs, and for text for backwards compability
                // allows type="date" and others to be compared as strings
                if ( /min|max/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
                    value = Number(value);
                }

                if ( value ) {
                    rules[method] = value;
                } else if ( type === method && type !== 'range' ) {
                    // exception: the jquery validate 'range' method
                    // does not test for the html5 'range' type
                    rules[method] = true;
                }
            }

            // maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
            if ( rules.max_length && /-1|2147483647|524288/.test(rules.max_length) ) {
                delete rules.maxlength;
            }

            return rules;
        },

        dataRules: function( element ) {           //data-rule-email="true"类
            var method, value,
                rules = {};
            for (method in this.methods) {
                value = $(element).attr("data-rule-" + method.toLowerCase());
                if ( value !== undefined ) {
                    rules[method] = value;
                }
            }
            return rules;
        },

        customRules: function(element) {                       //自定义正则
            var pattern = $(element).attr("data-rule-pattern");
            return pattern ? {pattern: pattern} : {};
        },

        normalizeRules: function( rules, element ) {
            // evaluate parameters
            $.each(rules, function( rule, parameter ) {
                rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
            });

            // clean number parameters
            $.each(['min_length', 'max_length'], function() {
                if ( rules[this] ) {
                    rules[this] = Number(rules[this]);
                }
            });

            $.each(['range_length', 'range'], function() {
                var parts;
                if ( rules[this] ) {
                    if ( $.isArray(rules[this]) ) {
                        rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
                    } else if ( typeof rules[this] === "string" ) {
                        parts = rules[this].split(/[\s,]+/);
                        rules[this] = [Number(parts[0]), Number(parts[1])];
                    }
                }
            });

            if ( rules.min && rules.max ) {
                rules.range = [rules.min, rules.max];
                delete rules.min;
                delete rules.max;
            }
            if ( rules.min_length && rules.max_length ) {
                rules.range_length = [rules.min_length, rules.max_length];
                delete rules.min_length;
                delete rules.max_length;
            }

            return rules;
        },

        methods: {
            required: function (value, element) {
                if (element.nodeName.toLowerCase() === "select") {
                    // could be an array for select-multiple or a string, both are fine this way
                    var val = $(element).val();
                    return val && val.length > 0;
                }
                if (this.checkable(element)) {
                    return this.getLength(value, element) > 0;
                }
                return $.trim(value).length > 0;
            },

            phone: function (value, element) {
                return this.optional(element) || /^1[3-9][0-9]{9}$/.test(value);
            },

            money: function (value, element) {
                return this.optional(element) || /^(([1-9]{1}\d*)|0)\.\d{2}$/.test(value);
            },

            email: function (value, element) {
                return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
            },

            /*url: function (value, element) {
                return this.optional(element) || /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            },

            date: function (value, element) {
                return this.optional(element) || !/Invalid|NaN/.test(new Date(value).toString());
            },

            dateISO: function (value, element) {
                return this.optional(element) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value);
            },

            number: function (value, element) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
            },*/

            digits: function (value, element) {
                return this.optional(element) || /^\d+$/.test(value);
            },

            min_length: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length >= param;
            },

            max_length: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length <= param;
            },

            range_length: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || ( length >= param[0] && length <= param[1] );
            },

            min: function (value, element, param) {
                return this.optional(element) || value >= param;
            },

            max: function (value, element, param) {
                return this.optional(element) || value <= param;
            },

            range: function (value, element, param) {
                return this.optional(element) || ( value >= param[0] && value <= param[1] );
            },

            pattern: function (value, element, param) {
                var pattern = eval(param);
                return this.optional(element) || pattern.test(value);
            }
        }

    };

});