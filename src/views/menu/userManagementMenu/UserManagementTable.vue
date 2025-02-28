<template>
  <div class="container">
    <div class="controls">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="用户名">
          <el-input
            v-model="searchInfo.username"
            placeholder="请输入用户名"
            @input="handleInputChange"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="searchInfo.tel"
            placeholder="请输入手机号"
            type="number"
            @input="handleInputChange"
          />
        </el-form-item>
        <el-form-item label="单位">
          <el-input
            v-model="searchInfo.productionCompany"
            placeholder="请输入单位"
            @input="handleInputChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="findUserListByCondition" class="searchButton"
            ><el-icon> <Search /> </el-icon>搜索</el-button
          >
          <el-button
            @click="handleCenterDialogVisible(null, 2)"
            :disabled="!isButtonDelDisabled"
            >批量删除</el-button
          >
          <el-button @click="addButton" class="searchButton"
            ><el-icon> <DocumentAdd /> </el-icon>新增</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      height="100%"
      highlight-current-row
      class="el-table-class"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" prop="id" />
      <el-table-column
        fixed
        prop="username"
        label="用户名"
        width="200"
        align="center"
      />
      <el-table-column prop="tel" label="手机号" width="150" align="center" />
      <el-table-column prop="email" label="邮箱" width="200" align="center" />
      <el-table-column
        prop="productionCompany"
        label="单位"
        width="300"
        align="center"
      />
      <el-table-column prop="address" label="地址" width="250" align="center" />
      <el-table-column label="操作" width="auto" align="center">
        <template #default="scope">
          <el-button
            @click="handleModifyButton(scope.row)"
            class-name="center-button"
            >修改</el-button
          >
          <el-button
            @click="handleCenterDialogVisible(scope.row, 1)"
            class-name="center-button"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageData.currentPage"
      :page-sizes="[10, 30, 50, 100]"
      :page-size="pageData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageData.total"
      class="el-pagination-pages"
    >
    </el-pagination>

    <el-dialog
      v-model="centerDialogVisible"
      title="警告"
      width="300"
      :before-close="handleClose"
    >
      <span>你将删除{{ delCount }}条数据，是否确定删除？</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleCancelDialogVisible"
            >取消</el-button
          >
          <el-button @click="handleDeleteRow"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 修改用户信息 -->
    <el-dialog
      v-model="userInfoDialogFormVisible"
      title="修改用户信息"
      width="500"
    >
      <el-form
        ref="ruleFormRef"
        :model="userInfoForm"
        :label-position="right"
        label-width="70"
        :rules="rules"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userInfoForm.username" disabled />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="userInfoForm.password"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="重复密码" prop="passwordAgain">
          <el-input
            v-model="userInfoForm.passwordAgain"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="手机号" prop="tel">
          <el-input v-model="userInfoForm.tel" type="number" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfoForm.email" />
        </el-form-item>
        <el-form-item label="单位" prop="productionCompany">
          <el-input v-model="userInfoForm.productionCompany" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="userInfoForm.address" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select
            v-model="userInfoForm.roleId"
            placeholder="请选择角色"
            multiple
          >
            <el-option
              v-for="item in userRoleOptions"
              :key="item.id"
              :label="item.roleinfo"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userInfoDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增信息框 -->
    <el-dialog
      v-model="infoAddDialogFormVisible"
      title="用户信息新增"
      width="500"
    >
      <el-form
        ref="addRuleFormRef"
        :model="infoAddForm"
        :label-position="right"
        label-width="100"
        :rules="addRules"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="infoAddForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="infoAddForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="重复密码" prop="passwordAgain">
          <el-input
            v-model="infoAddForm.passwordAgain"
            type="password"
            show-password
            placeholder="请重复密码"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="tel">
          <el-input
            v-model="infoAddForm.tel"
            type="number"
            placeholder="请输入手机号"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="infoAddForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="单位" prop="productionCompany">
          <el-input
            v-model="infoAddForm.productionCompany"
            placeholder="请输入单位"
          />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="infoAddForm.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select
            v-model="infoAddForm.roleId"
            placeholder="请选择角色"
            multiple
          >
            <el-option
              v-for="item in userRoleOptions"
              :key="item.id"
              :label="item.roleinfo"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="infoAddDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="addSubmitForm(addRuleFormRef)">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  watch,
  computed,
  reactive,
  getCurrentInstance
} from 'vue'
import {
  getUserListByCondition,
  deleteUserList,
  updateUserInfo,
  getRoleList,
  register
} from '@/api/getData'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
const multipleSelection = ref([]) // 用于存储多选框被选中的行数据
const centerDialogVisible = ref(false) // 提示框
const userInfoDialogFormVisible = ref(false) // 修改用户信息弹出框
const clickRowInfo = ref([]) // 点击删除按钮的行信息
const delCount = ref(0) // 删除提示框，条数
const isButtonDelDisabled = ref(false) // 点击状态改变
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}
const searchInfo = ref({
  username: '',
  tel: '',
  productionCompany: ''
})
const ruleFormRef = ref() // 更新校验
const addRuleFormRef = ref() // 新增校验
const userInfoForm = ref({
  id: '',
  username: '',
  password: '',
  passwordAgain: '',
  tel: '',
  email: '',
  productionCompany: '',
  address: '',
  roleId: []
})
const tableData = ref([])
const pageData = ref({
  currentPage: 1, // 当前页数
  pageSize: 10, // 每页显示条目个数
  total: 0 // 总条目数
})
const hoveredRowIndex = ref(null) // 用于存储当前悬停的行索引

const userRoleOptions = ref([]) // 角色列表
// 定义初始对象
const initialInfo = {
  id: '',
  username: '',
  password: '',
  passwordAgain: '',
  tel: '',
  email: '',
  productionCompany: '',
  address: '',
  roleId: []
}
const infoAddDialogFormVisible = ref(false) // 信息新增弹出框
const infoAddForm = ref(JSON.parse(JSON.stringify(initialInfo))) // 新增框信息
const handleSizeChange = (number) => {
  // page-size 改变时触发
  pageData.value.pageSize = number
  findUserListByCondition()
}

function handleInputChange () {
  // 搜索框内容变化时执行
  isButtonDelDisabled.value = false
}

function handleSelectionChange (val) {
  // 多选框变化时执行
  const list = []
  for (let i = 0; i < val.length; i++) {
    list.push(val[i].id)
  }
  multipleSelection.value = list
}

function handleCancelDialogVisible () {
  // 弹出框取消按钮
  centerDialogVisible.value = false
  // 点击删除按钮所保存的信息初始化
  clickRowInfo.value = []
}

function handleCenterDialogVisible (info, clickType) {
  // 点击删除，批量删除时执行
  delCount.value = 0 // 删除条数初始化
  if (clickType === 1) {
    // 点击删除，删除数据量等于1
    clickRowInfo.value = []
    clickRowInfo.value.push(info.id)
    delCount.value = clickRowInfo.value.length
  } else if (clickType === 2) {
    // 点击批量删除
    if (multipleSelection.value.length === 0) {
      // 没有选中多选数据，删除数据量等于总数
      delCount.value = pageData.value.total
    } else {
      // 存在选中数据，删除数据量等于选中数据个数
      delCount.value = multipleSelection.value.length
    }
  }
  centerDialogVisible.value = true // 打开弹出框
}
function handleDeleteRow () {
  // 弹出框确定按钮执行
  centerDialogVisible.value = false // 取消弹出框
  // console.log('clickRowInfo:', clickRowInfo)
  // console.log('multipleSelection:', multipleSelection)
  let dataList = clickRowInfo
  if (clickRowInfo.value.length === 0) {
    dataList = multipleSelection
  }
  deleteUserList({
    username: searchInfo.value.username,
    tel: searchInfo.value.tel,
    productionCompany: searchInfo.value.productionCompany,
    userIds: dataList.value
  })
    .then((res) => {
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        ElMessage({
          showClose: true,
          message: '删除成功！',
          center: true
        })
        // 点击删除按钮所保存的信息初始化
        clickRowInfo.value = []
        // 点击批量删除按钮所保存的信息初始化
        multipleSelection.value = []
        // 成功获取
        findUserListByCondition()
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

const handleCurrentChange = (number) => {
  // current-page 改变时触发
  pageData.value.currentPage = number
  findUserListByCondition()
}

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      findUserListByCondition()
      findRoleList()
    })
  }
})
// 查询角色列表
function findRoleList () {
  getRoleList({})
    .then((res) => {
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        // 成功获取
        userRoleOptions.value = result.body
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

// 分页查询
function findUserListByCondition () {
  const loadingInstance = ElLoading.service(loadingoptions)
  isButtonDelDisabled.value = true // 设置批量删除可用
  getUserListByCondition({
    username: searchInfo.value.username,
    tel: searchInfo.value.tel,
    productionCompany: searchInfo.value.productionCompany,
    currentPage: pageData.value.currentPage,
    pageSize: pageData.value.pageSize
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        if (result.body.length === 0) {
          ElMessage({
            showClose: true,
            message: '数据不存在',
            center: true
          })
        } else {
          // 成功获取
          tableData.value = result.body.records
          pageData.value.currentPage = result.body.current
          // pageData.value.pageSize=result.body.size
          pageData.value.total = result.body.total
          clickRowInfo.value = [] // 清空存储
        }
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

// 点击修改按钮
function handleModifyButton (row) {
  userInfoForm.value = { ...row }
  const t1 = row.roleId
  let idArray = [] // id数组
  if (t1 !== null && t1 !== undefined) {
    idArray = t1.split(',')
  }
  // let t2 = row.roleInfo
  // t2 = t2 === null || t2 === undefined ? '' : t2
  // const nameArray = t2.split(',') // 名称数组
  userInfoForm.value.roleId = idArray.map(Number)
  userInfoDialogFormVisible.value = true
}

// 自定义校验
const validatePass2 = (rule, value, callback) => {
  if (value !== userInfoForm.value.password) {
    callback(new Error('两次密码输入不一致!'))
  } else {
    callback()
  }
}

// 更新规则校验
const rules = reactive({
  passwordAgain: [{ validator: validatePass2, trigger: 'blur' }],
  tel: [
    { pattern: /^1[3-9]\d{9}$/, message: '电话号码格式不正确', trigger: 'blur' }
  ],
  email: [
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '邮箱地址格式不正确',
      trigger: 'blur'
    }
  ]
})

// 自定义校验
const addvalidatePass2 = (rule, value, callback) => {
  if (value !== infoAddForm.value.password) {
    callback(new Error('两次密码输入不一致!'))
  } else {
    callback()
  }
}

// 新增规则校验
const addRules = reactive({
  password: [{ required: true, message: '此项必填', trigger: 'blur' }],
  passwordAgain: [
    { required: true, message: '此项必填', trigger: 'blur' },
    { validator: addvalidatePass2, trigger: 'blur' }
  ],
  tel: [
    { pattern: /^1[3-9]\d{9}$/, message: '电话号码格式不正确', trigger: 'blur' }
  ],
  email: [
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '邮箱地址格式不正确',
      trigger: 'blur'
    }
  ]
})
// 提交
const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      updateUser()
    }
  })
}

// 调用信息更新接口
function updateUser () {
  const loadingInstance = ElLoading.service(loadingoptions)
  // 或者使用展开运算符（更现代且简洁的方式）
  const requestObject = { ...userInfoForm.value }
  updateUserInfo(requestObject)
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        ElMessage({
          showClose: true,
          message: '更新成功',
          center: true
        })
        userInfoDialogFormVisible.value = false
        findUserListByCondition()
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

// 点击新增按钮
function addButton () {
  infoAddForm.value = JSON.parse(JSON.stringify(initialInfo))
  infoAddDialogFormVisible.value = true
}

// 新增提交
const addSubmitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      addUser()
    }
  })
}

// 调用信息新增接口
function addUser () {
  const loadingInstance = ElLoading.service(loadingoptions)
  // 或者使用展开运算符（更现代且简洁的方式）
  const requestObject = { ...infoAddForm.value }
  register(requestObject)
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        ElMessage({
          showClose: true,
          message: '注册成功',
          center: true
        })
        infoAddDialogFormVisible.value = false
        findUserListByCondition()
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}
</script>

<style>
.controls {
  margin-bottom: 10px;
  display: flex;
  width: 100%;
  height: 50px;
}
.el-pagination-pages {
  justify-content: center; /* 水平居中 */
}
.el-table-class .el-table__body tr.current-row > td {
  background: #79bbff !important;
}
</style>
