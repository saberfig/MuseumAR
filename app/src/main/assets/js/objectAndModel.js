//3D手势交互
//var defaultScaleValue = 0.5;
//现在的鼎的长宽高分别是2.231、1.705、1.883
//而之前的消防车的模型w:0.724、h:0.437、d:0.313

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
//声明全局变量，存储展示的模型的比例
var previousScaleValue = 0.45;
//声明变量，先禁止单指模式识别（存疑）
var oneFingerGestureAllowed = false;
//定义方法，启动二指模式识别（存疑）
AR.context.on2FingerGestureStarted = function() {
    oneFingerGestureAllowed = false;
};

//定义方法，js文件的入口
var World = {
    loaded: false,
    drawables: [],
    //与我无关的内容
    firetruckRotation: {
        x: 0,
        y: 0,
        z: 0
    },
    firetruckCenter: {
        x: 0,
        y: -0.14,
        z: 0
    },

    firetruckLength: 0.5,
    firetruckHeight: 0.28,

    //初始化方法，先创建展示的静态模型资源，再创建对象跟踪器
    init: function initFn() {
        World.createModels();
        World.createTracker();
    },

    //创建对象跟踪器
    createTracker: function createTrackerFn() {
        //声明并加载对象识别文件：tracker.wto
        this.targetCollectionResource = new AR.TargetCollectionResource("assets/object/Ding.wto", {
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
    //创建展示的静态3D模型
    createModels:function createModelsFn(){
        //与我无关的内容
        var screwdriverScale = 0.04 * this.firetruckLength;
        var screwdriverPositionX = -0.48 * this.firetruckLength;
        var screwdriverPositionY = -0.10 * this.firetruckLength;
        var screwdriverPositionZ = 0.40 * this.firetruckLength;

         //添加枪的3D模型
        this.modelGun = new AR.Model("assets/ding.wt3", {
            scale: {
                x: 0.02,
                y: 0.02,
                z: 0.02
            },
            translate: {
                x: -0.02,
                y: 0.67,
                z: 0.69//screwdriverPositionZ
            },
            rotate: {
            /*
            这里大有问题
            之前没有用global参数设置，模型不能在z轴旋转
            设置为global后，就没有问题了，我不知道，不想弄了*/
                global:{
                    x:-90,
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
        });//modelGun到这里创建完成
        //将创建的3D模型太监到drawablea数组中，方便多资源调用
        World.drawables.push(this.modelGun);
        this.tireButton = new AR.Model("assets/object/marker.wt3", {
            translate: {
                x: 0.05,
                y: 0.76,
                z: 0.42
            },
            rotate:{
                  x:0,
                  y:0,
                  z:0
            },
            // onClick: function() {
            //     World.runScrewdriverAnimation();//点击按钮运行枪的动画
            // },
            onError: World.onError
        });
        
       // World.addButtonAnimation(this.tireButton);//调用启动按钮的动画的函数
       // World.drawables.push(this.tireButton);
    },

    //按钮的动画函数，没有做任何修改
    addButtonAnimation: function addButtonAnimationFn(button) {
        var scaleS = 0.03 * this.firetruckLength;
        var scaleL = 0.04 * this.firetruckLength;
        var scaleDuration = 2000;

        /* X animations */
        var buttonScaleAnimationXOut = new AR.PropertyAnimation(button, "scale.x", scaleS, scaleL, scaleDuration / 2, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_SINE
        });
        var buttonScaleAnimationXIn = new AR.PropertyAnimation(button, "scale.x", scaleL, scaleS, scaleDuration / 2, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_SINE
        });
        var buttonScaleAnimationX = new AR.AnimationGroup(
            AR.CONST.ANIMATION_GROUP_TYPE.SEQUENTIAL, [buttonScaleAnimationXOut, buttonScaleAnimationXIn]);

        /* Y animations */
        var buttonScaleAnimationYOut = new AR.PropertyAnimation(button, "scale.y", scaleS, scaleL, scaleDuration / 2, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_SINE
        });
        var buttonScaleAnimationYIn = new AR.PropertyAnimation(button, "scale.y", scaleL, scaleS, scaleDuration / 2, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_SINE
        });
        var buttonScaleAnimationY = new AR.AnimationGroup(
            AR.CONST.ANIMATION_GROUP_TYPE.SEQUENTIAL, [buttonScaleAnimationYOut, buttonScaleAnimationYIn]);

        /* Z animations */
        var buttonScaleAnimationZOut = new AR.PropertyAnimation(button, "scale.z", scaleS, scaleL, scaleDuration / 2, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_SINE
        });
        var buttonScaleAnimationZIn = new AR.PropertyAnimation(button, "scale.z", scaleL, scaleS, scaleDuration / 2, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_SINE
        });
        var buttonScaleAnimationZ = new AR.AnimationGroup(
            AR.CONST.ANIMATION_GROUP_TYPE.SEQUENTIAL, [buttonScaleAnimationZOut, buttonScaleAnimationZIn]);

        /* Start all animation groups. */
        buttonScaleAnimationX.start(-1);
        buttonScaleAnimationY.start(-1);
        buttonScaleAnimationZ.start(-1);
    },

 
    // //启动枪的内置动画，即发射子弹
    // runScrewdriverAnimation: function runScrewdriverAnimationFn() {
    //     World.setScrewdriverEnabled(true); //设置按钮为不可见，枪可见
    //     var appearAnimation = World.createAppearingAnimation(World.modelGun,0.45);//创建出现动画的动画对象
    //     appearAnimation.start();//先运行出现动画
    //     //var gunAnimation = new AR.ModelAnimation(modelGun,"Gun_animation");//创建枪的内置动画对象
    //     //gunAnimation.start(-1);//启动枪的内置动画，无限循环
    // },

    // //模型枪出现的动画
    // createAppearingAnimation: function createAppearingAnimationFn(model, scale) {
    //     var sx = new AR.PropertyAnimation(model, "scale.x", 0, scale, 1500, {
    //         type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
    //     });
    //     var sy = new AR.PropertyAnimation(model, "scale.y", 0, scale, 1500, {
    //         type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
    //     });
    //     var sz = new AR.PropertyAnimation(model, "scale.z", 0, scale, 1500, {
    //         type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
    //     });
    //     return new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [sx, sy, sz]);
    // },
   
    //设置枪和按钮为互斥出现
    // setScrewdriverEnabled: function setScrewdriverEnabledFn(enabled) {
    //     World.tireButton.enabled = !enabled;
    //     World.modelGun.enabled = enabled;
    // },

    objectRecognized: function objectRecognizedFn() {
        World.hideInfoBar();
        World.setAugmentationsEnabled(true);
    },

    objectLost: function objectLostFn() {
        World.setAugmentationsEnabled(false);
    },

    setAugmentationsEnabled: function setAugmentationsEnabledFn(enabled) {
        for (var i = 0; i < World.drawables.length; i++) {
            World.drawables[i].enabled = enabled;
        }
       // World.setScrewdriverEnabled(true);
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