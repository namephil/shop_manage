<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" />
      </div>
      <!--登录表单区-->
      <el-form
        class="login_input"
        :model="LoginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <el-form-item prop="username">
          <el-input
            type="text"
            prefix-icon="el-icon-user-solid"
            placeholder="账号"
            v-model="LoginForm.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            prefix-icon="iconfont icon-3702mima"
            placeholder="密码"
            v-model="LoginForm.password"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">提交</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单的数据绑定对象
      LoginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { require: true, message: '请输入登录账户名', trigger: true },
          { min: 3, max: 6, message: '长度为3-6的账户名', trigger: true }
        ],
        password: [
          { require: true, message: '请输入密码', trigger: true },
          { min: 6, max: 8, message: '密码长度为6-8个字符', trigger: true }
        ]
      }
    }
  },
  methods: {
    // 点击重置登陆表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录预校验
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登陆成功')
        // 1.将登陆成功之后的token，保存到客户端sessionStorage中
        // 1.1 项目中除了登陆之外的其他API接口只有登陆后才能访问
        // 1.2 token只应在当前网站打开期间生效，所以将token保存在sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 2.通过编程式导航跳转到后台主页，路由地址是/home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: rgb(16, 90, 65);
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: white;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #ddd;
  }
}
.login_input {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 10px 0;
  box-sizing: border-box;
  margin-top: 10px;
}
.btns {
  display: flex;
  justify-content: center;
}
</style>
