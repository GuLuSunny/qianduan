<template>
  <div class="profile-container">
    <el-card title="个人信息修改" shadow="hover" class="profile-card">
      <el-form label-width="120px" :model="userForm" class="profile-form">
        <!-- 头像区域（静态） -->
        <el-form-item label="用户头像">
          <img 
            class="profile-avatar" 
            src="@/assets/img/avatar.jpg" 
            alt="头像" 
          />
          <el-button type="primary" text class="ml-2">更换头像</el-button>
        </el-form-item>

        <!-- 静态不可修改字段 -->
        <el-form-item label="用户ID">
          <el-input v-model="userForm.id" disabled />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" disabled />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input v-model="userForm.create_time" disabled />
        </el-form-item>

        <!-- 静态可编辑字段 -->
        <el-form-item label="手机号">
          <el-input v-model="userForm.tel" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" type="email" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="userForm.address" />
        </el-form-item>
        <el-form-item label="所属单位">
          <el-input v-model="userForm.production_company" />
        </el-form-item>

        <!-- 静态操作按钮 -->
        <el-form-item class="btn-group">
          <el-button type="primary" @click="saveProfile">保存修改</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 纯静态模拟user表数据（不读接口/缓存）
const userForm = ref({
  id: '1001',          // 静态ID
  username: 'liusiYuan',// 静态用户名
  tel: '13800138000',   // 静态手机号
  address: '河南省郑州市',// 静态地址
  email: 'test@163.com',// 静态邮箱
  production_company: '河南大学',// 静态所属单位
  create_time: '2026-01-01'// 静态创建时间
})

// 静态保存
const saveProfile = () => {
  ElMessage.success('个人信息修改成功！')
}

// 静态返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.profile-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.profile-card {
  max-width: 700px;
  margin: 0 auto;
}

.profile-form {
  margin-top: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
}

.btn-group {
  margin-top: 30px;
  text-align: center;
}

.btn-group button {
  margin: 0 10px;
}
</style>