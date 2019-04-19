<template>
  <div id="container">
    <h2>类间特征基因表达分析</h2>
    <p>决定细胞不同聚类之间的关键因素是基因表达差异，而基因表达差异又可以反映出不同聚类间的生物学差异。因此，基于tSNE聚类，可以进行深入的基因表达差异分析，并与生物学意义做关联。</p>
    <el-tabs v-model="activeTab" v-show="violinSvgShow || heatmapSvgShow || scatterSvgShow">
      <el-tab-pane style="overflow-x:auto" label="VliPlot" name="violinSvgShow">
        <div class="violin">
          <h3>特征基因表达值分布</h3>
          <p>如下所示，小提琴图展示了特征基因在不同tSNE聚类中的表达量分布。横坐标标识不同tSNE聚类，纵坐标表示基因的UMI数目，每个点代表一个细胞。</p>
          <div v-show="violinSvgShow">
            <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['violin', 'violinContainer'])">{{$t('button.svg')}}</el-button>
            <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>
          </div>

          <div id="violinContainer"></div>
        </div>

      </el-tab-pane>
      <el-tab-pane style="overflow-x:auto" label="FeaturePlot" name="scatterSvgShow">
        <div class="scatter" style="white-space: nowrap;">
          <h3>特征基因表达值聚类图标记</h3>
          <p>如下所示，在tSNE聚类图中，特征基因表达量的高低用不同颜色进行标记，紫色代表高表达量，灰色代表低表达量。</p>
          <div v-show="scatterSvgShow">
            <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['scatter', 'scatterContainer'])">{{$t('button.svg')}}</el-button>
            <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>
            <el-button type="warning" size="small" @click="initScatterCluster()">显示 tSNE 图</el-button>
          </div>

          <div id="scatterContainer" style="display:inline-block"></div>
          <div id="tSNEClusterDiv" style="display:inline-block"></div>
        </div>
      </el-tab-pane>
      <el-tab-pane style="overflow-x:auto" label="Heatmap" name="heatmapSvgShow">
        <div class="heatmap">
          <h3>特征基因群表达值热图</h3>
          <p>如下热图所示，每一列代表一个细胞，每一行代表一个特征基因，每一个色块代表相应基因在相应细胞中的表达量，紫色代表低表达量，黄色代表高表达量。每个细胞所属的聚类也被标记在热图的下方。基于这个结果，可以对决定不同聚类的特征基因群做功能富集分析。</p>
          <div v-show="heatmapSvgShow">
            <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['heatmap', 'heatmapContainer'])">{{$t('button.svg')}}</el-button>
            <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>
          </div>

          <div id="heatmapContainer"></div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <br>

    <el-card class="" shadow="hover">
      <el-button type="primary" size="middle" @click="initViolinData()">VlnPlot</el-button>
      <el-button type="danger" size="middle" @click="initScatterData()">FeaturePlot</el-button>
      <el-button type="danger" size="middle" @click="initHeatmapData()">Heatmap</el-button>
    </el-card>

    <br>

      <el-switch
        v-model="filterMethod"
        active-color="#13ce66"
        inactive-color="#13ce66"
        active-text="按范围筛选"
        inactive-text="按geneId筛选">
      </el-switch>
      <div v-show="!filterMethod">
        <p>请输入要筛选的geneId列表：</p>
        <el-input
          style="width:300px;"
          type="textarea"
          :rows="5"
          :placeholder="$t('input.split_method')"
          v-model="geneId">
        </el-input>
        <el-button type="primary" @click="filter()" size='mini'>{{$t('button.filter')}}</el-button>
        <el-button type="info" @click="clear()" size='mini'>{{$t('button.clear')}}</el-button>
      </div>
      <div v-show="filterMethod" style="margin-top:10px">
          <div class="labelStyle">
            <label class="radio-inline control-label">pValAdj from</label>
          </div>
         <el-input style="width: 80px;" size='mini' v-model="pValueAdjStartA"></el-input>
        to  <el-input style="width: 80px;" size='mini' v-model="pValueAdjEndA"></el-input>

          <div class="labelStyle">
            <label class="radio-inline control-label">pct1 from</label>
          </div>
          <el-input style="width: 80px;" size='mini' v-model="pct1StartA"></el-input>
        to <el-input style="width: 80px;" size='mini' v-model="pct1EndA"></el-input>

          <div class="labelStyle">
            <label class="radio-inline control-label">pct2 from</label>
          </div>
          <el-input style="width: 80px;" size='mini' v-model="pct2StartA"></el-input>
        to <el-input style="width: 80px;" size='mini' v-model="pct2EndA"></el-input>
        <el-button type="primary" @click="filter()" size='mini'>{{$t('button.filter')}}</el-button>
        <el-button type="info" @click="clear()" size='mini'>{{$t('button.clear')}}</el-button>

      </div>

    <div style="margin-top: 20px" v-if="$store.state.commonInfo">
      请选择显示的 cluster：
      <el-radio-group v-model="clusterRadio" size="mini" @change="filter">
        <el-radio-button v-for="item in $store.state.commonInfo.clusterNameList" :key="item" :label="item"></el-radio-button>
      </el-radio-group>
    </div>

    <br>

    <div class="">
      <table id="table" cellspacing="0" width="100%" class="display table table-striped table-bordered">
          <thead>
            <tr>
              <!-- <th> <input type="checkbox" name="" value="" class='checkall'> </th> -->
              <th>  </th>
              <th>geneId</th>
              <th>geneName</th>
              <th>avgLogFC</th>
              <th>pValAdj</th>
              <th>pValue</th>
              <th>pct1</th>
              <th>pct2</th>
            </tr>
          </thead>
      </table>
    </div>

  </div>
</template>

<script>
import * as d3 from 'd3'
import * as d3Chromatic from 'd3-scale-chromatic'

export default {
  data() {
    return {
      geneId: '',
      pValueAdjStartA: '',
      pValueAdjEndA: '',
      pct1StartA: '',
      pct1EndA: '',
      pct2StartA: '',
      pct2EndA: '',
      violinSvgShow: false,
      data: [],
      table: null,
      selected: [],
      currentData: [],
      heatmapSvgShow: false,
      heatmapData: [],
      scatterSvgShow: false,
      scatterData: [],
      filterMethod: false,
      activeTab: 'violinSvgShow',
      clusterRadio: null,
    }
  },
  components: {
  },
  mounted() {
    if (!this.$store.state.commonInfo) { // 刷新页面 vuex 数据被清空
      this.getDBdata()
    } else {
      this.clusterRadio = this.$store.state.commonInfo.clusterNameList[0]
      this.initTable()
    }

    //  给动态生成的 checkbox 绑定 click 事件，只需要绑定一次
    let self = this
    // $(".checkall").click(function () {
    //     var checked = $(this).prop("checked")
    //     // 把当前页选中的从 selected 去掉 再全部 concat 进去
    //     if (checked === true) {
    //       $(".checkchild").not("input:checked").each(function () {
    //         self.selected.push($(this)[0].value)
    //       })
    //     } else {
    //       self.currentData.map((data) => {
    //         let index = self.selected.indexOf(data)
    //         self.selected.splice(index, 1)
    //       })
    //     }
    //     $(".checkchild").prop("checked", checked)
    // });
    $("#table").on("click", 'td input[type=checkbox]', function () {
      let checked = $(this).prop("checked")
      if (checked === true) {
        self.selected.push(this.value)
        //  如果页面上的 checkbox 全选上了 将 checkall 赋值为 true
        // if ($(".checkchild:checked").length === self.currentData.length) {
        //   $(".checkall").prop("checked", true)
        // }
      } else {
        //  一旦取消选中 则将全选按钮赋值为 false
        // $(".checkall").prop("checked", false)
        let index = self.selected.indexOf(this.value)
        self.selected.splice(index, 1)
      }
    })
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
          this.clusterRadio = this.$store.state.commonInfo.clusterNameList[0]
          this.initTable()
        }
      }
    },
    // 科学计数法
    num2e (num) {
      var p = Math.floor(Math.log(num) / Math.LN10)
      var n = num * Math.pow(10, -p)
      return n.toFixed(1) + 'e' + p
    },
    filter () {
      // 将 geneId 去除多余的空格 和 逗号 替换成一个逗号
      if (this.filterMethod === false) { // 按 geneId
        this.geneId = this.geneId.replace(/\s+/g,',').replace(new RegExp(',+',"gm"), ',')
        if (this.geneId !== "") { // 如果 geneId 列表为空，则不替换 selected
          this.selected = this.geneId.split(',')
        } else {
          this.selected = []
        }
      } else {
        this.selected = []
      }
      this.initTable()
      setTimeout(() => {
        this.table.ajax.reload()  // 重新 load table
      }, 0)
    },
    clear () {
      this.geneId = ''
      this.pValueAdjStartA = ''
      this.pValueAdjEndA = ''
      this.pct1StartA = ''
      this.pct1EndA = ''
      this.pct2StartA = ''
      this.pct2EndA = ''
    },
    initTable () {
      let self = this
      $(document).ready(function() {
        var table = $('#table').on('xhr.dt', function ( e, settings, json, xhr ) {
            var flag = true
            if (json.aData.length === 0) { // 如果查询无结果 全选框为 为选中 状态
              flag = false
            } else {
              let data = json.aData.map((d) => {return d.geneId	})
              self.currentData = data
              for (let i = 0;i < data.length;i++) {
                if (self.selected.indexOf(data[i]) === -1) {
                  flag = false
                  break
                }
              }
            }
            // $(".checkall").prop("checked", flag)
        }).DataTable({
              "lengthMenu": [
                [10,25, 50, 100],
                [10,25, 50, 100]
              ],
              "pageLength": 10,
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
              "sServerMethod": "POST",
              "oLanguage": {
                "sProcessing": "loading data..."
               },
              //通过ajax实现分页的url路径
              "sAjaxSource" : "/singel_cell/server/search_ccm_list"
                              +"?username=" + self.$store.state.username
                              +"&p=" + self.$store.state.projectId
                              +"&clusterName=" + self.clusterRadio
                              +"&geneId=" + (self.filterMethod === false ? self.geneId: '')
                              +"&pValueAdjStartA=" + (self.filterMethod === false ? '' :self.pValueAdjStartA)
                              +'&pValueAdjEndA=' + (self.filterMethod === false ? '' :self.pValueAdjEndA)
                              +"&pct1StartA=" + (self.filterMethod === false ? '' :self.pct1StartA)
                              +"&pct1EndA=" + (self.filterMethod === false ? '' :self.pct1EndA)
                              +"&pct2StartA=" + (self.filterMethod === false ? '' :self.pct2StartA)
                              +"&pct2EndA=" + (self.filterMethod === false ? '' :self.pct2EndA),
              "rowCallback": function( row, data ) {
                //  在当前页 选中 切换页面回来后 还是选中状态
                if ( $.inArray(data.geneId, self.selected) !== -1 ) {
                    $(row).find('input[type=checkbox]').prop('checked', true)
                }
              },
              "aoColumns" : [ {
                "sClass": "text-center",
                 "data": "geneId",
                 "render": function (data, type, full, meta) {
                     return '<input type="checkbox" class="checkchild" value="' + data + '" />';
                 },
                 "bSortable": false
              }, {
                  "mDataProp" : "geneId"
              }, {
                  "mDataProp" : "geneName"
              }, {
                  "mDataProp" : "avgLogFCA",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }, {
                  "mDataProp" : "pValAdjA",
                  "render": function (data) {
                    return self.num2e(data)
                  }
              }, {
                  "mDataProp" : "pValueA",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }, {
                  "mDataProp" : "pct1A",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }, {
                  "mDataProp" : "pct2A",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }],
          })
          self.table = table

        })
    },
    initViolinData () {
      if (this.selected.length === 0) {
        // let hassvg = d3.selectAll('#violinsvg')._groups[0].length
        // // 如果取消 checkbox 选中 再点击生成小提琴图 则清除 svg
        // if (hassvg) {
        //   d3.selectAll('#violinsvg').remove()
        //   this.violinSvgShow = false
        // } else {
          this.$message.error("请选择您要生成小提琴图的基因！")
        // }
        return
      }
      if (this.selected.length > 2) {
        this.$message.error('最多选择 2 个基因！')
        return
      }
      this.axios.get('/singel_cell/server/get_gene_violin_plot?p='+ this.$store.state.projectId +'&username=' + this.$store.state.username + '&geneId=' + this.selected.join(',')).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          this.initViolin()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initViolin () {
      // 生成 svg 的按钮
      this.violinSvgShow = true
      this.activeTab = 'violinSvgShow' // tab 被激活
      let self = this
      let hassvg = d3.selectAll('#violinsvg')._groups[0].length
      if (hassvg) {
        d3.selectAll('#violinsvg').remove()
      }
      let width = 110 * this.$store.state.commonInfo.clusterNameList.length, height = 600 // 每个 g 标签的宽度/高度
      let padding = {top:30,right:80,bottom:60,left:60}
      let number = this.selected.length < 2 ? 1 : 2 // 一行显示几个图，默认为 2
      let violinsvg = d3.select("#violinContainer").append("svg").attr("width", width * number).attr("height", (height * Math.ceil(this.selected.length / number))).attr("id", "violinsvg")
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)

      let xData = this.data.clusterNameList // 分组

      for (let i = 0;i < this.selected.length;i++) {
        let svg = violinsvg.append("g").attr("transform", "translate("+ ((i % number) * width) + "," + (parseInt(i / number) * height) +")")

        var yValueArr = this.data[this.selected[i]].map(item => item[2])

        // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
        var x = d3.scaleBand()
          .range([ padding.left, width - padding.right ])
          .domain(xData)
          .padding(0.05)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum..
        svg.append("g")
          .attr("transform", "translate(0" +"," + (height - padding.bottom) + ")")
          .call(d3.axisBottom(x))

        // Build and Show the Y scale
        var y = d3.scaleLinear()
          .domain(d3.extent(yValueArr))          // Note that here the Y scale is set manually
          .range([height - padding.bottom, padding.top]).nice()

        svg.append("g")
           .attr("transform", "translate("+ padding.left +",0)")
           .call(d3.axisLeft(y))

        // 随机散点
        var xLinear = d3.scaleLinear().domain([0,width]).range([0,width])

        // 每个图 按分组去画 violin plot
        for (let j = 0;j < xData.length;j++) {
          var data = this.data[this.selected[i]].filter(item => item[1] === xData[j])

          var yData = data.map(item => item[2])

          // Features of the histogram
          var histogram = d3.histogram()
              .domain(d3.extent(yData))
              .thresholds(y.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
              .value(d => d)
          var input, bins,allBins,lengths,longuest
          // Compute the binning for each group of the dataset
          var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
              .key(function(d) { return d[1];})
              .rollup(function(d) {   // For each key..
                input = d.map(function(d) { return d[2];})    // Keep the variable called Sepal_Length
                bins = histogram(input)   // And compute the binning on it.
                return(bins)
              })
              .entries(data)

          // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
          var maxNum = 0
          for (let k = 0;k < sumstat.length;k++){
            allBins = sumstat[k].value
            lengths = allBins.map(function(a){return a.length;})
            longuest = d3.max(lengths)
            if (longuest > maxNum) { maxNum = longuest }
          }
          // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
          var xNum = d3.scaleLinear()
            .range([0, x.bandwidth()])
            .domain([-maxNum,maxNum])

          // Add the shape to this svg!
          svg
            .selectAll("myViolin")
            .data(sumstat)
            .enter()        // So now we are working group per group
            .append("g")
            .attr("transform", function(d){ return("translate(" + x(d.key) +" ,0)") } ) // Translation on the right to be at the group position
            .append("path")
            .datum(function(d){ return(d.value)})     // So now we are working bin per bin
            .style("stroke", "black")
            .style("fill",(d,i) => colorScale(j))
            .attr("d", d3.area()
                         .x0(function(d){ return(xNum(-d.length)) } )
                         .x1(function(d){ return(xNum(d.length)) } )
                         .y(function(d){ return(y(d.x0)) } )
                         .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            )
            let x0 = Math.ceil(x(xData[j]))
            let x1 = Math.floor(x(xData[j]) + x.bandwidth())

            let randomData = d3.range(yData.length).map(d => d3.randomUniform(x0, x1)())

            svg.selectAll("g.circle")
              .data(data)
              .enter()
              .append("circle")
              .attr("cx", (d,i) => xLinear(randomData[i]))
              .attr("cy", (d, i) => y(d[2]))
              .attr("r", 1.5)
              .attr("fill", "black")
              .style("opacity", 0.2)
        }

        svg.append("text")
          .attr("transform", "translate("+ (width / 2) +", "+ padding.top/2 +")")
          .text(this.data[this.selected[i]][0][0])
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
      }

    },
    initHeatmapData () {
      if (this.selected.length === 0) {
        this.$message.error("请选择您要生成热图的基因！")
        return
      }
      if (this.selected.length > 30) {
        this.$message.error('最多选择 30 个基因！')
        return
      }
      this.axios.get('singel_cell/server/get_gene_tsne_heatmap?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&geneId='+ this.selected.join(',')).then((res) => {
        if (res.data.message_type === 'success') {
          this.heatmapData = res.data
          this.initHeatmap()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initHeatmap () {
      // 生成 svg 的按钮
      this.heatmapSvgShow = true
      this.activeTab = 'heatmapSvgShow' // tab 被激活

      let self = this
      let hassvg = d3.selectAll('#heatmapsvg')._groups[0].length
      if (hassvg) {
        d3.selectAll('#heatmapsvg').remove()
      }
      let padding = {top:50,right:5,bottom:30,left:0}
      let width = 5, height = 15  // 每个 rect 的宽度/高度
      let xData = this.heatmapData.groupNum // 一共有几个分组，画几个 g 标签
      let cellNumber = 0
      this.heatmapData.groupNum.map(item => {
        cellNumber+=this.heatmapData[item].cellIdList.length // 获取 cell 的总个数，为了确定 svg 的 width
      })
      let yTextPadding = 100 // 右侧文字所占空间的 width
      let svgWidth = width * cellNumber + (padding.left + padding.right) * xData.length + yTextPadding
      let svgHeight = height * this.selected.length + padding.top + padding.bottom
      let heatmapsvg = d3.select("#heatmapContainer").append("svg").attr("width", svgWidth).attr("height", svgHeight).attr("id", "heatmapsvg")
      let colorValueArr = [] // 把所有分组拼接到一起，为了求所有数据的最大值和最小值 当作 colorScale 的值域
      xData.map(item => {
        colorValueArr = colorValueArr.concat(this.heatmapData[item]['umiMatrixList'])
      })
      let colorScale = d3.scaleSequential().domain(d3.extent(colorValueArr.map(d => d.umiValue))).interpolator(d3.interpolatePlasma)

      let lastWidth = 0 // 记录之前所有的 width
      for (let i = 0;i < xData.length;i++) {
        i === 0? lastWidth = 0 :lastWidth += this.heatmapData[xData[i - 1]].cellIdList.length * width
        let rectData = this.heatmapData[xData[i]].umiMatrixList
        let cellLength = this.heatmapData[xData[i]]['cellIdList'].length
        let geneLength = this.heatmapData[xData[i]]['geneIdList'].length

        let w = lastWidth + (padding.right + padding.left) * i  // 每个 g 的位移
        let h = padding.top
        let svg = heatmapsvg.append("g").attr("transform", "translate("+ w + "," + h +")")

        svg.selectAll("rect")
           .data(rectData)
           .enter()
           .append("rect")
           .attr("x", (d,i) => width * (i % cellLength))
           .attr("y", (d,i) => height * parseInt(i / cellLength))
           .attr("width", width)
           .attr("height", height)
           .attr("fill", (d,i) => colorScale(d.umiValue))

         // x 轴文字
         svg.append("text")
           .attr("transform", "translate("+ (width * cellLength / 2) +", " + (height * geneLength + 20) + ")")
           .text(xData[i])
           .attr("text-anchor", "middle")
           .attr("font-size", "16px")

      }

      // y 轴文字
      heatmapsvg.append("g")
         .attr("transform", (d,i) => {return "translate("+ (svgWidth - yTextPadding) +", " + padding.top + ")"})
         .selectAll(".text")
         .data(this.heatmapData[xData[0]].geneNameList)
         .enter()
         .append("text")
         .attr("transform", (d,i) => {return "translate("+ 0 +", " + ((i + 1) * height) + ")"})
         .text(d => d)
         .attr("font-size", height +"px")

      let defs = heatmapsvg.append("defs");

      let linearGradient = defs.append("linearGradient")
  								.attr("id","linearColor")
  								.attr("x1","0%")
  								.attr("y1","0%")
  								.attr("x2","100%")
  								.attr("y2","0%");
      linearGradient.append("stop")
  						      .attr("offset","0%")
  						      .style("stop-color",d3.interpolatePlasma(0));

      linearGradient.append("stop")
  						      .attr("offset","50%")
  						      .style("stop-color",d3.interpolatePlasma(0.5));

  		linearGradient.append("stop")
        						.attr("offset","100%")
        						.style("stop-color",d3.interpolatePlasma(1));

      heatmapsvg.append("g")
                .attr("transform","translate("+ 0 +","+ 5 +")")
                .attr("id", "legend")
                .append("rect")
      					.attr("x", 0)
      					.attr("y", 0)
      					.attr("width", 100)
      					.attr("height", 30)
      					.style("fill","url(#" + linearGradient.attr("id") + ")")

    },
    initScatterData () {
      if (this.selected.length === 0) {
        let hassvg = d3.selectAll('#scattersvg')._groups[0].length
        // 如果取消 checkbox 选中 再点击生成小提琴图 则清除 svg
        // if (hassvg) {
        //   d3.selectAll('#scattersvg').remove()
        //   this.scatterSvgShow = false
        // } else {
          this.$message.error("请选择您要生成SVG的基因！")
        // }
        return
      }
      if (this.selected.length > 2) {
        this.$message.error('最多选择 2 个基因！')
        return
      }
      this.axios.get('singel_cell/server/get_gene_tsne_score?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&geneId='+ this.selected.join(',') + '&clusterName=' + this.clusterRadio).then((res) => {
        if (res.data.message_type === 'success') {
          this.scatterData = res.data
          this.initScatter()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initScatter () {
      // 生成 svg 的按钮
      this.scatterSvgShow = true
      this.activeTab = 'scatterSvgShow' // tab 被激活

      let self = this
      let hassvg = d3.selectAll('#scattersvg')._groups[0].length
      if (hassvg) {
        d3.selectAll('#scattersvg').remove()
      }
      let width = 800, height = 800 // 每个 g 标签的宽度/高度
      let padding = {top:50,right:80,bottom:40,left:60}
      let number = this.selected.length // 一行显示几个图
      let scattersvg = d3.select("#scatterContainer").append("svg").attr("width", width * number).attr("height", (height * Math.ceil(this.selected.length / number))).attr("id", "scattersvg")
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
      let tsneNum = this.$store.state.commonInfo.tsneNumList.tsneNum // ["tSNE_1", "tSNE_2"]

      for (let i = 0;i < this.selected.length;i++) {
        let svg = scattersvg.append("g").attr("transform", "translate("+ ((i % number) * width) + "," + (parseInt(i / number) * height) +")")
        let [xData, yData] = [this.$store.state.commonInfo[tsneNum[0]], this.$store.state.commonInfo[tsneNum[1]]]
        let colorValue = this.scatterData[this.selected[i]] // 每个 circle 的值，为了区别颜色的深浅
        let colorScale = d3.scaleSequential(d3Chromatic.interpolateReds).domain([d3.extent(colorValue)[0] - (d3.extent(colorValue)[1] - d3.extent(colorValue)[0]) / 5,d3.extent(colorValue)[1]])
        // let colorScale = d3.scaleSequential(d3Chromatic.interpolateReds).domain(d3.extent(colorValue))

        let xScale = d3.scaleLinear().domain(d3.extent(xData)).range([padding.left,width - padding.right]).nice()
        svg.append("g")
          .attr("transform", "translate(0," + (height - padding.bottom) + ")")
          .call(d3.axisBottom(xScale).tickValues([-20,0,20]))
          .selectAll("text")

        let yScale = d3.scaleLinear().domain(d3.extent(yData)).range([height - padding.bottom, padding.top]).nice()
        svg.append("g")
          .attr("transform", "translate(" + (padding.left) + ",0)")
          .call(d3.axisLeft(yScale).tickValues([-20,0,20]))

        svg.selectAll("circle")
           .data(xData)
           .enter()
           .append("circle")
           .attr("cx", (d,i) => xScale(xData[i]))
           .attr("cy", (d,i) => yScale(yData[i]))
           .attr("r", 2.5)
           .attr("fill", (d,i) => colorScale(colorValue[i]))
           .on('mouseover', function (d, i) {
               return tooltip.style('visibility', 'visible').text(colorValue[i])
             })
             .on('mousemove', function (d, i) {
               return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
             })
             .on('mouseout', function (d, i) {
               return tooltip.style('visibility', 'hidden')
             })

         // x 轴文字
         svg.append("text")
           .attr("transform", "translate("+ (width / 2) +", " + height + ")")
           .text(tsneNum[0])
           .attr("text-anchor", "middle")

         // 标题
         svg.append("text")
           .attr("transform", "translate("+ (width / 2) +", " + (padding.top - 10) + ")")
           .text(this.scatterData.geneMap[this.selected[i]])
           .attr("text-anchor", "middle")
           .attr("font-weight", 600)

         // y 轴文字
         svg.append("text")
           .text(tsneNum[1])
           .attr("transform", "translate("+ 15 +", " + (height / 2) + ") rotate(-90)")

         // 右侧颜色图例
         var defs = svg.append("defs");

       		var linearGradient = defs.append("linearGradient")
       								.attr("id","linearColor" + this.selected[i])
       								.attr("x1","0%")
       								.attr("y1","0%")
       								.attr("x2","100%")
       								.attr("y2","0%");

       		linearGradient.append("stop")
       						.attr("offset","0%")
       						.style("stop-color", d3Chromatic.interpolateReds(0));

          linearGradient.append("stop")
                  .attr("offset","50%")
                  .style("stop-color", d3Chromatic.interpolateReds(0.5));

       		linearGradient.append("stop")
       						.attr("offset","100%")
       						.style("stop-color", d3Chromatic.interpolateReds(1));

       		//添加一个矩形，并应用线性渐变
       		var colorRect = svg.append("rect")
       					.attr("x", width - padding.right)
       					.attr("y", padding.top)
       					.attr("width", 60)
       					.attr("height", 20)
       					.style("fill","url(#" + linearGradient.attr("id") + ")")

       		//添加文字
       		var minValueText = svg.append("text")
       					.attr("class","valueText")
       					.attr("x", width - padding.right)
       					.attr("y", padding.top + 40)
       					.attr("dy", "-0.3em")
                .attr("text-anchor", "middle")
       					.text(() => d3.min(colorValue).toFixed(2));

       		var maxValueText = svg.append("text")
       					.attr("class","valueText")
       					.attr("x", width - padding.right + 60)
       					.attr("y", padding.top + 40)
       					.attr("dy", "-0.3em")
                .attr("text-anchor", "middle")
       					.text(() => d3.max(colorValue).toFixed(2));



      }

    },
    initScatterCluster () {
      let self = this
      let splitGroup
      let hassvg = d3.selectAll('#clusterSvg')._groups[0].length
      if (hassvg) {
        return
      }
      let width = 800, height = 800
      let padding = {top:30,right:120,bottom:60,left:60}
      let clusterSvg = d3.select("#tSNEClusterDiv").append("svg").attr("width", width).attr("height", height).attr("id", "clusterSvg")
      let svg = clusterSvg.append("g").attr("transform", "translate("+ padding.left + "," + padding.top +")")
      let colorScale = d3.scaleOrdinal(d3.schemeCategory20)
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
         .attr("r", 1.5)
         .attr("fill", (d,i) => colorScale(this.$store.state.commonInfo.clusterId[i]))
         .on('mouseover', function (d, i) {
           return tooltip.style('visibility', 'visible').text('cluster: ' + self.$store.state.commonInfo.clusterId[i])
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

      let groupArr = this.$store.state.commonInfo.clusterNameList

      //  分组颜色图例
      let legendR = 8
      let legend = clusterSvg.append("g").attr("transform","translate("+(width-padding.right + 30)+","+(height/4)+")")
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
.overflow-auto {
  overflow: auto;
}
.label-font {
  font-size: 14px;
}
.overflow-auto {
  overflow: auto;
}
.labelStyle {
  display:inline-block;
  width:80px;
  text-align:end;
}
.filterbtnDiv {
  float: right;
  margin-bottom: 10px;
}
.text-align-center {
  text-align: center;
}
</style>
