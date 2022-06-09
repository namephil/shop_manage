<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card class="parambody">
      <el-alert
      title="注意只允许为第三级分类设置相关参数"
      type="warning"
      :closable="false"
      show-icon>
      </el-alert>
      <!--选择商品分类区域-->
      <el-row class="cat_opt">
          <el-col>
              <span>选择商品分类：</span>
              <!--选择商品分类级联选择-->
          </el-col>
          <!--级联选择框-->
          <el-cascader
          expand-trigger="hover"
          :options="cateList"
          :props="cateProps"
          v-model="selectedKeys"
          @change="handelChange"></el-cascader>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!--添加动态参数面板-->
        <el-tab-pane label="动态参数" name="many">
            <el-button :disabled="isBtnDisabled" type="primary" @click="dialogVisible = true">添加参数</el-button>
            <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <!--循环渲染TAG标签-->
                    <el-tag
                    closable
                    v-for="(item, i) in scope.row.attr_vals" :key="i"
                    @close="handelColseTag(i, scope.row)">{{item}}</el-tag>
                    <!--添加新标签-->
                    <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                    </el-input>
                    <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
            </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="handelEditForm(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
        </el-tab-pane>
        <!--添加静态属性面板-->
        <el-tab-pane label="静态属性" name="only">
            <el-button :disabled="isBtnDisabled" type="primary" @click="dialogVisible = true">添加属性</el-button>
            <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <!--循环渲染TAG标签-->
                    <el-tag
                    closable
                    v-for="(item, i) in scope.row.attr_vals" :key="i"
                    @close="handelColseTag(i, scope.row)">{{item}}</el-tag>
                    <!--添加新标签-->
                    <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                    </el-input>
                    <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
            </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="handelEditForm(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" size="mini"  @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数的对话框-->
    <el-dialog
    :title="titleText"
    :visible.sync="dialogVisible"
    width="30%"
    @close="handleClose">
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
    </span>
    </el-dialog>
    <!--修改参数对话框-->
    <el-dialog
    :title="titleText"
    :visible.sync="editDialogVisible"
    width="30%"
    @close="editHandleClose">
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      // 被激活页签的名称
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      dialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      inputVisible: false,
      // 文本框中输入的内容
      inputValue: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    // 级联选择框变化会触发该函数
    handelChange() {
      this.getParamsData()
    },
    // Tab页签点击事件
    handleClick() {
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return false
      }
      // 根据所选分类的ID和当前所属面板，获取对应参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      }
      if (this.activeName === 'only') {
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框的关闭事件
    handleClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('获取商品分类失败')
        }
        this.$message.success('添加商品成功')
        this.getParamsData()
        this.dialogVisible = false
      })
    },
    editHandleClose() {
      this.$refs.editFormRef.resetFields()
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    async handelEditForm(attrid) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrid}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 根据ID删除参数
    async removeParams(attrid) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => {
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
      })
      // 删除逻辑
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrid}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 将对attr_vals操作保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    },
    // 文本框失去焦点和按下enter都会触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return false
      }
      // 没有return，则证明输入的内容需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''
      // 发起请求保存这次操作
      this.saveAttrVals(row)
    },
    // 点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick当页面重新渲染之后才会指定回调函数中代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除标签项
    handelColseTag(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类ID
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 动态计算对话框标题
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt{
    margin: 15px;
}
.parambody{
    margin: 15px;
}
.el-breadcrumb{
    margin-bottom: 15px;
}
.el-tag{
    margin: 10px;
}
.input-new-tag{
    width: 120px;
}
</style>
