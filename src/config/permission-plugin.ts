import { getUserPermissions } from './global-state';

// 定义一个类型来描述权限字符串
type Permission = string;

// 定义一个插件类型，它必须有一个install方法
interface Plugin {
  install(app: any, options?: any): void; // 这里app的类型应该是具体的Vue应用类型，但为简化起见，我们使用any
}

// 创建一个插件对象，并实现install方法
const permissionPlugin: Plugin = {
  install(app) {
    // 为Vue应用的全局属性添加一个方法，用于检查权限
    app.config.globalProperties.$hasPermission = function (this: any, requiredPermission: Permission): boolean {
      // 注意：这里的this类型被指定为any，因为在Vue的插件中，this通常指向Vue的原型，但在这里我们不需要它
      const userPermissions = getUserPermissions();
      // console.log(userPermissions);
      // console.log(requiredPermission);
      return userPermissions.includes(requiredPermission);
    };
  }
};
 
// 导出插件
export default permissionPlugin; 