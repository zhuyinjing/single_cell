<template>
  <div id="container">
    <h2>类间特征基因表达分析</h2>
    <p>决定细胞不同聚类之间的关键因素是基因表达差异，而基因表达差异又可以反映出不同聚类间的生物学差异。因此，基于tSNE聚类，可以进行深入的基因表达差异分析，并与生物学意义做关联。</p>
    <el-tabs v-model="activeTab" v-show="scatterSvgShow || DotPlotSvgShow">
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
      <el-tab-pane style="overflow-x:auto" label="DotPlot" name="DotPlotSvgShow">
        <div class="DotPlot">
          <h3></h3>
          <p></p>
          <div v-show="DotPlotSvgShow">
            <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['DotPlot', 'DotPlotContainer'])">{{$t('button.svg')}}</el-button>
            <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>
          </div>

          <div id="DotPlotContainer"></div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <br>

    <el-card class="" shadow="hover">
      <el-button type="danger" size="middle" @click="initScatterData()">FeaturePlot</el-button>
      <el-button type="primary" size="middle" @click="initDotPlotData()">DotPlot</el-button>
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
            <label class="radio-inline control-label">pValAdj{{sample[0]}} from</label>
          </div>
         <el-input style="width: 80px;" size='mini' v-model="pValueAdjStartA"></el-input>
        to  <el-input style="width: 80px;" size='mini' v-model="pValueAdjEndA"></el-input>

          <div class="labelStyle">
            <label class="radio-inline control-label">pct1{{sample[0]}} from</label>
          </div>
          <el-input style="width: 80px;" size='mini' v-model="pct1StartA"></el-input>
        to <el-input style="width: 80px;" size='mini' v-model="pct1EndA"></el-input>

          <div class="labelStyle">
            <label class="radio-inline control-label">pct2{{sample[0]}} from</label>
          </div>
          <el-input style="width: 80px;" size='mini' v-model="pct2StartA"></el-input>
        to <el-input style="width: 80px;" size='mini' v-model="pct2EndA"></el-input>

        <br>
        <div class="labelStyle">
          <label class="radio-inline control-label">pValAdj{{sample[1]}} from</label>
        </div>
       <el-input style="width: 80px;" size='mini' v-model="pValueAdjStartB"></el-input>
      to  <el-input style="width: 80px;" size='mini' v-model="pValueAdjEndB"></el-input>

        <div class="labelStyle">
          <label class="radio-inline control-label">pct1{{sample[1]}} from</label>
        </div>
        <el-input style="width: 80px;" size='mini' v-model="pct1StartB"></el-input>
      to <el-input style="width: 80px;" size='mini' v-model="pct1EndB"></el-input>

        <div class="labelStyle">
          <label class="radio-inline control-label">pct2{{sample[1]}} from</label>
        </div>
        <el-input style="width: 80px;" size='mini' v-model="pct2StartB"></el-input>
      to <el-input style="width: 80px;" size='mini' v-model="pct2EndB"></el-input>

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
              <th></th>
              <th>geneId</th>
              <th>geneName</th>
              <th v-for="item in sample">avgLogFC{{item}}</th>
              <th v-for="item in sample">pValAdj{{item}}</th>
              <th v-for="item in sample">pValue{{item}}</th>
              <th v-for="item in sample">pct1{{item}}</th>
              <th v-for="item in sample">pct2{{item}}</th>
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
      pValueAdjStartB: '',
      pValueAdjEndB: '',
      pct1StartB: '',
      pct1EndB: '',
      pct2StartB: '',
      pct2EndB: '',
      data: [],
      table: null,
      selected: [],
      currentData: [],
      scatterSvgShow: false,
      scatterData: [],
      filterMethod: false,
      activeTab: 'violinSvgShow',
      sample: [],
      clusterRadio: null,
      DotPlotSvgShow: false,
      DotPlotData: [],
    }
  },
  components: {
  },
  mounted() {
    if (!this.$store.state.commonInfo) { // 刷新页面 vuex 数据被清空
      this.getDBdata()
    } else {
      this.clusterRadio = this.$store.state.commonInfo.clusterNameList[0]
      this.getTableHead()
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
          this.getTableHead()
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
      this.pValueAdjStartB = ''
      this.pValueAdjEndB = ''
      this.pct1StartB = ''
      this.pct1EndB = ''
      this.pct2StartB = ''
      this.pct2EndB = ''
    },
    getTableHead () {
      let form = new FormData()
      form.append('username', this.$store.state.username)
      form.append('p', this.$store.state.projectId)
      form.append('sEcho', 1)
      form.append('iDisplayStart', 0)
      form.append('iDisplayLength', 1)
      this.axios.post('/singel_cell/server/search_ccm_list', form).then(res => {
        if (res.data.message_type = 'success') {
          this.sample = Object.values(res.data.aData[0].sampleKey)
          this.initTable()
        } else {
          this.$message.error(res.data.message)
        }
      })

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
                              +"&pct2EndA=" + (self.filterMethod === false ? '' :self.pct2EndA)
                              +"&pValueAdjStartB=" + (self.filterMethod === false ? '' :self.pValueAdjStartB)
                              +'&pValueAdjEndB=' + (self.filterMethod === false ? '' :self.pValueAdjEndB)
                              +"&pct1StartB=" + (self.filterMethod === false ? '' :self.pct1StartB)
                              +"&pct1EndB=" + (self.filterMethod === false ? '' :self.pct1EndB)
                              +"&pct2StartB=" + (self.filterMethod === false ? '' :self.pct2StartB)
                              +"&pct2EndB=" + (self.filterMethod === false ? '' :self.pct2EndB),
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
              },  {
                  "mDataProp" : "avgLogFCB",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              },{
                  "mDataProp" : "pValAdjA",
                  "render": function (data) {
                    return self.num2e(data)
                  }
              }, {
                  "mDataProp" : "pValAdjB",
                  "render": function (data) {
                    return self.num2e(data)
                  }
              }, {
                  "mDataProp" : "pValueA",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }, {
                  "mDataProp" : "pValueB",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }, {
                  "mDataProp" : "pct1A",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }, {
                  "mDataProp" : "pct1B",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }, {
                  "mDataProp" : "pct2A",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              },{
                  "mDataProp" : "pct2B",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }],
          })
          self.table = table

        })
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
        this.$message.error("最多选择 2 个基因！")
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
        let colorScale = d3.scaleSequential(d3Chromatic.interpolateReds).domain([d3.extent(colorValue)[0] - (d3.extent(colorValue)[1] - d3.extent(colorValue)[0]) / 10,d3.extent(colorValue)[1]])

        let xScale = d3.scaleLinear().domain(d3.extent(xData)).range([padding.left,width - padding.right]).nice()
        svg.append("g")
          .attr("transform", "translate(0," + (height - padding.bottom) + ")")
          .call(d3.axisBottom(xScale).tickValues([-25,0,25]))
          .selectAll("text")

        let yScale = d3.scaleLinear().domain(d3.extent(yData)).range([height - padding.bottom, padding.top]).nice()
        svg.append("g")
          .attr("transform", "translate(" + (padding.left) + ",0)")
          .call(d3.axisLeft(yScale).tickValues([-25,0,25]))

        svg.selectAll("circle")
           .data(xData)
           .enter()
           .append("circle")
           .attr("cx", (d,i) => xScale(xData[i]))
           .attr("cy", (d,i) => yScale(yData[i]))
           .attr("r", 1.5)
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
    initDotPlotData () {
      if (this.selected.length === 0) {
        this.$message.error("请选择您要生成气泡图的基因！")
        return
      }
      if (this.selected.length > 30) {
        this.$message.error("最多选择 30 个基因！")
        return
      }
      let formData = new FormData()
      formData.append("username", this.$store.state.username)
      formData.append("p", this.$store.state.projectId)
      formData.append("geneId", this.selected.join(','))
      this.axios.post('/singel_cell/server/get_inner_comparison_circle', formData).then(res => {
        if (res.data.message_type === 'success') {
          this.DotPlotData = res.data
          this.initDotPlot()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initDotPlot () {
      // 生成 svg 的按钮
      this.DotPlotSvgShow = true
      this.activeTab = 'DotPlotSvgShow' // tab 被激活

      let self = this
      let hassvg = d3.selectAll('#DotPlotsvg')._groups[0].length
      if (hassvg) {
        d3.selectAll('#DotPlotsvg').remove()
      }
      var initWidth = 800
      var initHeight = 800

      var padding = {
        left: 150,
        top: 40,
        right: 200,
        bottom: 40
      }

      var width = initHeight - padding.left - padding.bottom
      var height = initWidth - padding.top - padding.bottom

      // 将 sampleKey 的 key value 调换， 方便取 pct
      let sampleKey = {}
      for (let k in this.DotPlotData.sampleKey.sampleKey) {
        sampleKey[this.DotPlotData.sampleKey.sampleKey[k]] = k
      }

      var svgG = d3.select("#DotPlotContainer")
        .append("svg")
        .attr("width", initWidth + padding.right)
        .attr("height", initHeight + padding.bottom)
        .attr("id", "DotPlotsvg")
      var svg = svgG.append('g').attr('transform','translate('+padding.left+','+padding.top+')')

      //y轴比例尺
      let ydata = this.DotPlotData.y
      let yScale = d3.scaleBand().rangeRound([height, 0]).padding(1).domain(ydata)

      //定义y轴
      let yAxis = d3.axisLeft(yScale)

      //添加y轴
      let yaxisg = svg.append("g")
        .attr("class", "yaxis")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .call(yAxis)
        .style("font-size", "14px")

      //x轴比例尺
      let xData = this.DotPlotData.x

      let xScale = d3.scaleBand().rangeRound([0, width]).padding(1).domain(xData)

      //定义x轴
      let xAxis = d3.axisBottom(xScale)

      //添加x轴
      let xaxisg = svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(" + "0 ," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "14px")
        .style("text-anchor", "end")
        .attr("transform", "translate(-15,10) rotate(-90)");

        let color  = {}
        color["A"] = d3.scaleLinear()
            .domain(d3.extent(this.DotPlotData.docList, d => d.meanValue))
            .range(["#bebbbb", "red"]);

        color["B"] = d3.scaleLinear()
            .domain(d3.extent(this.DotPlotData.docList, d => d.meanValue))
            .range(["#bebbbb", "blue"]);

        var radiusLinear = d3.scaleLinear()
            .domain([0, 1])
            .range([6, 10]);

          //添加circle包裹层，有几种类型添加几个
          var cover = svg.append("g")

          //添加circle
          cover.selectAll("circle")
            .data(this.DotPlotData.docList)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.geneName))
            .attr("cy", d => yScale(d.clusterName + '_' + d.groupName))
            .attr("r", d => radiusLinear(d['pct' + sampleKey[d.groupName]]))
            .attr("fill", d => color[sampleKey[d.groupName]](d.meanValue))
            .on("mouseover", function(d) {
              let self = this;
              d3.select(this)
              showtext.attr("x", function() {
                  return xScale(d.geneName)
                })
                .attr("y", function() {
                  return yScale(d.clusterName + '_' + d.groupName) - d3.select(self).attr("r") * 1.6 - 5
                })
                .text('pct' + d.groupName + ': ' + d['pct' + sampleKey[d.groupName]])
                .attr("text-anchor", "middle")
            })
            .on("mouseout", function() {
              d3.select(this)
              showtext.text("")
            })

          // tooltip
          let detail = cover.append("g")
          let showtext = svg.append("text")
            .text("")
            .attr("font-size", '14px')

      // 右侧颜色图例
      var defs = svg.append("defs");

  		var linearGradient = defs.append("linearGradient")
  								.attr("id","linearColor")
  								.attr("x1","0%")
  								.attr("y1","0%")
  								.attr("x2","100%")
  								.attr("y2","0%");

  		var stop1 = linearGradient.append("stop")
  						.attr("offset","0%")
  						.style("stop-color","#bebbbb");

  		var stop2 = linearGradient.append("stop")
  						.attr("offset","100%")
  						.style("stop-color","red");

  		//添加一个矩形，并应用线性渐变
  		var colorRect = svg.append("rect")
  					.attr("x", width + 50)
  					.attr("y", 200)
  					.attr("width", 80)
  					.attr("height", 20)
  					.style("fill","url(#" + linearGradient.attr("id") + ")")

  		//添加文字
  		var minValueText = svg.append("text")
  					.attr("class","valueText")
  					.attr("x", width + 50)
  					.attr("y", 240)
  					.attr("dy", "-0.3em")
  					.text(() => d3.min(self.DotPlotData.docList , d => d.meanValue).toFixed(2));

  		var maxValueText = svg.append("text")
  					.attr("class","valueText")
  					.attr("x", width + 120)
  					.attr("y", 240)
  					.attr("dy", "-0.3em")
  					.text(() => d3.max(self.DotPlotData.docList , d => d.meanValue).toFixed(2));

      var maxValueText = svg.append("text")
  					.attr("class","valueText")
  					.attr("x", width + 90)
  					.attr("y", 190)
  					.attr("dy", "-0.3em")
  					.text(this.DotPlotData.sampleKey.sampleKey["A"])
            .attr("text-anchor", "middle")

      // linearColorB
      var defs = svg.append("defs");

  		var linearGradient = defs.append("linearGradient")
  								.attr("id","linearColorB")
  								.attr("x1","0%")
  								.attr("y1","0%")
  								.attr("x2","100%")
  								.attr("y2","0%");

  		var stop1 = linearGradient.append("stop")
  						.attr("offset","0%")
  						.style("stop-color","#bebbbb");

  		var stop2 = linearGradient.append("stop")
  						.attr("offset","100%")
  						.style("stop-color","blue");

  		//添加一个矩形，并应用线性渐变
  		var colorRect = svg.append("rect")
  					.attr("x", width + 50)
  					.attr("y", 270)
  					.attr("width", 80)
  					.attr("height", 20)
  					.style("fill","url(#" + "linearColorB" + ")")

  		//添加文字
  		var minValueText = svg.append("text")
  					.attr("class","valueText")
  					.attr("x", width + 50)
  					.attr("y", 310)
  					.attr("dy", "-0.3em")
            .text(() => d3.min(self.DotPlotData.docList , d => d.meanValue).toFixed(2));

  		var maxValueText = svg.append("text")
  					.attr("class","valueText")
  					.attr("x", width + 120)
  					.attr("y", 310)
  					.attr("dy", "-0.3em")
            .text(() => d3.max(self.DotPlotData.docList , d => d.meanValue).toFixed(2));

      var maxValueText = svg.append("text")
  					.attr("class","valueText")
  					.attr("x", width + 90)
  					.attr("y", 270)
  					.attr("dy", "-0.3em")
  					.text(this.DotPlotData.sampleKey.sampleKey["B"])
            .attr("text-anchor", "middle")
      // gene ratio
     let legendCircle = svg.append("g").attr("transform", "translate("+ (width + 50) +", 500)")
     legendCircle.selectAll('.circle')
                 .data([0, 0.25, 0.50, 0.75, 1])
                 .enter()
                 .append("circle")
                 .attr("cx", (d, i) => 20)
                 .attr("cy", (d, i) => i * 20)
                 .attr("r", (d, i) => radiusLinear(d))

     legendCircle.selectAll('.text')
                 .data([0, 0.25, 0.50, 0.75, 1])
                 .enter()
                 .append("text")
                 .attr("x", (d, i) => 40)
                 .attr("y", (d, i) => i * 20 + 5)
                 .text((d) => d.toFixed(2))

      legendCircle.append("text")
  					.attr("class","valueText")
  					.attr("x", 15)
  					.attr("y", -20)
  					.attr("dy", "-0.3em")
  					.text("pct.exp");
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
.labelStyle {
  display:inline-block;
  width:95px;
  text-align:end;
}
</style>
