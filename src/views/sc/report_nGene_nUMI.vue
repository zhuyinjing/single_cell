<template>
  <div id="container">
    <div class="svgbox">
      <h2>表达基因与UMI数目的对应分布</h2>
      <p>如果一个细胞中发生表达的基因数目较多，那么该细胞的UMI数目也会较大。因此，一般情况下，细胞内发生表达的基因数目与UMI数目呈正相关关系；如果呈负相关关系，提示单细胞转录组测序结果存在问题。另外，基于单细胞表达基因数目与UMI数目的对应分布，也便于对门（Gate）进行设定，过滤掉表达基因数目或UMI数目出现极端值的细胞。</p>
      <p>下图展示了所有细胞表达基因数目与UMI数目的对应分布。</p>

      {{$t('d3.radius')}}：<el-input-number size="mini" v-model="radius" :step="0.5" :min="0" @change="changeRadius()"></el-input-number>
      &nbsp;&nbsp;&nbsp;
      {{$t('d3.width')}}：<el-input-number size="mini" v-model="width" :step="100" :min="0" @change="changeWidth()"></el-input-number>
      &nbsp;&nbsp;&nbsp;
      {{$t('d3.height')}}：<el-input-number size="mini" v-model="height" :step="100" :min="0" @change="changeWidth()"></el-input-number> <br><br>

      <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['nGene&nUMI', 'scatterContainer'])">{{$t('button.svg')}}</el-button>
      <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

      <div id="scatterContainer"></div>
    </div>

    <div class="clear"></div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  data() {
    return {
      data: [],
      radius: 2.5,
      width: 800,
      height: 500
    }
  },
  components: {
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData () {
      this.axios.get('/singel_cell/server/get_umi_meta_data?p='+ this.$store.state.projectId +'&username=' + this.$store.state.username).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data.umiMetaDataList
          this.initScatterPlot()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initScatterPlot () {
      let self = this
      let hassvg = d3.selectAll('#scattersvg')
      if (hassvg) {
        d3.selectAll('#scattersvg').remove()
      }
      var width = this.width, height = this.height;
      var scattersvg = d3.select("#scatterContainer").append("svg").attr("width", width).attr("height", height).attr("id", "scattersvg")
      var data = this.data
      var padding = {top: 20, right: 30, bottom: 50, left: 55}
      var xScale = d3.scaleLinear().domain([d3.min(this.data.map(item => item.nUMI))/1.2, d3.max(this.data.map(item => item.nUMI))*1.2]).range([0,width - padding.left - padding.right]).nice()
      var yScale = d3.scaleLinear().domain([d3.min(this.data.map(item => item.nGene))/1.2, d3.max(this.data.map(item => item.nGene))*1.2]).range([height - padding.top - padding.bottom,0]).nice()
      var xAxis = d3.axisBottom().scale(xScale)
      var yAxis = d3.axisLeft().scale(yScale)
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      let tooltipX = d3.select('#container')
      	.append('div')
        .attr("id","tooltipX")
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
        .attr("id","tooltipY")
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
        .style('font-size', '18px')
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
              .selectAll("text")
              .style("text-anchor", "start")
              .attr("transform", "rotate(45 -10 10)")
      var y = scattersvg.append("g").call(yAxis).attr("transform","translate("+ padding.left +"," + padding.top +")")

      // svg 被 rect 围住
      var rect = scattersvg.append("rect")
                    .attr("x",padding.left)
                    .attr("y",padding.top)
                    .attr("width", width - padding.left - padding.right)
                    .attr("height", height - padding.top - padding.bottom)
                    .attr("stroke", "black")
                    .attr("fill", 'none')

      var circle = scattersvg.selectAll("circle")
                      .data(this.data)
                      .enter()
                      .append("circle")
                      .attr("cx", (d) => padding.left + xScale(d["nUMI"]))
                      .attr("cy", (d) => padding.top + yScale(d["nGene"]))
                      .attr("r", this.radius)
                      .on('mouseover', function (d, i) {
                         tooltipCircle.style('visibility', 'visible').text(d['cellId'] +' ('+ d['nUMI'] + ', ' + d['nGene'] + ')').attr("transform", "translate("+ (padding.left + xScale(d[0]) + 10) +", " + (padding.top + yScale(d[1]) - 5) + ")")
                       })
                       .on('mousemove', function (d, i) {
                           //  兼容火狐
                          xLine.style("visibility", "visible")
                          yLine.style("visibility", "visible")
                          tooltipX.style("visibility", "visible")
                          tooltipY.style("visibility", "visible")

                          tooltipCircle.style('top', (d3.event.pageY-20)+'px').style('left',(d3.event.pageX+10)+'px')
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
                     tooltipX.style('top', ((height - padding.bottom - y) + d3.event.pageY)+'px').style('left',(d3.event.pageX - (document.getElementById("tooltipX").clientWidth) / 2)+'px')

                     tooltipY.style('visibility', 'visible').text((yScale.invert(y - padding.top).toFixed(1)))
                     tooltipY.style('top', (d3.event.pageY - (document.getElementById("tooltipX").clientHeight) / 2)  +'px').style('left', (d3.event.pageX - x + padding.left - (document.getElementById("tooltipY").clientWidth))+'px')

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
                 tooltipX.style('visibility', 'hidden')
                 tooltipY.style('visibility', 'hidden')

                 xLine.style('visibility', 'hidden')
                 yLine.style('visibility', 'hidden')
               })
      // x 轴文字
      scattersvg.append("text")
        .attr("transform", "translate("+ width / 2 +", " + 15 + ")")
        .text("nUMI")
        .attr("font-size", "16px")

      // y 轴文字
      scattersvg.append("text")
        .text("nGene")
        .attr("transform", "translate("+ 15 +", " + (height / 2) + ") rotate(-90)")

      //  x y 坐标轴导致线条加粗
      scattersvg.selectAll(".domain")
          .style("display", "none");
    },
    changeRadius () {
      d3.selectAll("circle").attr("r", this.radius)
    },
    changeWidth () {
      this.initScatterPlot()
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
.svgContainer {
  white-space: nowrap;
}
.svgbox {
  display: inline-block;
}
</style>
