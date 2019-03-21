<template>
  <div id="container">
    <h2>基因表达量特征分布</h2>
    <p>在单细胞转录组建库测序质量较好且不存在偏性的情况下，各基因在所有细胞中的平均表达量不会集中分布在过高或过低的强度范围内，而且每个基因在不同细胞之间的表达差异会显现出来。如下图所示：x轴表示每个基因在所有细胞中平均表达量的自然对数；y轴表示每个基因的表达量在不同细胞之间的分散程度，分散程度的计算方法是基因表达量方差与基因平均表达量之比的自然对数，用以衡量每个基因在不同细胞之间的表达差异。</p>
    <p>另外，在单细胞转录组研究中，基于细胞中不同基因的表达量进行降维是核心步骤。为了获得合理的降维结果，需要对参与降维过程的基因进行筛选，筛选的原则是保留表达量适中且表达量在不同细胞之间分散程度较大的基因，这样有利于后续的降维。表达量适中说明单细胞转录组建库测序不存在偏性，表达量分散程度较大说明该基因的表达可以反映细胞之间的特征差异。</p>
    <p>下两图分别展示了在D和W两个样本组中，所有基因表达量的特征分布。</p>

    <div class="" v-for="(item, index) in sample" :key="'sample' + index">
      <h3>{{index}}样本组基因表达量特征分布</h3>
      <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['表达异质化基因筛选', index + 'd3container'])">{{$t('button.svg')}}</el-button>
      <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

      <div :id="index + 'd3container'"></div>
    </div>


    <div class="" v-show="tableShow">
      <table id="table" class="display" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>{{head0}}</th>
            <th>{{head1}}</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tableData">
            <td>{{item[0]}}</td>
            <td>{{item[1]}}</td>
            <td>{{item[2]}}</td>
          </tr>
        </tbody>
      </table>

    </div>

    <!-- <el-carousel style="width:900px" height="620px" arrow="always" indicator-position="outside" trigger="click" :autoplay="false" @change="change">
      <el-carousel-item >
        <div id="d3container"></div>
      </el-carousel-item>
      <el-carousel-item >
      2
      </el-carousel-item>
      <el-carousel-item >
      3
      </el-carousel-item>
    </el-carousel> -->

    <div class="clear"></div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  data() {
    return {
      data: [],
      head0: '',
      head1: '',
      tableData: [],
      tableShow: false,
      table: null,
      sample: {D: 4, W: 4},
    }
  },
  components: {
  },
  mounted() {
    document.body.style.overflow = 'hidden'
    this.initData()
  },
  destroyed() {
    document.body.style['overflow-y']= 'scroll'
  },
  methods: {
    changeTableData () {
      this.tableShow = false
      if ($.fn.dataTable.isDataTable('#table')) {
        $('#table').dataTable().fnDestroy()
      }
      setTimeout(() => {
        this.initTable()
      },0)
    },
    initTable () {
      this.tableShow = true
      this.table = $("#table").DataTable({
        dom: 'Bfrtip',
        buttons: [{
            extend: 'csv',
            text: '导出 csv',
            filename: '表达异质化基因筛选'
          },
          {
            extend: 'excel',
            text: '导出 excel',
            filename: '表达异质化基因筛选'
          },
        ]
      })
    },
    initData () {
      this.axios.get('/singel_cell/server/get_var_gene_feature?p='+ this.$store.state.projectId +'&username=' + this.$store.state.username).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          this.head0 = res.data.x
          this.head1 = res.data.y
          Object.keys(this.sample).map(item => this.initScatterPlot(item))
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initScatterPlot (sampleName) {
      let self = this
      let hassvg = d3.selectAll('#' + sampleName + 'scattersvg')
      if (hassvg) {
        d3.selectAll('#' + sampleName + 'scattersvg').remove()
      }
      var width = 1000, height = 600;
      var scattersvg = d3.select("#"+ sampleName +"d3container").append("svg").attr("width", width).attr("height", height).attr("id", sampleName + "scattersvg")
      var data = this.data[sampleName]
      var padding = {top:30,right:30,bottom:60,left:60}
      var xScale = d3.scaleLinear().domain([d3.min(data.map(item => item[0])) / 1.2, d3.max(data.map(item => item[0])) * 1.2]).range([0,width - padding.left - padding.right]).nice()
      var yScale = d3.scaleLinear().domain([d3.min(data.map(item => item[1])) * 1.2, d3.max(data.map(item => item[1])) * 1.2]).range([height - padding.top - padding.bottom,0]).nice()
      var xAxis = d3.axisBottom().scale(xScale)
      var yAxis = d3.axisLeft().scale(yScale)
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      let tooltipX = d3.select('#container')
      	.append('div')
        .attr("id",sampleName + "tooltipX")
      	.style('position', 'absolute')
        .style("background","black")
        .style('z-index', '10')
      	.style('color', '#fff')
        .style('visibility', 'hidden')
        .style('font-size', '12px')
      	.style('font-weight', 'bold')
        .style("padding", "2px")
      	.text('')
      let tooltipY = d3.select('#container')
      	.append('div')
        .attr("id",sampleName + "tooltipY")
      	.style('position', 'absolute')
        .style("background","black")
        .style('z-index', '10')
      	.style('color', '#fff')
        .style('visibility', 'hidden')
        .style('font-size', '12px')
      	.style('font-weight', 'bold')
        .style("padding", "2px")
      	.text('')
      let tooltipCircle = d3.select('#container')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('')
      let xLine = scattersvg
      	.append('line')
        .style('z-index', '10')
      	.style('color', '#3497db')
        .style('visibility', 'hidden')
        .attr("stroke","#999")
        .style("stroke-dasharray", "5")
      let yLine = scattersvg
      	.append('line')
        .style('z-index', '10')
      	.style('color', '#3497db')
        .style('visibility', 'hidden')
        .attr("stroke","#999")
        .style("stroke-dasharray", "5")

      var x = scattersvg.append("g").call(xAxis).attr("transform","translate("+ padding.left +"," + (height - padding.bottom) +")")

      var y = scattersvg.append("g").call(yAxis).attr("transform","translate("+ padding.left +"," + padding.top +")")


      // svg 被 rect 围住
      var rect = scattersvg.append("rect")
                    .attr("x",padding.left)
                    .attr("y",padding.top)
                    .attr("width", width - padding.left - padding.right)
                    .attr("height", height - padding.top - padding.bottom)
                    .attr("stroke", "black")
                    .attr("fill", 'none')

      var circles = scattersvg.selectAll("circle")
                      .data(data)
                      .enter()
                      .append("circle")
                      .attr("cx", (d) => padding.left + xScale(d[0]))
                      .attr("cy", (d) => padding.top + yScale(d[1]))
                      .attr("r", 1.8)
                      .on('mouseover', function (d, i) {
                        return tooltipCircle.style('visibility', 'visible').text(d[2] +' ('+ d[0].toFixed(1) + ', ' + d[1].toFixed(1) + ')').attr("transform", "translate("+ (padding.left + xScale(d[0]) + 10) +", " + (padding.top + yScale(d[1]) - 5) + ")")
                       })
                       .on('mousemove', function (d, i) {
                         //  兼容火狐
                        xLine.style("visibility", "visible")
                        yLine.style("visibility", "visible")
                        tooltipX.style("visibility", "visible")
                        tooltipY.style("visibility", "visible")

                         return tooltipCircle.style('top', (d3.event.pageY-20)+'px').style('left',(d3.event.pageX+10)+'px')
                       })
                       .on('mouseout', function (d, i) {
                         return tooltipCircle.style('visibility', 'hidden')
                       })
      // 鼠标移动 x y 坐标轴对照线
      scattersvg.on('mousemove', function (d, i) {
                  let x = d3.mouse(this)[0]
                  let y = d3.mouse(this)[1]
                  // 鼠标仅在在图形区域移动触发事件 不含 padding
                  if (x > padding.left && x < width - padding.right && y > padding.top && y < height - padding.bottom) {
                    tooltipX.style('visibility', 'visible').text((xScale.invert(x - padding.left).toFixed(1)))
                    tooltipX.style('top', ((height - padding.bottom - y) + d3.event.pageY)+'px').style('left',(d3.event.pageX - (document.getElementById(sampleName + "tooltipX").clientWidth) / 2)+'px')

                    tooltipY.style('visibility', 'visible').text((yScale.invert(y - padding.top).toFixed(1)))
                    tooltipY.style('top', (d3.event.pageY - (document.getElementById(sampleName + "tooltipX").clientHeight) / 2)  +'px').style('left', (d3.event.pageX - x + padding.left - (document.getElementById(sampleName + "tooltipY").clientWidth))+'px')

                    xLine.style("visibility", "visible")
                    .attr('x1',padding.left)
                    .attr('y1',y)
                    .attr('x2',width - padding.right)
                    .attr('y2',y)

                    yLine.style("visibility", "visible")
                    .attr('x1',x)
                    .attr('y1',padding.top)
                    .attr('x2',x)
                    .attr('y2',height - padding.bottom)
                 } else {
                   // 当鼠标落在 padding 区域，则 x y 指示线隐藏
                   tooltipX.style('visibility', 'hidden')
                   tooltipY.style('visibility', 'hidden')

                   xLine.style('visibility', 'hidden')
                   yLine.style('visibility', 'hidden')
                 }
               })
               .on('mouseleave', function (d, i) {
                 // 鼠标仅在在图形区域之外移出触发事件 含 paddding
                 tooltipX.style('visibility', 'hidden')
                 tooltipY.style('visibility', 'hidden')

                 xLine.style('visibility', 'hidden')
                 yLine.style('visibility', 'hidden')
               })
      // x 轴文字
      scattersvg.append("text")
        .attr("transform", "translate("+ (width / 2) +", " + 20 + ")")
        .text(this.data.x)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")

      // y 轴文字
      scattersvg.append("text")
        .text(this.data.y)
        .attr("transform", "translate("+ 15 +", " + (height / 2) + ") rotate(-90)")

      //  x y 坐标轴导致线条加粗
      scattersvg.selectAll(".domain")
          .style("display", "none");

      let brush = d3.brush().extent([[padding.left,padding.top],[width - padding.right,height - padding.bottom]]).on("brush", brushing).on("end", brushend)
      scattersvg.append("g")
          .attr("class", "brush")
          .call(brush);

      function brushing () {
        let x = d3.mouse(this)[0]
        let y = d3.mouse(this)[1]
        // 鼠标仅在在图形区域移动触发事件 不含 padding
        if (x > padding.left && x < width - padding.right && y > padding.top && y < height - padding.bottom) {
          tooltipX.style('visibility', 'visible').text((xScale.invert(x - padding.left).toFixed(1)))
          tooltipX.style('top', ((height - padding.bottom - y) + d3.event.sourceEvent.pageY)+'px').style('left',(d3.event.sourceEvent.pageX - (document.getElementById(sampleName + "tooltipX").clientWidth) / 2)+'px')

          tooltipY.style('visibility', 'visible').text((yScale.invert(y - padding.top).toFixed(1)))
          tooltipY.style('top', (d3.event.sourceEvent.pageY - (document.getElementById(sampleName + "tooltipX").clientHeight) / 2)  +'px').style('left', (d3.event.sourceEvent.pageX - x + padding.left - (document.getElementById(sampleName + "tooltipY").clientWidth))+'px')

          xLine.style("visibility", "visible")
          .attr('x1',padding.left)
          .attr('y1',y)
          .attr('x2',width - padding.right)
          .attr('y2',y)

          yLine.style("visibility", "visible")
          .attr('x1',x)
          .attr('y1',padding.top)
          .attr('x2',x)
          .attr('y2',height - padding.bottom)
       } else {
         // 当鼠标落在 padding 区域，则 x y 指示线隐藏
         tooltipX.style('visibility', 'hidden')
         tooltipY.style('visibility', 'hidden')

         xLine.style('visibility', 'hidden')
         yLine.style('visibility', 'hidden')
       }

        if (d3.event.selection != null) {
         var brush_coords = d3.brushSelection(this);
         var s = d3.event.selection;
         // 把上一次选中的点 移除类名
         d3.selectAll(".selected").classed("selected",false)
         // style selected circles
         circles.filter(function (d, i){
              var cx = d3.select(this).attr("cx"),
                  cy = d3.select(this).attr("cy");

              var x0 = brush_coords[0][0],
                  x1 = brush_coords[1][0],
                  y0 = brush_coords[0][1],
                  y1 = brush_coords[1][1];

              return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1
          }).attr("class","selected")
         }
      }

      function brushend() {
        // 坐标轴文字 tooltip 隐藏
        tooltipX.style('visibility', 'hidden')
        tooltipY.style('visibility', 'hidden')

        xLine.style('visibility', 'hidden')
        yLine.style('visibility', 'hidden')

        if (!d3.event.selection) return; // 仅仅只是 click 画布而已
        d3.select(this).call(brush.move, null);


        let tableData = d3.selectAll(".selected").data()
        if (tableData.length > 0) {
          self.tableData = tableData
          self.changeTableData()
        } else {
          self.tableShow = false
        }
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
#d3container {
  white-space: nowrap;
}
</style>
<style media="screen">
.selected {
  fill: #ff3399;
}
</style>
