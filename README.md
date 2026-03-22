# lhhvue

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


地图瓦片数据量过大，暂不上传github，如有需要联系张凯飞获取。
使用：
  将tiles文件夹放置在public文件目录下即可。
注：由于数据量大，运行时可能报错，尝试再次启动。
```
lhhvue
├─ 📁public
│  ├─ 📁icons
│  │  ├─ 📄point_device.svg
│  │  └─ 📄point_watch.svg
│  ├─ 📁images
│  │  ├─ 📄bg0.png
│  │  ├─ 📄mark2.png
│  │  └─ 📄mark3.png
│  ├─ 📁templates
│  │  ├─ 📄XX年XX月XX日光谱反射率.xlsx
│  │  ├─ 📄XX气象XXXX年XX月数据.xlsx
│  │  ├─ 📄XX水库XX年水位数据模板.xls
│  │  └─ 📄水质XXXX-XX-XX.xlsx
│  ├─ 📄favicon - 副本.ico
│  ├─ 📄favicon.ico
│  └─ 📄index.html
├─ 📁src
│  ├─ 📁api
│  │  └─ 📄getData.ts
│  ├─ 📁assets
│  │  ├─ 📁css
│  │  │  ├─ 📄common.css
│  │  │  └─ 📄index.css
│  │  ├─ 📁datas
│  │  │  ├─ 📄001.json
│  │  │  ├─ 📄PointDeviceData.json
│  │  │  └─ 📄PointLayerData.json
│  │  ├─ 📁img
│  │  │  ├─ 📁icdIMG
│  │  │  │  ├─ 📄icd1.png
│  │  │  │  ├─ 📄icd2.png
│  │  │  │  ├─ 📄icd3.png
│  │  │  │  ├─ 📄icd4.png
│  │  │  │  ├─ 📄icd5.png
│  │  │  │  └─ 📄icd6.png
│  │  │  ├─ 📁sivIMG
│  │  │  │  ├─ 📄siv1.png
│  │  │  │  ├─ 📄siv10.png
│  │  │  │  ├─ 📄siv11.png
│  │  │  │  ├─ 📄siv2.png
│  │  │  │  ├─ 📄siv3.png
│  │  │  │  ├─ 📄siv4.png
│  │  │  │  ├─ 📄siv5.png
│  │  │  │  ├─ 📄siv6.png
│  │  │  │  ├─ 📄siv7.png
│  │  │  │  ├─ 📄siv8.png
│  │  │  │  └─ 📄siv9.png
│  │  │  ├─ 📄avatar.jpg
│  │  │  ├─ 📄bg-2.jpg
│  │  │  ├─ 📄bg-4.jpg
│  │  │  ├─ 📄bg-5.jpg
│  │  │  ├─ 📄bg1.jpg
│  │  │  ├─ 📄bg10.jpg
│  │  │  ├─ 📄bg2.jpg
│  │  │  ├─ 📄bg3.jpg
│  │  │  ├─ 📄bg4.jpg
│  │  │  ├─ 📄bg5.png
│  │  │  ├─ 📄bg6.png
│  │  │  ├─ 📄bg7.jpg
│  │  │  ├─ 📄bg8.jpg
│  │  │  ├─ 📄bg9.jpg
│  │  │  ├─ 📄bird1.png
│  │  │  ├─ 📄bird2.png
│  │  │  ├─ 📄bird3.png
│  │  │  ├─ 📄mark.png
│  │  │  ├─ 📄POP.svg
│  │  │  ├─ 📄text.jpg
│  │  │  ├─ 📄title1.png
│  │  │  ├─ 📄title10.png
│  │  │  ├─ 📄title2.png
│  │  │  ├─ 📄title3.png
│  │  │  ├─ 📄title4.png
│  │  │  ├─ 📄title5.png
│  │  │  ├─ 📄title6.png
│  │  │  ├─ 📄title7.png
│  │  │  ├─ 📄title8.png
│  │  │  ├─ 📄title9.png
│  │  │  └─ 📄waoku.jpg
│  │  ├─ 📁userimg
│  │  │  ├─ 📄datadownload.svg
│  │  │  ├─ 📄datadownloadlist.svg
│  │  │  ├─ 📄dataupload.svg
│  │  │  └─ 📄usermanage.svg
│  │  └─ 📄logo.png
│  ├─ 📁components
│  │  └─ 📄HelloWorld.vue
│  ├─ 📁config
│  │  ├─ 📄useAxiosApi.ts
│  │  └─ 📄useFetchApi.ts
│  ├─ 📁router
│  │  └─ 📄index.ts
│  ├─ 📁store
│  │  └─ 📄index.ts
│  ├─ 📁views
│  │  ├─ 📁charts 大屏组件
│  │  │  ├─ 📄AboutView.vue		测试用
│  │  │  ├─ 📄AtmosphereView.vue	气象
│  │  │  ├─ 📄BirdSpecies.vue	鸟类种类
│  │  │  ├─ 📄BirdsRatio.vue	鸟类占比
│  │  │  ├─ 📄HydrographView.vue	水位
│  │  │  ├─ 📄InfraredCameraDetection.vue	红外相机监测
│  │  │  ├─ 📄MapView.vue	观测站分布
│  │  │  ├─ 📄RunOff.vue	径流
│  │  │  ├─ 📄SensingImageView.vue		遥感影像
│  │  │  ├─ 📄SpectralReflectance.vue	光谱反射
│  │  │  └─ 📄WaterPhysicochemistry.vue		水质
│  │  │  └─ 📄WetLandView.vue		土壤
│  │  ├─ 📁menu
│  │  │  ├─ 📁DataBirds	鸟类观测数据
│  │  │  │  ├─ 📄BirdSciencepopularization.vue	鸟类科普
│  │  │  │  ├─ 📄Birdsdata.vue	鸟类布局
│  │  │  │  ├─ 📄BirdSearch.vue	鸟类查询
│  │  │  ├─ 📁ManualobservationdataMenu	人工观测数据
│  │  │  │  ├─ 📄ManuaDectect.vue	鸟类数据组件
│  │  │  │  ├─ 📄Manua.vue	人工观测布局
│  │  │  ├─ 📁autoDetectMenu	自动观测数据
│  │  │  │  ├─ 📄Atmosphere.vue	气象组件
│  │  │  │  ├─ 📄AutoDetect.vue	自动观测布局
│  │  │  │  ├─ 📄RunOff.vue	径流组件
│  │  │  │  └─ 📄WaterLevel.vue	水位组件
│  │  │  ├─ 📁configManagementMenu 配置管理
│  │  │  │  ├─ 📄ConfigManagement.vue 配置管理布局
│  │  │  │  ├─ 📄ConfigManagementRole.vue 配置管理角色组件
│  │  │  │  ├─ 📄ConfigManagementRight.vue 配置管理权限组件 
│  │  │  │  ├─ 📄ConfigManagementBird.vue 配置管理鸟类组件 
│  │  │  │  └─ 📄ConfigManagementDevice.vue  配置管理设备组件  
│  │  │  ├─ 📁dataDownloadMenu	 
│  │  │  │  ├─ 📄DataDownload.vue  数据申请页面
│  │  │  │  └─ 📄DataDownloadDetail.vue  图片详情页面
│  │  │  ├─ 📁dataQuerySpectralMenu	光谱数据查询
│  │  │  │  └─ 📄SpectralQuery.vue	光谱数据查询布局
│  │  │  │  └─ 📄SpectralGraph.vue	图表组件
│  │  │  │  └─ 📄SpectralTable.vue	表格组件
│  │  │  ├─ 📁dataUplodMenu	数据管理
│  │  │  │  └─ 📄DataUpload.vue	数据管理组件
│  │  │  ├─ 📁laboratoryAnalysisDataMenu	实验室分析数据
│  │  │  │  ├─ 📄LaboratoryAnalysisData.vue	实验室分析数据布局
│  │  │  │  ├─ 📄SpectralReflectance.vue	光谱组件
│  │  │  │  └─ 📄WaterPhysicochemistry.vue	水质组件
│  │  │  ├─ 📁researchDataMenu 研究数据
│  │  │  │  ├─ 📄DroneImageData.vue	无人机影像组件
│  │  │  │  ├─ 📄researchData.vue	研究数据布局
│  │  │  │  └─ 📄SatelliteRemoteSensingImageData.vue	卫星遥感影像组件
│  │  │  ├─ 📁userManagementMenu	用户管理
│  │  │  │  ├─ 📄UserManagement.vue	用户管理布局
│  │  │  │  ├─ 📄UserManagementTable.vue	用户数据列表组件  
│  │  │  ├─ 📁waterLevelQueryMenu	水位数据查询
│  │  │  │  ├─ 📄WaterLevelGraph.vue 水位查询图表组件
│  │  │  │  ├─ 📄WaterQueryPanel.vue	水位查询布局
│  │  │  │  └─ 📄WaterLevelTable.vue 水位查询表格组件
│  │  │  ├─ 📁runoff   径流数据查询
│  │  │  │  └─ 📄RunOffQuery.vue	径流数据查询布局
│  │  │  │  └─ 📄RunOffGraph.vue	径流图表组件   
│  │  │  ├─ 📁remoteSensingMenu   遥感数据查询
│  │  │  │  └─ 📄RemoteSensingQuery.vue	遥感,无人机数据查询布局
│  │  │  │  └─ 📄RemoteSensingTable.vue	遥感查询表格组件
│  │  │  │  └─ 📄DroneTable.vue	无人机查询表格组件
│  │  │  ├─ 📁PhysicochemicalData   水质数据查询
│  │  │  │  └─ 📄PhysicochemicalGraph.vue	水质图表组件
│  │  │  │  └─ 📄PhysicochemicalTable.vue	水质表格组件
│  │  │  │  └─ 📄PhysicochemicalPanel.vue	水质布局
│  │  │  └─ 📄head.vue 头部组件
│  │  ├─ 📄AboutView.vue 测试用
│  │  ├─ 📄BigscreenHome.vue 大屏布局
│  │  ├─ 📄HomeView.vue 无用
│  │  ├─ 📄LoginView.vue	登录页面
│  │  └─ 📄MainMenuView.vue	后台页面布局
│  ├─ 📄App.vue

---

## AI 小助手 (本地化)

- 默认使用本地 Ollama 服务：`AI_PROVIDER=ollama`，默认 `AI_API_URL=http://127.0.0.1:11434/api/generate`。
- 可在根目录创建或编辑 `.env.local` 来覆盖：例如设置 `AI_MODEL=deepseek-r1:1.5b`、`AI_API_URL`、或 `AI_API_KEY`（仅在使用带鉴权的提供商时需要）。
- 启动代理：

```
npm run ai-server
```

代理监听 `http://localhost:<AI_PORT>`（默认 3001），前端通过 `/api/ai-assistant` 调用该代理。

---
│  ├─ 📄main.ts
│  └─ 📄shims-vue.d.ts
├─ 📄.browserslistrc
├─ 📄.editorconfig
├─ 📄.eslintrc.js
├─ 📄.gitignore
├─ 📄babel.config.js
├─ 📄package-lock.json
├─ 📄package.json
├─ 📄README.md
├─ 📄tsconfig.json
└─ 📄vue.config.js
```