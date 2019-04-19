<template>
  <div id="container">
    <h2>聚类内部不同样本组间差异表达基因</h2>
    <el-tabs v-model="activeTab" v-show="scatterSvgShow">
      <el-tab-pane style="overflow-x:auto" label="FeaturePlot" name="scatterSvgShow">
        <div class="scatter">
          <h3>特征基因表达值聚类图标记</h3>
          <p>如下所示，在tSNE聚类图中，特征基因表达量的高低用不同颜色进行标记，紫色代表高表达量，灰色代表低表达量。</p>
          <div v-show="scatterSvgShow">
            <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['scatter', 'scatterContainer'])">{{$t('button.svg')}}</el-button>
            <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>
          </div>

          <div id="scatterContainer"></div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <br>

    <el-card class="" shadow="hover">
      <el-button type="danger" size="middle" @click="initScatterData()">FeaturePlot</el-button>
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
         <el-input style="width: 80px;" size='mini' v-model="pValueAdjStart"></el-input>
        to  <el-input style="width: 80px;" size='mini' v-model="pValueAdjEnd"></el-input>

          <div class="labelStyle">
            <label class="radio-inline control-label">pct{{sample[0]}} from</label>
          </div>
          <el-input style="width: 80px;" size='mini' v-model="pctAStart"></el-input>
        to <el-input style="width: 80px;" size='mini' v-model="pctAEnd"></el-input>

          <div class="labelStyle">
            <label class="radio-inline control-label">pct{{sample[1]}} from</label>
          </div>
          <el-input style="width: 80px;" size='mini' v-model="pctBStart"></el-input>
        to <el-input style="width: 80px;" size='mini' v-model="pctBEnd"></el-input>

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
              <th>avgLogFC</th>
              <th>pValAdj</th>
              <th>pValue</th>
              <th v-for="item in sample">pct{{item}}</th>
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
      pValueAdjStart: '',
      pValueAdjEnd: '',
      pctAStart: '',
      pctAEnd: '',
      pctBStart: '',
      pctBEnd: '',
      data: [],
      table: null,
      selected: [],
      currentData: [],
      scatterSvgShow: false,
      scatterData: [],
      filterMethod: false,
      activeTab: 'scatterSvgShow',
      sample: [],
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
      this.pValueAdjStart = ''
      this.pValueAdjEnd = ''
      this.pctAStart = ''
      this.pctAEnd = ''
      this.pctBStart = ''
      this.pctBEnd = ''
    },
    getTableHead () {
      let form = new FormData()
      form.append('username', this.$store.state.username)
      form.append('p', this.$store.state.projectId)
      form.append('sEcho', 1)
      form.append('iDisplayStart', 0)
      form.append('iDisplayLength', 1)
      this.axios.post('/singel_cell/server/search_cic_list', form).then(res => {
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
              "sAjaxSource" : "/singel_cell/server/search_cic_list"
                              +"?username=" + self.$store.state.username
                              +"&p=" + self.$store.state.projectId
                              +"&clusterName=" + self.clusterRadio
                              +"&geneId=" + (self.filterMethod === false ? self.geneId: '')
                              +"&pValueAdjStart=" + (self.filterMethod === false ? '' :self.pValueAdjStart)
                              +'&pValueAdjEnd=' + (self.filterMethod === false ? '' :self.pValueAdjEnd)
                              +"&pctAStart=" + (self.filterMethod === false ? '' :self.pctAStart)
                              +"&pctAEnd=" + (self.filterMethod === false ? '' :self.pctAEnd)
                              +"&pctBStart=" + (self.filterMethod === false ? '' :self.pctBStart)
                              +"&pctBEnd=" + (self.filterMethod === false ? '' :self.pctBEnd),
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
                  "mDataProp" : "avgLogFC",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }, {
                  "mDataProp" : "pValAdj",
                  "render": function (data) {
                    return self.num2e(data)
                  }
              }, {
                  "mDataProp" : "pValue",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              },  {
                  "mDataProp" : "pctA",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }, {
                  "mDataProp" : "pctB",
                  "render": function (data) {
                    return data.toFixed(3)
                  }
              }
            ],
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
      this.axios.get('/singel_cell/server/get_inner_comparison_tsne_score?username=' + this.$store.state.username + '&p=' + this.$store.state.projectId + '&clusterName=' + '0' + '&geneId=' + this.selected.join(',')).then(res => {
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
      // let tooltip = d3.select('#container')
      // 	.append('div')
      // 	.style('position', 'absolute')
      //   .style('z-index', '10')
      // 	.style('color', '#3497db')
      //   .style('visibility', 'hidden')
      //   .style('font-size', '18px')
      // 	.style('font-weight', 'bold')
      // 	.text('')
      let tsneNum = this.$store.state.commonInfo.tsneNumList.tsneNum // ["tSNE_1", "tSNE_2"]
      let [xData, yData] = [this.$store.state.commonInfo[tsneNum[0]], this.$store.state.commonInfo[tsneNum[1]]]

      var size = 600,
          padding = 20;

      var x = d3.scaleLinear()
          .domain(d3.extent(xData))
          .range([padding / 2, size - padding / 2])
          .nice()

      var y = d3.scaleLinear()
          .domain(d3.extent(yData))
          .range([size - padding / 2, padding / 2])
          .nice()

      var xAxis = d3.axisBottom()
          .scale(x)
          .ticks(6);

      var yAxis = d3.axisLeft()
          .scale(y)
          .ticks(6);

      // 判断所有 umiValue 的最大值最小值
      let umiValueArr = [], extentArr = []
      this.selected.map(item => umiValueArr = umiValueArr.concat([...Object.values(this.scatterData[item])]))
      umiValueArr = umiValueArr.map(item => item.umiValue)
      umiValueArr.map(item => extentArr = extentArr.concat([...item]))
      // var color = d3.scaleLinear().domain(d3.extent(extentArr)).range(["#c4c4c4", "#fe0b07"]);
      var color = d3.scaleSequential(d3Chromatic.interpolateReds).domain([d3.extent(extentArr)[0] - (d3.extent(extentArr)[1] - d3.extent(extentArr)[0]) / 10,d3.extent(extentArr)[1]])
      // var color = d3.scaleSequential(d3Chromatic.interpolateReds).domain([0,5])

      var traits = this.selected,
          n = this.sample.length;

      var svg = d3.select("#scatterContainer").append("svg")
          .attr("width", size * n + padding * 2)
          .attr("height", size * this.selected.length + padding)
          .attr("id", "scattersvg")
        .append("g")
          .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

      svg.selectAll(".x.axis")
          .data(this.sample)
        .enter().append("g")
          .attr("class", "x axis")
          .attr("transform", function(d, i) { return "translate(" + i * size + ","+  (self.selected.length * size - 10)+")"; })
          .each(function(d) { d3.select(this).call(xAxis); });

      svg.selectAll(".y.axis")
          .data(traits)
        .enter().append("g")
          .attr("class", "y axis")
          .attr("transform", function(d, i) { return "translate(10," + i * size + ")"; })
          .each(function(d) { d3.select(this).call(yAxis); });

      // x 轴标题
      svg.selectAll(".text")
        .data(this.sample).enter()
        .append("text")
        .attr("transform", (d, i) => "translate("+ (i * size + (size / 2))+ "," + 0 + ")")
        .text(d => d)
        .attr("text-anchor", "middle")
        .attr("font-weight", 600)

      // y 轴标题
      svg.selectAll(".text")
        .data(this.selected).enter()
        .append("text")
        .attr("transform", (d, i) => "translate("+ this.sample.length * size + "," + (i * size + (size / 2)) + ") rotate(90)")
        .text(d => this.scatterData.geneMap[d])
        .attr("text-anchor", "middle")
        .attr("font-weight", 600)

      var cell = svg.selectAll(".cell")
          .data([...new Array(this.sample.length * this.selected.length)].map((k,i) => i))
        .enter().append("g")
          .attr("class", "cell")
          .attr("transform", function(d, i) {return "translate(" + (d % n) * size + "," + Math.floor(i / n) * size + ")"; })
          .each(plot);

      function plot(p) {
        let rectValue = self.scatterData[self.selected[Math.floor(p / n)]][self.sample[p % n]]
        let rectIdList = rectValue.cellId
        let rectUMIList = rectValue.umiValue
        var cell = d3.select(this);

        cell.append("rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", size - padding)
            .attr("height", size - padding)
            .attr("fill", "none")
            .attr("stroke", "black")

        let circles = cell.selectAll("circle")
            .data(self.$store.state.commonInfo.cellId)
            .enter().append("circle")
            .attr("cx", (d,i) => x(xData[i]))
            .attr("cy", (d,i) => y(yData[i]))
            .attr("r", 1.5)
            .style("fill", (d, i) => {
              return color(0)
              // let index = rectIdList.findIndex(item => item === d)
              // return index === -1 ? color(0) : color(rectUMIList[index])
            })
            .attr("id", (d) => d + p)
            // .on('mouseover', function (d, i) {
            //   let index = rectIdList.findIndex(item => item === d)
            //   let text = index === -1 ? 0 : rectUMIList[index]
            //   return tooltip.style('visibility', 'visible').text(text)
            // })
            // .on('mousemove', function (d, i) {
            //   return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
            // })
            // .on('mouseout', function (d, i) {
            //   return tooltip.style('visibility', 'hidden')
            // })

            rectIdList.map((item, index) => d3.select("#" + item + p).style("fill", color(rectUMIList[index])))
      }
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
.labelStyle {
  display:inline-block;
  width:95px;
  text-align:end;
}
</style>
