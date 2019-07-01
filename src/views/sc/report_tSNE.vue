<template>
  <div id="container" v-loading="loading"  element-loading-text="请稍等，数据正在加载中..." element-loading-spinner="el-icon-loading" style="height:100%">
    <h2>tSNE 聚类</h2>
    <p>tSNE可以基于筛选后主成分进一步降维，然后对细胞进行聚类。完成聚类后，可根据实际的生物学问题，深入研究各类细胞之间的异同，及其背后的生物学意义。</p>

    {{$t('d3.radius')}}：<el-input-number size="mini" v-model="radius" :step="0.5" :min="0" @change="changeRadius()"></el-input-number>
    &nbsp;&nbsp;&nbsp;
    {{$t('d3.width')}}：<el-input-number size="mini" v-model="width" :step="100" :min="0" @change="changeWidth()"></el-input-number>
    &nbsp;&nbsp;&nbsp;
    {{$t('d3.height')}}：<el-input-number size="mini" v-model="height" :step="100" :min="0" @change="changeWidth()"></el-input-number> <br><br>

    <div id="svgContainer">
      <div class="svgBox">
        <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['tSNE样本标记图', 'sampleContainer'])">{{$t('button.svg')}}</el-button>
        <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

        <div id="sampleContainer"></div>
      </div>

      <div class="svgBox">
        <div id="divLegend"></div>
      </div>

      <div class="svgBox">
        <!-- <el-button type="primary" size="small" icon="el-icon-circle-plus" @click="mergeDialogShow = true">合并组</el-button>
        <el-button type="primary" size="small" icon="el-icon-edit-outline" @click="splitDialogShow = true">拆分组</el-button> -->
        <el-button type="warning" size="small" icon="el-icon-edit" @click="changeNameDialogShow = true">更改组名</el-button>
        <!-- <el-button type="primary" size="small" icon="el-icon-refresh" @click="originGroup()">恢复原始数据</el-button> -->

        <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['tSNE聚类标记图', 'clusterContainer'])">{{$t('button.svg')}}</el-button>
        <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

        <el-select size="small" v-model="sampleValue" @change="selectChange">
          <el-option
            v-for="item in data.groupName"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>

        <el-button type="" size="mini" v-if="pauseBtnShow" @click="pause()">
          <svg style="width:12px;height:12px" viewBox="0 0 24 24">
              <path fill="#000000" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
          </svg>
        </el-button>

        <el-button type="" size="mini" v-if="!pauseBtnShow" @click="selectChange()">
          <svg style="width:12px;height:12px" viewBox="0 0 24 24">
              <path fill="#000000" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
          </svg>
        </el-button>


        <!-- <span v-show="splitShow">
          <el-button type="info" size="small" id="revokeBtn">撤销</el-button>
          <el-button type="info" size="small" id="resetBtn">重新选择</el-button>
          <el-button type="danger" size="small" id="cancelBtn">取消拆分</el-button>
          <el-button type="danger" size="small" id="saveBtn">保存</el-button>
        </span> -->

        <div id="clusterContainer"></div>
      </div>
    </div>

    <el-dialog
      title="合并组"
      :visible.sync="mergeDialogShow"
      width="30%">
      <p>请选择要合并的组:</p>
      <el-checkbox-group v-model="mergeGroup">
        <el-checkbox v-for="item in groupArr" :label="item" :key="item + 'merge'" style="width:100%"></el-checkbox>
      </el-checkbox-group>
      <p>合并后的组名：</p>
      <el-input
        placeholder="默认为所选的第一个组名"
        v-model="mergeGroupName"
        clearable>
      </el-input>

      <span slot="footer" class="dialog-footer">
        <el-button @click="mergeDialogShow = false">取 消</el-button>
        <el-button type="primary" @click="merge()" :loading="mergeLoading">合并</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="拆分组"
      :visible.sync="splitDialogShow"
      width="30%">
      <p>请选择要拆分的组:</p>
      <el-select v-model="splitGroup" placeholder="请选择">
        <el-option
          v-for="item in groupArr"
          :key="item + 'split'"
          :label="item"
          :value="item">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="splitDialogShow = false">取 消</el-button>
        <el-button type="primary" id="splitBtn">开始拆分</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="更改组名"
      :visible.sync="changeNameDialogShow"
      >
      <el-form :inline="true" label-position="right" label-width="80px" :model="changeNameForm">
        <el-form-item v-for="(item, key) in changeNameForm" :label="key" :key="key + 'name'">
          <el-input size="small" v-model="changeNameForm[key]"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeNameDialogShow = false">取 消</el-button>
        <el-button type="primary" @click="changeGroupName()">确定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import bus from '@/bus.js'
import * as d3 from 'd3'

export default {
  data() {
    return {
      data: [],
      groupArr: [],
      mergeGroup: [],
      mergeDialogShow: false, // 合并
      mergeLoading: false,
      splitDialogShow: false, // 拆分
      splitGroup: '',
      message: null,
      splitShow: false,
      currentKey: 1,
      0: [],
      mergeGroupName: '',
      changeNameDialogShow: false, // 更改组名
      changeNameForm: {},
      loading: false,
      sampleValue: '',
      timer: '',
      pauseBtnShow: true,
      radius: 1.5,
      width: 800,
      height: 800,
    }
  },
  components: {
  },
  mounted() {
    bus.$on("initScatterCluster", () => {
      this.initScatterCluster()
    })
    if (!this.$store.state.commonInfo) { // 刷新页面 vuex 数据被清空
      this.getDBdata()
    } else {
      this.initData()
    }
    Array.prototype.equals = function(arr)
    {
        return this.sort().join() === arr.sort().join()
    }
  },
  destroyed () {
    if (this.message) {
      this.message.close()
    }
  },
  methods: {
    getDBdata () {
      let result = indexedDB.open('deg')
      result.onsuccess = (e) => {
        let db = e.target.result
        var transaction = db.transaction('degTable');
        var objectStore = transaction.objectStore('degTable');
        var request = objectStore.get('commonInfo' + this.$store.state.projectId)
        request.onsuccess = (e) => {
          this.$store.commit('setcommonInfo', e.target.result.value)
          this.initData()
        }
      }
    },
    pause () {
      if (this.sampleValue) {
        window.clearInterval(this.timer)
        this.pauseBtnShow = false
      }
    },
    selectChange () { // 选中的样本组的 circle 高亮
      window.clearInterval(this.timer)
      this.pauseBtnShow = true
      let circles = d3.selectAll(".clusterCircle").filter((d, i) => this.data.sampleId[i] === this.sampleValue)

      if (circles._groups[0].length !== 0) {
        this.timer = setInterval(() => {
          circles.transition()
            .duration(2000)
            .attr('r', 3)
            .transition()
            .duration(2000)
            .attr('r', 1.5)
        }, 4000)
      }
    },
    initData () {
      this.loading = true
      this.axios.get('/singel_cell/server/get_tsne_score?username='+ this.$store.state.username +'&p=' + this.$store.state.projectId).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          this.initScatterSample()
          this.initScatterCluster()
        } else {
          this.$message.error(res.data.message)
        }
        this.loading = false
      }).catch(() => {
        this.$message.error('请求出错！')
        this.loading = false
      })
    },
    originGroup () { // 恢复原始分组
      this.$confirm('此操作将恢复原始数据, 是否继续?', '提示', {
       confirmButtonText: '确定',
       cancelButtonText: '取消',
       type: 'warning'
     }).then(() => {
       this.axios.get('/singel_cell/server/reset_cell_cluster?username=' + this.$store.state.username + '&p=' + this.$store.state.projectId).then((res) => {
         if (res.data.message_type === 'success') {
           this.$message.success(res.data.message)
           this.initData()
         } else {
           this.$message.error(res.data.message)
         }
       })
     }).catch(() => {});
    },
    merge () {
      if (this.mergeGroup.length === 0) {
        this.$message.error("请选择您要合并的组！")
        return
      }
      // 合并中...  按钮显示
      this.mergeLoading = true

      let formData = new FormData()
      formData.append('username', this.$store.state.username)
      formData.append('p', this.$store.state.projectId)
      formData.append('sourceClusterList', this.mergeGroup.join(','))
      formData.append('targetCluster', this.mergeGroupName)
      this.axios.post('/singel_cell/server/merge_cell_cluster', formData).then((res) => {
        if (res.data.message_type === 'success') {
          this.$message.success(res.data.message)
          this.initData()
          this.mergeGroup = []
          this.mergeGroupName = ''
        } else {
          this.$message.error(res.data.message)
        }
        this.mergeDialogShow = false
        this.mergeLoading = false
      })
    },
    changeGroupName () {
      let oldGroupArr = Object.keys(this.changeNameForm)
      let newGroupArr = Object.values(this.changeNameForm)
      let flag = newGroupArr.some((d) => oldGroupArr.indexOf(d) !== -1) // 只要在原组名中存在，就提示
      if (flag === true) {
        this.$message.error("原组名中已包含该组名，请重新填写！")
        return
      }
      let formData = new FormData()
      formData.append('username', this.$store.state.username)
      formData.append('p', this.$store.state.projectId)
      formData.append('clusterNameMap', JSON.stringify(this.changeNameForm))
      this.axios.post('/singel_cell/server/rename_cluster', formData).then((res) => {
        if (res.data.message_type === 'success') {
          bus.$emit('updateDBData')
          // this.$message.success(res.data.message)
        } else {
          this.$message.error(res.data.message)
        }
        this.changeNameDialogShow = false
      })
    },
    initScatterSample () {
      let self = this
      let splitGroup
      let hassvg = d3.selectAll('#sampleSvg')
      if (hassvg) {
        d3.selectAll('#sampleSvg').remove()
        d3.selectAll('#legendSvg').remove()
      }
      let width = this.width, height = this.height
      let padding = {top:30,right:10,bottom:60,left:60} // right: 150
      let sampleSvg = d3.select("#sampleContainer").append("svg").attr("width", width).attr("height", height).attr("id", "sampleSvg")
      let svg = sampleSvg.append("g").attr("transform", "translate("+ padding.left + "," + padding.top +")")
      let colorScale
      if (this.data.groupName.length < 20) {
        colorScale = d3.scaleOrdinal(d3.schemeCategory20)
      } else {
        var randomColorList = [
                                  0xd3fe14, 0xfec7f8, 0x0b7b3e, 0x0bf0e9, 0xc203c8, 0xfd9b39, 0x888593,
                                  0x906407, 0x98ba7f, 0xfe6794, 0x10b0ff, 0xac7bff, 0xfee7c0, 0x964c63,
                                  0x1da49c, 0x0ad811, 0xbbd9fd, 0xfe6cfe, 0x297192, 0xd1a09c, 0x78579e,
                                  0x81ffad, 0x739400, 0xca6949, 0xd9bf01, 0x646a58, 0xd5097e, 0xbb73a9,
                                  0xccf6e9, 0x9cb4b6, 0xb6a7d4, 0x9e8c62, 0x6e83c8, 0x01af64, 0xa71afd,
                                  0xcfe589, 0xd4ccd1, 0xfd4109, 0xbf8f0e, 0x2f786e, 0x4ed1a5, 0xd8bb7d,
                                  0xa54509, 0x6a9276, 0xa4777a, 0xfc12c9, 0x606f15, 0x3cc4d9, 0xf31c4e,
                                  0x73616f, 0xf097c6, 0xfc8772, 0x92a6fe, 0x875b44, 0x699ab3, 0x94bc19,
                                  0x7d5bf0, 0xd24dfe, 0xc85b74, 0x68ff57, 0xb62347, 0x994b91, 0x646b8c,
                                  0x977ab4, 0xd694fd, 0xc4d5b5, 0xfdc4bd, 0x1cae05, 0x7bd972, 0xe9700a,
                                  0xd08f5d, 0x8bb9e1, 0xfde945, 0xa29d98, 0x1682fb, 0x9ad9e0, 0xd6cafe,
                                  0x8d8328, 0xb091a7, 0x647579, 0x1f8d11, 0xe7eafd, 0xb9660b, 0xa4a644,
                                  0xfec24c, 0xb1168c, 0x188cc1, 0x7ab297, 0x4468ae, 0xc949a6, 0xd48295,
                                  0xeb6dc2, 0xd5b0cb, 0xff9ffb, 0xfdb082, 0xaf4d44, 0xa759c4, 0xa9e03a,
                                  0x0d906b, 0x9ee3bd, 0x5b8846, 0x0d8995, 0xf25c58, 0x70ae4f, 0x847f74,
                                  0x9094bb, 0xffe2f1, 0xa67149, 0x936c8e, 0xd04907, 0xc3b8a6, 0xcef8c4,
                                  0x7a9293, 0xfda2ab, 0x2ef6c5, 0x807242, 0xcb94cc, 0xb6bdd0, 0xb5c75d,
                                  0xfde189, 0xb7ff80, 0xfa2d8e, 0x839a5f, 0x28c2b5, 0xe5e9e1, 0xbc79d8,
                                  0x7ed8fe, 0x9f20c3, 0x4f7a5b, 0xf511fd, 0x09c959, 0xbcd0ce, 0x8685fd,
                                  0x98fcff, 0xafbff9, 0x6d69b4, 0x5f99fd, 0xaaa87e, 0xb59dfb, 0x5d809d,
                                  0xd9a742, 0xac5c86, 0x9468d5, 0xa4a2b2, 0xb1376e, 0xd43f3d, 0x05a9d1,
                                  0xc38375, 0x24b58e, 0x6eabaf, 0x66bf7f, 0x92cbbb, 0xddb1ee, 0x1be895,
                                  0xc7ecf9, 0xa6baa6, 0x8045cd, 0x5f70f1, 0xa9d796, 0xce62cb, 0x0e954d,
                                  0xa97d2f, 0xfcb8d3, 0x9bfee3, 0x4e8d84, 0xfc6d3f, 0x7b9fd4, 0x8c6165,
                                  0x72805e, 0xd53762, 0xf00a1b, 0xde5c97, 0x8ea28b, 0xfccd95, 0xba9c57,
                                  0xb79a82, 0x7c5a82, 0x7d7ca4, 0x958ad6, 0xcd8126, 0xbdb0b7, 0x10e0f8,
                                  0xdccc69, 0xd6de0f, 0x616d3d, 0x985a25, 0x30c7fd, 0x0aeb65, 0xe3cdb4,
                                  0xbd1bee, 0xad665d, 0xd77070, 0x8ea5b8, 0x5b5ad0, 0x76655e, 0x598100,
                                  0x86757e, 0x5ea068, 0xa590b8, 0xc1a707, 0x85c0cd, 0xe2cde9, 0xdcd79c,
                                  0xd8a882, 0xb256f9, 0xb13323, 0x519b3b, 0xdd80de, 0xf1884b, 0x74b2fe,
                                  0xa0acd2, 0xd199b0, 0xf68392, 0x8ccaa0, 0x64d6cb, 0xe0f86a, 0x42707a
                                  ].map(d3_rgbString)
        colorScale = d3.scaleOrdinal()
          .domain(this.data.groupName)
          .range(randomColorList);
      }

      function d3_rgbString (value) {
        return d3.rgb(value >> 16, value >> 8 & 0xff, value & 0xff);
      }

      let [xText, yText] = [...this.$store.state.commonInfo.tsneNumList.tsneNum]
      let tooltip = d3.select('#container')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('background', '#fff')
        .text('')

      let symbol = d3.symbol().size([50])

      let xScale = d3.scaleLinear().domain(d3.extent(this.$store.state.commonInfo[xText])).range([0,width - padding.left - padding.right]).nice()
      svg.append("g").attr("transform","translate(0,"+ (height - padding.bottom - padding.top) +")").call(d3.axisBottom(xScale))

      let yScale = d3.scaleLinear().domain(d3.extent(this.$store.state.commonInfo[yText])).range([height - padding.top - padding.bottom,0]).nice()
      svg.append("g").call(d3.axisLeft(yScale))

      //  上边 和 右边 两侧的 line
      svg.append("line").attr("x1", 0).attr("y1", 0).attr("x2",width-padding.right-padding.left).attr("y2",0).attr("stroke","black").attr("stroke-width","1px")
      svg.append("line").attr("x1", width-padding.right-padding.left).attr("y1", 0).attr("x2",width-padding.right-padding.left).attr("y2",height-padding.top-padding.bottom).attr("stroke","black").attr("stroke-width","1px")

      svg.selectAll(".cicle")
         .data(this.$store.state.commonInfo.cellId)
         .enter()
         .append("circle")
         .attr("class", "sampleCircle")
         .attr("cx", (d,i) => xScale(this.$store.state.commonInfo[xText][i]))
         .attr("cy", (d,i) => yScale(this.$store.state.commonInfo[yText][i]))
         .attr("r", this.radius)
         .attr("fill", (d,i) => colorScale(self.data.sampleId[i]))
         .on('mouseover', function (d, i) {
           return tooltip.style('visibility', 'visible').text(d)
         })
         .on('mousemove', function (d, i) {
           return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
         })
         .on('mouseout', function (d, i) {
           return tooltip.style('visibility', 'hidden')
         })

      // x 轴文字
      sampleSvg.append("text")
        .attr("transform", "translate("+ (width / 2) +", " + (height - 5) + ")")
        .text(xText)
        .attr("text-anchor", "middle")

      // y 轴文字
      sampleSvg.append("text")
        .text(yText)
        .attr("transform", "translate("+ 15 +", " + (height / 2) + ") rotate(-90)")

      let groupArr = this.data.groupName
      this.groupArr = groupArr
      // groupArr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]

      // 图例 Div

      let legendR = 8
      d3.select('#divLegend').style("height", (this.height - 120) + "px")
      let legend = d3.select('#divLegend').append("svg").attr("width", 180).attr("height", groupArr.length * 30).attr("id","legendSvg").append("g").attr("transform","translate(10,10)")
      legend.selectAll(".circle")
            .data(groupArr)
            .enter()
            .append("circle")
            .attr("cx",0)
            .attr("cy",(d,i) => i * 30)
            .attr("r",legendR)
            .attr("fill", d => colorScale(d))

      legend.selectAll(".text")
            .data(groupArr)
            .enter()
            .append("text")
            .attr("transform",(d,i) => {
              return "translate(" + (legendR * 2) +","+ (legendR/2 + i * 30) +")"
            })
            .text(d => d)


      //  分组颜色图例
      // let legendR = 8
      // let legend = sampleSvg.append("g").attr("transform","translate("+(width-padding.right + 30)+","+(height/4)+")")
      // legend.selectAll(".circle")
      //       .data(groupArr)
      //       .enter()
      //       .append("circle")
      //       .attr("cx",0)
      //       .attr("cy",(d,i) => i * 30)
      //       .attr("r",legendR)
      //       .attr("fill", d => colorScale(d))
      //
      // legend.selectAll(".text")
      //       .data(groupArr)
      //       .enter()
      //       .append("text")
      //       .attr("transform",(d,i) => {
      //         return "translate(" + (legendR * 2) +","+ (legendR/2 + i * 30) +")"
      //       })
      //       .text(d => d)

    },
    initScatterCluster () {
      let self = this
      let splitGroup
      let hassvg = d3.selectAll('#clusterSvg')
      if (hassvg) {
        d3.selectAll('#clusterSvg').remove()
      }
      let width = this.width, height = this.height
      let padding = {top:30,right:150,bottom:60,left:60}
      let clusterSvg = d3.select("#clusterContainer").append("svg").attr("width", width).attr("height", height).attr("id", "clusterSvg")
      let svg = clusterSvg.append("g").attr("transform", "translate("+ padding.left + "," + padding.top +")")
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      let [xText, yText] = [...this.$store.state.commonInfo.tsneNumList.tsneNum]
      let sampleArr = Array.from(new Set(this.data.sampleId)).sort()
      let tooltip = d3.select('#container')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('background', '#fff')
        .text('')

      // 分组名称显示（在每组的中心位置）
      let groupArr = this.$store.state.commonInfo.clusterNameList
      this.groupArr = groupArr
      this.mergeGroup = []
      //  更改组名的 form 表单内容 eg: { 原组名1: ‘’, 原组名2: ''}
      this.changeNameForm = {}
      this.groupArr.map((item) => this.changeNameForm[item] = '')

      // let groupPointText = svg.selectAll(".text")
      //           .data(groupArr)
      //           .enter()
      //           .append("text")
      //           .attr("transform",d => "translate("+ xScale(this.data.avgMap[d][xText]) +","+ yScale(this.data.avgMap[d][yText]) +")")
      //           .text(d => d)
      //           .attr("fill","black")
      //           .attr("text-anchor", "middle")
      //           .classed("groupText",true)

      //  分组颜色图例
      let legendR = 8
      let legend = clusterSvg.append("g").attr("transform","translate("+(width-padding.right + 30)+","+45+")").attr("class", "lengendCluster")
      legend.selectAll(".circle")
            .data(groupArr)
            .enter()
            .append("circle")
            .attr("cx",0)
            .attr("cy",(d,i) => i * 30)
            .attr("r",legendR)
            .attr("fill", d => colorScale(d))

      legend.selectAll(".text")
            .data(groupArr)
            .enter()
            .append("text")
            .attr("transform",(d,i) => {
              return "translate(" + (legendR * 2) +","+ (legendR/2 + i * 30) +")"
            })
            .text(d => d)
            .attr("class","groupText")

      let xScale = d3.scaleLinear().domain(d3.extent(this.$store.state.commonInfo[xText])).range([0,width - padding.left - padding.right]).nice()
      svg.append("g").attr("transform","translate(0,"+ (height - padding.bottom - padding.top) +")").call(d3.axisBottom(xScale))

      let yScale = d3.scaleLinear().domain(d3.extent(this.$store.state.commonInfo[yText])).range([height - padding.top - padding.bottom,0]).nice()
      svg.append("g").call(d3.axisLeft(yScale))
      svg.selectAll(".cicle")
         .data(this.$store.state.commonInfo.cellId)
         .enter()
         .append("circle")
         .attr("class", "clusterCircle")
         .attr("cx", (d,i) => xScale(this.$store.state.commonInfo[xText][i]))
         .attr("cy", (d,i) => yScale(this.$store.state.commonInfo[yText][i]))
         .attr("r", this.radius)
         .attr("fill", (d,i) => colorScale(this.$store.state.commonInfo.clusterId[i]))
         .on('mouseover', function (d, i) {
           return tooltip.style('visibility', 'visible').text(d)
         })
         .on('mousemove', function (d, i) {
           return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
         })
         .on('mouseout', function (d, i) {
           return tooltip.style('visibility', 'hidden')
         })

      //  上边 和 右边 两侧的 line
      svg.append("line").attr("x1", 0).attr("y1", 0).attr("x2",width-padding.right-padding.left).attr("y2",0).attr("stroke","black").attr("stroke-width","1px")
      svg.append("line").attr("x1", width-padding.right-padding.left).attr("y1", 0).attr("x2",width-padding.right-padding.left).attr("y2",height-padding.top-padding.bottom).attr("stroke","black").attr("stroke-width","1px")

      // x 轴文字
      clusterSvg.append("text")
        .attr("transform", "translate("+ (width / 2) +", " + (height - 5) + ")")
        .text(xText)
        .attr("text-anchor", "middle")

      // y 轴文字
      clusterSvg.append("text")
        .text(yText)
        .attr("transform", "translate("+ 15 +", " + (height / 2) + ") rotate(-90)")

      let brush = d3.brush().extent([[0,0],[width - padding.left - padding.right,height - padding.top - padding.bottom]]).on("brush", brushing).on("end", brushend)

      function brushing () {

        if (d3.event.selection != null) {
           let groupColor = colorScale(self.splitGroup)

           var brush_coords = d3.brushSelection(this);
           var s = d3.event.selection;

           var x0 = brush_coords[0][0],
               y0 = brush_coords[0][1],
               x1 = brush_coords[1][0],
               y1 = brush_coords[1][1];

            paths.classed("brushing",function () {
              var cx = d3.select(this).attr("cx"),
                  cy = d3.select(this).attr("cy"),
                  color = d3.select(this).attr("fill")

              if (color === groupColor && x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1) {
                return true
              } else {
                return false
              }
            })

           }
        }

      function brushend() {
        if (!d3.event.selection) return; // 仅仅只是 click 画布而已
        d3.select(this).call(brush.move, null); // 取消 brush 层
        let s = d3.event.selection;

        d3.selectAll(".brushing").attr("class","brushed") // 把刚才选中的点类名改成 brushed
        let idArr = d3.selectAll(".brushed").data()
        // 如果这次划分的点和上次不相同，才去存新的值
        if (!(self[self.currentKey - 1]).equals(idArr)) {
          self[self.currentKey] = idArr
          self.currentKey++
        }
        if (idArr.length !== 0) {

        }
      }

      // 取消选中
      d3.selectAll("#cancelBrushBtn").on("click",() => {
        d3.selectAll(".brushed").classed("brushed",false) // 移除类名
      })

      //  拆分组
      d3.selectAll("#splitBtn").on("click", () => {
          let self = this
          if (this.splitGroup === '') {
            this.$message.error('请选择要拆分的组！')
            return
          }
          let groupColor = colorScale(this.splitGroup)
          splitGroup = JSON.parse(JSON.stringify(this.splitGroup))

          paths.style("opacity", 1)
          paths.classed("brushed", false)

          // 属于其他组的 path 隐藏
          paths.filter(function () {
            return d3.select(this).attr("fill") !== groupColor
          }).style("opacity",0)

          // 属于其他组的 中心点文字描述 隐藏
          groupPointText.filter(function () {
            return d3.select(this).text() !== self.splitGroup
          }).style("opacity",0)

          svg.append("g")
             .attr("class", "brush")
             .call(brush);
          this.splitDialogShow = false

          this.message = this.$message({
             showClose: true,
             // duration: 1000 * 60 * 1,
             message: '用鼠标进行框选出您要拆分到新组的点',
             type: 'success'
           });

          this.splitShow = true // 显示 拆分的选项（撤销，重置...）
      })

      //  取消拆分
      d3.selectAll("#cancelBtn").on("click", () => {
         // 将选项隐藏
         this.splitShow = false
         // 将 path 的 brushed 类名去掉
         d3.selectAll(".brushed").classed("brushed",false)
         // 将 其他点 和 中心文字 显示
         paths.style("opacity",1)
         groupPointText.style("opacity",1)
         // 刷子移除
         svg.selectAll("g.brush").remove()
         // 消息提示关闭
         this.message.close()
         // 取消保存的数组
         this.currentKey = 1
         this[0] = []
      })

      //  重置
      d3.selectAll("#resetBtn").on("click", () => {
        this.currentKey = 1
        this[0] = []
        d3.selectAll(".brushed").classed("brushed",false)
      })
      //  撤销
      d3.selectAll("#revokeBtn").on("click", () => {
        let lastPathArr = []
        if (this.currentKey < 2) {
          this.currentKey = 1
          this[0] = []
          lastPathArr = []
        } else {
          lastPathArr = this[this.currentKey - 2]
          this.currentKey = this.currentKey - 1
        }
        paths.classed("brushed",(d) => {
          if (lastPathArr.indexOf(d) !== -1) {
            return true
          } else {
            return false
          }
        })
      })
      //  保存
      d3.selectAll("#saveBtn").on("click", () => {
        this.$confirm('确认保存此操作?', '提示', {
         confirmButtonText: '确定',
         cancelButtonText: '取消',
         type: 'warning'
       }).then(() => {
         // 如果没有选择点 就点击保存，则不发请求给后端
         if (d3.selectAll(".brushed").data().length === 0) {
           // 将选项隐藏
           this.splitShow = false
           // 消息提示关闭
           this.message.close()
           // 将 currentKey 重置为 1
           this.currentKey = 1
           this.initData()
           return
         }
         let formData = new FormData()
         formData.append('username', this.$store.state.username)
         formData.append('p', this.$store.state.projectId)
         formData.append('cellIdList', d3.selectAll(".brushed").data().join(','))
         formData.append('sourceCluster', splitGroup)
         formData.append('targetClusterA', '')
         formData.append('targetClusterB', '')
         this.axios.post('/singel_cell/server/split_cell_cluster', formData).then((res) => {
           if (res.data.message_type === 'success') {
             this.splitGroup = ''
             this.$message.success(res.data.message)
             this.initData()
           } else {
             this.$message.error(res.data.message)
           }
           // 将选项隐藏
           this.splitShow = false
           // 消息提示关闭
           this.message.close()
           // 将 currentKey 重置为 1
           this.currentKey = 1
         })
       }).catch(() => {});
      })

    },
    changeRadius () {
      d3.selectAll(".sampleCircle").attr("r", this.radius)
      d3.selectAll(".clusterCircle").attr("r", this.radius)
    },
    changeWidth () {
      window.clearInterval(this.timer)
      this.pauseBtnShow = false
      this.initScatterSample()
      this.initScatterCluster()
    },
  }
}
</script>

<style scoped="true">
.cursor-pointer {
  cursor: pointer;
}
.clear {
  clear: both;
}
#svgContainer {
  white-space: nowrap;
}
.svgBox {
  display: inline-block;
  vertical-align: top;
}
.el-checkbox+.el-checkbox {
  margin-left: 0 !important;
}
#divLegend {
  margin-top: 70px;
  overflow-y: auto;
}

#divLegend::-webkit-scrollbar {
 width: 8px;
}
#divLegend::-webkit-scrollbar-track {
 background-color: #fafafa;
 -webkit-border-radius: 2em;
 -moz-border-radius: 2em;
 border-radius:2em;
}
 #divLegend::-webkit-scrollbar-thumb {
 background-color: #c7c8c7;
 -webkit-border-radius: 2em;
 -moz-border-radius: 2em;
 border-radius:2em;
}
</style>
<style media="screen">
.brushing {
  fill: black;
}
.brushed {
  fill: black;
}
</style>
