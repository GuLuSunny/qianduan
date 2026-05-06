<template>
  <div class="header-actions">
    <div class="user-info">
      <el-space wrap size="20">
        <!-- 头像点击跳转个人信息页 -->
        <img 
          class="avatar" 
          src="@/assets/img/avatar.jpg" 
          alt="用户头像" 
          @click="goToProfile" 
          title="修改个人信息"
        />
        <el-text class="mx-1" type="info" size="large">{{ nickname }}</el-text>
        <el-button type="info" text bg @click="goToKgqa">AI小助手</el-button>
        <el-button type="info" text bg @click="goToLink">进入大屏系统</el-button>
        <el-button type="info" text bg @click="goToQuit">退出系统</el-button>
      </el-space>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 纯静态昵称（不用读缓存）
const nickname = ref('刘思远')
const router = useRouter()

// 跳转知识图谱问答页面
function goToKgqa() {
  router.push('/kgqa')
}

// 跳转大屏系统（静态路由跳转）
function goToLink() {
  router.push('/Cesuimap')
}

// 核心：跳转个人信息页（静态路由跳转）
function goToProfile() {
  router.push('/user/profile')
}

// 退出系统（静态逻辑，只跳转不调接口）
function goToQuit() {
  ElMessage.info('已退出系统（静态演示）')
  router.push('/login')
}
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: #fff;
  padding: 0;
}

.user-info {
  display: flex;
  align-items: center;
  margin-right: 10%;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.avatar:hover {
  transform: scale(1.05);
}

.nickname {
  font-size: 16px;
  color: #555;
}
</style>