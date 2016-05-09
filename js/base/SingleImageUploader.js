$(function() {
    var _progressBar = '<div data-id="progress_class"><p class="progress"></p><p class="percent"><span class="bfb">0</span>%</span></span></p></div>';
    var ImageUploader  = function(){
        this.options = null;
        this.fileCount = 0;
        this.maxCount = 1;
        this.currentFile = null;
        this.uploader = null;
    };

    ImageUploader.prototype = {
        init: function (options, callback) {
            var that = this;
            callback = callback || {};
            var _options = $.extend({
                'container': '#uploader',                  //上传的容器
                'queue': '#queueList',                     //图片队列
                'picker': '#filePicker',                   //选择图片触发器
                'pidContainer':'#pid_container',            //上传图片成功后服务器端返回的pid的存储容器，以valued形式存储
                'buttonText': '上传图片', //选择按钮显示的字符
                'swf': '/js/webuploader/Uploader.swf',
                'server': '/oss/upload',                   //上传路径
                'auto': true,                              //是否选择完图片后立即上传
                'fileCountLimit': 1,
                'fileTypeDesc': 'Images',
                'fileTypeExts': 'jpg,jpeg,png',
                //'fileSizeLimit': 2 * 1024 * 1024,
                'fileSingleSizeLimit': 2 * 1024 * 1024,

                'onBeforeFileQueued': function(file) {
                    //保证只能上传一张图片
                    if (that.fileCount > 0) {  //已有图片，则清除原图片
                        uploader.removeFile( that.currentFile );
                    }
                    ++that.fileCount;
                },

                onFileQueued: function( file ) {
                    addFile( file );
                    that.currentFile = file;
                    that.showCancelBtn();
                },

                onFileDequeued: function( file ) {
                    removeFile(file);
                },

                'onUploadSuccess': function(file, rqData) {
                    if (!rqData) {
                        return;
                    }
                    var $li = $(_options.container+' [data-id='+file.id+']'),
                        $percent = $li.find('[data-id=progress_class]');
                    var error = $('<p class="error" name="upload_retry">'+"上传失败，请重试"+'</p>');
                    $percent.remove();                //移除进度条
                    if (rqData.message === 'success') {
                        $(_options.pidContainer).val(rqData.data.pid);  //存储上传成功的图片pid
                        $(_options.container + " .clickShowBigImg").attr("true-src", rqData.data.url);
                        that.showFilePicker("重新上传");
                    }else {
                        error.appendTo($li);             //显示错误信息
                        bindRetryEvent(file);
                        that.showFilePicker("上传图片");
                    }
                },

                onUploadProgress: function( file, percentage ) {
                    var $li = $(_options.container+' [data-id='+file.id+']'),
                        $percent = $li.find('.progress span');
                    // 避免重复创建
                    if ( !$percent.length ) {
                        $percent = $(_progressBar)
                            .appendTo( $li )
                            .find('span');
                    }
                    percentage = Math.round(percentage * 100);
                    setPercent(percentage, file.id);
                }
            }, options);

            var $wrap = $(_options.container),
                $list = $('<ul class="filelist"></ul>')
                    .appendTo( $wrap.find(_options.queue) ), // 图片容器
                ratio = window.devicePixelRatio || 1,  // 优化retina, 在retina下这个值是2
                thumbnailWidth = 100 * ratio,          // 缩略图大小
                thumbnailHeight = 100 * ratio,
                uploader;

            uploader = WebUploader.create({  //实例化
                auto: _options.auto,
                pick: {
                    id: _options.picker,
                    label: _options.buttonText,
                    multiple: false
                },

                accept: {
                    title: _options.fileTypeDesc,
                    extensions: _options.fileTypeExts,
                    mimeTypes: 'image/jpg,image/jpeg,image/png'
                },
                // swf文件路径
                swf: _options.swf,
                threads: _options.threads,
                server: _options.server,
                fileSizeLimit: _options.fileSizeLimit,    // 200 M
                fileSingleSizeLimit: _options.fileSingleSizeLimit    // 50 M
            });

            uploader.onBeforeFileQueued = _options.onBeforeFileQueued;
            uploader.onFileQueued = _options.onFileQueued;
            uploader.onFileDequeued = _options.onFileDequeued;
            uploader.onUploadSuccess = _options.onUploadSuccess;
            uploader.onUploadProgress = _options.onUploadProgress;
            that.options = _options;
            that.uploader = uploader;
            uploader.onError = function( code ) {
                that.showFilePicker("上传图片");
                if (code === "F_DUPLICATE") {
                    return;
                }
                var maxPicSize = _options.fileSingleSizeLimit / 1024 / 1024;
                var error = (code === "F_EXCEED_SIZE" || code === "Q_EXCEED_SIZE_LIMIT") ? "只能上传"+maxPicSize+"M以内的图片" : code;
                TVC.alert(error);
            };

            // 当有文件添加进来时执行，负责view的创建
            function addFile( file ) {
                $(_options.container+" .staticImgDiv").remove();
                //图片相关信息：名称，图片容器，图片进度条
                var $li = $( '<li data-id="' + file.id + '">' +
                        '<p class="title">' + file.name + '</p>' +
                        '<p class="imgWrap"></p>' + _progressBar + '</li>' ),
                    //预览图片时对图片的操作
                    $operateHtml = that.maxCount === 1 ? '<div class="file-panel">' +
                    '<span class="cancel"><img class="close" src="/images/close.png" width="20" height="20"></span></div>' :
                        '<div class="file-panel"><span class="cancel">删除</span></div>',
                    $prgress = $li.find('p.progress span'),
                    $wrap = $li.find( 'p.imgWrap' ),
                    $info = $('<p class="error"></p>');
                var $btns = $($operateHtml).appendTo( $li );
                // 创建缩略图
                uploader.makeThumb( file, function( error, src ) {
                    if ( error ) {
                        $wrap.text( '不能预览' );
                        //removeFile(file);
                        //alert("图片格式错误，请重新选择");
                        return;
                    }
                    var img = $('<img  width="110" height="110" class="clickShowBigImg" src="'+src+'">');
                    $wrap.empty().append( img );
                }, thumbnailWidth, thumbnailHeight );

                $li.on( 'mouseenter', function() {
                    $btns.stop().animate({height: 20});
                });

                $li.on( 'mouseleave', function() {
                    $btns.stop().animate({height: 0});
                });

                $btns.on( 'click', 'span', function() {
                    var index = $(this).index();

                    switch ( index ) {
                        case 0:                          //删除
                            uploader.removeFile( file );
                            $(_options.pidContainer).val('');  //清空图片pid
                            return;
                        case 1:                          //置顶
                            //$('#'+file.id).insertBefore("li");
                            break;
                    }
                });

                $li.appendTo( $list );
            }

            // 负责view的销毁
            function removeFile( file ) {
                var $li = $(_options.container+' [data-id='+file.id+']');
                $li.off().find('.file-panel').off().end().remove();
                that.currentFile = null;
                --that.fileCount;
                that.showFilePicker("上传图片");
            }
            //绑定失败重传事件
            function bindRetryEvent(file) {
                that.showCancelBtn();
                var $li = $(_options.container+' [data-id='+file.id+']'),
                    $percent = $li.find('.progress span');
                $li.find("[name=upload_retry]").unbind("click").on("click",function(){
                    $(this).remove();
                    $percent.show();
                    uploader.retry(file);
                });
            }

            //设置进度
            function setPercent(m, fileId){
                var $li = $(_options.container+' [data-id='+fileId+']');
                $li.find('span.bfb').text(m);
            }

            //取消按钮
            $(_options.container+ " [btn-name=cancelBtn]").on('click', function() {
                uploader.removeFile(that.currentFile);
                //that.showFilePicker("上传图片");
            });

        },

        removeImage: function() {  //移除已上传图片
            if (this.currentFile) {
                this.uploader.removeFile(this.currentFile);
            }

        },
        showFilePicker: function(pickerName) {  //设置上传按钮文字
            this.setState(pickerName);
            $(this.options.picker).show();
            $(this.options.container+ " [btn-name=cancelBtn]").hide();
        },
        setState: function(state){//设置上传状态
            $(this.options.container+ " .webuploader-pick-single").text(state);
        },
        showCancelBtn: function() { //显示取消上传按钮
            $(this.options.container+ " [btn-name=cancelBtn]").show();
            $(this.options.picker).hide();
        }
    };
    window['SingleImageUploader'] = ImageUploader;
});
