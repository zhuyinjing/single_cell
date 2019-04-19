<template>
  <div id="container">
    <h2>基因与UMI数量基因结构分布</h2>
    <p>下图分别对基因数量和UMI数量在基因结构上的分布进行了描绘：对于基因而言，exons表示外显子上存在表达证据的基因数量，intron.exon表示外显子与内含子上同时存在表达证据的基因数量，introns表示内含子上存在表达证据的基因数量；对于UMI而言，exons表示所在read匹配到外显子上的UMI数量，intron.exon表示所在read同时匹配到外显子与内含子上的UMI数量，introns表示所在read匹配到内含子上的UMI数量。</p>
    <p>正常情况下，大部分的基因与UMI数量应该分布在exons与intron.exon两个类别中。</p>

    <div class="svgContainer">
      <div class="svgbox">
        <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['geneCounts', 'geneContainer'])">{{$t('button.svg')}}</el-button>
        <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

        <div id="geneContainer"></div>
      </div>
      <div class="svgbox">
        <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['UMIcounts', 'umiContainer'])">{{$t('button.svg')}}</el-button>
        <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

        <div id="umiContainer"></div>
      </div>

    </div>

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
      this.axios.get('/singel_cell/server/get_singel_cell_count_data?p='+ this.$store.state.projectId +'&username=' + this.$store.state.username).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          this.initGene()
          this.initUMI()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initGene () {
      let self = this
      let hassvg = d3.selectAll('#geneCountsSvg')._groups[0].length
      if (hassvg) {
        d3.selectAll('#geneCountsSvg').remove()
      }
      let width = 600, height = 500 // 每个 g 标签的宽度/高度
      let padding = {top:30,right:80,bottom:60,left:80}
      let violinsvg = d3.select("#geneContainer").append("svg").attr("width", width).attr("height", height).attr("id", "geneCountsSvg")
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      let tooltip = d3.select('#container')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('background', '#fff')
        .text('')
      let xData = ['exons', 'intron.exon', 'introns'] // 分组

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

        // y 轴文字
        svg.append("text")
          .text('Number of genes')
          .style("font-size", "16px")
          .attr("transform", "translate("+ 15 +", " + (height / 2) + ") rotate(-90)")

    },
    initUMI () {
      let self = this
      let hassvg = d3.selectAll('#UMIcountsSvg')._groups[0].length
      if (hassvg) {
        d3.selectAll('#UMIcountsSvg').remove()
      }
      let width = 600, height = 500 // 每个 g 标签的宽度/高度
      let padding = {top:30,right:80,bottom:60,left:80}
      let violinsvg = d3.select("#umiContainer").append("svg").attr("width", width).attr("height", height).attr("id", "UMIcountsSvg")
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      let tooltip = d3.select('#container')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('background', '#fff')
        .text('')
      let xData = ['exons', 'intron.exon', 'introns'] // 分组

        let svg = violinsvg.append("g")

        var yValueArr = this.data.umiCount.map(item => item.count)

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

        // y 轴文字
        svg.append("text")
          .text('Number of UMIs')
          .style("font-size", "16px")
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
.svgContainer {
  white-space: nowrap;
}
.svgbox {
  display: inline-block;
}
</style>
