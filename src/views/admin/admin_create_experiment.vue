<template>
  <div class="content">
    <el-tooltip class="item cursor-pointer" effect="dark" :content="$t('button.back')" placement="right">
      <i class="el-icon-back" @click="backProjectList"></i>
    </el-tooltip>
    <p>{{$t('project_list.project_name')}}: {{this.$store.state.projectName}}</p>
    <div class="">
      <el-button type="danger" @click="editDesign()"><i class="el-icon-edit"></i>{{$t('create_experiment.edit_experiment')}}</el-button>
      <!-- <el-button type="" @click="clearDesign"><i class="el-icon-delete"></i>{{$t('create_experiment.clear_experiment')}}</el-button> -->
    </div>
    <p class="p-font-style">{{$t('create_experiment.experiment_list')}}</p>

    <div class="" v-if="$store.state.projectType === 'ScRNA_CCA'">
      <table class="gridtable">
        <tr>
            <th>样本组</th><th>样本数</th><th>样本名称</th>
        </tr>
        <tr v-for="(item, index) in experimentDesign.sampleGroups">
            <td :class="{'bgcolor': index % 2 === 0 ? false: true}">{{item.groupName}}</td>
            <td :class="{'bgcolor': index % 2 === 0 ? false: true}">{{item.sampleNum}}</td>
            <td :class="{'bgcolor': index % 2 === 0 ? false: true}">{{item.sampleList.join(", ")}}</td>
        </tr>
      </table>
    </div>

    <div class="" v-if="$store.state.projectType === 'ScRNA_PCA'">
      <table class="gridtable">
        <tr>
            <th>样本数</th><th>样本名称</th>
        </tr>
        <tr>
            <td>{{experimentDesign.sampleNum}}</td>
            <td>{{experimentDesign.sampleName.join(", ")}}</td>
        </tr>
      </table>
    </div>

    <el-dialog  :title="$t('create_experiment.edit_experiment')" :visible.sync="step1Dialog" width="50%">
      <div class="" v-if="$store.state.projectType === 'ScRNA_CCA'">
        <el-button type="danger" @click="addConditionCCA()">
          <i class="el-icon-circle-plus"></i>
          {{$t('create_experiment.add_condition')}}
        </el-button>
        <div class="padding-10-5" v-for="(item, index) in editCCA.sampleGroups">
          样本组
          <el-input
            class="conditioninput width-100"
            v-model="item.groupName"
            clearable>
          </el-input>
          样本数
          <el-input
            class="numberinput width-100"
            v-model.number="item.sampleNum"
            clearable>
          </el-input>
          <i class="el-icon-remove cursor-poiter" @click="deleteOptionCCA(index)"></i>
        </div>
      </div>
      <div class="" v-if="$store.state.projectType === 'ScRNA_PCA'">
        <el-button type="danger" @click="addConditionPCA()">
          <i class="el-icon-circle-plus"></i>
          {{$t('create_experiment.add_condition')}}
        </el-button>
        <div class="padding-10-5" v-for="(item, index, key) in editPCA.sampleName">
          样本名称
          <el-input
            class="conditioninput width-100"
            v-model.number="editPCA.sampleName[index]"
            clearable>
          </el-input>
          <i class="el-icon-remove cursor-poiter" @click="deleteOptionPCA(index)"></i>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="step1Dialog = false">{{$t('button.cancel')}}</el-button>
        <el-button type="danger" @click="createExperiment()">{{$t('button.confirm')}}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    return {
      step1Dialog: false,
      step2Dialog: false,
      condition: [],
      conditionNumMap: {},
      conditionList: [],
      experiments: null,
      experimentDesign: {'sampleName':[]},
      editCCA: [],
      editPCA: [],
    }
  },
  components: {
  },
  mounted () {
    this.getExperiment()
  },
  methods: {
    getExperiment () {
      this.axios.get('/server/experiment?username=' + this.$store.state.username + '&p=' + this.$store.state.projectId).then((res) => {
        if (res.data.message_type === 'success') {
          if (res.data.experimentDesign) {
            this.experimentDesign = res.data.experimentDesign
          } else {
            this.$store.state.projectType === 'ScRNA_CCA' ? this.experimentDesign = {'sampleGroups':[]} : this.experimentDesign = {'sampleName':[]}
            this.$message("暂无实验设计，请编辑！")
          }
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    editDesign () {
      if (this.experimentDesign) {
        if (this.$store.state.projectType === 'ScRNA_CCA') {
          this.editCCA = JSON.parse(JSON.stringify(this.experimentDesign))
        } else {
          this.editPCA = JSON.parse(JSON.stringify(this.experimentDesign))
        }
      }
      this.step1Dialog = true
    },
    addConditionPCA () {
      this.editPCA.sampleName.push('')
    },
    addConditionCCA () {
      this.editCCA.sampleGroups.push({sampleGroups: '', groupNum: null})
    },
    deleteOptionCCA (index) {
      this.editCCA.sampleGroups.splice(index, 1)
    },
    deleteOptionPCA (index) {
      this.editPCA.sampleName.splice(index, 1)
    },
    createExperiment () {
      if (this.$store.state.projectType === 'ScRNA_CCA') {
        if (this.editCCA.sampleGroups.length === 0) { // 不填写条件
          this.$message.error('请填写完整信息！')
          return
        }
        let flag = this.editCCA.sampleGroups.some(item => !item.groupName || !item.sampleNum) // 条件中有一项为空
        if (flag === true) {
          this.$message.error('请填写完整信息！')
          return
        }

        let obj = {}
        this.editCCA.sampleGroups.map(item => {
          obj[item.groupName] = [...new Array(item.sampleNum)].map((k,i) => item.groupName + (i + 1))
        })

        let formData = new FormData()
        formData.append('username', this.$store.state.username)

        formData.append('p', this.$store.state.projectId)
        formData.append('experimentObjectString', JSON.stringify(obj))
        this.axios.post('/server/create_experiment', formData).then((res) => {
          if(res.data.message_type === 'success') {
            this.$message.success(res.data.message)
            this.getExperiment()
          } else {
            this.$message.error('请求异常！')
          }
          this.step1Dialog = false
        })
      } else {
        if (this.editPCA.sampleName.length === 0) { // 不填写条件
          this.$message.error('请填写完整信息！')
          return
        }
        let flag = this.editPCA.sampleName.some(item => !item) // 条件中有一项为空
        if (flag === true) {
          this.$message.error('请填写完整信息！')
          return
        }
        let formData = new FormData()
        formData.append('username', this.$store.state.username)
        formData.append('p', this.$store.state.projectId)
        formData.append('experimentObjectString', JSON.stringify(this.editPCA.sampleName))
        this.axios.post('/server/create_experiment', formData).then((res) => {
          if(res.data.message_type === 'success') {
            this.$message.success(res.data.message)
            this.getExperiment()
          } else {
            this.$message.error('请求异常！')
          }
          this.step1Dialog = false
        })
      }
    },
    clearDesign () {
      this.$confirm('确认清空该实验设计吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          this.axios.get('/server/clear_experiment?username=' + this.$store.state.username + '&p=' + this.$store.state.projectId).then((res) => {
            if (res.data === 'success') {
              this.$message.success('已清空!');
              this.message = {}
            } else {
              this.$message.error('清空失败!');
            }
          })
        }).catch(() => {});

    },
    backProjectList () {
      this.$router.push({'path': '/admin'})
    }
  }
}
</script>

<style scoped="true">
.content {
  width: 60%;
  margin: 19px auto;
}
table.gridtable {
    width: 100%;
    text-align: center;
    font-size:14px;
    color:#333333;
    border-width: 1px;
    border-color: #ebeef5;
    border-collapse: collapse;
}
table.gridtable th {
    color: #333;
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #ebeef5;
}
table.gridtable td {
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #ebeef5;
    background-color: #ffffff;
}
.p-font-style{
  color: #666;
}
.cursor-poiter{
  cursor: pointer;
}
.tableStyle {
  display:inline-block;
  width:40%;
  margin-right:50px;
}
.right {
  float: right;
  width: 60px;
}
.item {
  margin: 4px;
}
.cursor-pointer {
  cursor: pointer;
}
.bgcolor {
  background-color: #f9f9f9 !important;
}
.degtable {
  display: inline-block;
  width: 40%;
}
.padding-10-5 {
  padding: 10px 5px;
}
.conditioninput {
  width: 30%;
  margin-right: 20px;
}
.numberinput {
  width: 20%;
  margin-right: 20px;
}
@media screen and (max-width:1400px) {
  .width-100 {
    width: 100%;
  }
}
</style>
