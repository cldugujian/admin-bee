window.onload = function () {
	
    // 加载完成时去除加载动画
    common();

    // 全局对象
    let global = {
        // 本地存储
        storage:window.localStorage,
        // 提示消息
        tips:function (type,txt) {
            if( $(".tips").length === 0 ){
                let tips = $("<div/>")
                    .addClass("flex_center tips"+" tips_"+type)
                    .text(txt).appendTo("body")
                    .fadeIn(500)
                    .delay(1000)
                    .fadeOut(500,function () {
                        $(this).remove();
                    });
            }
        },
    };
	
    // 音量
    let volume = {
	    music: global.storage.getItem("storageSetting") && JSON.parse(global.storage.getItem("storageSetting"))[2],
	    effect:global.storage.getItem("storageSetting") && JSON.parse(global.storage.getItem("storageSetting"))[3],
    };
    
	// 所有声音
	let sound = {
		
		// 战斗界面背景音乐
		battle:new Howl({ src:[ './sound/battle.mp3','./sound/battle.ogg' ],loop:true,volume:volume.music, }),
		// 击中敌机
		boom_enemy_00:new Howl({ src:[ './sound/boom_enemy_00.mp3','./sound/boom_enemy_00.wav' ],volume:volume.effect }),
		// 击毁敌机
		boom_enemy_01:new Howl({ src:[ './sound/boom_enemy_01.mp3','./sound/boom_enemy_01.ogg','./sound/boom_enemy_01.wav' ],volume:volume.effect }),
		// 敌机爆炸
		boom_plane:new Howl({ src:[ './sound/boom_plane.mp3','./sound/boom_plane.ogg','./sound/boom_plane.wav' ],volume:volume.effect }),
		// 点击按钮
		click:new Howl({ src:[ './sound/click.mp3','./sound/click.wav' ],volume:volume.effect }),
		// 敌机追踪主机
		enemy_fall:new Howl({ src:[ './sound/enemy_fall.mp3','./sound/enemy_fall.wav' ],volume:volume.effect }),
		// 错误
		error:new Howl({ src:[ './sound/error.mp3','./sound/error.wav' ],volume:volume.effect }),
		// 失败
		fail:new Howl({ src:[ './sound/fail.mp3','./sound/fail.ogg','./sound/fail.wav' ],volume:volume.effect }),
		// 菜单界面背景音乐
		menu:new Howl({ src:[ './sound/menu.mp3','./sound/menu.ogg' ],loop:true,volume:volume.music, }),
		// 菜单界面飞机飞出来
		plane_00:new Howl({ src:[ './sound/plane_00.mp3','./sound/plane_00.ogg','./sound/plane_00.wav' ],volume:volume.effect }),
		// 战斗界面飞机飞出来
		plane_01:new Howl({ src:[ './sound/plane_01.mp3','./sound/plane_01.ogg','./sound/plane_01.wav' ],volume:volume.effect }),
		// 生成敌机
		refresh:new Howl({ src:[ './sound/refresh.mp3','./sound/refresh.ogg' ],volume:volume.effect }),
		// 射击
		shot:new Howl({ src:[ './sound/shot.mp3','./sound/shot.ogg','./sound/shot.wav' ],volume:volume.effect }),
		// 胜利
		victory:new Howl({ src:[ './sound/victory.mp3','./sound/victory.ogg','./sound/victory.wav' ],volume:volume.effect }),
		
	};
	
	// 菜单背景音乐
	let soundMenu;
	// 战斗背景音乐
	let soundBattle;

    // 小蜜蜂主逻辑
    let bee = {

        isFirst: true,                            // 是否是刚进入游戏

        gameMain:$("#js_game_main"),

        bg: $("#js_bee_main"),                   // 背景

        plane: $("#js_spirit"),                   // 主机
        planBullet: null,                        // 主机子弹
        planBulletSpeed: 500 / framesPerSecond,  // 主机子弹速度
        planBulletFrequency: 750,                // 主机子弹发射频率
        planBulletTime: null,                   // 主机子弹创建时间间隔

        frame: $("#js_bee_enemy"),              // 敌群
        enemyBase: null,                         // 敌群位置

        enemy: null,                            // 敌机
        enemyJumpTime: null,                    // 敌机跳出的时间间隔

        currentLevel: 0,  // 当前关卡

        timer: null,                            // 定时器

        gamma: 0,                               // 手机倾斜度
        sensitive: 1.2,                         // 倾斜敏感度(0.8-1.6)

        headerMargin: null,                      // 顶部间距
        footerMargin: null,                      // 底部间距

        // 关卡信息:标题、分数、连击、血量、狂暴模式
        info: {
            headerMargin: null,
            footerMargin: null,
            title: $("#js_bee_title").find("span"),
            score: $("#js_bee_score").find("span"),
            scoreDetail: 0,
            combo: $("#js_bee_combo").find("span"),
            comboDetail: 0,
            comboMax: 0,
            blood: $("#js_bee_blood"),
            bloodDetail: null,
            boost: $("#js_bee_boost"),
            boostDetail: null,
        },

        // 粒子爆炸效果
        part: {
            number: 15,
            radius: 10,
        },

        // 开始游戏后，需要延迟一段时间
        // 主机飞行的动画需要时间，记为delay.plane
        // 生成敌机需要时间，记为delay.enemy
        delay:{
            plane:750,
            mid:500,
            enemy:2000,
        },

        // 初始化
        init: function () {
            // 清空定时器
            this.gamePause();
            // 获取顶部间距
            this.info.headerMargin = $("#js_bee_header").height();
            // 获取底部间距
            this.info.footerMargin = $("#js_bee_footer").height();
            // 主机初始位置
            this.plane.css({left: (innerWidth - this.plane.width()) / 2});
            // 主机子弹初始化
            this.planBulletTime = Date.now();
            // 消除所有子弹
            this.planBullet && this.planBullet.remove();
            // 敌机跳出时间初始化
            this.enemyJumpTime = Date.now();
            // 背景起始位置
            this.bg.css({backgroundPositionY: "100%"});
            // 改变陀螺仪角度
            this.directionChange();
            // 关卡标题信息
            this.info.title.text(levelData[this.currentLevel].barrier);
            // 连击数信息
            this.info.comboDetail = 0;
            this.info.combo.text(this.info.comboDetail);
            // 分数信息
            this.info.scoreDetail = 0;
            this.info.score.text(this.info.scoreDetail);
            // 初始化游戏中最高关卡
            this.maxLevel();
            // 窗口焦点事件
            // this.gameInOut();
            // 窗口点击事件
            this.gameOption();
            // 显示游戏主界面
            this.gameMain.show();
            // 隐藏combo
	        $("#js_bee_combo").hide();
            // 清空敌机
            this.frame.empty();
        },
        // 初始化游戏中最高关卡
        maxLevel:function () {
            let storage = global.storage;
            // 初始化最高关卡
            if( !storage.getItem("maxLevel") ){
                let InitCurrentLevel = JSON.stringify(0);
                storage.setItem("maxLevel",InitCurrentLevel);
            }
        },
        // 生成敌机dom
        createDom: function () {
            // 敌机宽、高、每行个数、间距及总数
            let enemy = {
                width: 0.3,
                height: 0.225,
                space: 0.1,
                map: levelData[this.currentLevel].map,
                column: levelData[this.currentLevel].column,
            };
            this.frame.css({
                    width: enemy.column * enemy.width + (enemy.column - 1) * enemy.space + "rem",
                    left: (innerWidth - (enemy.column * enemy.width + (enemy.column - 1) * enemy.space) * 100 * innerWidth
                    /375) / 2,
                    top: this.info.headerMargin
                });
            // 生成敌机
            let arr = [];
            for (let i = 0; i < enemy.map.length; i++) {
                if (enemy.map[i] !== 0) {
                    let type = enemy.map[i];
                    arr[i] = $("<li/>")
                        .css({
                            width: enemy.width + "rem",
                            height: enemy.height + "rem",
                            left: (i % enemy.column * (enemy.width + enemy.space)).toFixed(2) + "rem",
                            top: (parseInt(i / enemy.column) * (enemy.height + enemy.space)).toFixed(2) + "rem",
                            backgroundPositionX: -(type-1)*enemy.width + "rem",
                            backgroundPositionY: '0',
                            backgroundSize: enemy.width*3 + "rem",
                        })
                        .attr({
                            // 该敌机类型
                            "data-type": type,
                            // 该敌机血量
                            "data-blood": type,
                            // 该敌机速度
                            "data-speed": 0.6 + 0.2 * type,
                            // 该敌机携带的额外分数
                            "data-score": (type - 1) * 5,
                        });
                }
            }
            this.enemy = this.frame.append(arr).find("li");
            // 获取敌群的总宽度，每次横向移动速度及每次纵向位移值
            this.enemyBase = {
                totalWidth: parseFloat(this.frame.width()),
                speed: innerWidth / 360 * levelData[this.currentLevel].frameSpeed,
                offsetY: this.enemy.eq(0).height(),
            }
        },
        // 正式游戏前的短动画
        readyToPlay:function () {
            let _this = this;
            // 先让主机移除界面
            let initBottom = -( _this.plane.height() + parseFloat(_this.plane.css("bottom")) );
	        // 播放飞机飞行音效
	        let soundPlaneShort = sound.plane_01.volume(volume.effect).play();
	        // 暂停菜单背景音乐
	        sound.menu.stop(soundMenu);
	        // 然后缓缓飞出来
            _this.plane.show().css({ marginBottom:initBottom }).animate({ marginBottom:0 },_this.delay.plane,"easeOutBack",function () {
                // 获取敌机显示的间隔
                let delay = (_this.delay.enemy-_this.delay.mid)/levelData[_this.currentLevel].map.length;
                // 先隐藏所有敌机，之后依次出现，间隔为100ms
                setTimeout(function () {
	                // 播放敌机音效
	                let soundRefresh = sound.refresh.volume(volume.effect).play();
	                // 敌机依次出现
                    _this.enemy.css({ opacity:0 }).each(function () {
                        let that = $(this);
                        setTimeout(function () {
                            that.animate({ opacity:1 },300);
                        },that.index()*delay);
                    });
                },_this.delay.mid);
            });
	        // 播放战斗背景音乐
	        let soundBattle = sound.battle.play();
	        // 间隔后开始游戏
            setTimeout(function () {
            	// 开始游戏主循环
                _this.gameLoop();
            },_this.delay.plane + _this.delay.enemy);
        },
        // 主机移动
        planeMove: function (gamma) {
            // 设置速度
            let speed = Math.pow(Math.abs(gamma), this.sensitive) / 5;
            // 获取当前位置
            let currentLeft = parseFloat(this.plane.css("left"));
            // 主机移动
            if (gamma > 3 && (currentLeft + this.plane.width() <= innerWidth)) {
                this.plane.css({left: (currentLeft + this.plane.width() + speed <= innerWidth) ? (currentLeft + speed) : (innerWidth - this.plane.width())});
            }
            if (gamma < -3 && (currentLeft >= 0)) {
                this.plane.css({left: (currentLeft - speed >= 0) ? (currentLeft - speed) : 0});
            }
        },
        // 主机子弹
        planBulletHandler: function () {
            let _this = this;
            // 判断是否可以生成
            if ((Date.now() - _this.planBulletTime >= _this.planBulletFrequency)) {
                // 创建一个子弹
                _this.planBullet = $("<span class='bullet js_bullet'></span>");
                // 记录子弹生成时的时间
                _this.planBulletTime = Date.now();
                // 添加子弹
                _this.bg.append(_this.planBullet);
                // 播放子弹音效
	            let soundShot = sound.shot.volume(volume.effect).play();
                // 获取主机位置及宽度
                let plane = {
                    top: parseFloat(_this.plane.css("top")),
                    left: parseFloat(_this.plane.css("left")),
                    width: _this.plane.width(),
                };
                // 子弹宽高
                let bulletBase = {
                    width: _this.planBullet.width(),
                    height: _this.planBullet.height()
                };
                // 根据主机位置设置子弹初始位置
                _this.planBullet.css({
                    top: plane.top - bulletBase.height / 2,
                    left: plane.left + plane.width / 2 - bulletBase.width / 2
                });
            }
            // 重新获取子弹
            _this.planBullet = $(".js_bullet");
            // 先判断当前有没有子弹，如果有子弹，则判断子弹位置，如果子弹飞出了屏幕，则销毁，否则向上移动
            _this.planBullet.each(function () {
                let that = $(this);
                let currentTop = parseFloat(that.css("top"));
                if (currentTop >= 0) {
                    that.css({top: currentTop - _this.planBulletSpeed});
                } else {
                    that.remove();
                    _this.info.comboDetail = 0;
                }
            });
        },
        // 敌群移动
        frameMove: function (enemyBase) {
            let _this = this;
            // 敌群当前位置
            let enemyPos = {
                top: parseFloat(_this.frame.offset().top),
                left: parseFloat(_this.frame.offset().left)
            };
            // 敌群如果碰壁则反向，且往下移一格
            if ((enemyPos.left + enemyBase.totalWidth >= innerWidth + 0.1) || (enemyPos.left <= 0.1)) {
                enemyBase.speed = -enemyBase.speed;
                _this.frame.css({top: enemyPos.top + enemyBase.offsetY});
            }
            // 敌群移动
            _this.frame.css({left: enemyPos.left + enemyBase.speed});
        },
        // 背景移动
        backgroundMove: function () {
            // 获取当前位置
            let currentTop = parseFloat(this.bg.css("background-position-y"));
            // 如果到顶则重置位置
            if (currentTop <= 0) {
                this.bg.css({backgroundPositionY: "100%"});
            } else {
                this.bg.css({backgroundPositionY: currentTop - levelData[this.currentLevel].backgroundSpeed + "%"});
            }
        },
        // 碰撞检测算法
        isBump: function (obj1, obj2) {
            let target1 = {
                top: obj1.offset().top,
                left: obj1.offset().left,
                width: obj1.width(),
                height: obj1.height(),
            };
            let target2 = {
                top: obj2.offset().top,
                left: obj2.offset().left,
                width: obj2.width(),
                height: obj2.height(),
            };
            if (!((target1.left + target1.width < target2.left) || (target1.left > target2.left + target2.width) || (target1.top + target1.height < target2.top) || (target1.top > target2.top + target2.height))) {
                return true;
            }
        },
        // 碰撞检测
        bumpCheck: function () {
            let _this = this;
            this.enemy.each(function () {
                let thisEnemy = $(this);
                // 检测敌机与主机
                if ( _this.isBump($("#js_spirit_1"), thisEnemy) || _this.isBump($("#js_spirit_2"), thisEnemy) ) {
                	// 失败音效
	                let soundFail = sound.fail.volume(volume.effect).play();
                	// 主机爆炸音效
	                let soundBoomPlane = sound.boom_plane.volume(volume.effect).play();
                	// 主机爆炸
	                _this.particle(_this.plane.offset().left+_this.plane.width()/2, _this.plane.offset().top+_this.plane.height()/2, 3, 1);
	                // 主机隐藏
	                _this.plane.hide();
                    _this.gamePause();
                    _this.gameOver();
                }
                // 获取敌机的类型、血量及携带的额外分数
                let data = {
                    type: parseInt(thisEnemy.attr("data-type")),
                    blood: parseInt(thisEnemy.attr("data-blood")),
                    score: parseInt(thisEnemy.attr("data-score")),
                };
                // 检测敌机与子弹，如果碰到了，则消除子弹，敌机血量-1，并重新创建一个子弹
                _this.planBullet.each(function () {
                    let that = $(this);
                    if (_this.isBump(that, thisEnemy)) {
                        // 消除子弹
                        that.remove();
                        // 获取坐标
                        let x = thisEnemy.offset().left + thisEnemy.width() / 2;
                        let y = thisEnemy.offset().top + thisEnemy.height() / 2;
                        // 爆炸粒子
                        _this.particle(x, y, data.type, data.blood);
                        // 如果血量为1，则移除敌机，否则血量-1
                        if (data.blood === 1) {
                        	// 敌机爆炸音效
	                        let soundBoomEnemy01 = sound.boom_enemy_01.volume(volume.effect).play();
                        	// 移除敌机
                            thisEnemy.remove();
                            // 延迟更新分数与连击数
                            setTimeout(function () {
                                // 更新连击
                                _this.updateCombo();
                                // 更新分数
                                _this.updateScore(data.score);
                            }, 800);
                        } else {
	                        // 敌机破损音效
	                        let soundBoomEnemy00 = sound.boom_enemy_00.volume(volume.effect).play();
	                        // 敌机血量减1
                            thisEnemy.attr("data-blood", --data.blood);
                            let bgPosition = parseFloat(thisEnemy.css("background-position-y"));
                            thisEnemy.css({
                                backgroundPositionY:bgPosition-thisEnemy.height()+"px"
                            });
                        }
                    }
                });
                // 检测敌机(非活跃敌机)有没有飞过主机底线
                if (!thisEnemy.hasClass("active")) {
                    if (thisEnemy.offset().top + thisEnemy.height() >= _this.plane.offset().top) {
	                    // 失败音效
	                    let soundFail = sound.fail.volume(volume.effect).play();
	                    // 主机爆炸音效
	                    let soundBoomPlane = sound.boom_plane.volume(volume.effect).play();
	                    // 主机爆炸
	                    _this.particle(_this.plane.offset().left+_this.plane.width()/2, _this.plane.offset().top+_this.plane.height()/2, 3, 1);
	                    // 主机隐藏
	                    _this.plane.hide();
                        _this.gamePause();
                        _this.gameOver();
                    }
                }
            });
        },
        // 随机数
        random: function (range, base) {
            return parseInt(Math.random() * range) + base;
        },
        // 爆炸粒子
        particle: function (x, y, type, blood) {
            let flag = blood === 1;
            let _this = this;
            // 空数组，用于存储粒子dom
            let spanList = [];
            // 空数组，用于存储粒子位置
            let random = [];
            // 粒子数据
            let part = {};
            // 粒子的大小(根据敌机血量)
            part.size = (innerWidth / 360) * (flag ? 3 : 2);
            // 粒子的数量(根据敌机血量)
            part.number = flag ? _this.part.number+(type-1)*10 : _this.part.number;
            // 粒子的半径(根据敌机血量)
            part.radius = flag ? (innerWidth/360)*(_this.part.radius+(type-1)*3) : _this.part.radius;
            // 粒子的颜色
            part.color = [
                ["#fff", "#96ff30", "#30ff48"],  // 绿色
                ["#fff", "#0cbefc", "#1f9eff"],  // 蓝色
                ["#fff", "#ff5599", "#ff5555"],  // 红色
            ];
            // 生成粒子的父容器
            let par = $("<div/>").attr({class: "particle",});
            for (let i = 0; i < part.number; i++) {
                // 生成粒子，并设置初始位置、宽高及颜色
                spanList[i] = $("<span/>").css({
                    left: x - part.size / 2,
                    width: part.size,
                    height: part.size,
                    backgroundColor: part.color[type - 1][_this.random(3, 0)]
                });
                // 粒子的top值(根据敌机血量)
                spanList[i].css({ top: (flag ? (y - part.size / 2) : y) });
                // 设置爆炸范围，形成一个圆形
                let ranX = _this.random(part.radius * 2, -part.radius);
                let ranCache = Math.sqrt(part.radius * part.radius - ranX * ranX);
                let ranY = _this.random(ranCache * 2, -ranCache);
                // 随机设置粒子的位置
                random[i] = {x: ranX, y: ranY};
            }
            // 页面中添加粒子
            $("body").append(par.append(spanList));
            // 设置粒子的运动路径
            let time1 = 300, time2 = 600;
            par.find("span").each(function () {
                let that = $(this);
                let index = that.index();

                if( flag ){
                    // 粒子的终点
                    let finalX = _this.info.score.offset().left + _this.info.score.width() / 2;
                    let finalY = _this.info.score.offset().top + _this.info.score.height() / 2;
                    // 先炸开，然后全部运动到分数并淡出，之后销毁
                    that.css({
                        top: y + random[index].y,
                        left: x + random[index].x
                    });
	                setTimeout(function () {
		                that.css({
			                top: finalY,
			                left: finalX,
			                opacity: 0.1
		                });
		                setTimeout(function () {
			                that.parent().remove();
		                },500);
	                },index * time1 / part.number);
                }else{
                    // 炸开并淡出，之后销毁
                    that.css({
                            top: y + random[index].y,
                            left: x + random[index].x,
                            opacity:0.8,
                        });
	                setTimeout(function () {
		                if( !that.hasClass("plane") ){
			                that.parent().remove();
		                }
	                },500);
                }

            });
        },
        // 追踪算法
        track: function (obj1, obj2) {

            let x1 = obj1.offset().left;
            let y1 = obj1.offset().top;
            let x2 = obj2.offset().left;
            let y2 = obj2.offset().top;

            let w1 = obj1.width();
            let h1 = obj1.height();
            let w2 = obj2.width();
            let h2 = obj2.height();

            // 获取两个目标中心点的距离
            let horizon = (x1 + w1 / 2) - (x2 + w2 / 2);
            let vertical = (y1 + h1 / 2) - (y2 + h2 / 2);
            let distance = Math.sqrt(horizon * horizon + vertical * vertical);

            let speed = obj1.attr("data-speed") * levelData[this.currentLevel].enemyTrackSpeed;

            // 获取追踪的偏移值
            let leftOffset = null;
            let topOffset = -(vertical / distance) * speed;

            // 水平方向的最大啊速度限制
            if (horizon > 3) {
                leftOffset = Math.max(-(horizon / distance) * speed, -1.2);
            } else if (horizon < -3) {
                leftOffset = Math.min(-(horizon / distance) * speed, 1.2);
            } else {
                leftOffset = 0;
            }

            // 垂直方向，如果越过了主机，则继续下落，当落到屏幕底端时返回屏幕顶端
            if (y1 + h1 >= y2 && y1 < innerHeight) {
                topOffset = Math.abs((vertical / distance) * speed) + 0.9;
            } else {
                topOffset = -(vertical / distance) * speed;
            }

            obj1.css({
                top: y1 <= innerHeight ? (y1 + topOffset) : -h1,
                left: x1 + leftOffset
            });

        },
        // 随机跳出飞机
        enemyJump: function () {
            let _this = this;
            // 判断间隔有没有到，如果到了，就随机选一个剩下的敌机，将其变成激活状态
            if( _this.enemy.length !== 0 ){
                if (Date.now() - _this.enemyJumpTime >= levelData[_this.currentLevel].enemyJumpFrequency) {
                    let random = parseInt(Math.random() * _this.enemy.length);
                    if (!_this.enemy.eq(random).hasClass("active")) {
                        // 在激活之前一定要先设置好位置，否则会乱掉
                        _this.enemy.eq(random)
                            .css({
                                top: _this.enemy.eq(random).offset().top,
                                left: _this.enemy.eq(random).offset().left,
                            })
                            .addClass("active");
                        // 重新设置间隔
                        _this.enemyJumpTime = Date.now();
                    }
                }
            }
        },
        // 激活的敌机添加追踪
        enemyActive: function () {
            let _this = this;
            _this.bg.find(".active").each(function () {
                let that = $(this);
                _this.track(that, _this.plane);
            });
        },
        // 判断有没有打完所有敌机
        isAllDestroyed: function () {
            let _this = this;
            // 重新获取敌机数量
            _this.enemy = _this.frame.find("li");
            // 如果敌机数量为0,则清除定时器，关数+1，并开始下一关
            if (_this.enemy.length === 0) {
	            console.log("打完了");
	            // 胜利音效
	            let soundVictory = sound.victory.volume(volume.effect).play();
	            // 先判断有没有开始过新游戏
	            if( !global.storage.getItem("isPlayed") ){
		            // 如果没有，则存储一个true值，并干开始游戏
		            global.storage.setItem("isPlayed",JSON.stringify(true));
	            }
                _this.gamePause();
                if( _this.currentLevel <= levelData.length - 2 ){
                    _this.currentLevel++;
                    // 获取存储中的最高关卡数
                    let storage = global.storage;
                    let currentMaxLevel = JSON.parse(storage.getItem("maxLevel"));
                    // 如果比当前数低，则更新最高关卡数
                    _this.currentLevel > currentMaxLevel && storage.setItem("maxLevel",JSON.stringify(_this.currentLevel));
                    _this.gamePass();
                }else{
                    _this.gameDone();
                }
            }
        },
        // 旋转设备时
        directionChange: function () {
            let _this = this;
            let flag = true;
            window.addEventListener("deviceorientation", function (event) {
                flag && (_this.gamma = event.gamma);
                flag = false;
                setTimeout(function () {
                    flag = true;
                }, 30);
            }, false);
        },
        // 更新连击数
        updateCombo: function () {
            // 连击数+1
            this.info.comboDetail++;
            // 更新最大连击数
            this.info.comboMax < this.info.comboDetail && (this.info.comboMax = this.info.comboDetail);
            // 文字替换
            this.info.combo.text(this.info.comboDetail);
            // 连击数大于3时显示连击，否则隐藏
            $("#js_bee_combo")[0].style.display = (this.info.comboDetail >= 3 ? "block" : "none");
        },
        // 更新分数
        updateScore: function (extraScore) {
            // 获取连击数及连击得分
            let combo = parseInt(this.info.comboDetail);
            let comboScore = 0;
            if (combo >= 3) {
                if (combo <= 5) {
                    comboScore = parseInt((combo - 2));
                } else if (5 < combo && combo <= 8) {
                    comboScore = parseInt((combo - 2) * 1.2);
                } else if (8 < combo && combo <= 12) {
                    comboScore = parseInt((combo - 2) * 1.4);
                } else if (12 < combo && combo <= 15) {
                    comboScore = parseInt((combo - 2) * 1.6);
                } else {
                    comboScore = parseInt((combo - 2) * 1.8);
                }
            }
            // 计算增加的分值 (基础分数+连击得分+类型额外得分)
            let increaseScore = 10 + comboScore + extraScore;
            // 获取当前分值
            let CurrentScore = parseInt(this.info.score.text());
            // 更新分数
            this.info.score.text(CurrentScore + increaseScore);
        },
        // 游戏主循环
        gameLoop: function () {
            let _this = this;
            // 主循环
            _this.timer = setInterval(function () {
                // 敌群移动
                _this.frameMove(_this.enemyBase);
                // 主机移动(先获取陀螺仪角度)
                _this.planeMove(_this.gamma);
                // 生成子弹并移动
                _this.planBulletHandler();
                // 碰撞检测
                _this.bumpCheck();
                // 判断有没有打完所有敌机
                _this.isAllDestroyed();
                // 背景层移动
                _this.backgroundMove();
                // 随机选一个敌机并激活
                _this.enemyJump();
                // 敌机和子弹更新
                _this.enemyActive();
            }, 1000 / framesPerSecond);
        },
        // 弹窗选项
        gameOption:function () {
            let _this = this;
	        $(".js_pop_gaming").find(".confirm")
		        .off()
		        .click(function () {
			        $(".scale-1").removeClass("scale-1");
			        sound.battle.stop(soundBattle);
			        _this.gameStart();
		        });
	        $(".js_pop_gaming").find(".cancel")
		        .off()
		        .click(function () {
			        $(".scale-1").removeClass("scale-1");
			        // 隐藏游戏主界面
			        _this.gameMain.hide();
			        // 返回主菜单
			        before.ele.beforeMain.fadeIn();
			        // 暂停战斗背景音乐
			        sound.battle.stop(soundBattle);
			        // 播放菜单背景音乐
			        sound.menu.play();
		        });
        },
        // 当前关卡通过
        gamePass:function () {
            $("#js_pop_pass").addClass("scale-1");
        },
        // 当前关卡失败
        gameOver: function () {
            $("#js_pop_over").addClass("scale-1");
            console.log("over~");
        },
        // 通关
        gameDone:function () {
            $("#js_pop_done").addClass("scale-1");
        },
        // 清空定时器
        gamePause: function () {
            clearInterval(this.timer);
            this.timer = null;
        },
        // 离开页面时暂停游戏,恢复页面时继续游戏
        gameInOut:function () {
            let _this = this;
            $(window).focus(function () {
                if( !_this.timer ){
                    _this.gameLoop();
                }
            }).blur(function () {
                _this.gamePause();
            });
        },
        // 游戏开始
        gameStart: function () {
            let _this = this;
            _this.init();
            _this.createDom();
            _this.readyToPlay();
        },

    };

    // 开始界面
    let before = {
        // dom元素
        ele:{
            bg:$("#js_game_before"),
            beforeMain:$("#js_game_before_main"),
            plane:$("#js_game_before_plane"),
            menu:$("#js_game_before_menu"),
            checkpoint:$("#js_checkpoint"),
            allMenuPop:$(".js_menu_pop"),
            setting:$("#js_setting"),
            dragSpan:$(".js_setting_item"),
            dragSpanRate:null,
        },
        // 内景图定时器
        timer:null,
        // 初始化
        init:function () {
            // 去除预加载的图片
            $("#pre_load").remove();
            // 滑杆比例校正
            this.dragSpanRateJustice();
            // 游戏设置 - 位置初始值
            this.settingInit();
        },
        // 滑杆比例校正
        dragSpanRateJustice:function () {
            let dragSpan = this.ele.dragSpan;
            this.ele.dragSpanRate = dragSpan.width()/dragSpan.parent().width();
        },
        // 背景图移动
        backgroundMove:function () {
            let _this = this;
            clearInterval( _this.timer );
            _this.timer = null;
            _this.timer = setInterval(function () {
                // 获取当前位置
                let currentTop = parseFloat(_this.ele.bg.css("background-position-y"));
                // 如果到顶则重置位置
                if (currentTop <= 0) {
                    _this.ele.bg.css({backgroundPositionY: "100%"});
                } else {
                    _this.ele.bg.css({backgroundPositionY: currentTop - levelData[1].backgroundSpeed + "%"});
                }
            },1000/framesPerSecond);
        },
        // 旋转设备
        directionChange:function () {
            let plane = this.ele.plane;
            window.addEventListener("deviceorientation", function (event) {
                plane.css({transform:"translateX("+ event.gamma*2 +"px) "});
            }, false);
        },
        // 开始游戏
        startGame:function (level) {
            this.ele.beforeMain.fadeOut(300,function () {
                bee.currentLevel = level;
                bee.gameStart();
            });
        },
        // 弹窗点击事件
        popHandler:function () {
            let _this = this;
            let popWarning = $("#js_pop_warning");
            popWarning.find(".btn").click(function () {
                let that = $(this);
                if( that.hasClass("confirm") ){
	                bee.currentLevel = 0;
                    _this.startGame(bee.currentLevel);
                    global.storage.removeItem("maxLevel");
                    global.storage.setItem("isPlayed",JSON.stringify(false));
                }
                popWarning.removeClass("scale-1");
            });
        },
        // 选择关卡 - 弹出
        checkpointShow:function () {
            let _this = this;
            let ele = _this.ele;
            // 获取返回按钮
            let btn = _this.ele.checkpoint.find(".btn");
            // 先隐藏主菜单，再依次显示各个关卡，并添加膨胀效果
            let listLength = ele.checkpoint.find("li").length;
            // 设置显示速度
            let speed = 75;
            ele.beforeMain.fadeOut(300,function () {
                ele.checkpoint.removeAttr("style").addClass("flex")
                    // 先去除选中
                    .find("li").removeClass("fade_in active").each(function () {
                    let that = $(this);
                    let index = that.index();
                    // 每隔75ms淡入关卡列表
                    setTimeout(function () {
                        that.addClass("fade_in checkpoint_scale");
                        setTimeout(function () {that.removeClass("checkpoint_scale");},100);
                    },speed*index);
                    // 获取最高关卡数
                    let maxLevel = JSON.parse(global.storage.getItem("maxLevel"));
                    // 所有关卡全部出现后，再每隔100ms显示已解锁的关卡
                    if( index <= maxLevel ){
                        setTimeout(function () {
                            setTimeout(function () {
                                that.addClass("active");
                            },speed*index*2);
                        },speed*listLength+750);
                    }
                });
                // 关卡全部显示之后，再显示返回按钮
                setTimeout(function () {
                    btn.addClass("fade_in checkpoint_scale");
                    setTimeout(function () {btn.removeClass("checkpoint_scale");},200);
                },speed*listLength+100);
            });
        },
        // 选择关卡 - 隐藏
        checkpointHide:function () {
            let ele = this.ele;
            // 选择关卡
            ele.allMenuPop.fadeOut(100,function () {
                ele.checkpoint.find(".btn").removeClass("fade_in").siblings().find("li").removeClass("fade_in active");
                ele.beforeMain.fadeIn();
            });
        },
        // 选择关卡 - 点击
        checkpointChoose:function () {
            let _this = this;
            let checkpoint = _this.ele.checkpoint;
            checkpoint.find("li").click(function () {
                let that = $(this);
                let index = that.index();
                let maxLevel = localStorage.getItem("maxLevel");
                if( index > maxLevel ){
                    global.tips(2,"请先解锁上一关卡！");
                    let soundError = sound.error.volume(volume.effect).play();
                }else{
                    checkpoint.fadeOut(300,function () {
                        bee.currentLevel = index;
                        bee.gameStart();
                    });
                }
            });
        },
        // 选择关卡 - 返回
        checkpointBack:function () {
            let _this = this;
            $("#js_checkpoint").find(".btn").click(function () {
                _this.checkpointHide();
            });
        },
        // 游戏设置 - 位置初始值
        settingInit:function () {
            let storage = global.storage;
            // 判断缓存中有没有设置，如果没有，则设置默认值0.44(居中)
            if( !storage.getItem("storageSetting") ){
                // 位置赋值
                let settingData = JSON.stringify([0.5,0.5,0.5,0.5]);
                storage.setItem("storageSetting",settingData);
            }
            let storageSetting = JSON.parse(storage.getItem("storageSetting"));
            // 存储滑杆初始位置
            let spanInitX = [
                storageSetting[0],
                storageSetting[1],
                storageSetting[2],
                storageSetting[3]
            ];
            // 获取滑杆元素
            let dragSpan = this.ele.dragSpan;
            let dragSpanRate = this.ele.dragSpanRate;
            // 根据存储值，设置初始位置
            for( let i=0; i<dragSpan.length; i++ ){
                dragSpan.eq(i).css({ left:spanInitX[i]*100*(1-dragSpanRate)+"%" });
            }
            bee.part.number = 5 + storageSetting[0]*30;
            bee.part.radius = 3 + bee.part.number/2;
            bee.sensitive = 0.8 + 0.8*storageSetting[1];
            volume.music = storageSetting[2];
            volume.effect = storageSetting[3];
        },
        // 游戏设置 - 弹出
        settingShow:function () {
            let _this = this;
            this.ele.beforeMain.fadeOut(300,function () {
                _this.ele.setting.show(0).animate({ top:0 },300,"easeOutBack")
            });
        },
        // 游戏设置 - 隐藏
        settingHide:function () {
            let _this = this;
            // 动画
            _this.ele.setting.animate({ top:"-100%" },300,"easeInBack",function () {
                $(this).hide();
                setTimeout(function () {_this.ele.beforeMain.fadeIn(300);},200);
                _this.settingInit();
            });
        },
        // 游戏设置 - 拖拽
        settingDrag:function () {
            let _this = this;
            // 存储初始按下的位置
            let eInitX = [ null,null,null,null ];
            // 存储滑杆初始位置
            let spanInitX = [];
            // 获取滑杆元素
            let dragSpan = _this.ele.dragSpan;
            // 滑动的开关，默认为关闭
            let flag = false;
            // 按下一瞬间
            dragSpan.on("touchstart",function (e) {
                e.preventDefault();
                // 启用滑动
                flag = true;
                let that = $(this);
                let index = that.index();
                // 手指初始位置
                eInitX = e.originalEvent.changedTouches[0].pageX;
                // 滑杆初始位置
                spanInitX[index] = parseFloat(that.css("left"));
            })
                // 滑动过程中
                .on("touchmove",function (e) {
                    e.preventDefault();
                    // 判断是否可以滑动
                    if( flag ){
	                    let that = $(this);
                        let index = that.index();
                        let parentIndex = that.parents(".setting_list").index();
                        let pageX = e.originalEvent.changedTouches[0].pageX;
                        // 算出最终的位置
                        let spanLeft = spanInitX[index]+(pageX-eInitX);
                        // 最大偏移值
                        let maxWidth = that.parent().width()-that.width();
                        // 判断有没有超出左边
                        spanLeft <= 0 && (spanLeft = 0);
                        // 判断有没有超出右边
                        spanLeft >= maxWidth && ( spanLeft = maxWidth );
                        // 位置赋值
                        that.css({ left:spanLeft });

                        /* 预留 - 音乐 */
                        if( parentIndex === 2 ){
                        	volume.music = spanLeft/maxWidth;
	                        sound.menu.volume(volume.music);
                        }

                        /* 预留 - 音效 */
                        if( parentIndex === 3 ){
                            console.log("音效");
                        }

                    }
                })
                // 放开一瞬间
                .on("touchend",function (e) {
                    e.preventDefault();
                    // 禁用滑动
                    flag = false;
                });
        },
        // 游戏设置 - 按钮
        settingHandler:function () {
            let _this = this;
            _this.ele.setting.find(".btn").click(function () {
                // 隐藏弹窗
                _this.settingHide();
                // 判断有没有确定，如果确定则更新存储
                if( $(this).hasClass("js_setting_confirm") ){
                    // 更新存储中的位置信息
                    let settingData = [];
                    _this.ele.dragSpan.each(function () {
                        let currentLeft = parseFloat($(this).css("left"));
                        let maxWidth = $(this).parent().width()-$(this).width();
                        settingData.push( (currentLeft/maxWidth).toFixed(3) );
                    });
                    global.storage.setItem("storageSetting",JSON.stringify(settingData));
                    // 更新存储中的设置信息并立即生效
                    _this.settingInit();
                }else{
                	// 重新定义音量
	                volume.music = JSON.parse(global.storage.getItem("storageSetting"))[2];
	                sound.menu.volume(volume.music);
                }
            });
        },
	    // 点击音效
	    soundHandler:function(){
        	$(".js_sound_click").click(function () {
		        let soundMenuClick = sound.click.volume(volume.effect).play();
	        });
	    },
        // 所有事件
        allHandler:function () {
            // 菜单点击事件
            this.menuClick();
            // 选择关卡 - 按钮
            this.checkpointBack();
            // 游戏设置 - 拖拽
            this.settingDrag();
            // 游戏设置 - 按钮
            this.settingHandler();
            // 选择关卡 - 点击
            this.checkpointChoose();
            // 弹窗点击事件
            this.popHandler();
	        // 点击音效
            this.soundHandler();
        },
        // 菜单动画
        menuAnimation:function () {
            let _this = this;
            let ele = _this.ele;
            let title = $("#js_game_before_title");
            // 飞机飞行音效
	        let soundPlaneFadeIn = sound.plane_00.volume(volume.effect).play();
	        // 飞机飞出来
            ele.plane.css({ top:innerHeight/1.1 }).show().delay(500).animate({ top:0 },1200,"easeOutCubic",function () {
	            // 播放菜单背景音乐
	            let soundMenu = sound.menu.play();
            	// 关闭飞机飞行音效
	            sound.plane_00.stop(soundPlaneFadeIn);
            	// 标题下来
                title.css({ top:-innerHeight/1.5 }).animate({ top:0 },600,"easeOutExpo",function () {
                	// 按钮滑入
                    ele.menu.find("li").each(function () {
                        let that = $(this);
                        let index = that.index();
                        setTimeout(function () {
                            that.addClass("move_back");
                        },70*index);
                    });
                });
            });

        },
        // 菜单点击事件
        menuClick:function () {
            let _this = this;
	        _this.ele.menu.find("li").click(function () {
                let index = $(this).index();
                switch (index){
                    // 开始游戏
                    case 0:
                        // 先判断有没有开始过新游戏
                        if( !global.storage.getItem("isPlayed") ){
                            // 如果没有，则开始游戏
                            _this.ele.beforeMain.fadeOut(300,function () {
                                bee.gameStart(bee.currentLevel);
                            });
                        }else{
                            $("#js_pop_warning").addClass("scale-1");
                        }
                        break;
                    // 选择关卡
                    case 1:
                        _this.checkpointShow();
                        break;
                    // 选项
                    case 2:
                        _this.settingShow();
                        break;
                    // 我的成就
                    case 3:
                        break;
                    // 退出游戏
                    case 4:
                        break;
                }
            });
        },
        // 运行
        run:function () {
            let _this = this;
            _this.init();
            _this.backgroundMove();
            setTimeout(function () {_this.menuAnimation();},500);
            setTimeout(function () {_this.directionChange();},3500);
            _this.allHandler();
        },
    };
	
    before.run();

};