<template>
  <div id="container">
    <h2>基因与UMI数量分布</h2>
    <p>由于单细胞转录组建库的起始RNA分子量很少，所以测序结果并不能对每个细胞的转录组都有完整覆盖，一般情况下每个细胞会有几千个基因的转录本被检测到。对于一个成功的单细胞转录组/测序而言，不同细胞检测到的基因数目应该大体相当。因此，对不同细胞检测到的基因数目分布进行描绘，可以辅助判断测序质量。</p>
    <p>UMI是Unique Molecular Identifier的缩写，即唯一分子识别码，用来对单细胞转录本进行绝对定量。在对单细胞RNA分子进行扩增之前，每个转录本都会被加上UMI。对于回贴到同一基因的reads，只需要计算UMI的数量，就可以对该基因转录本进行绝对定量，从而排除扩增对定量的影响。对于一个成功的单细胞转录组测序而言，不同细胞的UMI总和应该分布在一定的范围之内。因此，对不同细胞检测到的UMI数据分布进行描绘，可以辅助判断测序质量。</p>
    <p>下图分别表示，在相同样本中，所有细胞检测到的基因和UMI数目分布。</p>

    <div class="svgContainer">
      <div class="svgbox">
        <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['nGene', 'nGeneContainer'])">{{$t('button.svg')}}</el-button>
        <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

        <div id="nGeneContainer"></div>
      </div>
      <div class="svgbox">
        <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['nUMI', 'nUMIContainer'])">{{$t('button.svg')}}</el-button>
        <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

        <div id="nUMIContainer"></div>
      </div>

    </div>

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
      this.axios.get('/singel_cell/server/get_umi_meta_data?p='+ this.$store.state.projectId +'&username=' + this.$store.state.username).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data.umiMetaDataList
          this.initnGene()
          this.initnUMI()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initnGene () {
      let self = this
      let hassvg = d3.selectAll('#nGenesvg')
      if (hassvg) {
        d3.selectAll('#nGenesvg').remove()
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
      var margin = {top: 15, right: 30, bottom: 30, left: 40},
          width = 400 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3.select("#nGeneContainer")
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("id","nGenesvg")
        .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

      // Read the data and compute summary statistics for each specie
        var data = this.data
        var sampleData = this.data.map(item => item.nGene)

        // Build and Show the Y scale
        var y = d3.scaleLinear()
          .domain([d3.min(sampleData) * 1.2,d3.max(sampleData) * 1.2])          // Note that here the Y scale is set manually
          .range([height, 0]).nice()
        svg.append("g").call( d3.axisLeft(y) )

        // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
        var x = d3.scaleBand()
          .range([ 0, width ])
          .domain([this.data[0].sampleGroup])
          .padding(0.05)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum..

        var xLinear = d3.scaleLinear().domain([0,width]).range([0,width])


        let x0 = Math.ceil(x(this.data[0].sampleGroup))
        let x1 = Math.floor(x(this.data[0].sampleGroup) + x.bandwidth())

        var xData = d3.range(sampleData.length).map(d => d3.randomUniform(x0, x1)())

        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
        // Features of the histogram
        var histogram = d3.histogram()
            .domain([d3.min(sampleData),y.domain()[1]])
            .thresholds(y.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d)
        var input, bins,allBins,lengths,longuest
        // Compute the binning for each group of the dataset
        var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
            .key(function(d) { return d.sampleGroup;})
            .rollup(function(d) {   // For each key..
              input = d.map(function(g) { return g.nGene;})    // Keep the variable called Sepal_Length
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
              .style("fill","#f8766d")
              .attr("d", d3.area()
                  .x0(function(d){ return(xNum(-d.length)) } )
                  .x1(function(d){ return(xNum(d.length)) } )
                  .y(function(d){ return(y(d.x0)) } )
                  .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
              )

          svg.selectAll("g.circle")
            .data(xData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinear(d))
            .attr("cy", (d, i) => y(sampleData[i]))
            .attr("r", 1.5)
            .attr("fill", "black")
            .on('mouseover', function (d, i) {
              return tooltip.style('visibility', 'visible').text(self.data[i]['cellId'])
            })
            .on('mousemove', function (d, i) {
              return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
            })
            .on('mouseout', function (d, i) {
              return tooltip.style('visibility', 'hidden')
            })

            svg.append("text")
              .attr("transform", "translate("+ (width / 2) +", 0)")
              .text("nGene")
              .attr("text-anchor", "middle")
              .attr("font-size", "16px")

    },
    initnUMI () {
      let self = this
      let hassvg = d3.selectAll('#nUMIsvg')
      if (hassvg) {
        d3.selectAll('#nUMIsvg').remove()
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
      var margin = {top: 15, right: 30, bottom: 30, left: 40},
          width = 400 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3.select("#nUMIContainer")
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("id","nUMIsvg")
        .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

      // Read the data and compute summary statistics for each specie
        var data = this.data
        var sampleData = this.data.map(item => item.nUMI)

        // Build and Show the Y scale
        var y = d3.scaleLinear()
          .domain([d3.min(sampleData) * 1.2,d3.max(sampleData) * 1.2])          // Note that here the Y scale is set manually
          .range([height, 0]).nice()
        svg.append("g").call( d3.axisLeft(y) )

        // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
        var x = d3.scaleBand()
          .range([ 0, width ])
          .domain([this.data[0].sampleGroup])
          .padding(0.05)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum..

        var xLinear = d3.scaleLinear().domain([0,width]).range([0,width])


        let x0 = Math.ceil(x(this.data[0].sampleGroup))
        let x1 = Math.floor(x(this.data[0].sampleGroup) + x.bandwidth())

        var xData = d3.range(sampleData.length).map(d => d3.randomUniform(x0, x1)())

        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
        // Features of the histogram
        var histogram = d3.histogram()
            .domain([d3.min(sampleData),y.domain()[1]])
            .thresholds(y.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d)
        var input, bins,allBins,lengths,longuest
        // Compute the binning for each group of the dataset
        var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
            .key(function(d) { return d.sampleGroup;})
            .rollup(function(d) {   // For each key..
              input = d.map(function(g) { return g.nUMI;})    // Keep the variable called Sepal_Length
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
              .style("fill","#f8766d")
              .attr("d", d3.area()
                  .x0(function(d){ return(xNum(-d.length)) } )
                  .x1(function(d){ return(xNum(d.length)) } )
                  .y(function(d){ return(y(d.x0)) } )
                  .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
              )

          svg.selectAll("g.circle")
            .data(xData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinear(d))
            .attr("cy", (d, i) => y(sampleData[i]))
            .attr("r", 1.5)
            .attr("fill", "black")
            .on('mouseover', function (d, i) {
              return tooltip.style('visibility', 'visible').text(self.data[i]['cellId'])
            })
            .on('mousemove', function (d, i) {
              return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
            })
            .on('mouseout', function (d, i) {
              return tooltip.style('visibility', 'hidden')
            })

            svg.append("text")
              .attr("transform", "translate("+ (width / 2) +", 0)")
              .text("nUMI")
              .attr("text-anchor", "middle")
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
