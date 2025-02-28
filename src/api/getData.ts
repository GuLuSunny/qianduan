import useAxiosApi from '../config/useAxiosApi'
/**
 * 账号密码登录
 * @returns UseAxiosReturn
 */
export function loginuser (data: any) {
  return useAxiosApi('/api/login', {
    method: 'POST',
    data: data
  })
}
/**
 * 账号注册
 * @returns UseAxiosReturn
 */
export function register (data: any) {
  return useAxiosApi('api/register', {
    method: 'POST',
    data: data
  })
}
/**
 * 账号退出
 * @returns UseAxiosReturn
 */
export function logoutuser (data: any) {
  return useAxiosApi('/api/logout', {
    method: 'POST',
    data: data
  })
}
/**
 * 按年查询水位数据
 * @returns UseAxiosReturn
 */
export function findWaterlevelByYear (data: any) {
  return useAxiosApi('/api/waterlevelSelectByYear', {
    method: 'POST',
    data: data
  })
}
/**
 * 按月查询水位数据
 * @returns UseAxiosReturn
 */
export function findWaterlevelByMonth (data: any) {
  return useAxiosApi('/api/waterlevelSelectBymonth', {
    method: 'POST',
    data: data
  })
}
/**
 * 按年查询径流数据
 * @returns UseAxiosReturn
 */
export function findRunOffByYear (data: any) {
  return useAxiosApi('/api/tbFlowSelectByYear', {
    method: 'POST',
    data: data
  })
}
/**
 * 按月查询径流数据
 * @returns UseAxiosReturn
 */
export function findRunOffByMonth (data: any) {
  return useAxiosApi('/api/tbFlowSelectByMonth', {
    method: 'POST',
    data: data
  })
}
/**
 * 查询光谱反射率数据
 * @returns UseAxiosReturn
 */
export function findReflectanceByTimeAndDevice (data: any) {
  console.log(data)
  return useAxiosApi('/api/SpectralReflectance', {
    method: 'POST',
    data: data
  })
}

/**
 * 按日期查询光谱反射率数据
 * @returns UseAxiosReturn
 */
export function findReflectanceByTime (data: any) {
  console.log(data)
  return useAxiosApi('/api/SpectralReflectance/pageQuery', {
    method: 'POST',
    data: data
  })
}
/**
 * 按日期查询光谱反射率数据行数
 * @returns UseAxiosReturn
 */
export function findReflectanceRowsByTime (data: any) {
  console.log(data)
  return useAxiosApi('/api/GetRowNumOfDateData', {
    method: 'POST',
    data: data
  })
}
/**
 * 按id删除光谱反射率数据
 * @returns UseAxiosReturn
 */
export function deleteSpeDataById (data: any) {
  console.log(data)
  return useAxiosApi('/api/SpeDelById', {
    method: 'DELETE',
    data: data
  })
}
/**
 * 修改光谱反射率数据
 * @returns UseAxiosReturn
 */
export function saveReflectanceData (data: any) {
  console.log(data)
  return useAxiosApi('/api/saveReflectanceData', {
    method: 'POST',
    data: data
  })
}
/**
 * 查询径流数据-大屏年数据
 * @returns UseAxiosReturn
 */
export function findRunOff (data: any) {
  return useAxiosApi('/api/tbFlowSelectByYear', {
    method: 'POST',
    data: data
  })
}

/**
 * 查询径流数据-大屏月数据
 * @returns UseAxiosReturn
 */
export function findMonthRunOff (data: any) {
  return useAxiosApi('/api/tbFlowSelectByMonth', {
    method: 'POST',
    data: data
  })
}

/**
 * 查询水体理化数据
 * @returns UseAxiosReturn
 */
export function getWaterPhyBigScreen (data: any) {
  return useAxiosApi('/api/water_physicochemistry', {
    method: 'POST',
    data: data
  })
}

/**
 * 分页查询水体理化数据
 * @returns UseAxiosReturn
 */
export function getWaterPhyPageQuery (data: any) {
  return useAxiosApi('/api/water_physicochemistry/pageQurey', {
    method: 'POST',
    data: data
  })
}

/**
 * 根据id删除水体理化数据
 * @returns UseAxiosReturn
 */
export function delWaterPhyDataByids (data: any) {
  return useAxiosApi('/api/water_physicochemistry/DelByIds', {
    method: 'DELETE',
    data: data
  })
}

/**
 * 分页查询水体理化数据
 * @returns UseAxiosReturn
 */
export function getAtmospherePageQuery (data: any) {
  return useAxiosApi('/api/atmosphere/pageQurey', {
    method: 'POST',
    data: data
  })
}

/**
 * 根据id删除水体理化数据
 * @returns UseAxiosReturn
 */
export function delAtmosphereDataByids (data: any) {
  return useAxiosApi('/api/atmosphere/DelByIds', {
    method: 'DELETE',
    data: data
  })
}
/**
 * 查询气象数据
 * @returns UseAxiosReturn
 */
export function findAtmosphere (data: any) {
  return useAxiosApi('/api/atmosphere', {
    method: 'POST',
    data: data
  })
}

/**
 * 查询最近一条气象数据
 * @returns UseAxiosReturn
 */
export function findCurrentAtmosphereByDevice (data: any) {
  return useAxiosApi('/api/findCurrentAtmosphereByDevice', {
    method: 'POST',
    data: data
  })
}
/**
 * 通过月份信息和设备信息查询气象数据
 * @returns UseAxiosReturn
 */
export function selectByMonthAndDevice (data: any) {
  return useAxiosApi('/api/atmosphere/selectByMonthAndDevice', {
    method: 'POST',
    data: data
  })
}
/**
 * 通过年份信息和设备信息查询气象数据
 * @returns UseAxiosReturn
 */
export function selectByYearAndDevice (data: any) {
  return useAxiosApi('/api/atmosphere/selectByYearAndDevice', {
    method: 'POST',
    data: data
  })
}

/**
 * 气象Excel方式提交
 * @returns UseAxiosReturn
 */
export function atmosphereInsertByExcel (data: any) {
  return useAxiosApi('/api/atmosphere/insertByExcel', {
    method: 'POST',
    data: data
  })
}
/**
 * 径流Excel方式提交
 * @returns UseAxiosReturn
 */
export function runoffInsertByExcel (data: any) {
  return useAxiosApi('/api/tbFlow/insertByExcel', {
    method: 'POST',
    data: data
  })
}
/**
 * 径流表单方式提交
 * @returns UseAxiosReturn
 */
export function runoffInsertByForm (data: any) {
  return useAxiosApi('/api/tbFlow/insert', {
    method: 'POST',
    data: data
  })
}
/**
 * 水位Excel方式提交
 * @returns UseAxiosReturn
 */
export function waterLevelInsertByExcel (data: any) {
  return useAxiosApi('/api/tbWaterLevel/insertByExcel', {
    method: 'POST',
    data: data
  })
}
/**
 * 水位form方式提交
 * @returns UseAxiosReturn
 */
export function waterLevelInsertByForm (data: any) {
  return useAxiosApi('/api/tbWaterLevel/insert', {
    method: 'POST',
    data: data
  })
}

/**
 * 光谱Excel方式提交
 * @returns UseAxiosReturn
 */
export function spectralReflectanceInsertByExcel (data: any) {
  return useAxiosApi('api/SpectralReflectance/insertByExcel', {
    method: 'POST',
    data: data
  })
}
/**
 * 水体理化Excel方式提交
 * @returns UseAxiosReturn
 */
export function waterPhysicochemistryInsertByExcel (data: any) {
  return useAxiosApi('/api/waterPhysicochemistry/insertByExcel', {
    method: 'POST',
    data: data
  })
}

/**
 * 鸟类form提交
 * @returns UseAxiosReturn
 */
export function observationBirdInsert (data: any) {
  return useAxiosApi('/api/ObservationBird/insert', {
    method: 'POST',
    data: data
  })
}


/**
 * 湿地土壤form提交
 * @returns UseAxiosReturn
 */
export function wetlandSoilInsert (data: any) {
  return useAxiosApi('/api/monitoring/wetlandSoil/insert', {
    method: 'POST',
    data: data
  })
}
/**
 * 湿地植被form提交
 * @returns UseAxiosReturn
 */
export function wetlandPlantInsert (data: any) {
  return useAxiosApi('/api/monitoring/plant/insert', {
    method: 'POST',
    data: data
  })
}
/**
 * 卫星遥感影像提交
 * @returns UseAxiosReturn
 */
export function sateliteRemoteSensingInsert (data: any) {
  return useAxiosApi('/api/SateliteRemoteSensing/insert', {
    method: 'POST',
    data: data
  })
}


/**
 * 无人机影像提交
 * @returns UseAxiosReturn
 */
export function droneImageInsert (data: any) {
  return useAxiosApi('/api/DroneImage/insert', {
    method: 'POST',
    data: data
  })
}

/**
 * 查询水位数据
 * @returns UseAxiosReturn
 */
export function findWaterlevel (data: any) {
  return useAxiosApi('/api/waterlevel', {
    method: 'POST',
    data: data
  })
}

/**
 * 查询水位分页数据
 * @returns UseAxiosReturn
 */
export function fetchBytimeandPage (data: any) {
  return useAxiosApi('api/waterlevel/fetchBytimeandPage', {
    method: 'POST',
    data: data
  })
}

/**
 * 按id删除水位数据
 * @returns UseAxiosReturn
 */
export function deleteWaterLevelById (data: any) {
  return useAxiosApi('api/waterlevel/delByIds', {
    method: 'DELETE',
    data: data
  })
}

/**
 * 按id删除遥感数据
 * @returns UseAxiosReturn
 */
export function deleteRemoteSensingById (data: any) {
  return useAxiosApi('api/RemoteSensing/DelByIds', {
    method: 'DELETE',
    data: data
  })
}

/**
 * 按id删除无人机数据
 * @returns UseAxiosReturn
 */
export function deleteDroneById (data: any) {
  return useAxiosApi('api/Drone/DelByIds', {
    method: 'DELETE',
    data: data
  })
}

/**
 * 查询径流分页数据
 * @returns UseAxiosReturn
 */
export function getTbFlowPageQuery (data: any) {
  return useAxiosApi('api/tbFlow/pageQurey', {
    method: 'POST',
    data: data
  })
}

/**
 * 查询遥感分页数据
 * @returns UseAxiosReturn
 */
export function getRemoteSensingPageQuery (data: any) {
  return useAxiosApi('api/RemoteSensing/pageQurey', {
    method: 'POST',
    data: data
  })
}

/**
 * 查询无人机分页数据
 * @returns UseAxiosReturn
 */
export function getDronePageQuery (data: any) {
  return useAxiosApi('api/Drone/pageQurey', {
    method: 'POST',
    data: data
  })
}
/**
 * 按id删除径流数据
 * @returns UseAxiosReturn
 */
export function deleteTbFlowById (data: any) {
  return useAxiosApi('api/tbFlow/DelByIds', {
    method: 'DELETE',
    data: data
  })
}

/**
 * 查询鸟类分页数据
 * @returns UseAxiosReturn
 */
export function birdPageQuery (data: any) {
  return useAxiosApi('/api/ObservationBird/pageQuery', {
    method: 'POST',
    data: data
  })
}


/**
 * 按id删除鸟类数据
 * @returns UseAxiosReturn
 */
export function birdDelByIds (data: any) {
  return useAxiosApi('/api/ObservationBird/delByIds', {
    method: 'DELETE',
    data: data
  })
}

/**
 * 按日期导出鸟类Excel文件
 * @returns UseAxiosReturn
 */
export function getBirdExcelByDate (data: any) {
  return useAxiosApi('/api/ObservationBird/ExcelByDate', {
    method: 'POST',
    data: data,
    responseType: 'blob'
  })
}

/**
 * 获取鸟类科、种、目信息
 * @returns UseAxiosReturn
 */
export function getBirdData (data: any) {
  return useAxiosApi('/api/ObservationBird/fetchData', {
    method: 'POST',
    data: data,
  })
}

/**
 * 鸟类获取可用日期
 * @returns UseAxiosReturn
 */
export function getBirdDate (data: any) {
  return useAxiosApi('/api/ObservationBird/getObservationTime', {
    method: 'POST',
    data: data,
  })
}

/**
 * 级联查询数据库所有目，科，种
 * @returns UseAxiosReturn
 */
export function getBirdMKZ (data: any) {
  return useAxiosApi('api/species/getBirdMKZ', {
    method: 'POST',
    data: data,
  })
}


/**
 * 保存目，科，种
 * @returns UseAxiosReturn
 */
export function addBirdData (data: any) {
  return useAxiosApi('api/species/addBirdData', {
    method: 'POST',
    data: data,
  })
}
/**
 * 返回最近一天鸟类占比百分比
 * @returns UseAxiosReturn
 */
export function getBirdRate (data: any) {
  return useAxiosApi('/api/ObservationBird/percenttageInLastDay', {
    method: 'POST',
    data: data,
  })
}

/**
 * 根据搜索条件获取用户列表，分页
 * @returns UseAxiosReturn
 */
export function getUserListByCondition (data: any) {
  return useAxiosApi('/api/user/getUserListByCondition', {
    method: 'POST',
    data: data
  })
}
/**
 * 根据用户id集合和条件删除用户列表
 * @returns UseAxiosReturn
 */
export function deleteUserList (data: any) {
  return useAxiosApi('/api/user/deleteUserList', {
    method: 'POST',
    data: data
  })
}

/**
 * 根据用户id更新用户信息
 * @returns UseAxiosReturn
 */
export function updateUserInfo (data: any) {
  return useAxiosApi('/api/user/updateUserInfo', {
    method: 'POST',
    data: data
  })
}

/**
 * 通过类型，查询时间列表
 * @returns UseAxiosReturn
 */
export function getTimesByType (data: any) {
  return useAxiosApi('/api/utils/getTimesByType', {
    method: 'POST',
    data: data
  })
}

/**
 * 自定义查询观测设备或地点信息
 观测设备种类分类；
01：光谱和水体监测点；
02：径流监测点；
03：气象站；
04：外业调查点位
 * @returns UseAxiosReturn
 */
export function queryDeviceByMultiWord (data: any) {
  return useAxiosApi('/api/device/queryDeviceByMultiWord', {
    method: 'POST',
    data: data
  })
}
/**
 * 根据条件查询设备-分页列表
 * @param data 
 * @returns 
 */
export function getDeviceListPage (data: any) {
  return useAxiosApi('/api/device/getDeviceListPage', {
    method: 'POST',
    data: data
  })
}
/**
 * 根据设备id更新信息
 * @param data 
 * @returns 
 */
export function updateDeviceInfo (data: any) {
  return useAxiosApi('/api/device/updateDeviceInfo', {
    method: 'POST',
    data: data
  })
}
/**
 * 新增设备信息
 * @param data 
 * @returns 
 */
export function addDeviceInfo (data: any) {
  return useAxiosApi('/api/device/insertDevice', {
    method: 'POST',
    data: data
  })
}

/**
 * 大屏-获取设备观测点位置和介绍信息
 * @param data 
 * @returns 
 */
export function findDevicePositionAndIntroduce (data: any) {
  return useAxiosApi('/api/deviceIntroduceTable/findDevicePositionAndIntroduce', {
    method: 'POST',
    data: data
  })
}

/**
 * 大屏-获取设备观测点个数信息
 * @param data 
 * @returns 
 */
export function queryDeviceNums (data: any) {
  return useAxiosApi('/api/device/queryDeviceNums', {
    method: 'POST',
    data: data
  })
}

/**
 * 根据设备id删除信息
 * @param data 
 * @returns 
 */
export function deleteDeviceDataById (data: any) {
  return useAxiosApi('/api/device/deleteDeviceDataById', {
    method: 'POST',
    data: data
  })
}
/**
 * 查询角色列表
 * @returns UseAxiosReturn
 */
export function getRoleList (data: any) {
  return useAxiosApi('/api/role/getRoleList', {
    method: 'POST',
    data: data
  })
}

/**
 * 根据条件查询角色-权限分页列表
 * @returns UseAxiosReturn
 */
export function getRoleRightListPage (data: any) {
  return useAxiosApi('/api/role/getRoleRightListPage', {
    method: 'POST',
    data: data
  })
}

/**
 * 查询权限列表
 * @returns UseAxiosReturn
 */
export function getPurviewList (data: any) {
  return useAxiosApi('/api/purview/getPurviewList', {
    method: 'POST',
    data: data
  })
}
/**
 * 根据角色id删除角色数据
 * @returns UseAxiosReturn
 */
export function deleteRoleDataById (data: any) {
  return useAxiosApi('/api/role/deleteRoleDataById', {
    method: 'POST',
    data: data
  })
}

/**
 * 根据角色id进行更新信息
 * @returns UseAxiosReturn
 */
export function updateRoleInfo (data: any) {
  return useAxiosApi('/api/role/updateRoleInfo', {
    method: 'POST',
    data: data
  })
}

/**
 * 新增角色信息
 * @returns UseAxiosReturn
 */
export function addRoleInfo (data: any) {
  return useAxiosApi('/api/role/addRoleInfo', {
    method: 'POST',
    data: data
  })
}
/**
 * 湿地植物检测
 * @returns UseAxiosReturn
 */
export function PlantGetData (data: any) {
  return useAxiosApi('/api/monitoring/plantGetData', {
    method: 'POST',
    data: data
  })
}
/**
 * 湿地土壤检测
 * @returns UseAxiosReturn
 */
export function WetlandSoilGetData (data: any) {
  return useAxiosApi('/api/monitoring/wetlandSoilGetData', {
    method: 'POST',
    data: data
  })
}

/**
 * 根据条件查询权限分页列表
 * @returns UseAxiosReturn
 */
export function getPurviewListPage (data: any) {
  return useAxiosApi('/api/purview/getPurviewListPage', {
    method: 'POST',
    data: data
  })
}

/**
 * 调用权限信息更新接口
 * @returns UseAxiosReturn
 */
export function updatePurviewInfo (data: any) {
  return useAxiosApi('/api/purview/updatePurviewInfo', {
    method: 'POST',
    data: data
  })
}

/**
 * 根据权限id删除角色数据
 * @returns UseAxiosReturn
 */
export function deletePurviewDataById (data: any) {
  return useAxiosApi('/api/purview/deletePurviewDataById', {
    method: 'POST',
    data: data
  })
}


/**
 * 新增权限信息
 * @returns UseAxiosReturn
 */
export function addPurviewInfo (data: any) {
  return useAxiosApi('/api/purview/addPurviewInfo', {
    method: 'POST',
    data: data
  })
}
/**
 * 查询湿地土壤分页数据
 * @returns UseAxiosReturn
 */
export function getEetlandSoilPageQuery (data: any) {
  return useAxiosApi('/api/wetlandSoilMonitoring/pageQurey', {
    method: 'POST',
    data: data
  })
}

/**
 * 按id删除湿地土壤数据
 * @returns UseAxiosReturn
 */
export function deleteWetlandSoilId (data: any) {
  return useAxiosApi('/api/wetlandSoilMonitoring/DelByIds', {
    method: 'DELETE',
    data: data
  })
}
/**
 * 查询湿地植被分页数据
 * @returns UseAxiosReturn
 */
export function getPlantPageQuery (data: any) {
  return useAxiosApi('/api/plantMonitoring/pageQurey', {
    method: 'POST',
    data: data
  })
}

/**
 * 按id删除湿地植被数据
 * @returns UseAxiosReturn
 */
export function deletePlantSoilId (data: any) {
  return useAxiosApi('/api/plantMonitoring/DelByIds', {
    method: 'DELETE',
    data: data
  })
}
/**
 * 查询数据管理分页数据
 * @returns UseAxiosReturn
 */
export function dataManagePageQuery (data: any) {
  return useAxiosApi('/api/dataManagement/findDataPageByCondition', {
    method: 'POST',
    data: data
  })
}

/**
 * 按数据公开情况数据
 * @returns UseAxiosReturn
 */
export function dataOpen (data: any) {
  return useAxiosApi('/api/dataOpen', {
    method: 'DELETE',
    data: data
  })
}
/**
 * 获取大屏水鸟科普信息
 * @returns UseAxiosReturn
 */
export function getFullscreenBirdInfo(data: any) {
  return useAxiosApi('/api/fullscreenBird/getBirdInfo', {
    method: 'POST',
    data: data
  });
}
/**
 * 鸟类分页查询
 * @returns UseAxiosReturn
 */
export function getBirdPageData(data: any) {
  return useAxiosApi('/api/birds/pageQuery', {
    method: 'POST',
    data: data
  });
}
/**
 * 获取文件名和路径
 * @returns UseAxiosReturn
 */
export function getFilepath(data: any) {
  return useAxiosApi('/api/all/getFilepath', {
    method: 'POST',
    data: data
  });
}
/**
 * 本地路径下载
 * @returns UseAxiosReturn
 */
export function fileDownload(data: any) {
  return useAxiosApi('/api/fileDownloadById', {
    method: 'POST',
    data: data,
    responseType: 'blob'
  });
}