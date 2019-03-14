<template>
  <div id="container">
    <h2>基因与UMI数量分布</h2>
    <p>由于单细胞转录组建库的起始RNA分子量很少，所以测序结果并不能对每个细胞的转录组都有完整覆盖，一般情况下每个细胞会有几百到几千个基因的转录本被检测到，而且细胞之间存在差异。对于一个成功的单细胞转录组建库测序而言，不同细胞被检测到发生表达的基因的数量分布应该是比较宽泛的，不会只集中于某个区间，否则可能预示建库测序过程存在偏性。因此，对不同细胞被检测到发生表达的基因的数量分布进行描绘，可以辅助判断建库测序质量。/测序而言，不同细胞检测到的基因数目应该大体相当。因此，对不同细胞检测到的基因数目分布进行描绘，可以辅助判断测序质量。</p>
    <p>唯一分子识别码（Unique Molecular Identifier，UMI），可以用来对单细胞基因表达进行绝对定量。在对单细胞RNA分子进行PCR扩增之前，每个转录本都会被加上UMI。对于回贴到同一基因的所有读段，只需要计算UMI的数量，就可以对单细胞基因表达进行绝对定量，从而排除PCR扩增对定量的影响。对于一个成功的单细胞转录组建库测序而言，不同细胞的UMI数量总和应该具有比较宽泛的分布，不会只集中于某个区间，否则可能预示建库测序过程存在偏性。因此，对不同细胞检测到的UMI数量总和的分布进行描绘，可以辅助判断建库测序质量。</p>
    <p>下两图分别展示了在D和W两个样本组中，所有细胞被检测到发生表达的基因数量以及UMI数量总和的分布。</p>

    <div class="svgContainer" v-for="(item, index) in sample" :key="'sample' + index">
      <h3>{{index}}样本组基因与UMI数量分布</h3>
      <div class="svgbox">
        <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['geneCounts', index + 'geneContainer'])">{{$t('button.svg')}}</el-button>
        <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

        <div :id="index + 'geneContainer'"></div>
      </div>
    </div>

  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  data() {
    return {
      sample: {D: 4, W: 4},
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
      this.axios.get('/singel_cell/server/get_umi_meta_data?p='+ this.$store.state.projectId +'&username=' + this.$store.state.username).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          let number = Object.keys(this.sample)
          number.map((sampleName) => {
            this.initGene(sampleName)
          })
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initGene (sampleName) {
      let self = this
      let hassvg = d3.selectAll('#'+ sampleName +'geneCountsSvg')._groups[0].length
      if (hassvg) {
        d3.selectAll('#'+ sampleName +'geneCountsSvg').remove()
      }
      let svgWidth = 1200, svgHeight = 500
      let width = 600, height = 500 // 每个 g 标签的宽度/高度
      let padding = {top:30,right:80,bottom:60,left:80}
      let violinsvg = d3.select("#" + sampleName +"geneContainer").append("svg").attr("width", svgWidth).attr("height", svgHeight).attr("id", sampleName + "geneCountsSvg")
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      let tooltip = d3.select('#container')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('')
      let xData = []
      for (let i = 0;i < this.sample[sampleName];i++) {
        xData.push(sampleName + (i + 1))
      }
        let svg = violinsvg.append("g")

        var yValueArr = this.data.geneCount.map(item => item.count)

        // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
        var x = d3.scaleBand()
          .range([ padding.left, width - padding.right ])
          .domain(xData)
          .padding(0.05)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum..
        svg.append("g")
          .attr("transform", "translate(0" +"," + (height - padding.bottom) + ")")
          .call(d3.axisBottom(x))

        // Build and Show the Y scale
        var y = d3.scaleLinear()
          .domain(d3.extent(yValueArr))          // Note that here the Y scale is set manually
          .range([height - padding.bottom, padding.top]).nice()

        svg.append("g")
           .attr("transform", "translate("+ padding.left +",0)")
           .call(d3.axisLeft(y))

        // 随机散点
        var xLinear = d3.scaleLinear().domain([0,width]).range([0,width])

        // 每个图 按分组去画 violin plot
        for (let j = 0;j < xData.length;j++) {
          var data = this.data.geneCount.filter(item => item.featureType === xData[j])

          var yData = data.map(item => item.count)

          // Features of the histogram
          var histogram = d3.histogram()
              .domain(d3.extent(yData))
              .thresholds(y.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
              .value(d => d)
          var input, bins,allBins,lengths,longuest
          // Compute the binning for each group of the dataset
          var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
              .key(function(d) { return d.featureType;})
              .rollup(function(d) {   // For each key..
                input = d.map(function(d) { return d.count;})    // Keep the variable called Sepal_Length
                bins = histogram(input)   // And compute the binning on it.
                return(bins)
              })
              .entries(data)

          // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
          var maxNum = 0
          for (let k = 0;k < sumstat.length;k++){
            allBins = sumstat[k].value
            lengths = allBins.map(function(a){return a.length;})
            longuest = d3.max(lengths)
            if (longuest > maxNum) { maxNum = longuest }
          }
          // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
          var xNum = d3.scaleLinear()
            .range([0, x.bandwidth()])
            .domain([-maxNum,maxNum])

          // Add the shape to this svg!
          svg
            .selectAll("myViolin")
            .data(sumstat)
            .enter()        // So now we are working group per group
            .append("g")
            .attr("transform", function(d){ return("translate(" + x(d.key) +" ,0)") } ) // Translation on the right to be at the group position
            .append("path")
            .datum(function(d){ return(d.value)})     // So now we are working bin per bin
            .style("stroke", "black")
            .style("fill",(d,i) => colorScale(j))
            .attr("d", d3.area()
                         .x0(function(d){ return(xNum(-d.length)) } )
                         .x1(function(d){ return(xNum(d.length)) } )
                         .y(function(d){ return(y(d.x0)) } )
                         .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            )

          let x0 = Math.ceil(x(xData[j]))
          let x1 = Math.floor(x(xData[j]) + x.bandwidth())

          let randomData = d3.range(yData.length).map(d => d3.randomUniform(x0, x1)())

          svg.selectAll("g.circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d,i) => xLinear(randomData[i]))
            .attr("cy", (d, i) => y(d['count']))
            .attr("r", 1.5)
            .attr("fill", "black")
            .on('mouseover', function (d, i) {
              return tooltip.style('visibility', 'visible').text(d['cellId'])
            })
            .on('mousemove', function (d, i) {
              return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
            })
            .on('mouseout', function (d, i) {
              return tooltip.style('visibility', 'hidden')
            })
        }

        // x 轴文字
        svg.append("text")
          .attr("transform", "translate("+ (width / 2 - 25) +", " + padding.top + ")")
          .text("nGene")
          .attr("font-size", "16px")

   let svgUMI = violinsvg.append("g").attr("transform","translate("+ width +",0)")

        var yValueArr = this.data.umiCount.map(item => item.count)

        // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
        var x = d3.scaleBand()
          .range([ padding.left, width - padding.right ])
          .domain(xData)
          .padding(0.05)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum..
        svgUMI.append("g")
          .attr("transform", "translate(0" +"," + (height - padding.bottom) + ")")
          .call(d3.axisBottom(x))

        // Build and Show the Y scale
        var y = d3.scaleLinear()
          .domain(d3.extent(yValueArr))          // Note that here the Y scale is set manually
          .range([height - padding.bottom, padding.top]).nice()

        svgUMI.append("g")
           .attr("transform", "translate("+ padding.left +",0)")
           .call(d3.axisLeft(y))

        // 随机散点
        var xLinear = d3.scaleLinear().domain([0,width]).range([0,width])

        // 每个图 按分组去画 violin plot
        for (let j = 0;j < xData.length;j++) {
          var data = this.data.umiCount.filter(item => item.featureType === xData[j])

          var yData = data.map(item => item.count)

          // Features of the histogram
          var histogram = d3.histogram()
              .domain(d3.extent(yData))
              .thresholds(y.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
              .value(d => d)
          var input, bins,allBins,lengths,longuest
          // Compute the binning for each group of the dataset
          var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
              .key(function(d) { return d.featureType;})
              .rollup(function(d) {   // For each key..
                input = d.map(function(d) { return d.count;})    // Keep the variable called Sepal_Length
                bins = histogram(input)   // And compute the binning on it.
                return(bins)
              })
              .entries(data)

          // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
          var maxNum = 0
          for (let k = 0;k < sumstat.length;k++){
            allBins = sumstat[k].value
            lengths = allBins.map(function(a){return a.length;})
            longuest = d3.max(lengths)
            if (longuest > maxNum) { maxNum = longuest }
          }
          // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
          var xNum = d3.scaleLinear()
            .range([0, x.bandwidth()])
            .domain([-maxNum,maxNum])

          // Add the shape to this svg!
          svgUMI
            .selectAll("myViolin")
            .data(sumstat)
            .enter()        // So now we are working group per group
            .append("g")
            .attr("transform", function(d){ return("translate(" + x(d.key) +" ,0)") } ) // Translation on the right to be at the group position
            .append("path")
            .datum(function(d){ return(d.value)})     // So now we are working bin per bin
            .style("stroke", "black")
            .style("fill",(d,i) => colorScale(j))
            .attr("d", d3.area()
                         .x0(function(d){ return(xNum(-d.length)) } )
                         .x1(function(d){ return(xNum(d.length)) } )
                         .y(function(d){ return(y(d.x0)) } )
                         .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            )

          let x0 = Math.ceil(x(xData[j]))
          let x1 = Math.floor(x(xData[j]) + x.bandwidth())

          let randomData = d3.range(yData.length).map(d => d3.randomUniform(x0, x1)())

          svgUMI.selectAll("g.circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d,i) => xLinear(randomData[i]))
            .attr("cy", (d, i) => y(d['count']))
            .attr("r", 1.5)
            .attr("fill", "black")
            .on('mouseover', function (d, i) {
              return tooltip.style('visibility', 'visible').text(d['cellId'])
            })
            .on('mousemove', function (d, i) {
              return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
            })
            .on('mouseout', function (d, i) {
              return tooltip.style('visibility', 'hidden')
            })
        }

        // x 轴文字
        svgUMI.append("text")
          .attr("transform", "translate("+ (width / 2 - 25) +", " + padding.top + ")")
          .text("nUMI")
          .attr("font-size", "16px")

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
