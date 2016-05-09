$(function(){
    function init() {
        bindTopMenuTabEvent();
        initMenuStatus();
    }

    /*********选中一级菜单后默认显示其二级菜单下的第一个子模块内容***********/
    function bindTopMenuTabEvent() {
        $("a[name=first_class_menu]").click(function(){
            var key = $(this).text();
            var url = $("#left_menu_index_" + key + " a:first").attr("href");
            TVC.redirect(url);
        });
    }
    
    function initMenuStatus() {
        $("#left_menu_zone [name=menu]").each(function () {
            var submenu = $(this).children("a").first();
            var link = submenu.attr("href");
            var pathname = $("#link_url").val();

            if (link === pathname) {  //-1 !== link.indexOf(pathname)
                $(this).children("a").addClass("clicked");    //选中当前二级菜单的第一个子模块
                //根据二级菜单找到其所属的一级菜单，并使其处于选中
                var choosedLeftMenu = $(this).parent().parent().attr("id");
                var key = choosedLeftMenu.replace("left_menu_index_", "");
                $("a[name=first_class_menu]").removeClass("selected");
                $("[name=left_menu]").hide();
                $("#left_menu_index_" + key).show();  //显示所有该一级菜单下的二级菜单
                $("a[name=first_class_menu]").each(function(){
                    if ($(this).text() == key) {
                        $(this).addClass("selected");
                    }
                });
            }
        });
    }
    
    var LeftMenu = {
        init: init
    };

    LeftMenu.init();
    return LeftMenu;
});