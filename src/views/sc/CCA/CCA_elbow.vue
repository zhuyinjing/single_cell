<template>
  <div id="container">
    <h2>典型相关分析肘形图</h2>
    <p>如下图所示，横坐标代表不同排位的典型相关，纵坐标代表典型观相关对应的相关性强度，不同颜色的曲线代表不同样本组。典型相关排位越靠后，其相关性强度越低，肘形图渐趋平缓。因此，可以基于肘形图的拐点位置，进行典型相关的选择，舍弃相关性强度较低的典型相关。根据图中所示，可以选取排位前20的典型相关进行后续分析。</p>
    <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['pc_elbow_plot', 'd3container'])">{{$t('button.svg')}}</el-button>
    <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>


    <!-- <div id="d3container"></div> -->

    <el-carousel style="width:900px" height="620px" arrow="always" indicator-position="outside" trigger="click" :autoplay="false" @change="change">
      <el-carousel-item >
        <div id="d3container"></div>
      </el-carousel-item>
      <el-carousel-item >
      2
      </el-carousel-item>
      <el-carousel-item >
      3
      </el-carousel-item>
    </el-carousel>

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
    change (last, next) {
      // console.log(last,next);
    },
    initData () {
      this.axios.get('/singel_cell/server/get_sdev_of_pc?username='+ this.$store.state.username +'&p=' + this.$store.state.projectId).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data.sdevOfPc
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
      var scattersvg = d3.select("#d3container").append("svg").attr("width", width).attr("height", height).attr("id", "scattersvg")

      var data = this.data
      var padding = {top:30,right:100,bottom:60,left:60}
      var xScale = d3.scaleLinear().domain([0, this.data.length]).range([0,width - padding.left - padding.right])
      var yScale = d3.scaleLinear().domain([d3.min(data.map(item => item["standardDeviation"])) - 2, d3.max(data.map(item => item["standardDeviation"])) + 2]).range([height - padding.top - padding.bottom,0]).nice()
      var xAxis = d3.axisBottom().scale(xScale)
      var yAxis = d3.axisLeft().scale(yScale)
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      let tooltip = d3.select('#container')
      	.append('div')
      	.style('position', 'absolute')
        .style('z-index', '10')
      	.style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '14px')
      	.style('font-weight', 'bold')
      	.text('')

      var x = scattersvg.append("g").call(xAxis).attr("transform","translate("+ padding.left +"," + (height - padding.bottom) +")")

      var y = scattersvg.append("g").call(yAxis).attr("transform","translate("+ padding.left +"," + padding.top +")")

      var line = d3.line()
          .x(function(d, i) { return padding.left + xScale(d["pcNum"]); }) // set the x values for the line generator
          .y(function(d) { return padding.top + yScale(d["standardDeviation"]); }) // set the y values for the line generator
          .curve(d3.curveMonotoneX) // apply smoothing to the line

      let krr = [{pcNum:2,standardDeviation:10,id:'cc'},{pcNum:6,standardDeviation:12,id:'cc'},{pcNum:4,standardDeviation:11,id:'pc'},{pcNum:8,standardDeviation:4,id:'pc'}]
      // scattersvg
      //     .selectAll('.line-group')
      //     .data(['cc','pc']).enter()
      //     .append('g')
      //     .append("path")
      //     // .datum(data) // 10 . Binds data to the line
      //     .attr("d", (d) => line(krr.filter(item => item.id === d)))
      //     .attr("fill", "none")
      //     .attr("stroke", (d,i) => colorScale(i))
      //     .attr("stroke-width", "3")

      // svg 被 rect 围住
      var circle = scattersvg.selectAll("circle")
                      .data(data)
                      .enter()
                      .append("circle")
                      .attr("cx", (d) => padding.left + xScale(d["pcNum"]))
                      .attr("cy", (d) => padding.top + yScale(d["standardDeviation"]))
                      .attr("r", 2.5)
                      .on('mouseover', function (d, i) {
                        let minus = i === 0? '': ' , ' + (d["standardDeviation"] - data[i-1]['standardDeviation']).toFixed(2)
                        return tooltip.style('visibility', 'visible').text(d["standardDeviation"].toFixed(2) + minus)
                      })
                      .on('mousemove', function (d, i) {
                        return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
                      })
                      .on('mouseout', function (d, i) {
                        return tooltip.style('visibility', 'hidden')
                      })

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
                .data(['D', 'W'])
                .enter()
                .append("line")
                .attr("x1", 5)
                .attr("y1", (d, i) => i * legendHeight + 5)
                .attr("x2", 30)
                .attr("y2", (d, i) => i * legendHeight + 5)
                .attr("fill", (d, i) => colorScale(i))
                .attr("stroke", (d, i) => colorScale(i))
                .attr("stroke-width", 3)
        legendGroup.selectAll(".text")
                  .data(['D', 'W'])
                  .enter()
                  .append("text")
                  .attr("transform",(d,i) => "translate(35,"+ (i * legendHeight + 10) +")")
                  .text(d => d)

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
