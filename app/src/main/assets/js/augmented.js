/*展示静态文物模型界面*/

//声明全局变量，存储控制的模型的位置数据
var previousTranslateValue = {
    x:0,
    y:0,
    z:0
};

//声明全局变量，存储控制的模型的角度数据
var previousRotationValue = {
    x:0,
    y:0,
    z:0
};

var previousScaleValue = 0.002;//全局变量，表示文物静态模型的大小

var oneFingerGestureAllowed = false;//先禁止单指模式识别（存疑）

var bucketScale = 0.0047;//木桶模型的大小
var woodScale = 0.02;//木头模型的大小
var meetScale = 0.003;//肉的模型大小

var bucketPouringScale = 0.11;//倒水动画的大小
var woodFiringScale = 0.07;//火苗燃烧动画的大小
var meetBurntScale = 0.02;//沸水动画的大小

//定义方法，启动二指模式识别（存疑）
AR.context.on2FingerGestureStarted = function() {
    oneFingerGestureAllowed = false;
};

//定义方法，js文件的入口
var World = {
    loaded: false,
    drawables: [],//里面依次存放静态文物模型、增强模型的静态模型、增强模型动画（若分开）

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


        /*添加木桶的模型*/
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
                x:230,
                y:90,
                z:90
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
                previousTranslateValue.x = this.translate.x;
                previousTranslateValue.z = this.translate.z;
                // if((this.translate.x >=-0.97)&&(this.translate.x<=0)&&(this.translate.y>=0.033)&&(this.translate.y<=0.696)){
                //     World.meet.enabled = false;
                // }
                return true;
            },

            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

        /*肉（可拖动）按键对应的模型*/
        this.meet = new AR.Model("assets/augmented/meet.wt3",{
            scale: {
                x: meetScale,
                y: meetScale,
                z: meetScale
            },
            translate: {
                x: 0.813,
                y: -0.276,
                z: 0.092
            },
            rotate: {
                x:180,
                y:-90,
                z:-90
            },
            //移动
            onPanBegan: function() {
                oneFingerGestureAllowed = false;
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
                previousTranslateValue.x = this.translate.x;
                previousTranslateValue.z = this.translate.z;
                return true;
            },

            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError

        });

        //将创建的所有3D模型添加到drawables数组中，方便多资源调用
        World.drawables.push(this.houMuWuDing);
        World.drawables.push(this.bucket);
        World.drawables.push(this.meet);
    },

    //对象识别成功时，设置drawables数组中所有的模型为可见
    objectRecognized: function objectRecognizedFn() {
        console.log("lzg111111111");
        //World.hideInfoBar();
        console.log("lzg222222222222");
        var audio = document.getElementById("audio01");
        audio.play();
        console.log("lzg3333333333333");

        var title_text = document.getElementsByTagName("TITLE")[0].text;//获取当前页面的标签
        if(title_text == "index"){
            World.setAugmentationsEnabled(0, 1, true);
            World.appear();//播放出现动画
        }else if(title_text == "ar"){
            World.setAugmentationsEnabled(0, 1, false);
        }
    },

    //对象丢失时将所有的模型设置为不可见
    //还需要设置页面跳转时使用不同的js，让当前的效果都消失
    objectLost: function objectLostFn() {
        World.setAugmentationsEnabled(0, World.drawables.length, false);
    },

    //设置所有的增强模型为enabled的值
    setAugmentationsEnabled: function setAugmentationsEnabledFn(start, num, enabled) {
        for (var i = start; i <start + num; i++) {
            World.drawables[i].enabled = enabled;
        }
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

    showInfoBar: function WorldLoadedFn() {
        document.getElementById("infoBox").style.display = "table";
        document.getElementById("loadingMessage").style.display = "none";
    },

    showAugmented: function showAugmentedFn(index){
        World.drawables[0].enabled = false;
        if(index == 1){
            World.drawables[1].enabled = true;
        }else if(index == 2){
            World.drawables[2].enabled = true;
        }else if(index == 3){
            World.drawables[1].enabled = false;
            World.drawables[2].enabled = false;
        }else{
            World.onError();
        }
    }
};
World.init();
