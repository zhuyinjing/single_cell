<template>
  <div id="container" v-loading="loading"  element-loading-text="请稍等，数据正在加载中..." element-loading-spinner="el-icon-loading" style="height:100%">
    <h2>PCA 统计显著性检验</h2>
    <p>衡量基因表达量与其主成分分值之间相关性的p-value称作基因分值，p-value越低说明该基因表达量与其主成分分值的相关性越高。如果主成分中富集具有低p-value的基因，那么该主成分被认为在代表细胞异质性方面具有统计显著性，可以考虑用作下游聚类分析。</p>
    <p>下图展示了前六个主成分的统计显著性检验结果。其中，每一张小图的横坐标表示基于随机数据生成的主成分中具有低p-value的基因比例，纵坐标表示被检验主成分中具有低p-value的基因比例，组成蓝色曲线的每一个点代表基于每一次随机数据的计算结果。如果蓝色曲线越偏向左侧，说明该主成分越具有统计显著性。另外，每个小图上方也标记了统计显著性检验的p-value结果。</p>
    <el-checkbox-group
      v-model="pcArr">
      <el-checkbox v-for="item in pcList" :label="item" :key="item" style="width:20%;">{{item}}</el-checkbox>
    </el-checkbox-group>

    <br>

    <el-button type="primary" size="small" @click="getData()">{{$t('button.confirm')}}</el-button>
    <el-button type="info" size="small" @click="pcArr = []">{{$t('button.clear')}}</el-button>

    <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['JackStrawPlot', 'd3container'])">{{$t('button.svg')}}</el-button>
    <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

    <div id="d3container"></div>

  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  data() {
    return {
      pcList: [],
      pcArr: [],
      data: [],
      radius: 3,
      loading: false
    }
  },
  components: {
  },
  mounted() {
    this.axios.get('singel_cell/server/get_jack_straw_plot?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&pcNum='+ this.pcArr.join(',')).then((res) => {
      if (res.data.message_type === 'success') {
        this.pcList = res.data.analysisNumList.analysisNum
        this.pcArr = this.pcList.slice(0,6)
        this.getData()
      } else {
        this.$message.error(res.data.message)
      }
    })
  },
  methods: {
    getData () {
      this.loading = true
      this.axios.get('singel_cell/server/get_jack_straw_plot?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&pcNum='+ this.pcArr.join(',')).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          this.initScatterPlot()
        } else {
          this.$message.error(res.data.message)
        }
        this.loading = false
      }).catch(() => {
        this.$message.error('请求出错！')
        this.loading = false
      })
    },
    initScatterPlot () {
      let self = this
      let hassvg = d3.selectAll('svg')
      if (hassvg) {
        d3.selectAll('svg').remove()
      }
      let width = 500, height = 300 // 每个 g 标签的宽度/高度
      let padding = {top:30,right:20,bottom:60,left:60}
      let number = 3 // 一行显示几个图
      let scattersvg = d3.select("#d3container").append("svg").attr("width", width * number).attr("height", (height * Math.ceil(this.pcArr.length / number))).attr("id", "scattersvg")
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

      for (let i = 0;i < this.pcArr.length;i++) {
        let svg = scattersvg.append("g").attr("transform", "translate("+ ((i % number) * width) + "," + (parseInt(i / number) * height) +")")

        // let xData = this.data[this.pcArr[i]].jackStawPlot.map(item => item.empiricalPValue)
        // let yData = this.data[this.pcArr[i]].jackStawPlot.map(item => item.fakePValue)

        let xScale = d3.scaleLinear().domain([0,0.1]).range([padding.left,width - padding.right])
        svg.append("g")
          .attr("transform", "translate(0," + (height - padding.bottom) + ")")
          .call(d3.axisBottom(xScale).tickFormat(d => d.toFixed(3)).tickValues([0.000,0.025,0.050,0.075,0.100]))

        let yScale = d3.scaleLinear().domain([0,0.3]).range([height - padding.bottom, padding.top])
        svg.append("g")
          .attr("transform", "translate(" + (padding.left) + ",0)")
          .call(d3.axisLeft(yScale).tickValues([0.0,0.1,0.2,0.3]))

        svg.selectAll("circle")
           .data(this.data[this.pcArr[i]].jackStawPlot)
           .enter()
           .append("circle")
           .attr("cx", (d,i) => xScale(d.empiricalPValue))
           .attr("cy", (d,i) => yScale(d.fakePValue))
           .attr("r", self.radius)
           .attr("fill", "#0600ff")

         // x 轴文字
         svg.append("text")
           .attr("transform", "translate("+ (width / 2) +", " + (padding.top - 5) + ")")
           .text(this.pcArr[i] + '\xa0\xa0' + this.data[this.pcArr[i]].jackStrawPlotProp[0].propPValue)
           .attr("text-anchor", "middle")
           .attr("font-size", "16px")

         //  上边 和 右边 两侧的 line
         // svg.append("rect").attr("x",padding.left).attr("y",padding.top).attr("width",width-padding.left-padding.right).attr("height",height-padding.top-padding.bottom).attr("stroke","black").attr("fill","none").attr("stroke-width","1px")
         svg.append("line").attr("x1", padding.left).attr("y1", padding.top).attr("x2",width-padding.right).attr("y2",padding.top).attr("stroke","black").attr("stroke-width","1px")
         svg.append("line").attr("x1", width-padding.right).attr("y1", padding.top).attr("x2",width-padding.right).attr("y2",height - padding.bottom).attr("stroke","black").attr("stroke-width","1px")

         // 斜率为 1 的虚线
         svg.append("line")
            .attr("x1", xScale(0))
            .attr("y1", yScale(0))
            .attr("x2", xScale(xScale.domain()[1]))
            .attr("y2", yScale(xScale.domain()[1]))
            .attr("stroke", "#666")
            .attr("stroke-dasharray", 5)

      }

    },
  }
}
</script>

<style scoped="true">
.cursor-pointer {
  cursor: pointer;
}
.el-checkbox+.el-checkbox {
  margin-left: 0 !important;
}
</style>
