<template>
  <div id="container">
    <h2>典型相关分析肘形图</h2>
    <p>如下图所示，横坐标代表不同排位的典型相关，纵坐标代表典型观相关对应的相关性强度，不同颜色的曲线代表不同样本组。典型相关排位越靠后，其相关性强度越低，肘形图渐趋平缓。因此，可以基于肘形图的拐点位置，进行典型相关的选择，舍弃相关性强度较低的典型相关。根据图中所示，可以选取排位前20的典型相关进行后续分析。</p>
    <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['elbow_plot', 'elbowContainer'])">{{$t('button.svg')}}</el-button>
    <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

    <div id="elbowContainer"></div>

  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  data() {
    return {
      data: [],
    }
  },
  components: {
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData () {
      this.axios.get('/singel_cell/server/get_sdev_of_pc?username='+ this.$store.state.username +'&p=' + this.$store.state.projectId).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
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
      var width = 900, height = 600;
      var scattersvg = d3.select("#elbowContainer").append("svg").attr("width", width).attr("height", height).attr("id", "scattersvg")

      var data = this.data.sdevOfPc
      var padding = {top:30,right:100,bottom:60,left:60}
      var xScale = d3.scaleLinear().domain([0, 30]).range([0,width - padding.left - padding.right])
      var yScale = d3.scaleLinear().domain([0, 1]).range([height - padding.top - padding.bottom,0]).nice()
      var xAxis = d3.axisBottom().scale(xScale)
      var yAxis = d3.axisLeft().scale(yScale)
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)

      var x = scattersvg.append("g").call(xAxis).attr("transform","translate("+ padding.left +"," + (height - padding.bottom) +")")

      var y = scattersvg.append("g").call(yAxis).attr("transform","translate("+ padding.left +"," + padding.top +")")

      var line = d3.line()
          .x(function(d, i) { return padding.left + xScale(d["pcNum"]); }) // set the x values for the line generator
          .y(function(d) { return padding.top + yScale(d["standardDeviation"]); }) // set the y values for the line generator
          .curve(d3.curveMonotoneX) // apply smoothing to the line

      let krr = [{pcNum:2,standardDeviation:0.4,id:'cc'},{pcNum:6,standardDeviation:1,id:'cc'},{pcNum:4,standardDeviation:11,id:'pc'},{pcNum:8,standardDeviation:4,id:'pc'}]
      scattersvg
          .selectAll('.line-group')
          .data(this.data.groupName).enter()
          .append('g')
          .append("path")
          // .datum(data) // 10 . Binds data to the line
          .attr("d", (d) => line(data.filter(item => item.sampleGroup === d.groupName)))
          .attr("fill", "none")
          .attr("stroke", (d,i) => colorScale(d.groupName))
          .attr("stroke-width", "3")

      // x 轴文字
      scattersvg.append("text")
        .attr("transform", "translate("+ (width / 2) +", " + height + ")")
        .text("CC")
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")

      // y 轴文字
      scattersvg.append("text")
        .text("Shared Correlation Strength")
        .attr("transform", "translate("+ 15 +", " + (height / 2) + ") rotate(-90)")

      // legend
      let legendHeight = 20
      let legendGroup = scattersvg.append("g").attr("transform","translate("+ (width - padding.right) +","+ (height / 3) +")")
      legendGroup.selectAll(".legend")
                .data(this.data.groupName)
                .enter()
                .append("line")
                .attr("x1", 5)
                .attr("y1", (d, i) => i * legendHeight + 5)
                .attr("x2", 30)
                .attr("y2", (d, i) => i * legendHeight + 5)
                .attr("fill", (d, i) => colorScale(d.groupName))
                .attr("stroke", (d, i) => colorScale(d.groupName))
                .attr("stroke-width", 3)
        legendGroup.selectAll(".text")
                  .data(this.data.groupName)
                  .enter()
                  .append("text")
                  .attr("transform",(d,i) => "translate(35,"+ (i * legendHeight + 10) +")")
                  .text(d => d.groupName)

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
#elbowContainer {
  white-space: nowrap;
}
</style>
<style media="screen">
.el-carousel__arrow {
  top: 100% !important;
}
.el-carousel__arrow--right {
  right: 45% !important;
  /* background: #409eff !important; */
}
.el-carousel__arrow--left {
  left: 45% !important;
  /* background: #409eff !important; */
}
.el-carousel__indicators--outside button {
  display: none !important;
}
</style>
