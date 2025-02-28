<template>
  <div class="bigBox">
    <div class="box">
      <!-- 滑动盒子 -->
      <div class="pre-box">
        <h1>多源数据综汇系统</h1>
        <div class="img-box">
          <img src="../assets/img/bg6.png" alt="" />
        </div>
      </div>
      <div class="login-form">
        <div class="title-box">
          <h1>登录</h1>
        </div>
        <div class="input-box-login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            label-with="5px"
            :rules="loginrules"
            hide-required-asterisk="true"
            class="input-box-login-form"
            v-loading.fullscreen.lock="fullscreenLoading"
          >
            <el-form-item prop="username" label="">
              <el-input
                type="text"
                placeholder="用户名"
                :suffix-icon="User"
                v-model="loginForm.username"
                style="width: 270px; height: 40px"
              />
            </el-form-item>
            <el-form-item prop="password" label="">
              <el-input
                type="password"
                placeholder="密码"
                :suffix-icon="Lock"
                v-model="loginForm.password"
                style="width: 270px; height: 40px"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="btn-box">
          <el-button type="primary" @click="login(loginFormRef)" class="btn-box-el-button"
            >登录</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { loginuser, register } from '@/api/getData'
import { defineComponent, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { updateUserPermissions } from '@/config/global-state'; 
const fullscreenLoading = ref(false) // 加载效果
const routers = useRouter()
const preRef = ref()
const loginFormRef = ref() // 登录校验

const loginForm = ref({
  // 登录
  username: '',
  password: ''
})

// 登录规则校验
const loginrules = reactive({
  username: [{ required: true, message: '此项必填', trigger: 'blur' }],
  password: [{ required: true, message: '此项必填', trigger: 'blur' }]
})

// 提交
const login = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      loginUser()
    }
  })
}

function loginUser () {
  fullscreenLoading.value = true
  loginuser({
    username: loginForm.value.username,
    password: loginForm.value.password
  })
    .then((res) => {
      const result = res.response.value // 处理成功的响应
      console.log(result)
      if (result.code === 'SUCCESS') {
        localStorage.setItem('Authorization', result.body.token)
        localStorage.setItem('Userinfo', result.body.userinfo)
        // 更新全局状态中的用户权限
        updateUserPermissions(result.body.principal);
        fullscreenLoading.value = false
        routers.push('/Cesuimap')
        // this.$router.push("about");
      } else {
        fullscreenLoading.value = false
        const message = result.msg
        ElMessage({
          showClose: true,
          message: message,
          center: true
        })
      }
    })
    .catch((error) => {
      fullscreenLoading.value = false
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}
/* 去除input的轮廓 */
input {
  outline: none;
}

.bigBox {
  /* 溢出隐藏 */
  height: 100vh;
  overflow-x: hidden;
  display: flex;
  /* 渐变方向从左到右 */
  background-image: url(../assets/img/bg10.jpg);
  background-size: cover;
}
/* 最外层的大盒子 */
.box {
  width: 1050px;
  height: 600px;
  display: flex;
  /* 相对定位 */
  position: relative;
  z-index: 2;
  margin: auto;
  /* 设置圆角 */
  border-radius: 8px;
  /* 设置边框 */
  border: 1px solid rgba(255, 255, 255, 0.6);
  /* 设置盒子阴影 */
  box-shadow: 2px 1px 19px rgba(0, 0, 0, 0.1);
  background: rgba(24, 24, 24, 0.3);
}
/* 滑动的盒子 */
.pre-box {
  /* 宽度为大盒子的一半 */
  width: 50%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 4px;
  box-shadow: 2px 1px 19px rgba(0, 0, 0, 0.1);
  background-color: rgba(128, 150, 110);
  /* 动画过渡，先加速再减速 */
  transition: 0.5s ease-in-out;
}
/* 滑动盒子的标题 */
.pre-box h1 {
  margin-top: 150px;
  /* 文字间距 */
  letter-spacing: 5px;
  color: white;
  /* 禁止选中 */
  user-select: none;
  /* 文字阴影 */
  text-shadow: 4px 4px 3px rgba(0, 0, 0, 0.1);
}

/* 图片盒子 */
.img-box {
  width: 200px;
  height: 200px;
  margin: 20px auto;
  /* 设置为圆形 */
  border-radius: 50%;
  /* 设置用户禁止选中 */
  user-select: none;
  overflow: hidden;
  box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.1);
}

/* 图片 */
.img-box img {
  width: 100%;
  transition: 0.5s;
}
/* 登录和注册盒子 */
.login-form {
  width: 50%;
  height: 100%;
  position: absolute;
  left: 50%;
  top: 5%;
}
/* 标题盒子 */
.title-box {
  width: 100%;
  position: absolute;
  top: 20%;
  justify-content: center;
}
/* 标题 */
.title-box h1 {
  color: white;
  /* 禁止选中 */
  user-select: none;
  letter-spacing: 5px;
  text-shadow: 4px 4px 3px rgba(0, 0, 0, 0.1);
}

.input-box-login-form {
  display: flex;
  flex-direction: column; /* 使得表单项垂直排列 */
  align-items: center; /* 垂直方向上的居中对齐 */
  width: 100%; /* 或者设置为具体宽度 */
  position: absolute;
  top: 30%;
  justify-content: center;
}
/* 按钮盒子 */
.btn-box {
  width: 100%; /* 或者设置为具体宽度 */
  display: flex;
  justify-content: center;
  position: absolute;
  top: 50%;
}

/* 按钮 */
button {
  width: 100px;
  height: 30px;
  margin: 0 7px;
  line-height: 30px;
  border: none;
  border-radius: 4px;
  background-color: #797c7f;
  color: rgb(250, 245, 245);
}

/* 按钮悬停时 */
button:hover {
  /* 鼠标小手 */
  cursor: pointer;
  /* 透明度 */
  opacity: 0.8;
}

/* 按钮文字 */
.btn-box p {
  height: 30px;
  line-height: 30px;
  /* 禁止选中 */
  user-select: none;
  font-size: 25px;
  color: rgb(246, 243, 243);
}

.btn-box p:hover {
  cursor: pointer;
  border-bottom: 1px solid white;
}
.btn-box-el-button{
  font-size: 20px;
}
</style>
