/*展示增强模型的游戏界面*/

//声明全局变量，存储控制的模型的位置数据
var previousTranslateValue={
    x:0,
    y:0,
    z:0
};

//声明全局变量，存储控制的模型的角度数据
var previousRotationValue={
    x:0,
    y:0,
    z:0
};

var previousScaleValue = 0.002;//全局变量，表示文物静态模型的大小
var elfScale = 0.03;//全局变量，表示小精灵的大小

var woodScale = 0.02;//木头模型的大小
var fireScale = 0.02;//火苗模型的大小
var bucketScale = 0.02;//木桶模型的大小
var boiledWaterScale = 0.02;//沸水模型的大小
var meetScale = 0.02;//肉的模型大小

var oneFingerGestureAllowed = false;//先禁止单指模式识别（存疑）

//定义方法，启动二指模式识别（存疑）
AR.context.on2FingerGestureStarted = function() {
    oneFingerGestureAllowed = false;
};

//定义方法，js文件的入口
var World = {
    loaded: false,
    drawables: [],//里面存放所有的文物静态模型和小精灵（第一个对象）
    paths:[
        "assets/object/elf.wt3",
        "assets/object/houMuWuDing.wto",
        "assets/object/goat.wt3",
        "assets/object/wood.wt3",
        "assets/object/meet.wt3",
    ],//第一个路径为小精灵需要加载的模型位置，第二个为被识别的文物wto文件的位置
    audios:[
        "assets/audio/audio1.mp3",
        "assets/audio/audio2.mp3",
        "assets/audio/audio3.mp3"
    ],
    flags:[
        false,
        false,
        false,
    ],

    //初始化方法，先创建展示的静态模型资源，再创建对象跟踪器
    init: function initFn() {
        World.createModels();
        World.createTracker();
    },

    //创建对象跟踪器
    createTracker: function createTrackerFn() {
        //声明并加载对象识别文件：tracker.wto
        this.targetCollectionResource = new AR.TargetCollectionResource(World.paths[1], {
            onError: World.onError
        });
        //利用wto文件创建跟踪器tracker
        this.tracker = new AR.ObjectTracker(this.targetCollectionResource, {
            onError: World.onError
        });
        //根据识别对象的名字加载识别资源
        this.objectTrackable = new AR.ObjectTrackable(this.tracker, "*", {
            drawables: {
                cam: World.drawables
            },
            onObjectRecognized: World.objectRecognized,//如果识别成功，调用该回调方法
            onObjectLost: World.objectLost,//如果是被对象消失，调用该回调方法
            onError: World.onError//如果出现错误，调用onError方法
        });
    },


    /*创建展示的静态3D模型，所有可能出现的模型都在drawables数组中一次性加载的情况*/
    createModels:function createModelsFn(){

        /*小精灵的模型*/
        this.elf = new AR.Model(World.paths[0],{
            scale: {
                x: elfScale,
                y: elfScale,
                z: elfScale
            },
            translate: {
                x: 0.915,
                y: 1.414,
                z: 0.092
            },
            rotate: {
                global:{
                    x:0,
                    y:0,
                    z:0
                }
            },
            onClick: function() {
                World.playIntroduction();
            },
            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

        /*木桶（可拖动）的按键对应的模型*/
        this.bucket = new AR.Model(World.paths[2],{
            scale: {
                x: bucketScale,
                y: bucketScale,
                z: bucketScale
            },
            translate: {
                x: 0.915,
                y: 1.414,
                z: 0.092
            },
            rotate: {
                global:{
                    x:0,
                    y:0,
                    z:0
                }
            },

            onDragBegan: function( /*x, y*/ ) {
                oneFingerGestureAllowed = true;
                return true;
            },
            onDragChanged: function(x, y, intersectionX, intersectionY) {
                if (oneFingerGestureAllowed&&World.flags[0]==true) {
                    this.translate = {
                        x: intersectionX,
                        y: intersectionY
                    };
                }
                return true;
            },
            onDragEnded: function( /*x, y*/ ) {
                if(this.translate.x<0&&this.translate.x>-1&&this.translate.y>-2&&this.translate.y<-1){
                    this.translate.x=-0.2;
                    this.translate.y=-0.7;
                    // var audio=document.getElementById("audioSrc");
                    // audio.src="assets/audio/audio2.mp3";
                    // audio.play();
                    World.playIntroduction();
                    World.playWaterAnimation();
                    World.flags[0] = false;
                    World.flags[1] = true;
                    World.flags[2] = false;//待处理
                }
                else{
                    this.translate.x=1;
                    this.translate.y=1;
                }
                return true;
            },


            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });


        /*木头（可拖动）按键对应的模型*/
        this.wood = new AR.Model(World.paths[3],{
            scale: {
                x: woodScale,
                y: woodScale,
                z: woodScale
            },
            translate: {
                x: 0.915,
                y: 1.414,
                z: 0.092
            },
            rotate: {
                global:{
                    x:0,
                    y:0,
                    z:0
                }
            },

            onDragBegan: function( /*x, y*/ ) {
                oneFingerGestureAllowed = true;
                return true;
            },
            onDragChanged: function(x, y, intersectionX, intersectionY) {
                if (oneFingerGestureAllowed) {
                    this.translate = {
                        x: intersectionX,
                        y: intersectionY
                    };
                }
                return true;
            },
            onDragEnded: function( /*x, y*/ ) {
                if(this.translate.x<0&&this.translate.x>-2&&this.translate.y>0.5&&this.translate.y<1.5){
                    this.translate.x=-0.2;
                    this.translate.y=1.5;
                    // var audio=document.getElementById("audioSrc");
                    // audio.src="assets/audio/audio3.mp3";
                    // audio.play();
                    World.playIntroduction();
                    World.playFireAnimation();
                    World.flags[0] = false;
                    World.flags[1] = true;
                    World.flags[2] = false;
                }
                else{
                    this.translate.x=1;
                    this.translate.y=0;
                }
                return true;
            },


            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });


        /*肉（可拖动）按键对应的模型*/
        this.meet = new AR.Model(World.paths[4],{
            scale: {
                x: meetScale,
                y: meetScale,
                z: meetScale
            },
            translate: {
                x: 0.915,
                y: 1.414,
                z: 0.092
            },
            rotate: {
                global:{
                    x:0,
                    y:0,
                    z:0
                }
            },


            onDragBegan: function( /*x, y*/ ) {
                oneFingerGestureAllowed = true;

                return true;
            },
            onDragChanged: function(x, y, intersectionX, intersectionY) {
                if (oneFingerGestureAllowed) {
                    this.translate = {
                        x: intersectionX,
                        y: intersectionY
                    };
                }
                return true;
            },
            onDragEnded: function( /*x, y*/ ) {
                this.enabled = false;//让肉不可见
                return true;
            },


            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError

        });


        /*水（不可交互，只播放动画）的按键对应的模型*/
        this.bucket = new AR.Model("ssets/object/boiledWater.wt3",{
            scale: {
                x: boiledWaterScale,
                y: boiledWaterScale,
                z: boiledWaterScale
            },
            translate: {
                x: 0.915,
                y: 1.414,
                z: 0.092
            },
            rotate: {
                global:{
                    x:0,
                    y:0,
                    z:0
                }
            },
            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

        /*火焰（不可交互，主要播放动画）的3D模型*/
        this.fire = new AR.Model("assets/object/fire.wt3",{
            scale: {
                x: fireScale,
                y: fireScale,
                z: fireScale
            },
            translate: {
                x: 0.915,
                y: 1.414,
                z: 0.092
            },
            rotate: {
                global:{
                    x:0,
                    y:0,
                    z:0
                }
            },
            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

    
        //将创建的所有3D模型添加到drawables数组中，方便多资源调用
        World.drawables.push(this.elf);
        World.drawables.push(this.bucket);
        World.drawables.push(this.boiledWater);        
        World.drawables.push(this.wood);
        World.drawables.push(this.fire);
        World.drawables.push(this.meet);
    },

    //对象识别成功时，设置drawables数组中所有的模型为可见
    objectRecognized: function objectRecognizedFn() {
        World.hideInfoBar();
        World.setAugmentationsEnabled(true);
        World.appearingAnimation.start();//播放静态模型的出现动画
    },

    //对象丢失时将所有的模型设置为不可见
    objectLost: function objectLostFn() {
        World.setAugmentationsEnabled(false);
    },

    //设置所有的增强模型为enabled的值
    setAugmentationsEnabled: function setAugmentationsEnabledFn(enabled) {
        for (var i = 0; i < World.drawables.length; i++) {
            World.drawables[i].enabled = enabled;
        }
    },

    //小精灵播放语音，待完善
    playIntroduction:function playIntroductionFn(){
        //创建待播放的音频
        if(World.flags[0]==true){
            this.introductionSound = new AR.Sound(World.audios[0], {
            onError: World.onError
            });
        }
        else if (World.flag[1] == true){
            this.introductionSound = new AR.Sound(World.audios[1], {
            onError: World.onError
            });
        }else if (World.flag[2] == true){
            this.introductionSound = new AR.Sound(World.audios[2], {
            onError: World.onError
            });
        }
       
        this.introductionSound.load();

        World.introductionSound.play();
        // if( World.introductionSound.state == AR.CONST.STATE.LOADED ){
        //     World.introductionSound.play();
        //     if( World.introductionSound.state == AR.CONST.STATE.PLAYING ){//如果正在播放，点击则暂停
        //         World.introductionSound.pause();
        //     }else if( World.introductionSound.state ==  AR.CONST.STATE.PAUSE ){//如果正在暂停，点击恢复播放
        //         World.introductionSound.resume();
        //     }else{
        //         World.introductionSound.play();
        //     }
        // }else if(World.introductionSound.state ==  AR.CONST.STATE.LOADING ){
        //     World.showInfoBar(); //音频还在加载中则显示
        // }
    },

    //播放沸水的动画
    playWaterAnimation:function playWaterAnimationFn(){

    },

    //播放燃烧火焰的动画
    playFireAnimation:function playFireAnimationFn(){

    },


    onError: function onErrorFn(error) {
        alert(error);
    },

    hideInfoBar: function hideInfoBarFn() {
        document.getElementById("infoBox").style.display = "none";
    },

    showInfoBar: function worldLoadedFn() {
        document.getElementById("infoBox").style.display = "table";
        document.getElementById("loadingMessage").style.display = "none";
    }
};

World.init();