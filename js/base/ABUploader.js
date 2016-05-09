$(function () {
    var ABUploader  = function(selector){
        this._selector = selector;
    };
    
    ABUploader.prototype = {
        init: function (options, callback) {
            var that = this;
            callback = callback || {};
            var _options = $.extend({
                'buttonText': '上传图片', //选择按钮显示的字符  
                'swf': '/js/base/plugins/jquery/uploadify/uploadify.swf',
                'uploader': '/resource/upload_image',
                'fileObjName': 'file',
                'buttonClass':'',
                'formData': {},
                'fileSizeLimit': 5120,
                'method': 'Post',
                'auto': true,
                'multi': false,
                'fileTypeDesc': 'Image Files',
                'fileTypeExts': '*.jpg;*.jpeg;*.png;',
                'overrideEvents':['onSelectError','onUploadProgress','onDialogClose'],
                'onSelect': function (file) {//选择文件后的触发事件
                    $.isFunction(callback['onSelect']) && callback.onSelect(file);
                },
                'onSWFReady': function (file) {//选择文件后的触发事件
                    $.isFunction(callback['onSWFReady']) && callback.onSWFReady(file);
                },
                'onSelectError':function(file, errorCode, errorMsg){
                    $.isFunction(callback['onSelectError']) && callback.onSelectError(file, errorCode, errorMsg);
                },
                'onUploadSuccess': function (file, data, response) {
                    that.enable();
                    $.isFunction(callback['onUploadSuccess']) && callback.onUploadSuccess(file, data, response);
                },
                onUploadProgress: function (file, fileBytesLoaded, fileTotalBytes){
                    $.isFunction(callback['onUploadProgress']) && callback.onUploadProgress(file, fileBytesLoaded, fileTotalBytes);
                },
                'onCancel':function(file){
                    that.enable();
                    $.isFunction(callback['onCancel']) && callback.onCancel(file);
                },onUploadError : function(file, errorCode, errorMsg){
                    that.enable();
                    $.isFunction(callback['onUploadError']) && callback.onUploadError(file, errorCode, errorMsg);
                },onUploadStart:function(file){
                    that.disable();
                    $.isFunction(callback['onUploadStart']) && callback.onUploadStart(file);
                }
            }, options);

            $(this._selector) && $(this._selector).uploadify(_options);
        },
        disable:function(){
            //window.console.log("disable:"+this._selector);
            $(this._selector) && $(this._selector).uploadify('disable',true);
        },
        enable:function(){
            //window.console.log("enable:"+this._selector);
            $(this._selector) && $(this._selector).uploadify('disable',false);
        },
        cancle:function(){
            //window.console.log("enable:"+this._selector);
            $(this._selector) && $(this._selector).uploadify('cancel','*');
        },
        setFileCountLimit:function(count){
            count = parseInt(count);
            $(this._selector) && $(this._selector).uploadify('settings', 'queueSizeLimit', count);
        }
    };
    
    
    window['ABUploader'] = ABUploader;

});