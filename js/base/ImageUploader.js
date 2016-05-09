$(function() {
    var _fileCount = 0;
    var _maxCount = 5;
    var _options = null;
 /*   var _progressBar = '<p class="progress"><span class="circle" ><span class="pie_left">'+
        '<span class="left"></span></span><span class="pie_right"><span class="right"></span>'+
        '</span><span class="mask"><span class="bfb">0</span>%</span></span></p>';*/
    var _progressBar = '<div id="progress_class"><p class="progress"></p><p class="percent"><span class="bfb">0</span>%</span></span></p></div>';
    var ImageUploader  = function(){};

    ImageUploader.prototype = {
        init: function (options, callback) {
            callback = callback || {};
            _options = $.extend({
                'container': '#uploader',
                'queue': '#queueList',
                'picker': '#filePicker',
                'buttonText': '上传图片', //选择按钮显示的字符
                'swf': '/js/webuploader/Uploader.swf',
                'server': '/oss/upload',
                'threads': 5,
                'auto': true,
                'fileCountLimit': 5,
                'fileTypeDesc': 'Images',
                'fileTypeExts': 'jpg,jpeg,png',
                //'fileSizeLimit': 100 * 1024 * 1024,
                'fileSingleSizeLimit': 2 * 1024 * 1024,

                'onBeforeFileQueued': function(file) {
                    if (_fileCount > _maxCount - 1) {
                        return false;
                    }
                    ++_fileCount;
                },

                onFileQueued: function( file ) {
                    addFile( file );
                },

                onFileDequeued: function( file ) {
                    removeFile( file );
                },

                'onUploadSuccess': function(file, rqData) {
                    var $li = $('#'+file.id),
                        $percent = $li.find('#progress_class');
                    var error = $('<p class="error" name="upload_retry">'+"上传失败，请重试"+'</p>');
                    $percent.remove();
                    if (rqData.message === 'success') {
                        $li.find( 'p.imgWrap').attr('pid', rqData.data.pid);
                        $li.find('img').attr('true-src', rqData.data.url);
                        if (_options.leftImgNumSelector) {
                            var count = parseInt($(_options.leftImgNumSelector).text());
                            $(_options.leftImgNumSelector).text(count - 1);
                        }
                    }else {
                        $li.find('[name=li_top]').stop().animate({height: 0});
                        error.appendTo($li);
                        bindRetryEvent(file);
                    }
                },

                onUploadError: function(file) {
                    var $li = $('#'+file.id),
                        $percent = $li.find('#progress_class');
                    var error = $('<p class="error" name="upload_retry">'+"上传失败，请重试"+'</p>');
                    $percent.remove();
                    $li.find('[name=li_top]').stop().animate({height: 0});
                    error.appendTo($li);
                    bindRetryEvent(file);
                },

                onUploadProgress: function( file, percentage ) {
                    var $li = $('#'+file.id),
                        $percent = $li.find('#progress_class');
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

            _maxCount = _options.fileCountLimit;

            var $wrap = $(_options.container),
                /*$list = $('<ul class="filelist" id="_img_file_list_container"></ul>')
                    .appendTo( $wrap.find(_options.queue) ), // 图片容器*/
                $list = $(_options.queue), // 图片容器
                ratio = window.devicePixelRatio || 1,  // 优化retina, 在retina下这个值是2
                thumbnailWidth = 100 * ratio,          // 缩略图大小
                thumbnailHeight = 100 * ratio,
                uploader;

            uploader = WebUploader.create({             //实例化
                auto: _options.auto,
                pick: {
                    id: _options.picker,
                    label: _options.buttonText
                },

                accept: {
                    title: _options.fileTypeDesc,
                    extensions: _options.fileTypeExts,
                    mimeTypes: 'image/*'
                },
                // swf文件路径
                swf: _options.swf,
                threads: _options.threads,
                server: _options.server,
                fileSizeLimit: _options.fileSizeLimit,
                fileSingleSizeLimit: _options.fileSingleSizeLimit
            });

            uploader.onBeforeFileQueued = _options.onBeforeFileQueued;
            uploader.onFileQueued = _options.onFileQueued;
            uploader.onFileDequeued = _options.onFileDequeued;
            uploader.onUploadSuccess = _options.onUploadSuccess;
            uploader.onUploadProgress = _options.onUploadProgress;
            uploader.onUploadError = _options.onUploadError;
            uploader.onError = function( code ) {
                if (code === "F_DUPLICATE") {
                    return;
                }
                var maxPicSize = _options.fileSingleSizeLimit / 1024 / 1024;
                var error = (code === "F_EXCEED_SIZE" || code === "Q_EXCEED_SIZE_LIMIT") ? "图片大小不符合规定，只能上传"+maxPicSize+"M以内的图片" : code;
                TVC.alert(error);
            };

            // 当有文件添加进来时执行，负责view的创建
            function addFile( file ) {
                //图片相关信息：名称，图片容器，图片进度条
                var $li = $( '<li id="' + file.id + '">' +
                        '<p class="title">' + file.name + '</p>' +
                        '<p class="imgWrap" name="pid_container" pid=""></p>'+ _progressBar +
                        '</li>' ),
                //预览图片时对图片的操作
                    $btns = $('<div class="file-panel delete">' +
                        '<span class="cancell">删除</span></div>').appendTo( $li ),
                    $top = $('<p class="top" name="li_top">置顶</p>').appendTo($li),
                    $prgress = $li.find('p.progress span'),
                    $wrap = $li.find( 'p.imgWrap' ),
                    $info = $('<p class="error"></p>');

                // 创建缩略图
                uploader.makeThumb( file, function( error, src ) {
                    if ( error ) {
                        $wrap.text( '不能预览' );
                        return;
                    }
                    var img = $('<img width="110" height="110" class="clickShowBigImg" src="'+src+'">');
                    $wrap.empty().append( img );
                }, thumbnailWidth, thumbnailHeight );

                $li.on( 'mouseenter', function() {
                    $btns.stop().animate({height: 20});
                    if ($li.find("[name=upload_retry]").length === 0) {
                        $top.stop().animate({height: 28});
                    }

                });

                $li.on( 'mouseleave', function() {
                    $btns.stop().animate({height: 0});
                    $top.stop().animate({height: 0});
                });


                $btns.on( 'click', 'span', function() {
                    var index = $(this).index();

                    switch ( index ) {
                        case 0:                          //删除
                            uploader.removeFile( file );
                            --_fileCount;
                            break;
                    }
                });

                $top.on('click', function(){
                    $("#queueList").prepend($(this).parent());
                });

                $li.appendTo( $list );
                if (_fileCount === _maxCount) {
                   $(_options.picker).hide();
                }
            }

            // 负责view的销毁
            function removeFile( file ) {
                var $li = $('#'+file.id);
                $li.off().find('.file-panel').off().end().remove();
                $(_options.picker).show();
                if (_options.leftImgNumSelector) {
                    var count = parseInt($(_options.leftImgNumSelector).text());
                    $(_options.leftImgNumSelector).text(count + 1);
                }
            }
            //绑定失败重传事件
            function bindRetryEvent(file) {
                var $li = $("#"+file.id),
                    $percent = $li.find('.progress span');
                $li.find("[name=upload_retry]").unbind("click").on("click",function(){
                    $(this).remove();
                    $percent.show();
                    uploader.retry(file);
                });
            }

            //设置进度
            function setPercent(m, fileId){
                var $li = $("#" + fileId);
                $li.find('span.bfb').text(m);
              /*  var num = m * 3.6;
                if (num<=180) {
                    $($li).find('.right').css('transform', "rotate(" + num + "deg)");
                } else {
                    $($li).find('.right').css('transform', "rotate(180deg)");
                    $($li).find('.left').css('transform', "rotate(" + (num - 180) + "deg)");
                }*/
            }

        },

        setCurrentFileCount: function(count) {
            _fileCount = count;
        }
    };
    window['ImageUploader'] = ImageUploader;
});