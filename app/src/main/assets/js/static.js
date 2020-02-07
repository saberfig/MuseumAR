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

//全局变量，表示文物静态模型的大小
var previousScaleValue = 0.002;
//全局变量，表示小精灵的大小
var elfScale = 0.0;
//先禁止单指模式识别（存疑）
var oneFingerGestureAllowed = false;
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

        //创建待播放的音频
        this.introductionSound = new AR.Sound("assets/audio/audio1.mp3", {
            onLoaded: function() {//加载之后直接播放音频
                introductionSound.play();
            },
            onError: World.onError
        });
        this.introductionSound.load();//加载音频源

        /*添加小精灵的模型*/
        this.elf = new AR.Model("assets/object/elf.wt3",{
            scale: {
                x: 0.03,
                y: 0.03,
                z: 0.03
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

        /*添加后母戊鼎的静态文物3D模型*/
        this.houMuWuDing = new AR.Model("assets/object/houMuWuDing.wt3", {
            scale: {
                x: 0.002,
                y: 0.002,
                z: 0.002
            },
            translate: {
                x: -0.176,
                y: 0.751,
                z: 0.648
            },
            rotate: {
                global:{
                    x:270,
                    y:0,
                    z:0
                }
            },
            //旋转
            onDragBegan:function(){
                oneFingerGestureAllowed=true;
                return true;
            },
            onDragChanged:function(x,y,intersectionX, intersectionY){
                if(oneFingerGestureAllowed){
                    this.rotate={
                        x:previousRotationValue.x + y*250,
                        z:previousRotationValue.z + x*100
                    };
                }
                return true;
            },
            onDragEnded:function(){
                previousRotationValue.x=this.rotate.x;
                previousRotationValue.z=this.rotate.z;
                return true;
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
                return true;
            },
            //放大
            onScaleBegan: function() {
                oneFingerGestureAllowed=false;
                return true;
            },
            onScaleChanged: function(scale) {
                var scaleValue = previousScaleValue * scale;
                this.scale = {
                    x: scaleValue,
                    y: scaleValue,
                    z: scaleValue
                };
                return true;
            },
            onScaleEnded: function() {
                previousScaleValue = this.scale.x;
                return true;
            },
            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

         //播放后母戊鼎的出现时的缩放动画
        this.appearingAnimation = this.createAppearingAnimation(this.houMuWuDing, previousScaleValue);//这个参数的值？

        //将创建的所有3D模型添加到drawables数组中，方便多资源调用
        World.drawables.push(this.elf);
        World.drawables.push(this.houMuWuDing);

    },

    //对象识别成功时，设置drawables数组中所有的模型为可见
    objectRecognized: function objectRecognizedFn() {
        World.hideInfoBar();
        World.setAugmentationsEnabled(true);
        World.appear();//播放出现动画
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
    playIntroduction:function palyIntroductionFn(){
       World.introductionSound.play();
    },

    //创建静态模型的出现动画
    createAppearingAnimation: function createAppearingAnimationFn(model, scale) {

        var sx = new AR.PropertyAnimation(model, "scale.x", 0, scale, 1500, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
        });
        var sy = new AR.PropertyAnimation(model, "scale.y", 0, scale, 1500, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
        });
        var sz = new AR.PropertyAnimation(model, "scale.z", 0, scale, 1500, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
        });

        return new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [sx, sy, sz]);//返回一个动画组
    },

    appear: function appearFn() {
        World.hideInfoBar();
        World.appearingAnimation.start();//播放静态模型的出现动画
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