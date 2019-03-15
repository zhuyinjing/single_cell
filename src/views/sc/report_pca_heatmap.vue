<template>
  <div id="container">
    <h2>PCA 热图</h2>
    <p>PCA热图的每一列代表一个细胞，每一行代表该主成分中的一个基因，每一个色块代表相应细胞中相应基因的UMI数目。每张热图代表一个主成分，可以反映出该主成分在不同细胞之间的差异。在细胞之间的差异越大，该主成分越能代表细胞之间的异质性，可考虑用作下游聚类分析。</p>
    <el-checkbox-group
      v-model="pcArr">
      <el-checkbox v-for="item in pcList" :label="item" :key="item" style="width:20%;">{{item}}</el-checkbox>
    </el-checkbox-group>

    <br>

    <el-button type="primary" size="small" @click="getData()">{{$t('button.confirm')}}</el-button>
    <el-button type="info" size="small" @click="pcArr = []">{{$t('button.clear')}}</el-button>

    <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['heatmap', 'd3container'])">{{$t('button.svg')}}</el-button>
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
    this.axios.get('singel_cell/server/get_pca_heatmap?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username).then((res) => {
      if (res.data.message_type === 'success') {
        this.pcList = res.data.analysisNumList.analysisNum
        this.pcArr = this.pcList.slice(0,9)
        this.getData()
      } else {
        this.$message.error(res.data.message)
      }
    })
  },
  methods: {
    getData () {
      this.axios.get('singel_cell/server/get_pca_heatmap?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&pcNum='+ this.pcArr.join(',')).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          this.initHeatmap()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initHeatmap () {
      let self = this
      let hassvg = d3.selectAll('#heatmapsvg')
      if (hassvg) {
        d3.selectAll('#heatmapsvg').remove()
      }
      let padding = {top:50,right:150,bottom:30,left:0}
      let width = 5, height = 15  // 每个 rect 的宽度/高度
      let number = this.pcArr.length > 2 ? 3 : this.pcArr.length // 一行显示几个图，默认为 3，小于 3 则按 个数显示
      let xData = this.data[this.pcArr[0]].cellIdList
      let heatmapsvg = d3.select("#d3container").append("svg").attr("width", (width * xData.length + padding.left + padding.right) * number).attr("height", ((height * this.data[this.pcArr[0]].geneIdList.length + padding.top + padding.bottom) * Math.ceil(this.pcArr.length / number))).attr("id", "heatmapsvg")
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
        let rectData = this.data[this.pcArr[i]].umiMatrixList
        let yText = this.data[this.pcArr[i]].geneNameList

        let colorScale = d3.scaleSequential().domain(d3.extent(rectData.map(d => d.umiValue))).interpolator(d3.interpolatePlasma)

        let w = (width * xData.length + padding.right) * (i % number) + (padding.left * (parseInt(i / number) + 1)) // 每个 g 的位移
        let h = (height * yText.length + padding.bottom) * parseInt(i / number) + (padding.top * (parseInt(i / number) + 1))
        let svg = heatmapsvg.append("g").attr("transform", "translate("+ w + "," + h +")")

        svg.selectAll("rect")
           .data(rectData)
           .enter()
           .append("rect")
           .attr("x", (d,i) => width * (i % xData.length))
           .attr("y", (d,i) => height * parseInt(i / xData.length))
           .attr("width", width)
           .attr("height", height)
           .attr("fill", (d,i) => colorScale(d.umiValue))
          // .on('mouseover', function (d, i) {
          //     return tooltip.style('visibility', 'visible').text(d.umiValue)
          //   })
          //   .on('mousemove', function (d, i) {
          //     return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
          //   })
          //   .on('mouseout', function (d, i) {
          //     return tooltip.style('visibility', 'hidden')
          //   })

         // x 轴文字
         svg.append("text")
           .attr("transform", "translate("+ (width * xData.length / 2) +", " + (height * yText.length + 20) + ")")
           .text(this.pcArr[i])
           .attr("text-anchor", "middle")
           .attr("font-size", "16px")

         // y 轴文字
         svg.selectAll(".text")
            .data(yText)
            .enter()
            .append("text")
            .attr("transform", (d,i) => {return "translate("+ (width * xData.length + 5) +", " + (height * (i+1) - 3) + ")"})
            .text(d => d)
            .attr("font-size", height +"px")

      }

      let defs = heatmapsvg.append("defs");

      let linearGradient = defs.append("linearGradient")
  								.attr("id","linearColor")
  								.attr("x1","0%")
  								.attr("y1","0%")
  								.attr("x2","100%")
  								.attr("y2","0%");
      linearGradient.append("stop")
  						      .attr("offset","0%")
  						      .style("stop-color",d3.interpolatePlasma(0));

      linearGradient.append("stop")
  						      .attr("offset","50%")
  						      .style("stop-color",d3.interpolatePlasma(0.5));

  		linearGradient.append("stop")
        						.attr("offset","100%")
        						.style("stop-color",d3.interpolatePlasma(1));

      heatmapsvg.append("g")
                .attr("transform","translate("+ 0 +","+ 5 +")")
                .attr("id", "legend")
                .append("rect")
      					.attr("x", 0)
      					.attr("y", 0)
      					.attr("width", 100)
      					.attr("height", 30)
      					.style("fill","url(#" + linearGradient.attr("id") + ")")

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
