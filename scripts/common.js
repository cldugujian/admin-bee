function common(){

    // 去除加载动画
    $("#js_loading").fadeOut(300,function () {
        $(this).remove();
    });

    // 移动端适配
    let rem = {
        init:function () {
            $("html,body").height(innerHeight);
        },
        // 隐藏浏览器状态栏
        hideBar:function () {
            setTimeout(function() {
                window.scrollTo(0, 1)
            }, 0);
        },
        // 屏幕适配
        response:function () {
            let fontSize;
            fontSize = 100*innerWidth/360 + "px";
            $("html,body").css({ fontSize:fontSize });
        },
        // 窗口改变时也触发屏幕适配
        resize:function () {
            let _this = this;
            $(window).resize(function () {
                _this.response();
            });
        },
        // 执行以上所有方法
        run:function () {
            this.init();
            this.hideBar();
            this.response();
            this.resize();
        }
    };

    rem.run();

}