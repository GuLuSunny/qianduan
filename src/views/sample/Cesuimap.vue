<template>
    <div class="CesiumapView">
        <!-- 顶部标题 -->
        <transition name="fade">
            <div class="headView">
                <div class="headTime">2024-5-23 14:02:43</div>
                <div class="headTitle">Ai-Family智慧用电数据看板</div>
                <div class="headWeather">天津 29℃ 晴</div>
            </div>
        </transition>

        <!-- 内容盒子 -->
        <div class="dataBoxView">
            <div class="titleIcon"></div>
            <div class="boxTitle">我是盒子的标题哦</div>

            <div class="dataCenter">
                asdasdasdasdas
            </div>
        </div>

        <div class="dataBoxView" style="top: 37%;">
            <div class="titleIcon"></div>
            <div class="boxTitle">我是盒子的标题哦</div>

            <div class="dataCenter">
                asdasdasdasdas
            </div>
        </div>

        <div class="dataBoxView" style="top: 67%;">
            <div class="titleIcon"></div>
            <div class="boxTitle">我是盒子的标题哦</div>

            <div class="dataCenter">
                asdasdasdasdas
            </div>
        </div>


        <div class="dataBoxView" style="right: 20px; left: auto;  transform: translateX(200%);">
            <div class="titleIcon"></div>
            <div class="boxTitle">我是盒子的标题哦</div>

            <div class="dataCenter">
                asdasdasdasdas
            </div>
        </div>

        <div class="dataBoxView" style="right: 20px; left: auto; top: 37%;  transform: translateX(200%);">
            <div class="titleIcon"></div>
            <div class="boxTitle">我是盒子的标题哦</div>

            <div class="dataCenter">
                asdasdasdasdas
            </div>
        </div>

        <div class="dataBoxView" style="right: 20px; left: auto; top: 67%;  transform: translateX(200%);">
            <div class="titleIcon"></div>
            <div class="boxTitle">我是盒子的标题哦</div>

            <div class="dataCenter">
                asdasdasdasdas
            </div>
        </div>

        <!-- 底部功能按钮 -->
        <div class="boxMenuView">
            <ul>
                <li>智慧用电</li>
                <li>智慧照明</li>
                <li>智慧交通</li>
                <li>智能家居</li>
                <li>数据总览</li>
            </ul>
        </div>


        <!-- 地图 -->
        <div id="cesiumContainer">
        </div>

        <!-- 鼠标缩放控件 -->
        <div class="MouseZoom" id="MouseZoom"></div>


        <!-- <transition name="fade">
            <div class="loading-box" id="loadingBox" v-if="loadingShow">
                <div class="spinner"></div>
                <p>加载中...</p>
            </div>
        </transition> -->



        <!-- 鼠标点击窗口 -->
        <transition name="fade">
            <div v-show="clickPopupShowRight">
                <div class="clickModal-content" id="clickPopup">
                    <span class="close" @click="closeModal">&times;</span>
                    <div class="clickPopup-title" id="clickPopup-title">
                        <div class="clickPopupTitleText">我是窗口标题</div>
                    </div>
                    <p id="clickPopup-p">这是一个漂亮的弹窗，带有关闭按钮。</p>
                </div>
            </div>
        </transition>


        <!-- 鼠标悬浮窗口 -->
        <transition name="fade">
            <div v-show="hoverPopupShow">
                <div class="hoverModal-content" id="hoverPopup">
                    <p id="hoverPopup-p">我悬浮窗口哦</p>
                </div>
            </div>
        </transition>




        <div class="mars3d-animation-point" id="htmlElement">
            <p></p>
        </div>

    </div>
</template>
<script setup>
import { ref, watch, getCurrentInstance, onMounted } from 'vue';
//导入cesium
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import marker from '../../../public/images/cesiumMap/marker.png';
import { dialogEmits } from 'element-plus';
// 绿色水滴   http://mars3d.cn/project/vue/img/marker/mark-green.png
// 红色公司   http://mars3d.cn/project/vue/img/marker/mark-red.png
// 蓝色标志   http://mars3d.cn/project/vue/img/marker/mark-blue.png
// lading
var loadingShow = true;
var cesiumLoaded = false;
var clickPopupShowRight = true; // 控制弹窗显示与隐藏

// 悬浮弹窗
var hoverPopupShow=true;

// 记录标记为
var lastClickedEntityPosition ;
// 旋转函数

var viewer;

// 给定的坐标
var position = Cesium.Cartesian3.fromDegrees(117.085653, 39.102947);
// 初始朝向角度
var heading = 0;
// 初始俯仰角度
var pitch = 90;
// 初始距离
var distance = 10000;
// 初始偏移量
var offset = new Cesium.HeadingPitchRange(Cesium.Math.toRadians(heading), -Cesium.Math.toRadians(pitch), distance);
// 控制heading增减的标志位
var increasing = true;

onMounted(async () => {
    const instance = getCurrentInstance();
    if (instance) {
        instance.proxy.$nextTick(() => {
            console.log("实体化完成。");
            window.CESIUM_BASE_URL = "/static/Cesium";
            checkCesiumLoaded();
        })
    }
})

function checkCesiumLoaded() {

    // 设置定时器，每隔一段时间检查Cesium对象是否存在
    const intervalId = setInterval(async () => {
        console.log("正在等待Cesium加载");
        if (typeof Cesium !== 'undefined') {
            // Cesium对象已加载
            clearInterval(intervalId); // 停止定时器
            cesiumLoaded = true;
            // 执行你的操作，例如初始化Cesium地图
            await initializeCesium();
            console.log("初始化完毕");
            
            var eventHelper = new Cesium.EventHelper();
            var tileLoadProgressEvent = viewer.scene.globe.tileLoadProgressEvent;
            eventHelper.add(tileLoadProgressEvent, async function (e) {
                 console.log('每次加载地图服务矢量切片都会进入这个回调', e);
                if (e == 0) {
                    console.log("矢量切片加载完成时的回调");
                    //关闭加载动画
                    loadingShow=false;
                    console.log(loadingShow);
                    // 移除监听器
                    eventHelper.removeAll(tileLoadProgressEvent);
                    console.log("移除监听器");
                    await boxesSlidein();
                    console.log("页面初始化完毕!");
                }
            });
        }
    }, 1000); // 每隔1秒检查一次
}
async function boxesSlidein() {
    // 添加淡出动画
    const boxes = document.querySelectorAll('.dataBoxView');
    boxes.forEach(box => {
        box.classList.add('fade-out');
    });


    // 分别在不同时间点触发滑入和淡出效果
    setTimeout(() => {
        boxes[0].classList.add('slide-in');
        boxes[3].classList.add('slide-in');
    }, 1000);

    setTimeout(() => {
        boxes[1].classList.add('slide-in');
        boxes[4].classList.add('slide-in');
    }, 1500);

    setTimeout(() => {
        boxes[2].classList.add('slide-in');
        boxes[5].classList.add('slide-in');
    }, 2000);

    // 菜单特效
    const lis = document.querySelectorAll('.boxMenuView ul li');
    lis.forEach((li, index) => {
        li.style.animation = `fadeInUp 3s ease forwards`;
        li.style.animationDelay = `${index * 0.3}s`;
    });
}

// 初始化失败--待处理
// 初始化地球
async function initializeCesium() {
    // 请自己去cesium官网注册申请一个token替换
    //个人token全权限
    Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwODZhN2NiNi00N2JiLTQwMjQtOTFlZS1kZmY2MTdlMzE5M2UiLCJpZCI6MjcwODY2LCJpYXQiOjE3Mzk2Mjk1Mzh9.5jTz_wsmd8tYJSDLnUmxSpGE2d4gNp3EJqGTUjfGpf0"
    //个人令牌，双权限："eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZGU2YTc1ZS0zMmVjLTQ0YjktODthisMC05YTUxMjthisYmE3MGIiLCJpZCI6MjcwODY2LCJpYXQiOjE3Mzc1OTkwMTl9.cebCb2cPYCxfd8jVXFVB-6HpmD63nQLiEVDtO2Z7Ccs"
    //默认令牌："eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNmJkYzFiZi1jMGE2LTQ2YmYtYTAyZS1jOTNhODEwZTYzZjYiLCJpZCI6MjE2NTk4LCJpYXQiOjE3MTYyNTc5OTJ9.AbNDyzzy3zB6vFXXXnJ9HwVhNvBSbKAnhFRo3k9D3hE";
    console.log(Cesium)
    viewer = new Cesium.Viewer("cesiumContainer", {
        geocoder: false,                //是否显示地名查找控件
        geocoder: false,                // 是否显示地名查找控件
        sceneModePicker: false,         // 是否显示投影方式控件
        navigationHelpButton: false,    // 是否显示帮助信息控件
        baseLayerPicker: false,         // 是否显示图层选择控件
        homeButton: false,              // 是否显示Home按钮
        fullscreenButton: false,        // 是否显示全屏按钮
        animation: false,               // 是否显示动画控件
        shouldAnimate: true,           // 控制模型动画
        timeline: false,                // 是否显示时间轴
        selectionIndicator: false,      // 是否显示选中指示器
        infoBox: false,                 // 是否显示信息框
        // 使用中国在线地图服务作为底图
        // imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
        //     url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer"
        // }),
        // imageryProvider: new Cesium.UrlTemplateImageryProvider({
        //     url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
        //     layer: "tdtVecBasicLayer",
        //     style: "default",
        //     format: "image/png",
        //     tileMatrixSetID: "GoogleMapsCompatible",
        // })
    });


    // 设置最小缩放距离（以米为单位）
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 500; // 例如设置为 1000 米

    // 设置最大缩放距离（以米为单位）
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 8000000; // 例如设置为 5000000 米



    // // 倾斜视图 鼠标左键平移
    // viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.RIGHT_DRAG]

    // // 缩放设置 重新设置缩放成员
    // viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];

    // // 偏斜平移
    // //viewer.scene.screenSpaceCameraController.lookEventTypes = [ Cesium.CameraEventType.RIGHT_DRAG]

    // // 平移 添加鼠标右键  鼠标右键旋转
    // viewer.scene.screenSpaceCameraController.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG];


    //隐藏logo
    viewer._cesiumWidget._creditContainer.style.display = "none";

    console.log("初始化错误检查点1")
    // // 定义目标位置
    var destination = Cesium.Cartesian3.fromDegrees(117.085053, 39.102347, 10000);

    // 缓慢飞行到指定位置并控制方向
    viewer.camera.flyTo({
        destination: destination,
         duration: 8,// 以秒为单位的飞行时间，时间越长速度越慢
         complete:  function () {
             startRotation();
         }
    });




    // let model = viewer.entities.add({
    //     id: '建筑模型',
    //     position: Cesium.Cartesian3.fromDegrees(117.085053, 39.102347, 0),
    //     model: {
    //         uri: glbModel,
    //         minimumPixelSize: 800,
    //         maximumScale: 800,
    //         scale: 1.0, // 模型的缩放比例
    //         shadows: Cesium.ShadowMode.ENABLED // 阴影模式
    //     },
    // });


    // 创建带有图片的实体
    viewer.entities.add({
        id: '000000001',
        name: '公司',
        position: Cesium.Cartesian3.fromDegrees(117.085053, 39.102347, 0),
        billboard: {
            image: marker, // 图片路径
            width: 40.85,  // 图片宽度（像素）
            height: 95.8, // 图片高度（像素）
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,// 垂直方向上的对齐方式
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 紧贴地面
            pixelOffset: new Cesium.Cartesian2(0, 16) // 偏移量，单位为像素。这里的例子是向下偏移50像素
        },
        monitoItems: {
            data: {
                "name": "公司位置"
            }
        },
    });

    // 获取地图容器和 HTML 元素
    var cesiumContainer = document.getElementById('cesiumContainer');
    var htmlElement = document.getElementById('htmlElement');

    // 将 HTML 元素添加到地图容器中
    cesiumContainer.appendChild(htmlElement);

    console.log('坐标转换检查点1');
    // 将 HTML 元素与 Cesium 地图相对位置绑定
    viewer.scene.preRender.addEventListener(function () {
        var position = Cesium.Cartesian3.fromDegrees(117.085053, 39.102347);
        var canvasPosition = viewer.scene.cartesianToCanvasCoordinates(position);
        if (Cesium.defined(canvasPosition)) {
            htmlElement.style.left = canvasPosition.x + 'px';
            htmlElement.style.top = canvasPosition.y + 'px';
        }
    });



    // 生成随机数函数
    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }


    // 生成100个点位的经纬度数据
    const points = [];
    for (let i = 1; i <= 300; i++) {
        points.push({
            id: i.toString(),
            name: `${i}`,
            text: i.toString(),
            position: {
                longitude: await getRandom(117.085053, 118),
                latitude: await getRandom(39.102347, 40)
            }
        });
    }



    // 创建一个数组来保存所有的实体
    const entities = [];


    // 广告牌
    // points.forEach(res => {
    //     const entity = viewer.entities.add({
    //         id: res.id,
    //         name: res.name,
    //         position: Cesium.Cartesian3.fromDegrees(res.position.longitude, res.position.latitude),
    //         billboard: {
    //             image: new Cesium.PinBuilder().fromText(res.text, Cesium.Color.ROYALBLUE, 48).toDataURL(),
    //             verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    //         },
    //         monitoItems: {
    //             data: res
    //         },
    //     });
    //     // 将实体添加到数组中
    //     entities.push(entity);
    // });


    // 创建一个具有渐变色背景的图像
     function createGradientBackground(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        // 创建渐变
        const gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

        // 填充渐变
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        // 返回作为背景的图像
        return canvas.toDataURL('image/png');
    }

    // 使用上面创建的图像作为标签的背景
    const gradientBackground = createGradientBackground(200, 50);
    // 点位信息
    points.forEach(res => {
        const entity = viewer.entities.add({
            id: res.id,
            name: res.name,
            position: Cesium.Cartesian3.fromDegrees(res.position.longitude, res.position.latitude, 0),
            billboard: {
                image: marker, // 图片路径
                width: 40.85,  // 图片宽度（像素）
                height: 95.8, // 图片高度（像素）
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,// 垂直方向上的对齐方式
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 紧贴地面
                pixelOffset: new Cesium.Cartesian2(0, 16) // 偏移量，单位为像素。这里的例子是向下偏移50像素
            },
            label: {
                text: res.name,
                font: "bold 30px Helvetica", // 字体大小和样式
                scale: 0.5,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 使用填充和轮廓
                fillColor: new Cesium.Color.fromCssColorString('#47e8fe'), // 文字颜色
                outlineColor: new Cesium.Color(0, 0, 0, 0.3), // 轮廓颜色，模拟阴影
                outlineWidth: 2.0, // 轮廓宽度
                pixelOffset: new Cesium.Cartesian2(0, 35), // 偏移量
                showBackground: true, // 显示背景
                backgroundImage: gradientBackground, // 背景图像
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平对齐方式
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 紧贴地面
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直对齐方式
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 100000) // 距离显示条件
            },
            // point: {
            //     pixelSize: 10, // 点的大小（像素）
            //     color: Cesium.Color.ROYALBLUE, // 点的颜色
            //     outlineColor: Cesium.Color.WHITE, // 点的轮廓颜色
            //     outlineWidth: 1 // 点的轮廓宽度
            // },
            monitoItems: {
                data: res
            }
        });
        // 将实体添加到数组中
        entities.push(entity);
    });



    // 监听 Cesium 实体点击事件
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(onEntityClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 鼠标悬浮
    handler.setInputAction(onMovement, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



    // 监听地图视图改变事件--待修正
    viewer.scene.postRender.addEventListener(onMapViewChange, this);



    // 监听地图鼠标移动事件
    // viewer.screenSpaceEventHandler.setInputAction(onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



    // // 监听地图上的鼠标滚动事件
    // viewer.scene.canvas.addEventListener('wheel', onMouseWheel);

    // function onMouseWheel(event) {
    //     console.log('开始')
    // }

    // // 监听鼠标滚动结束事件
    // viewer.scene.canvas.addEventListener('wheel', onMouseWheelEnd);

    // function onMouseWheelEnd(event) {
    //     console.log('结束')

    // }
}

// 实体点击事件处理函数
function onEntityClick(movement) {
    // 获取点击位置的实体对象
    var pickedObject = viewer.scene.pick(movement.position);
    console.log(pickedObject)
    // 如果点击到了一个具有 monitoItems 属性的实体对象
    if (pickedObject && pickedObject.id && pickedObject.id.monitoItems) {
        console.log("点击对象为一个具有 monitoItems 属性的实体对象");
        // 记录点击的位置，保存为当前时间的 Cartesian 坐标
        lastClickedEntityPosition = pickedObject.id.position.getValue(Cesium.JulianDate.now());

        showModal(); // 点击后显示信息框

        // 获取实体的位置信息（Cartesian 坐标）
        const entityPosition = pickedObject.id.position.getValue(Cesium.JulianDate.now());

        // 将 Cartesian 坐标转换为窗口坐标
        
        const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, entityPosition);
        console.log('坐标检查点2');
        // 获取当前相机高度（Cartographic 坐标中的高度）
        const currentHeight = viewer.camera.positionCartographic.height;
        // 将实体位置从 Cartesian 坐标转换为 Cartographic 坐标（经度、纬度、高度）
        const cartographicPosition = Cesium.Cartographic.fromCartesian(entityPosition);
        console.log(cartographicPosition); // 输出 Cartographic 坐标

        // 将相机飞行到实体位置，并保持当前高度
        viewer.camera.flyTo({
            // 目标位置为实体的经度、纬度和当前高度
            currentHeight,
            destination: Cesium.Cartesian3.fromRadians(cartographicPosition.longitude, cartographicPosition.latitude, 2000),
            duration: 2 // 飞行时间（秒）
        });

        // 获取弹窗元素
        const modalElement = document.getElementById('clickPopup');
        const modal_P_Element = document.getElementById('clickPopup-p');

        // 将弹窗定位到实体位置的窗口坐标
        modalElement.style.left = windowPosition.x + 'px';
        modalElement.style.top = windowPosition.y + 'px';

        // 在弹窗中显示实体的详细信息
        // modal_P_Element.innerHTML = `${JSON.stringify(pickedObject.id.monitoItems.data)}`;

    } else {
        // 如果没有点击到目标实体，则关闭弹窗
        closeModal();


        //====取消旋转======
        viewer.clock.onTick.removeEventListener(rotate);

        // 解锁相机
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
}


// 显示弹窗
async function showModal() {
    clickPopupShowRight = true;
}
// 关闭弹窗
async function closeModal() {
    clickPopupShowRight = false;
}


// 地图视图改变事件处理函数
async function onMapViewChange() {

    // 如果弹窗正在显示且存在点击的位置，则更新弹窗位置为点击的位置
    if (clickPopupShowRight && lastClickedEntityPosition) {
        const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, lastClickedEntityPosition);
        console.log("坐标检查点3");
        const modalElement = document.getElementById('clickPopup');
        // 将弹窗定位到实体位置的窗口坐标
        modalElement.style.left = windowPosition.x + 'px';
        modalElement.style.top = windowPosition.y + 'px';
    }
}


// 鼠标悬浮
async function onMovement(movement) {
    // 获取点击位置的实体对象
    var pickedObject = viewer.scene.pick(movement.endPosition);


    // // 获取鼠标在屏幕上的位置
    // const screenPosition = new Cesium.Cartesian2(movement.endPosition.x, movement.endPosition.y);

    // // 获取弹窗元素
    // const MouseZoom = document.getElementById('MouseZoom');

    // // 将弹窗定位到实体位置的窗口坐标
    // MouseZoom.style.left = screenPosition.x + 'px';
    // MouseZoom.style.top = screenPosition.y + 'px';

    if (pickedObject && pickedObject.id._id === '建筑模型') {
        // 获取模型对应的实体对象
        var entity = viewer.entities.getById(pickedObject.id._id);
        // 设置模型轮廓宽度
        entity.model.silhouetteSize = 2;
        entity.model.silhouetteColor = new Cesium.Color.fromCssColorString('#47e8fe');
    } else {
        // 获取模型对应的实体对象
        var entity = viewer.entities.getById('建筑模型');

        //待处理
        // 设置模型轮廓宽度
        //entity.model.silhouetteSize = 0;
    }

    // 如果点击到了一个具有 monitoItems 属性的实体对象
    if (pickedObject && pickedObject.id && pickedObject.id.monitoItems) {

        // 获取实体的位置信息（Cartesian 坐标）
        const entityPosition = pickedObject.id.position.getValue(Cesium.JulianDate.now());
        
        // 将 Cartesian 坐标转换为窗口坐标
        const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, entityPosition);
        console.log("鼠标移动倒了一个具有 monitoItems 属性的实体对象");
        // 获取弹窗元素
        const modalElement = document.getElementById('hoverPopup');
        const modal_P_Element = document.getElementById('hoverPopup-p');

        // 将弹窗定位到实体位置的窗口坐标
        modalElement.style.left = windowPosition.x + 'px';
        modalElement.style.top = windowPosition.y + 'px';

        // 在弹窗中显示实体的详细信息
        modal_P_Element.innerHTML = `${JSON.stringify(pickedObject.id.monitoItems.data.name)}`;


        // 判断clickPopup状态决定是否显示hoverPopup
        if (!clickPopupShowRight) {
        }
        clickPopupShowRight ? hoverPopupShow = false : hoverPopupShow = true;
    } else {
        clickPopupShowRight = false;
    }
    console.log(clickPopupShowRight);
}

// 开始旋转的函数
async function startRotation() {
    // 修改旋转的方法
    viewer.clock.onTick.addEventListener(rotate);
    //设置旋转时间
    setTimeout(() =>{
        //====取消旋转======
        viewer.clock.onTick.removeEventListener(rotate);
        console.log("取消旋转");
        // 解锁相机
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        console.log("解锁相机");
    }, 10000);
}

async function rotate()
{
    // 控制弧度
    if (increasing) {
            heading += 0.1;
            if (heading >= 300) { // 设定一个上限
                increasing = false;
            }
        } else {
            heading -= 0.1;
            if (heading <= 0) { // 设定一个下限
                increasing = true;
            }
        }

        // 减少俯仰角度
        if (pitch >= 30) {
            pitch -= 0.1;
        }
        // 减少距离
        if (distance < 100000) {
            distance += 30;
        }


        offset = new Cesium.HeadingPitchRange(Cesium.Math.toRadians(heading), -Cesium.Math.toRadians(pitch), distance);
        // 锁定相机
        viewer.camera.lookAt(position, offset);
}

</script>

<style lang="less" scoped>
.CesiumapView {
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: url('../../../public/images/cesiumMap/cursor-RmLDFyYc32.png') 24 24, auto;
}

#cesiumContainer {
    height: 100%;
    width: 100%;
}


/* 弹窗内容容器 */
.clickModal-content {
    width: 450px;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(2, 7, 17, .8);
    // padding: 0 10px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    /* position: relative; */

    /* X 轴左移一半，Y 轴向上偏移 100% */
    transform: translate(-50%, -220%);

    font-family: PuHuiTi, serif;
    color: #ffffff;
}

.clickModal-content::after {
    content: "";
    position: absolute;
    bottom: -13px;
    /* 调整这个值来定位三角形 */
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 14px solid rgba(2, 7, 17, .8);
}

.clickPopup-title {
    // width: 100%;
    height: 35px;
    line-height: 32px;
    background: url('../../../public/images/cesiumMap//custom-styles-title-BXpsbnaH.png');
    background-size: 100% 100%;
    padding-left: 16px;
    user-select: none;
}

.clickPopupTitleText {
    font-family: YouShe, serif;
    font-weight: 400;
    font-size: 18px;
    color: transparent;
    background: linear-gradient(180deg, #ffffff 0%, #22fffe 100%);
    /* 添加必要的字体样式 */
    -webkit-background-clip: text;
    background-clip: text;
    letter-spacing: .06em;
    cursor: default;
}


.clickModal-content p {
    word-wrap: break-word;
    padding: 10px 10px 15px 10px;
    margin: 0;
    color: #bdbdbd;
}


/* 关闭按钮样式 */
.close {
    position: absolute;
    top: -5px;
    right: 2px;
    cursor: pointer;
    color: #1f7c81;
    zoom: 1.5;
}

/* 关闭按钮的样式 */
.close:hover {
    color: #7dffff;
}

/* 鼠标悬浮窗口 */
.hoverModal-content {
    width: 300px;
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    position: fixed;
    top: 0;
    left: 50%;
    color: #ffffff;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    /* X 轴左移一半，Y 轴向上偏移 100% */
    transform: translate(-50%, -330%);
    /* 穿透效果 */
    pointer-events: none;

    font-family: PuHuiTi, serif;
}

.hoverModal-content::after {
    content: "";
    position: absolute;
    bottom: -8px;
    /* 调整这个值来定位三角形 */
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 14px solid rgba(0, 0, 0, 0.8);
}


.hoverModal-content p {
    padding: 0;
    margin: 0;
}


/* 动画点 */
.mars3d-animation-point,
.mars3d-animation-point:before,
.mars3d-animation-point:after,
.mars3d-animation-point p,
.mars3d-animation-point p:before,
.mars3d-animation-point p:after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    /* 穿透效果 */
    pointer-events: none;
}

.mars3d-animation-point {
    color: #f33349;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid #ff4d4d;
    cursor: pointer;
    color: #f33349;
    background: currentColor;
    z-index: 3;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 2em currentColor, 0 0 0.5em currentColor;
    position: absolute;
    left: 50%;
    top: 50%;
}

.mars3d-animation-point p {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: mars3d-animation-point-mapAni 2s ease infinite;
}

.mars3d-animation-point:before,
.mars3d-animation-point:after,
.mars3d-animation-point p:before,
.mars3d-animation-point p:after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 2px solid;
    animation: mars3d-animation-point-mapAni 1s ease infinite;
}

@keyframes mars3d-animation-point-mapAni {
    0% {
        width: 0;
        height: 0;
        opacity: 1;
    }

    25% {
        width: 100%;
        height: 120%;
        opacity: 0.8;
    }

    50% {
        width: 150%;
        height: 150%;
        opacity: 0.6;
    }

    75% {
        width: 200%;
        height: 200%;
        opacity: 0.4;
    }

    100% {
        width: 250%;
        height: 250%;
        opacity: 0;
    }
}







/* loading */

.loading-box {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background-color: white;
    z-index: 9999999999;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    user-select: none;
    cursor: wait;
    font-family: PuHuiTi, serif;
}

.loading-box.active {
    display: block;
}

.spinner {
    border: 8px solid #f3f3f3;
    /* Light grey */
    border-top: 8px solid #3498db;
    /* Blue */
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 0.5s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.8s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}





.headView {
    width: 100%;
    height: 80px;
    background: url('../../../public/images/cesiumMap//header-CE2FZDIm.png');
    background-size: 100% 100%;
    position: fixed;
    top: -2px;
    z-index: 9;


    display: flex;
    justify-content: space-between;
    align-items: start;

    color: #ffffff;

    user-select: none;
    /* 穿透效果 */
    // pointer-events: none;
}

.headTime {
    font-family: PuHuiTi, serif;
    color: #bebebe;
    padding: 8px 0 0 20px;
    pointer-events: all;
}

.headTitle {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    font-weight: 400;
    font-size: 30px;
    line-height: 70px;
    letter-spacing: .1rem;

    font-family: YouShe, serif;
    font-style: normal;
    font-weight: 400;
}

.headWeather {
    font-family: PuHuiTi, serif;
    color: #bebebe;
    padding: 8px 20px 0 0;
    pointer-events: all;
}

.headTime:hover,
.headWeather:hover {
    color: #47e8fe;
}

/* 鼠标缩放 */
.MouseZoom {
    position: absolute;
    width: 40px;
    height: 40px;
    top: -100px;
    left: -100px;
    margin-top: -20px;
    margin-left: -20px;

    background: url("../../../public/images/cesiumMap//cursor-RmLDFyYc.png");
    background-size: 100% 100%;
    z-index: 1;

    /* 穿透效果 */
    pointer-events: none;
}


/* 盒子内容 */
.dataBoxView {
    width: 23%;
    height: calc(100%/3.5);
    position: fixed;
    z-index: 1;
    left: 20px;
    top: 70px;
    /* 穿透效果 */
    /* pointer-events: none; */
    background: linear-gradient(to right, rgba(37, 54, 54, .6) 0%, rgba(37, 54, 54, .4) 100%);
    user-select: none;
    border-radius: 6px 0 0 0;

    // 滑动特效
    transition: opacity 2s ease-in-out, transform 2s ease-in-out;
    /* 初始位置在屏幕左侧之外 */
    transform: translateX(-200%);

}

.slide-in {
    /* 目标位置 */
    transform: translateX(0) !important;
}

.fade-out {
    animation: fadeOut 5s forwards;
}

@keyframes fadeOut {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.titleIcon {
    position: absolute;
    left: 0px;
    top: -12px;
    width: 24px;
    height: 24px;
    background-color: green;
    background: url("../../../public/images/cesiumMap//panel-header2-D01NbEeL.png");
    background-size: 100% 100%;
}

.boxTitle {
    height: 30px;
    padding-left: 24px;

    color: #ffffff;
    background: url("../../../public/images/cesiumMap//panel-header1-DVTX7Lb2.png");
    background-size: 100% 100%;

    font-family: YouShe, serif;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 24px;
    text-shadow: 0 2px 4px rgba(2, 7, 17, .8);
}

.dataCenter {
    padding: 20px;
    color: #ffffff;
    font-family: PuHuiTi, serif;
    // background-color: red;
}


// 底部菜单
.boxMenuView {
    position: fixed;
    z-index: 1;
    bottom: 20px;
    width: 800px;
    left: 50%;
    transform: translate(-50%, 0);
    user-select: none;

    ul {
        display: flex;
        justify-content: space-between;
        align-items: center;

        li {
            width: 151px;
            height: 40px;
            line-height: 40px;
            text-shadow: 0 2px 4px rgba(2, 7, 17, .5);
            letter-spacing: .2rem;
            text-align: center;
            font-family: PangMenZhengDao, serif;
            font-style: normal;
            font-weight: 400;
            font-size: 18px;
            color: #ffffff;
            background: url('../../../public/images/cesiumMap/menu-btn-unchecked-BbOiNvmo.png');
            background-size: 100% 100%;

            opacity: 0;
        }

        li:nth-child(1) {
            background: url('../../../public/images/cesiumMap/menu-btn-checked_2-DcHCg5DW.png');
            background-size: 100% 100%;
            color: #ffdea3;

        }

        li:hover {
            color: #ffdea3;
        }

    }
}

/* 定义动画 */
@keyframes fadeInUp {
    0% {
        opacity: 0;
        transform: translateY(0);
    }

    50% {
        opacity: 1;
        transform: translateY(-30px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>