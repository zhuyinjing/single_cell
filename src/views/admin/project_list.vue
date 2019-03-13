<template>
  <el-row :gutter="20">
    <el-col :span="18" :offset="2">
      <div class="grid-content bg-purple">
        <br>

        <el-button type="primary" size="medium" @click="createProjectDialog = true">+ 创建项目</el-button><br><br>

        <el-card class="" shadow="hover">
          <el-row :gutter="20">
            <el-col :span="2"><div class="grid-content bg-purple line-height-40">项目名称</div></el-col>
            <el-col :span="4"><div class="grid-content bg-purple">
              <el-input v-model="input" placeholder="请输入内容"></el-input>
            </div></el-col>
            <el-col :span="2"><div class="grid-content bg-purple line-height-40">项目类型</div></el-col>
            <el-col :span="4"><div class="grid-content bg-purple">
              <el-select v-model="value" placeholder="请选择">
                <el-option value="RNA-Seq" label="RNA-Seq"></el-option>
              </el-select>
            </div></el-col>
            <el-col :span="2"><div class="grid-content bg-purple line-height-40">创建时间</div></el-col>
            <el-col :span="4"><div class="grid-content bg-purple">
              <el-date-picker
                style="width:100%"
                v-model="value1"
                type="date"
                placeholder="选择日期">
              </el-date-picker>
            </div></el-col>
            <el-col :span="2"><div class="grid-content bg-purple line-height-40">
              <el-button type="primary" size="medium">查询</el-button>
            </div></el-col>
          </el-row>
        </el-card>
        <br>

        <div class="">
          <table id="table" cellspacing="0" width="100%" class="display table table-striped table-bordered">
            <thead>
              <tr>
                <th>项目名称</th>
                <th>项目类型</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
      <div class="clear">

      </div>
      </div>
    </el-col>

    <el-dialog :title="$t('project_list.create_project')" :visible.sync="createProjectDialog" width="30%">
      <el-form :model="form">
        <el-form-item :label="$t('project_list.project_name')">
          <el-input v-model="form.name" auto-complete="off" clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('project_list.project_introduction')">
          <el-input v-model="form.description" auto-complete="off" clearable></el-input>
        </el-form-item>
        <div class="margin-bottom-10">
          <label for="">{{$t('project_list.species_type')}}</label>
        </div>
        <el-select v-model="form.species" :placeholder="$t('project_list.species_type')">
          <el-option :value="key" v-for="(item, key) in $store.state.speciesArr" :key="key">{{key}}</el-option>
        </el-select>
        <div class="selectDiv">
          <label for="">{{$t('project_list.sequencing_type')}}</label>
        </div>
        <el-select v-model="form.type" :placeholder="$t('project_list.species_type')">
          <el-option v-for="item in typeList" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createProjectDialog = false">{{$t('button.cancel')}}</el-button>
        <el-button type="primary" @click="createClick()">{{$t('button.confirm')}}</el-button>
      </div>
  </el-dialog>

  </el-row>
</template>

<script>
import imgMenuShowComp from '@/components/imgMenuShowComp.vue'

export default {
  data () {
    return {
      input: '',
      value: '',
      value1: '',
      textareaGeneName: '',
      textareaGeneId: '',
      table: null,
      createProjectDialog: false,
      projectList: null,
      form: {
        id: '',
        name: '',
        description: '',
        species: 'Human (Homo sapiens)',
        type: 'ScRNA_PCA'
      },
      speciesList: ['homo_sapiens', 'ictidomys_tridecemlineatus', 'glycine_max'],
      typeList: ['BulkRNA', 'ScRNA_PCA', 'ScRNA_CCA'],
      deleteId: ''
    }
  },
  components: {
    imgMenuShowComp
  },
  mounted () {
    this.$nextTick(() => {
      this.initTable()
    })
  },
  methods: {
    initTable () {
      let self = this
      $(document).ready(function() {
          this.table = $('#table').DataTable(
            {
              "pageLength": 25,
              "bPaginate" : true,//分页工具条显示
              //"sPaginationType" : "full_numbers",//分页工具条样式
              "bStateSave" : true, //是否打开客户端状态记录功能,此功能在ajax刷新纪录的时候不会将个性化设定回复为初始化状态
              "bScrollCollapse" : true, //当显示的数据不足以支撑表格的默认的高度
              "bLengthChange" : true, //每页显示的记录数
              "bFilter" : false, //搜索栏
              "bSort" : false, //是否支持排序功能
              "bInfo" : true, //显示表格信息
              "bAutoWidth" : true, //自适应宽度
              "bJQueryUI" : false,//是否开启主题
              "bDestroy" : true,
              "bProcessing" : true, //开启读取服务器数据时显示正在加载中……特别是大数据量的时候，开启此功能比较好
              "bServerSide" : true,//服务器处理分页，默认是false，需要服务器处理，必须true
              "sAjaxDataProp" : "aData",
              //通过ajax实现分页的url路径
              "sAjaxSource" : "/server/projects?username=" + self.$store.state.username,
              "aoColumns" : [
                  {
                    "mDataProp" : "name"
                }, {
                    "mDataProp" : "type"
                }, {
                    "mDataProp" : "openTime",
                    "mRender" : function(data, type, full) {
                        let time = data.split('T')[0] + ' ' + data.split('T')[1].split('.')[0]
                        return time
                    }
                }, {
                    "mDataProp" : "id",
                    "mRender" : function(data, type, full) {
                        return '<button id="experimentBtn" value="'+ data + '" class="el-button el-button--danger el-button--mini" @click="createExperiment()">实验设计</button>' + '<button id="reportBtn" class="el-button el-button--primary el-button--mini">查看报告</button>'
                    }
                }
              ],
            }
          );

          $('#table tbody').on( 'click', '#experimentBtn', function () {
            var row = $(this).parents('tr')[0]
            var data = $("#table").dataTable().fnGetData(row)
            self.commitStore(data)
            self.$router.push('/admin_create_experiment')
          })
        })
      },
    commitStore (item) {
      this.$store.commit('setprojectName', item.name)
      this.$store.commit('setprojectId', item.id)
      this.$store.commit('setspecies', item.speciesInfoEntity.id)
      this.$store.commit('setprojectType', item.type)
    },
    search () {
      this.initTable()
      setTimeout(() => {
        this.table.ajax.reload()  // 重新 load table
      }, 0)
    },
    clear () {
      this.textareaGeneName = ''
      this.textareaGeneId = ''
    },
    createExperiment () {
      this.$router.push('/admin_create_experiment')
    },
    createClick () {
      if (!this.form.name) {
        this.$message.error('项目名不能为空!')
        return
      }
      let formData = new FormData()
      formData.append('username', this.$store.state.username)
      formData.append('name', this.form.name)
      formData.append('description', this.form.description)
      formData.append('speciesId', this.$store.state.speciesArr[this.form.species])
      formData.append('type', this.form.type)
      this.axios.post('/server/create_project', formData).then((res) => {
        if (res.data.message_type === 'success') {
          this.getProjects()
        } else {
          this.$message.error('请求错误!');
        }
        this.form.name = ''
        this.form.description = ''
        this.createProjectDialog = false
      })
    },
  }
}
</script>

<style scoped="true">
.cursor-pointer {
  cursor: pointer;
}
.imgStyle {
  width: 100%;
}
.overflow-auto {
  overflow: auto;
}
.line-height-40 {
  line-height: 40px;
}
</style>
