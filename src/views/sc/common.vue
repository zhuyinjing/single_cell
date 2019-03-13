<template>
  <div id="container">
    <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['tSNE', 'd3container'])">{{$t('button.svg')}}</el-button>
    <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

    <div id="d3container"></div>

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
      this.axios.get('/singel_cell/server/get_tsne_score?username='+ this.$store.state.username +'&p=' + this.$store.state.projectId).then((res) => {
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
      let width = 800, height = 600
      let padding = {top:30,right:80,bottom:60,left:60}
      let scattersvg = d3.select("#d3container").append("svg").attr("width", width).attr("height", height).attr("id", "scattersvg")
      let svg = scattersvg.append("g").attr("transform", "translate("+ padding.left + "," + padding.top +")")
      let colorScale = d3.scaleOrdinal(d3.schemeCategory20)
      let tooltip = d3.select('#container')
      	.append('div')
      	.style('position', 'absolute')
        .style('z-index', '10')
      	.style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '12px')
      	.style('font-weight', 'bold')
      	.text('')

      let xScale = d3.scaleLinear().domain(d3.extent(this.data.tSNE_1)).range([0,width - padding.left - padding.right]).nice()
      svg.append("g").attr("transform","translate(0,"+ (height - padding.bottom - padding.top) +")").call(d3.axisBottom(xScale))

      let yScale = d3.scaleLinear().domain(d3.extent(this.data.tSNE_2)).range([height - padding.top - padding.bottom,0]).nice()
      svg.append("g").call(d3.axisLeft(yScale))

      let circles = svg.selectAll("circle")
         .data(this.data.cellId)
         .enter()
         .append("circle")
         .attr("cx", (d,i) => {
           return xScale(self.data.tSNE_1[i])
         })
         .attr("cy", (d,i) => {
           return yScale(self.data.tSNE_2[i])
         })
         .attr("r",2.5)
         .attr("fill", (d,i) => {
           return colorScale(self.data.groupId[i])
         })
         .on('mouseover', function (d, i) {
           return tooltip.style('visibility', 'visible').text(5)
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
      scattersvg.append("text")
        .attr("transform", "translate("+ (width / 2 - 25) +", " + height + ")")
        .text("tSNE_1")
        .attr("font-size", "16px")

      // y 轴文字
      scattersvg.append("text")
        .text("tSNE_2")
        .attr("transform", "translate("+ 15 +", " + (height / 2) + ") rotate(-90)")

    },
  }
}
</script>

<style scoped="true">
.cursor-pointer {
  cursor: pointer;
}
</style>
