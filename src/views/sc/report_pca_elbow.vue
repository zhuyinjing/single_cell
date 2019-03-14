<template>
  <div id="container">
    <h2>PCA 肘形图</h2>
    <p>如果随着主成分的增加，所有主成分的标准差之和不再有显著增长，说明当前的所有主成分即可代表细胞异质性，而不需要采用更多的主成分做下游聚类分析。因此，可以基于PCA肘形图的拐点位置，进行主成分的选择。</p>
    <p>如下图所示，横坐标表示主成分数量，纵坐标表示所有主成分的标准差之和。</p>
    <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['pc_elbow_plot', 'd3container'])">{{$t('button.svg')}}</el-button>
    <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

    <div id="d3container"></div>

    <div class="clear"></div>

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
      var padding = {top:30,right:30,bottom:60,left:60}
      var xScale = d3.scaleLinear().domain([0, 20]).range([0,width - padding.left - padding.right])
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
        .text("PC")
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")

      // y 轴文字
      scattersvg.append("text")
        .text("Standard Deviation of PC")
        .attr("transform", "translate("+ 15 +", " + (height / 2) + ") rotate(-90)")

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
