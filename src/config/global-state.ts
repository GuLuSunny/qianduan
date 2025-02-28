// 定义一个接口来描述用户权限的类型
interface UserPermissions {
  readonly permissions: string[];
}

// 创建一个全局状态对象，并为其添加类型
const globalState: { userPermissions: string[] } = {
  userPermissions: [] // 初始时没有权限
};

// 初始化全局状态，从localStorage加载用户权限（如果有的话）
function initializeGlobalState() {
  const savedPermissions = localStorage.getItem('userPermissions');
  if (savedPermissions) {
    globalState.userPermissions = JSON.parse(savedPermissions);
  }
};

// 提供一个函数来更新用户权限，并为其参数添加类型定义
export const updateUserPermissions: (newPermissions: string[]) => void = (newPermissions: string[]) => {
  globalState.userPermissions = newPermissions;
  // 保存权限到 LocalStorage
  localStorage.setItem('userPermissions', JSON.stringify(newPermissions));
};

// 提供一个函数来获取当前的用户权限，并为其返回值添加类型定义
export const getUserPermissions: () => string[] = () => {
  let userPermissions = localStorage.getItem('userPermissions');
  if (userPermissions !== null) {
    return JSON.parse(userPermissions) as string[];
  }else{
    return [] 
  }
};

// 初始化全局状态
//initializeGlobalState();

// 但由于我们想要一个全局可访问的对象和一个单独的更新函数，
// 我们通常会像上面那样分开定义它们，而不是将它们封装在一个接口实例中。
// 上面的GlobalState接口示例更多是为了展示如何定义这样的接口，
// 但在实际应用中，您可能会选择上面已经展示的更简单的方法。

// 最后，如果您想在多个文件中共享这个全局状态，
// 您可能需要将其放在一个单独的文件中，并使用export和import来在其他文件中访问它。
// 上面的代码已经做到了这一点，只是通过分开函数和对象来保持简单性。