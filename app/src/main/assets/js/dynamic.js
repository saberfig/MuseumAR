/*展示静态文物模型界面*/

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
var bucketScale = 0.0047;//木桶模型的大小
var waterScale = 0.11;//倒水动画的模型大小
var oneFingerGestureAllowed = false;//先禁止单指模式识别（存疑）
var flag = true;

//定义方法，启动二指模式识别（存疑）
AR.context.on2FingerGestureStarted = function() {
    oneFingerGestureAllowed = false;
};

//定义方法，js文件的入口
var World = {
    loaded: false,
    drawables: [],//里面存放所有的文物静态模型和小精灵（第一个对象）

    //初始化方法，先创建展示的静态模型资源，再创建对象跟踪器
    init: function initFn() {
        World.createModels();
        World.createTracker();
    },

    //创建对象跟踪器
    createTracker: function createTrackerFn() {
        //声明并加载对象识别文件：tracker.wto
        this.targetCollectionResource = new AR.TargetCollectionResource("assets/object/houMuWuDing.wto", {
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

        //创建音频资源
        this.introductionSound0 = new AR.Sound("assets/audio/defaultAudio.mp3", {
            onError: World.onError
        });//默认音频，在初始时点击小精灵用到

        this.introductionSound1 = new AR.Sound("assets/audio/audio1.mp3", {
            onError: World.onError
        });

        //音频加载
        this.introductionSound0.load();
        this.introductionSound1.load();

        /*添加小精灵的模型*/
        this.elf = new AR.Model("assets/augmented/elf.wt3",{
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
                World.playIntroduction(flag);
            },
            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

        /*添加后母戊鼎的静态文物3D模型*/
        this.bucket = new AR.Model("assets/augmented/bucket.wt3", {
            scale: {
                x: bucketScale,
                y: bucketScale,
                z: bucketScale
            },
            translate: {
                x: 0.827,
                y: 0.509,
                z: 0.107
            },
            rotate: {
                global:{
                    x:320,
                    y:90,
                    z:90
                }
            },

            //移动
            onPanBegan: function() {
                oneFingerGestureAllowed=false;
                return true;
            },
            onPanChanged: function(x,y) {
                //有问题，把y轴都换成了z轴
                this.translate={
                    x:previousTranslateValue.x+x,
                    z:previousTranslateValue.z-y
                }
                return true;
            },
            onPanEnded: function() {
                previousTranslateValue.x=this.translate.x;
                previousTranslateValue.z=this.translate.z;

               // World.playWaterAnimation();
                return true;
            },

            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

//        this.boiledWater = new AR.Model("assets/augmented/boiledWater.wt3",{
//            scale:{
//                x:waterScale,
//                y:waterScale,
//                z:waterScale
//            },
//            translate:{
//                x:-0.302,
//                y:0.981,
//                z:-0.17
//            },
//            rotate:{
//                 global:{
//                    x:270,
//                    y:0,
//                    z:0
//                }
//            }
//            enabled: false,//最初设置模型为不可用
//            onLoaded: World.showInfoBar,
//            onError: World.onError
//        });


        //将创建的所有3D模型添加到drawables数组中，方便多资源调用
        World.drawables.push(this.elf);
        World.drawables.push(this.bucket);
//        World.drawables.push(this.boiledWater);

    },



    //对象识别成功时，设置drawables数组中所有的模型为可见
    objectRecognized: function objectRecognizedFn() {
        World.hideInfoBar();
        World.setAugmentationsEnabled(true);
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
    playIntroduction:function playIntroductionFn(enabled){
        if(enabled == true){
            World.introductionSound0.play();
            flag = false;
        }
        else{
            World.introductionSound1.play();
            flag = true;
        }
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
