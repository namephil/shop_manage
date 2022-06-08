<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
       <el-row>
           <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
       </el-row>
       <el-table :data="rolesList" border stripe>
       <!--展开列-->
         <el-table-column type="expand">
             <template slot-scope="scope">
                 <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                    <!--渲染一级-->
                    <el-col :span="5">
                      <el-tag closable @close="removeRightById(scope.row, item1)">{{item1.authName}}</el-tag>
                    </el-col>
                    <!--渲染二级和三级-->
                    <el-col :span="19">
                      <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                          <!--二级菜单-->
                          <el-col :span="6">
                            <el-tag type="success" closable @close="removeRightById(scope.row, item2)">{{item2.authName}}</el-tag>
                          </el-col>
                          <!--三级菜单-->
                          <el-col :span="13">
                            <el-row v-for="item3 in item2.children" :key="item3.id">
                                <el-tag type="warning" closable @close="removeRightById(scope.row, item3)">{{item3.authName}}</el-tag>
                            </el-row>
                          </el-col>
                      </el-row>
                    </el-col>
                 </el-row>
             </template>
         </el-table-column>
         <el-table-column type="index"></el-table-column>
         <el-table-column label="角色名称" prop="roleName"></el-table-column>
         <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
         <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"  @click="removeRoleById(scope.row.id)">删除</el-button>
            <!-- 分配角色按钮 -->
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
       </el-table>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="Id">
          <el-input v-model="editForm.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!--分配权限的对话框-->
    <el-dialog
    title="提示"
    :visible.sync="setRightDialogVisible"
    width="50%"
    @close="setRightDialogClosed">
      <!--树形结构-->
      <el-tree
      :data="rightList"
      :props="treeProps"
      show-checkbox node-key="id"
      default-expand-all
      :default-checked-keys="defKeys"
      ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 控制权限对话框的显示与隐藏
      setRightDialogVisible: false,
      rightList: [],
      // 树形控件的属性绑定
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      editDialogVisible: false,
      addRoleDialogVisible: false,
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { message: '请输入角色描述', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles', this.rolesList)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
    },
    // 删除角色
    async removeRightById(role, rightId) {
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      role.children = res.data
    },
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      this.rightList = res.data
      // 递归获取三级节点id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的方式，获取角色下所有三级权限的id，并保存到defKeys
    getLeafKeys(node, arr) {
      // 当前node节点不包含children属性，则是三级节点
      if (node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听权限分配对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败！')
      }

      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改角色信息并提交
    editRoleInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改角色信息的数据请求
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败！')
        }

        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getRolesList()
        // 提示修改成功
        this.$message.success('更新用户信息成功！')
      })
    },
    // 根据Id删除对应的用户信息
    async removeRoleById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('roles/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }

      this.$message.success('删除角色成功！')
      this.getRolesList()
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色
    async addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败！')
        }

        this.$message.success('添加角色成功！')
        // 隐藏添加用户的对话框
        this.addRoleDialogVisible = false
        // 重新获取用户列表数据
        this.getRolesList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>
