<template>
  <el-container style="height:calc(100% - 62px);margin-top:2px">
    <el-aside v-show="$store.state.menuShow" width="350px;" style="width:300px;height:100%;border-right:1px solid #e6e6e6">
      <leftMenu style="margin-top:5px"></leftMenu>
    </el-aside>
    <el-main>
      <div class="">
        <imgMenuShowComp></imgMenuShowComp>

        <el-breadcrumb separator="/" style="margin:5px 0 50px 0">
          <el-breadcrumb-item :to="{ path: 'report' }">{{$t('report.project')}} {{$store.state.projectName}}</el-breadcrumb-item>
          <el-breadcrumb-item>{{$t('leftMenu.expr_matrix')}}</el-breadcrumb-item>
        </el-breadcrumb>

        <h2>{{$t('leftMenu.expr_matrix')}}</h2>

        <p>{{$t('expr_matrix.introduction')}}</p>

        <p>{{$t('expr_matrix.describe')}}</p>

        <p>$$ TPM_{i} = \frac{ \frac{ N_{i} }{ L_{i} } * 1000000}{\sum_{i=1}^{n} \frac{N_{i}}{L_{i}}}$$</p>

        <p>N<sub>i</sub>：{{$t('expr_matrix.Ni')}}</p>
        <p>L<sub>i</sub>：{{$t('expr_matrix.Li')}}</p>
        <p>{{$t('expr_matrix.TMP_span1')}} (N<sub>i</sub>/L<sub>i</sub>) {{$t('expr_matrix.TMP_span2')}}</p>

        <el-card class="" style="width:1300px;min-width:1300px" shadow="hover">
          <div class="" style="display:inline-block;vertical-align:top;">
            <div class="">
              <div class="labelStyle">
                <label for="maxpval" class="label-font">geneId</label>
              </div>
              <el-input
                style="width:400px;"
                type="textarea"
                :rows="3"
                :placeholder="$t('input.split')"
                v-model="textareaGeneId">
              </el-input>
            </div>
          </div>
          <div class="" style="display:inline-block;vertical-align:top;">
            <div class="">
              <div class="labelStyle">
                <label for="maxpval" class="label-font">geneName</label>
              </div>
              <el-input
                style="width:400px;"
                type="textarea"
                :rows="3"
                :placeholder="$t('input.split')"
                v-model="textareaGeneName">
              </el-input>
            </div>
            <br>
            <div class="">
              <div class="labelStyle">
              </div>
              <el-button style="float:right" type="info" @click="clear()">{{$t('button.clear')}}</el-button>
              <el-button style="float:right;margin-right:10px;" type="primary" @click="search()">{{$t('button.select')}}</el-button>
            </div>
          </div>
        </el-card>
        <br>

        <!-- <div class="overflow-auto"> -->
        <div class="">
          <table id="patients" cellspacing="0" class="display table table-striped table-bordered">
              <thead>
              <tr>
                  <th v-for="item in tpmsArray">{{item}}</th>
              </tr>
              </thead>
          </table>
        </div>
      </div>
      <div class="clear">

      </div>
    </el-main>
  </el-container>
</template>

<script>
import leftMenu from './leftMenu.vue'
import imgMenuShowComp from './imgMenuShowComp.vue'

export default {
  data () {
    return {
      tpmsArray: [],
      arr: [{
          "mDataProp" : "geneId"
      }, {
          "mDataProp" : "geneName"
      }],
      textareaGeneName: '',
      textareaGeneId: ''
    }
  },
  components: {
    leftMenu,
    imgMenuShowComp
  },
  mounted () {
    this.getTpms()
    this.$nextTick(function() {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    });
  },
  methods: {
    getTpms () {
      this.axios('/server/gene_tpms?p=' + this.$store.state.projectId + '&username=' + this.$store.state.username + '&sEcho=1&iDisplayStart=0&iDisplayLength=1').then((res) => {
        if (res.data.aData.length > 0)  {
          let obj = res.data.aData[0].tpms
          for (let k in obj) {
            this.tpmsArray.push(k)
          }
          // table head 按照 a～z 排序
          this.tpmsArray.sort()
          this.tpmsArray.map((item) => {
            this.arr.push({
                "mDataProp" : "tpms",
                "mRender" : function(data, type, full) {
                    return Math.ceil(data[item])
                }
            })
          })
          this.tpmsArray.unshift('geneName')
          this.tpmsArray.unshift('geneId')
        }
        this.initTable()
      })
    },
    initTable () {
      let self = this
      $(document).ready(function() {
          self.table = $('#patients').DataTable({
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
              "sAjaxSource" : "/server/gene_tpms?p=" + self.$store.state.projectId + "&username=" + self.$store.state.username +  "&geneName=" + self.textareaGeneName.replace(/\s/g,'') +  "&geneId=" + self.textareaGeneId.replace(/\s/g,''),
              "aoColumns" : self.arr,
              // "aoColumnDefs":[{"aTargets":[2][1],"mRender":function(){
              //        return "<a href=#>1441</a>"}
              // }]
          });
        })
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
  }
}
</script>

<style scoped="true">
.content {
  float:left;
  /* width: 60%; */
  width: calc(100% - 350px);
  padding: 0 20px;
  margin: 19px auto;
}
.cursor-pointer {
  cursor: pointer;
}
.imgStyle {
  width: 100%;
}
.overflow-auto {
  overflow: auto;
}
.clear {
  clear: both;
}
.labelStyle {
  display: inline-block;
  width: 95px;
  text-align: end;
}

.filterbtnDiv {
  float: right;
  margin-bottom: 10px;
}

.text-align-center {
  text-align: center;
}
.label-font {
  font-size: 14px;
}
</style>
