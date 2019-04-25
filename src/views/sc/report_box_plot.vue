<template>
  <div id="container">
    <h2>测序读段回贴位置分布</h2>
    <p>转录本由基因外显子序列组成，因此单细胞转录组测序产生的reads应该都可以回贴到基因外显子区域。但是，由于单细胞转录组测序涉及大量的细胞，所以测序结果中会包含一定数量的可变剪切事件，从而导致部分reads回贴到基因内含子区域。对reads基因组回贴位置进行统计，可以辅助判断单细胞转录组的测序质量。</p>
    <p>如下图所示，横坐标表示各类reads回贴位置，纵坐标表示每个细胞中回贴到相应位置的reads比例。</p>
    <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['测序读段回贴位置分布', 'boxContainer'])">{{$t('button.svg')}}</el-button>
    <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

    <div id="boxContainer"></div>
  </div>
</template>

<script>
import * as d3 from 'd3'
export default {
  data() {
    return {
      boxData: null,
    }
  },
  components: {
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData () {
      this.axios.get('/singel_cell/server/get_cell_location_dist?username='+ this.$store.state.username +'&p='+ this.$store.state.projectId).then(res => {
        if (res.data.message_type === 'success') {
          this.boxData = res.data.singelCellFeaturesList
          this.initBoxPlot()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initBoxPlot () {
      let hassvg = d3.selectAll('svg')
      if (hassvg) {
        d3.selectAll('svg').remove()
      }
      let tooltip = d3.select('#container')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text('')
      var margin = {top: 10, right: 120, bottom: 30, left: 60},
          width = 1000 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

      let xData = ["exon", "intron", "Ambiguity", "Intergenic", "Unmapped", "NA"]

      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)

      // append the svg object to the body of the page
      var svg = d3.select("#boxContainer")
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

       var q1,median,q3,interQuantileRange,min,max

        // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
        var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
          .key(function(d) { return d.assignmentType;})
          .rollup(function(d) {
            q1 = d3.quantile(d.map(function(g) { return g.fractionReads;}).sort(d3.ascending),.25)
            median = d3.quantile(d.map(function(g) { return g.fractionReads;}).sort(d3.ascending),.5)
            q3 = d3.quantile(d.map(function(g) { return g.fractionReads;}).sort(d3.ascending),.75)
            interQuantileRange = q3 - q1
            min = q1 - 1.5 * interQuantileRange
            max = q3 + 1.5 * interQuantileRange

            let arr = d.filter(item => item.fractionReads >= min && item.fractionReads <= max).sort((a,b) => a.fractionReads - b.fractionReads)
            let top = arr[arr.length - 1].fractionReads // line 的上限，符合 [min,max] 中最大值
            let bottom = arr[0].fractionReads
            return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: bottom, max: top})
          })
          .entries(this.boxData)

        // Show the X scale
        var x = d3.scaleBand()
          .range([ 0, width ])
          .domain(xData)
          .paddingInner(1)
          .paddingOuter(.5)

        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))

        // Show the Y scale
        var y = d3.scaleLinear()
          .domain(d3.extent(this.boxData.map(d => d.fractionReads)))
          .range([height, 0])
          .nice()
        svg.append("g").call(d3.axisLeft(y))

        // Show the main vertical line
        svg
          .selectAll("vertLines")
          .data(sumstat)
          .enter()
          .append("line")
            .attr("x1", function(d){return(x(d.key))})
            .attr("x2", function(d){return(x(d.key))})
            .attr("y1", function(d){return(y(d.value.min))})
            .attr("y2", function(d){return(y(d.value.max))})
            .attr("stroke", "black")
            .style("width", 40)

        // rectangle for the main box
        var boxWidth = 100
        svg
          .selectAll("boxes")
          .data(sumstat)
          .enter()
          .append("rect")
              .attr("x", function(d){return(x(d.key)-boxWidth/2)})
              .attr("y", function(d){return(y(d.value.q3))})
              .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))})
              .attr("width", boxWidth )
              .attr("stroke", "black")
              .style("fill", (d,i) => colorScale(d.key))

        // Show the median
        svg
          .selectAll("medianLines")
          .data(sumstat)
          .enter()
          .append("line")
            .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
            .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
            .attr("y1", function(d){return(y(d.value.median))})
            .attr("y2", function(d){return(y(d.value.median))})
            .attr("stroke", "black")
            .style("width", 80)

      // Add individual points with jitter
      // 异常值的取值范围 > top, < bottom
      let circleData = []
      sumstat.map(item => {
        circleData = circleData.concat(this.boxData.filter(d => d.assignmentType === item.key).filter(d => d.fractionReads < item.value.min || d.fractionReads > item.value.max))
      })
      var jitterWidth = 50
      svg
        .selectAll("indPoints")
        .data(circleData)
        .enter()
        .append("circle")
          .attr("cx", function(d){return(x(d.assignmentType))})
          .attr("cy", function(d){return(y(d.fractionReads))})
          .attr("r", 2.5)
          .on('mouseover', function (d, i) {
            return tooltip.style('visibility', 'visible').text(d['cellId'])
          })
          .on('mousemove', function (d, i) {
            return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
          })
          .on('mouseout', function (d, i) {
            return tooltip.style('visibility', 'hidden')
          })

        // y 轴文字
        svg.append("text")
          .text('Fraction of reads per cell')
          .style("font-size", "16px")
          .attr("transform", "translate("+ -40 +", " + (height / 2 + 50) + ") rotate(-90)")

       // legend
       let rectWidth = 20, rectHeight = 20, rectMargin = 5
       let legend = svg.append("g").attr("transform","translate("+ width +"," + (height/4)+")")
       legend.selectAll(".circle")
             .data(xData)
             .enter()
             .append("rect")
             .attr("x",0)
             .attr("y",(d,i) => i * (rectHeight + rectMargin))
             .attr("width", rectWidth)
             .attr("height",rectHeight)
             .attr("fill", d => colorScale(d))

       legend.selectAll(".text")
             .data(xData)
             .enter()
             .append("text")
             .attr("transform",(d,i) => {
               return "translate(" + (rectWidth + rectMargin) +","+ (rectHeight / 2 + i * (rectHeight + rectMargin) + rectMargin) +")"
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
</style>
