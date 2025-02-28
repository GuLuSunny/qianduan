<template>
  <div class="header-actions">
    <!-- 用户头像和昵称 -->
    <div class="user-info">
      <el-space wrap size="20">
        <img class="avatar" src="@/assets/img/avatar.jpg" alt="用户头像" />
        <el-text class="mx-1" type="info" size="large">{{ nickname }} </el-text>
        <el-button type="info" text bg @click="goToLink">
          返回大屏系统
        </el-button>
        <el-button type="info" text bg @click="goToQuit"> 退出系统 </el-button>
      </el-space>
    </div>
  </div>
</template>

<script setup>
import { ref,onMounted,getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { logoutuser } from '@/api/getData'
import { ElMessage } from 'element-plus'
const nickname = ref('刘思远')
const routers = useRouter()
function goToLink () {
  routers.push('/bigscreenHome')
}

onMounted(() => {
  // 初始化
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      // 在 DOM 更新后执行
      const userinfo = JSON.parse(localStorage.getItem('Userinfo'))
      nickname.value = userinfo.username
    })
  }
})


function goToQuit () {
  if (
    localStorage.getItem('Authorization') === null ||
    localStorage.getItem('Authorization') === ''
  ) {
    routers.push('/login')
  } else {
    logoutuser({}).then((res) => {
      const result = res.response.value // 处理成功的响应
      // console.log(result)
      if (result.code === 'SUCCESS') {
        localStorage.setItem('Authorization', '')
        routers.push('/login')
      } else {
        const message = result.msg
        // alert(message)
        ElMessage({
          showClose: true,
          message: message,
          center: true
        })
      }
    })
  }
}
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: white;
  padding: 0;
}

.user-info {
  display: flex;
  align-items: center;
  margin-right: 10%;
}

.avatar {
  width: 36px; /* 修改宽度为 36px */
  height: 36px; /* 修改高度为 36px */
  border-radius: 50%;
  margin-right: 10px;
  margin-bottom: 10px; /* 调整下边距 */
  cursor: pointer;
}

.nickname {
  font-size: 16px;
  color: #555;
}
</style>
