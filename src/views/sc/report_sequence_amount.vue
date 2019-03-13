<template>
  <div class="">
    <h2>不同单细胞测序量</h2>
    <p>RNA-seq测序数据产出可以作为衡量单细胞建库质量的一个指标：如果测序数据量太少，说明该细胞RNA分子库浓度不足；如果测序数据量太大，说明该细胞RNA分子库可能具有较高的重复率。所以，在进行单细胞转录组分析之前，要检测各细胞的测序量，根据实际情况去掉测序量偏性较大的细胞。</p>
    <p>如下图所示，横坐标通过barcode表示不同的细胞，纵坐标表示不同细胞的测序量。</p>
    <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['bar_chart', 'barContainer'])">{{$t('button.svg')}}</el-button>
    <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

    <div id="barContainer"></div>
  </div>
</template>

<script>
import * as d3 from 'd3'
export default {
  data() {
    return {
      barData: null,
    }
  },
  components: {
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData () {
      this.axios.get('/singel_cell/server/get_cell_sequence_num?username='+ this.$store.state.username +'&p='+ this.$store.state.projectId).then((res) => {
        if (res.data.message_type === 'success') {
          this.barData = res.data.readsPerCellList
          this.initBarChart()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initBarChart () {
      // create a tooltip
      var Tooltip = d3.select("#barContainer")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

      let hassvg = d3.selectAll('#barSvg')
      if (hassvg) {
        d3.selectAll('#barSvg').remove()
      }
      //  获取 svg 容器的实际 width
      // let containerWidth = document.getElementById("barContainer").clientWidth

      var margin = {top: 20, right: 20, bottom: 100, left: 60},
          width = 1200 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

      let xData = this.barData.map(item => item.cellId)
      let yData = this.barData.map(item => item.logScaleValue)

      var x = d3.scaleBand().domain(xData).range([0, width]).padding(0.1)
      var y = d3.scaleLinear().domain(d3.extent(yData)).range([height, 0]).nice()

      var svg = d3.select("#barContainer").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("id","barSvg")
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.selectAll(".bar")
            .data(this.barData)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.cellId); })
            .attr("width", x.bandwidth())
            .attr("y", function(d) { return y(d.logScaleValue); })
            .attr("fill","steelblue")
            .attr("height", function(d) { return height - y(d.logScaleValue); })
            .on("mouseover", function(d) {
              var barWidth = parseFloat(d3.select(this).attr("width"));
              var xPosition = parseFloat(d3.select(this).attr("x")) + (barWidth / 2);
              var yPosition = parseFloat(d3.select(this).attr("y")) - 10;
              // 当前 rect 颜色变浅
              d3.select(this).attr("fill","#4f8dbcad")

              svg.append("text")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .style("font-size","16px")
                // .style("font-weight","700")
                .attr("text-anchor", "middle")
                .text(d.readsTotalPerCell);
            })
            .on("mouseout", function(d) {
              // 颜色恢复成之前的
              d3.select(this).attr("fill","steelblue")

              d3.select('#tooltip').remove();
            });

        // add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "translate(-10,10) rotate(-90)");

        // add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

        // y 轴文字
        svg.append("text")
          .text('log10(Number of reads)')
          .style("font-size", "16px")
          .attr("transform", "translate("+ -40 +", " + (height / 2 + 30) + ") rotate(-90)")


    },
  }
}
</script>

<style scoped="true">
.cursor-pointer {
  cursor: pointer;
}
</style>
