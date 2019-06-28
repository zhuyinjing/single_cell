<template>
<el-container style="height:calc(100% - 62px);margin-top:2px">
  <el-aside v-show="$store.state.menuShow" width="350px;" style="width:300px;height:100%;border-right:1px solid #e6e6e6">
    <leftMenu style="margin-top:5px"></leftMenu>
  </el-aside>
  <el-main>
    <div class="">
      <imgMenuShowComp></imgMenuShowComp>

      <el-breadcrumb separator="/" style="margin:5px 0 50px 0">
        <el-breadcrumb-item>{{$t('report.project')}} {{$store.state.projectName}}</el-breadcrumb-item>
        <el-breadcrumb-item></el-breadcrumb-item>
      </el-breadcrumb>
      <h2>{{$t('report.title')}}</h2>
      <p>{{$t('report.introduction')}}</p>

      <h2>{{$t('report.project')}}{{$store.state.projectName}}{{$t('report.describe')}}</h2>
      <p>{{$t('report.species')}}：<span class="latinNameStyle">{{this.displayLatinName}}</span> ( {{this.displayName}} )</p>
      <p>{{$t('report.genome')}}：{{this.genome}}</p>

      <h2>{{$t('report.experiment')}}</h2>

      <div class="" id="canvas">
        <div class="tableStyle">
          <p class="p-font-style">{{$t('create_experiment.experiment_list')}}</p>
          <table class="gridtable">
            <tr>
              <th>{{$t('create_experiment.experiment_condition')}}</th>
              <th>{{$t('create_experiment.sample_name')}}</th>
            </tr>
            <tr v-for="(item, value, index) in $store.state.info.experimentDesign.nameSampleMap">
              <td :class="{'bgcolor': index % 2 === 0 ? false: true}">{{item.condition}}</td>
              <td :class="{'bgcolor': index % 2 === 0 ? false: true}">{{item.name}}</td>
            </tr>
          </table>
        </div>
        <div class="degtable">
          <p class="p-font-style">{{$t('create_experiment.case_control')}}</p>
          <table class="gridtable">
            <tr>
              <th>{{$t('create_experiment.case')}}</th>
              <th>{{$t('create_experiment.control')}}</th>
            </tr>
            <tr v-for="(item, index) in $store.state.info.experimentDesign.experiments">
              <td :class="{'bgcolor': index % 2 === 0 ? false: true}">{{item._case}}</td>
              <td :class="{'bgcolor': index % 2 === 0 ? false: true}">{{item._control}}</td>
            </tr>
          </table>
        </div>
      </div>

    </div>
  </el-main>
</el-container>
</template>

<script>
import leftMenu from './leftMenu.vue'
import imgMenuShowComp from './imgMenuShowComp.vue'

export default {
  data() {
    return {
      geneNum: null,
      transcriptNum: null,
      displayLatinName: null,
      displayName: null,
      genome: null,
      dialog: false,
    }
  },
  components: {
    leftMenu,
    imgMenuShowComp
  },
  mounted() {
    this.getValue()
  },
  methods: {
    pdf() {
      // html2canvas(document.body, {
      //     onrendered:function(canvas) {
      //
      //         //返回图片dataURL，参数：图片格式和清晰度(0-1)
      //         var pageData = canvas.toDataURL('image/jpeg', 1.0);
      //
      //         //方向默认竖直，尺寸ponits，格式a4[595.28,841.89]
      //         var pdf = new jsPDF('', 'pt', 'a4');
      //
      //         //addImage后两个参数控制添加图片的尺寸，此处将页面高度按照a4纸宽高比列进行压缩
      //         pdf.addImage(pageData, 'JPEG', 0, 0, 595.28, 592.28/canvas.width * canvas.height );
      //
      //         pdf.save('stone.pdf');
      //
      //     }
      // })

      // printJS({
      //   printable: 'canvas',
      //   type: 'html',
      //   showModal: true,
      //   targetStyles: ['*']
      //  })

      // var pdf = new jsPDF('p', 'pt', 'a4')
      // $('#canvas').css("background", "#fff")
      // pdf.addHTML($("#canvas"),{pagesplit: false, retina: true}, () => {
      //   pdf.internal.scaleFactor = 3.75;
      //   pdf.output("save", "test.pdf")
      // })
    },
    getValue() {
      this.axios.get('/server/rnaseq_report_summary?username=' + this.$store.state.username + '&p=' + this.$store.state.projectId + '&speciesId=' + this.$store.state.species).then((res) => {
        if (res.data.message_type === 'success') {
          // this.geneNum = res.data.rnaSeqReportSummary.geneNum
          // this.transcriptNum = res.data.rnaSeqReportSummary.transcriptNum
          this.displayLatinName = res.data.speciesInfo.latinName
          this.displayName = res.data.speciesInfo.commonName
          this.genome = res.data.referenceInfo.genome
        }
      })
    },
  }
}
</script>

<style scoped="true">
.content {
  float: left;
  /* width: 60%; */
  width: calc(100% - 350px);
  padding: 0 20px;
  margin: 19px auto;
}

.p-font-style {
  /* color: #666; */
}

.cursor-pointer {
  cursor: pointer;
}

.latinNameStyle {
  font-style: italic;
}

table.gridtable {
  width: 100%;
  text-align: center;
  font-size: 14px;
  color: #333333;
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

.tableStyle {
  display: inline-block;
  width: 40%;
  margin-right: 50px;
}

.degtable {
  display: inline-block;
  width: 40%;
}

.bgcolor {
  background-color: #f9f9f9 !important;
}
</style>
