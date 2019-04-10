<template>
  <div id="container">
    <h2>基因加载量分布图</h2>
    <p>基因加载量是主成分中每个基因的属性，基因加载量的绝对值越大，说明相应基因表达量可以解释该主成分方差的程度越大，对于该主成分越具有代表性。基因加载量的正负，分别表示相应基因表达量与该主成分成正相关或负相关关系。</p>
    <p>下图分别展示了前两个主成分中基因加载量绝对值排名前十的基因。</p>
    <el-checkbox-group
      v-model="pcArr">
      <el-checkbox v-for="item in pcList" :label="item" :key="item" style="width:20%;">{{item}}</el-checkbox>
    </el-checkbox-group>

    <br>

    <el-button type="primary" size="small" @click="getData()">{{$t('button.confirm')}}</el-button>
    <el-button type="info" size="small" @click="pcArr = []">{{$t('button.clear')}}</el-button>

    <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['vizPCA', 'd3container'])">{{$t('button.svg')}}</el-button>
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
    }
  },
  components: {
  },
  mounted() {
    this.axios.get('singel_cell/server/get_viz_pca?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&analysisNum='+ this.pcArr.join(',')).then((res) => {
      if (res.data.message_type === 'success') {
        this.pcList = res.data.analysisNumList.analysisNum
        this.pcArr = this.pcList.slice(0,10)
        this.getData()
      } else {
        this.$message.error(res.data.message)
      }
    })
  },
  methods: {
    getData () {
      this.axios.get('singel_cell/server/get_viz_pca?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&analysisNum='+ this.pcArr.join(',')).then((res) => {
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
      let hassvg = d3.selectAll('svg')
      if (hassvg) {
        d3.selectAll('svg').remove()
      }
      let width = 600, height = 600 // 每个 g 标签的宽度/高度
      let padding = {top:30,right:80,bottom:60,left:100}
      let number = 2 // 一行显示几个图
      let scattersvg = d3.select("#d3container").append("svg").attr("width", width * number).attr("height", (height * Math.ceil(this.pcArr.length / number))).attr("id", "scattersvg")
      let colorScale = d3.scaleOrdinal(d3.schemeCategory20)
      let tooltip = d3.select('#container')
      	.append('div')
      	.style('position', 'absolute')
        .style('z-index', '10')
      	.style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '18px')
      	.style('font-weight', 'bold')
      	.text('')

      for (let i = 0;i < this.pcArr.length;i++) {
        let svg = scattersvg.append("g").attr("transform", "translate("+ ((i % number) * width) + "," + (parseInt(i / number) * height) +")")

        let xData = this.data[this.pcArr[i]].value
        let yData = this.data[this.pcArr[i]].geneName

        let xScale = d3.scaleLinear().domain(d3.extent(xData)).range([padding.left,width - padding.right]).nice()
        svg.append("g")
          .attr("transform", "translate(0," + (height - padding.bottom) + ")")
          .call(d3.axisBottom(xScale))
          .selectAll("text")
          .style("text-anchor", "start")
          .attr("transform", "rotate(45 -10 10)");

        let yScale = d3.scaleBand().domain(yData).range([height - padding.bottom, padding.top]).padding(1)
        svg.append("g")
          .attr("transform", "translate(" + (padding.left) + ",0)")
          .call(d3.axisLeft(yScale))

        svg.selectAll("circle")
           .data(this.data[this.pcArr[i]].geneId)
           .enter()
           .append("circle")
           .attr("cx", (d,i) => xScale(xData[i]))
           .attr("cy", (d,i) => yScale(yData[i]))
           .attr("r", self.radius)
           .attr("fill", "#0600ff")
           .on('mouseover', function (d, i) {
             return tooltip.style('visibility', 'visible').text(d)
           })
           .on('mousemove', function (d, i) {
             return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
           })
           .on('mouseout', function (d, i) {
             return tooltip.style('visibility', 'hidden')
           })

         // x 轴文字
         svg.append("text")
           .attr("transform", "translate("+ (width / 2) +", " + height + ")")
           .text(this.pcArr[i])
           .attr("text-anchor", "middle")
           .attr("font-size", "16px")

         //  上边 和 右边 两侧的 line
         // svg.append("rect").attr("x",padding.left).attr("y",padding.top).attr("width",width-padding.left-padding.right).attr("height",height-padding.top-padding.bottom).attr("stroke","black").attr("fill","none").attr("stroke-width","1px")
         svg.append("line").attr("x1", padding.left).attr("y1", padding.top).attr("x2",width-padding.right).attr("y2",padding.top).attr("stroke","black").attr("stroke-width","1px")
         svg.append("line").attr("x1", width-padding.right).attr("y1", padding.top).attr("x2",width-padding.right).attr("y2",height - padding.bottom).attr("stroke","black").attr("stroke-width","1px")

         //  x y 坐标轴导致线条加粗
         // svg.selectAll(".domain")
         //     .style("display", "none");


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
