/**
 * 添加、编辑用户页面
 * Created by aibang on 2015/11/17.
 */
$(function(){
    var _isFormChanged = {isShow: false};

    function init() {

        TVC.setCloseWindowTip(_isFormChanged);
        bindUploadePictureEvent();
        bindUploadeAudioEvent();
        bindUploadeMapEvent();
        listenFormChange();
    }

    function listenFormChange(){
        $("input").on("input change", function(){
            _isFormChanged.isShow = true;
        });
        $("textarea").on("textarea change", function(){
            _isFormChanged.isShow = true;
        });
        $("select").on("select change", function(){
            _isFormChanged.isShow = true;
        });
        var UeEditor = [descriptionData,tripLineData,tipData,ticketData,trafficData];
        for (var i = 0; i < UeEditor.length; ++i) {
            UeEditor[i].addListener( 'contentChange', function( descriptionData ) {
                _isFormChanged.isShow = true;
            });
        }
    }

    function bindUploadePictureEvent() {
        var uploader = new ABUploader("#upload_scenic");
        var pidSelector = "input[name=scenic_pid]";
        var imgSelector = "#scenic_pic";
        //alert($("#scenic_pid").attr('value'))
        var text = '';
        $(pidSelector).val()?text = '重新上传':text = '点击上传';
        uploader.init({
            uploader: '/oss/upload',
            multi: false,
            buttonText: text,
            'fileSizeLimit': 2048,
            'fileTypeExts': '*.jpg;*.jpeg;*.png;',
            fileObjName: 'file'
        }, {
            onSelect: function(){
                TVC.showLoading("");
                _isFormChanged.isShow = true;
                $("#scenicMsg").html("<span class='color-grey'>文件上传中...</span>").show();
            },
            onSelectError: function(file, errorCode, errorMsg){
                TVC.hideLoading();
                if (errorCode === -100) {
                    $("#scenicMsg").html("最多上传1张图片").show();
                } else if (errorCode === -110) {
                    $("#scenicMsg").html("只能上传2M大小以内的图片").show();
                }
            },
            onUploadSuccess: function(file, rqData, response){
                TVC.hideLoading();
                $("#scenicMsg").html('').hide();
                if(rqData == '') $("#scenicMsg").html("上传失败，请重新上传").show();
                rqData = $.parseJSON(rqData);
                if (rqData.message === 'success') {
                    $(pidSelector).val(rqData.data.pid);
                    $(imgSelector).attr('src', rqData.data.url).show();
                    $(".uploadify-button-text:eq(0)").html('重新上传');
                } else {
                    $("#scenicMsg").html("上传失败，请重新上传").show();
                }
            },
            onUploadError: function(file, errorCode, errorMsg) {
                TVC.hideLoading();
                $("#scenicMsg").html("上传失败，请重新上传").show();
            },
            onUploadProgress: function (file, fileBytesLoaded, fileTotalBytes) {
                //uploadify-button-text
                var total = new Number(fileTotalBytes / 1024).toFixed(2);
                var percentage = Math.round(fileBytesLoaded / fileTotalBytes * 100);
                if(percentage > 99){
                    percentage = 99;
                    total = new Number(fileTotalBytes * 0.9 / 1024).toFixed(2);
                }

                var text = '<span class="color-grey">已上传(' + total + 'k)...' + percentage + '%</span>';

                $("#scenicMsg").html(text).show();
            }
        });
    }

    function bindUploadeAudioEvent() {
        var uploader = new ABUploader("#upload_audio");
        var pidSelector = "input[name=audio_id]";
        var imgSelector = "#audio";
        var text = '';
        $(pidSelector).val()?text = '重新上传':text = '上传语音';
        uploader.init({
            uploader: '/oss/upload',
            multi: false,
            buttonText: text,
            'fileSizeLimit': 10240,
            'fileTypeExts': '*.mp3;',
            fileObjName: 'file'
        }, {
            onSelect: function(){
                TVC.showLoading("");
                _isFormChanged.isShow = true;
                var audio = document.getElementById("audio");
                audio.pause();
                $("#cancleUpaoadAudio").show();
                $("#deleteScenicAudio").hide();
                $("#audioMsg").html("<span class='color-grey'>文件上传中...</span>").show();
            },
            onSelectError: function(file, errorCode, errorMsg){
                TVC.hideLoading();
                $("#cancleUpaoadAudio").hide();
                if (errorCode === -100) {
                    $("#audioMsg").html("只能上传1段语音").show();
                } else if (errorCode === -110) {
                    $("#audioMsg").html("只能上传10M以内的语音文件").show();
                }
                if($(pidSelector).val()){
                    $("#deleteScenicAudio").show();
                }
            },
            onUploadSuccess: function(file, rqData, response){
                TVC.hideLoading();
                $("#cancleUpaoadAudio").hide();
                //$(".audioButtonNotShow").show();
                $("#audioMsg").html('').hide();
                if(rqData == '') $("#audioMsg").html("上传失败，请重新上传").show();
                rqData = $.parseJSON(rqData);
                if (rqData.message === 'success') {
                    $(pidSelector).val(rqData.data.pid);
                    $(imgSelector).attr('src', rqData.data.url).removeAttr('class');
                    $(".uploadify-button-text:eq(1)").html('重新上传');
                } else {
                    $("#audioMsg").html("上传失败，请重新上传").show();
                }
                if($(pidSelector).val()){
                    $("#deleteScenicAudio").show();
                }
            },
            onUploadError: function() {
                TVC.hideLoading();
                $("#cancleUpaoadAudio").hide();
                if($(pidSelector).val()){
                    $("#deleteScenicAudio").show();
                }
                $("#audioMsg").html("上传失败，请重新上传").show();
            },
            onUploadProgress: function (file, fileBytesLoaded, fileTotalBytes) {
                //uploadify-button-text
                var total = new Number(fileTotalBytes / 1024).toFixed(2);
                var percentage = Math.round(fileBytesLoaded / fileTotalBytes * 100);
                if(percentage > 99){
                    percentage = 99;
                    total = new Number(fileTotalBytes * 0.9 / 1024).toFixed(2);
                }
                
                var text = '<span class="color-grey">已上传(' + total + 'k)...' + percentage + '%</span>';
                
                $("#audioMsg").html(text).show();
            }
        });
    }

    $("#deleteScenicAudio").click(function(){
        $('#upload_audio').uploadify('cancel', '*');
        $("#audio").attr('class','hidden');
        $("#audio_id").attr('value','');
        $(this).hide();
        $(".uploadify-button-text:eq(1)").html('上传语音');
    })

    function bindUploadeMapEvent() {
        var uploader = new ABUploader("#upload_map");
        var pidSelector = "input[name=map_pid]";
        var imgSelector = "#map_pic";
        var text = '';
        $(pidSelector).val()?text = '重新上传':text = '点击上传';
        uploader.init({
            uploader: '/oss/upload',
            multi: false,
            buttonText: text,
            'fileSizeLimit': 10240,
            'fileTypeExts': '*.jpg;*.jpeg;*.png;',
            fileObjName: 'file'
        }, {
            onSelect: function(){
                TVC.showLoading("");
                _isFormChanged.isShow = true;
                $("#mapMsg").html("<span class='color-grey'>文件上传中...</span>").show();
            },
            onSelectError: function(file, errorCode, errorMsg){
                TVC.hideLoading();
                if (errorCode === -100) {
                    $("#mapMsg").html("最多上传1张图片").show();
                } else if (errorCode === -110) {
                    $("#mapMsg").html("只能上传2M大小以内的图片").show();
                }
            },
            onUploadSuccess: function(file, rqData, response){
                TVC.hideLoading();
                $("#mapMsg").html('').hide();
                if(rqData == '') $("#mapMsg").html("上传失败，请重新上传").show();
                rqData = $.parseJSON(rqData);
                if (rqData.message === 'success') {
                    $(pidSelector).val(rqData.data.pid);
                    $(imgSelector).attr('src', rqData.data.url).show();
                    $(".uploadify-button-text:eq(2)").html('重新上传');
                } else {
                    $("#mapMsg").html("上传失败，请重新上传").show();
                }
            },
            onUploadError: function() {
                TVC.hideLoading();
                $("#mapMsg").html("上传失败，请重新上传").show();
            },
            onUploadProgress: function (file, fileBytesLoaded, fileTotalBytes) {
                //uploadify-button-text
                var total = new Number(fileTotalBytes / 1024).toFixed(2);
                var percentage = Math.round(fileBytesLoaded / fileTotalBytes * 100);
                if(percentage > 99){
                    percentage = 99;
                    total = new Number(fileTotalBytes * 0.9 / 1024).toFixed(2);
                }

                var text = '<span class="color-grey">已上传(' + total + 'k)...' + percentage + '%</span>';

                $("#mapMsg").html(text).show();
            }
        });
    }

    $(".deleteScenicPic").click(function(){
        $(this).hide();
        $("#scenic_pic").hide()
        $("#scenic_pid").attr("value",'');
        $(".uploadify-button-text:eq(0)").html('点击上传')
    })

    $(".deleteMapPic").click(function(){
        $(this).hide();
        $("#map_pic").hide()
        $("#map_pid").attr("value",'');
        $(".uploadify-button-text:eq(2)").html('点击上传')
    })



    $(".clickShowBigImg").unbind("mouseover").on("mouseover", function(){
        $(this).next().show();
    }).unbind("mouseout").on("mouseout", function(){
        $(this).next().hide();
    });
    $("[name=close_image]").unbind("mouseover").on("mouseover", function(){
        $(this).show();
    }).unbind("mouseout").on("mouseout", function(){
        $(this).hide();
    })

    var province    = $("select[name='province'] option:selected").val();
    var city        = $("select[name='city'] option:selected").val();
    if(province == '' && city == ''){
        var provinceChange = new TVC.provinceChangedInSelect("select[name='province']");
        $("select[name='province']").change(function(){
            provinceChange.provinceChanged("select[name='province']","select[name='city']");
        });
    }

    $("#addScenicFormSubmit").click(function(){
        //获取表单
        var checkSubmit      = 1;
        var scenicId         = $("input[name='id']").val();
        var scenicName       = $("input[name='scenicName']").val();
        var publicity        = $("textarea[name='publicity']").val();
        var star             = $("input[name='star']:checked").val();
        var province         = $("select[name='province'] option:selected").val();
        var city             = $("select[name='city'] option:selected").val();
        var scenic_pid       = $("input[name='scenic_pid']").val();
        var audio_id         = $("input[name='audio_id']").val();
        var map_pid          = $("input[name='map_pid']").val();
        var lnglat           = $("input[name='lnglat']").val();

        var description      = descriptionData.getContent();
        var tripLine         = tripLineData.getContent();
        var tip              = tipData.getContent();
        var ticket           = ticketData.getContent();
        var traffic          = trafficData.getContent();

        var addScenicFormId  = $("#addScenicFormId").val();

        if(addScenicFormId){
            var scenicAjaxUrl = "/scenic/update";
            var refreshType = "no";
        }else{
            var scenicAjaxUrl = "/scenic/add";
            var refreshType = "yes";
        }

        if(!scenicName){
            $("#scenicNameMsg").html('请输入景点名称');
            $("#scenicNameMsg").css("display","block");
            checkSubmit = 0;
        }else{
            $("#scenicNameMsg").css("display","none");
        }

        if(scenicName.length > $("#scenicNameCountNum").attr("max")){
            checkSubmit = 0;
            $("#scenicNameMsg").html('字符超出限制');
            $("#scenicNameMsg").css("display","block");
        }

        if(isNaN(star)){
            $("#starMsg").html("请选择星级");
            $("#starMsg").css("display","block");
            checkSubmit = 0;
        }else{
            $("#starMsg").css("display","none");
        }

        if(!province || !city){
            $("#positionMsg").html("请选择地区");
            $("#positionMsg").css("display","block");
            checkSubmit = 0;
        }else if(province && city){
            $("#positionMsg").css("display","none");
        }

        if(!lnglat || !lnglat.match(/^\d+\.\d+\|\d+\.\d+$/)){
            $("#lnglatMsg").html("请输入坐标");
            $("#lnglatMsg").css("display","block");
            checkSubmit = 0;
        }else{
            $("#lnglatMsg").css("display","none");
        }

        if(!publicity){
            $("#scenicPublicityMsg").html("请输入景区宣传语");
            $("#scenicPublicityMsg").css("display","block");
            checkSubmit = 0;
        }else{
            $("#scenicPublicityMsg").css("display","none");
        }

        if(publicity.length > $("#scenicPublicityCountNum").attr("max")){
            checkSubmit = 0;
            $("#scenicPublicityMsg").html("字符超出限制");
            $("#scenicPublicityMsg").css("display","block");
        }

        if(!description){
            $("#scenicDescriptionMsg").html("请输入景区简介");
            $("#scenicDescriptionMsg").css("display","block");
            checkSubmit = 0;
        }else{
            $("#scenicDescriptionMsg").css("display","none");
        }

        if(!tripLine){
            $("#scenicTripLineMsg").html("请输入路线信息");
            $("#scenicTripLineMsg").css("display","block");
            checkSubmit = 0;
        }else{
            $("#scenicTripLineMsg").css("display","none");
        }

        if(!tip){
            $("#scenicTipMsg").html("请输入贴士信息");
            $("#scenicTipMsg").css("display","block");
            checkSubmit = 0;
        }else{
            $("#scenicTipMsg").css("display","none");
        }

        if(!ticket){
            $("#scenicTicketMsg").html("请输入门票信息");
            $("#scenicTicketMsg").css("display","block");
            checkSubmit = 0;
        }else{
            $("#scenicTicketMsg").css("display","none");
        }

        if(!traffic){
            $("#scenicTrafficMsg").html("请输入交通信息");
            $("#scenicTrafficMsg").css("display","block");
            checkSubmit = 0;
        }else{
            $("#scenicTrafficMsg").css("display","none");
        }
        var scenic_pid  = $("input[name='scenic_pid']").val();
        var audio_id    = $("input[name='audio_id']").val();
        var map_pid     = $("input[name='map_pid']").val();

        if(!scenic_pid){
            $("#scenicMsg").html('请上传景区图片');
            checkSubmit = 0;
        }

        if(checkSubmit){
            $.ajax({
                url: scenicAjaxUrl,
                data: {"id":scenicId, "name":scenicName, "star":star, "province":province, "city":city, "scenic_pid":scenic_pid, "audio_id":audio_id, "map_pid":map_pid, "lnglat":lnglat, "publicity":publicity, "description":description, "tripLine":tripLine, "tip":tip, "ticket":ticket, "traffic":traffic},
                type: "POST",
                dataType: "json",
                beforeSend: function()
                {
                    TVC.showLoading('');
                },
                success: function(jsonData) {
                    TVC.hideLoading();
                    _isFormChanged.isShow = false;
                    switch (jsonData.message)
                    {
                        case 'success':
                            TVC.showTip('保存成功');if(refreshType == 'yes') location.reload();break;
                        default:
                            TVC.alert('保存失败，请重新提交');break;
                    }
                },
                error: function() {
                    TVC.hideLoading();
                    TVC.alert('保存失败，请重新提交');
                }
            });
        }
    })

    countWordsNum("#scenicNameCountNum", "#scenicName");
    countWordsNum("#scenicPublicityCountNum", "#publicity");
    function countWordsNum(num, name){
        var scenicNameCountNumInit = $(num).attr("max") - $(name).val().length;
        $(num).html(scenicNameCountNumInit);
        $(name).on("input propertychange keyup",function(){
            var scenicNameCountNum = $(name).val().length;
            $(num).html(scenicNameCountNum);
            var scenicNameCountNumMax = $(num).attr("max");
            if (scenicNameCountNum > scenicNameCountNumMax){
                $(num).css("color","red");
            }else{
                $(num).css("color","green");
            }
            var scenicNameCountNumRel = scenicNameCountNumMax - scenicNameCountNum;
            $(num).html(scenicNameCountNumRel);
        });
    }

    var Page = {
        init: init
    };
    Page.init();
    return Page;
});
