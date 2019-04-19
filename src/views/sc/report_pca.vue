<template>
  <div id="container">
    <h2>PCA 散点图</h2>
    <p>如下图所示，横坐标与纵坐标分别表示所有细胞基因表达量的第一个和第二个主成分，每一个点代表一个细胞。</p>
    <el-checkbox-group
      v-model="pcArr">
      <el-checkbox v-for="item in pcList" :label="item" :key="item" style="width:20%;">{{item}}</el-checkbox>
    </el-checkbox-group>

    <br>

    <el-button type="primary" size="small" @click="getData()">{{$t('button.confirm')}}</el-button>
    <el-button type="info" size="small" @click="pcArr = []">{{$t('button.clear')}}</el-button>

    &nbsp;&nbsp;&nbsp;
    {{$t('d3.radius')}}：<el-input-number size="mini" v-model="radius" :step="0.5" :min="0" @change="changeRadius()"></el-input-number>

    <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['PCA', 'd3container'])">{{$t('button.svg')}}</el-button>
    <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

    <br><br>

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
      data: null,
      radius: 3,
      opacity: 1,
    }
  },
  components: {
  },
  mounted() {
    //  获取 pc 列表
    this.axios.get('singel_cell/server/get_pca_score?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&analysisNum='+ this.pcArr.join(',')).then((res) => {
      if (res.data.message_type === 'success') {
        this.pcList = res.data.analysisNumList.analysisNum
        // 为了拼接 [[x,y,z],...] 数组
        this.pcArr = [this.pcList[0], this.pcList[1]]
        this.getData()
      } else {
        this.$message.error(res.data.message)
      }
    })
  },
  methods: {
    getData() {
      if (this.pcArr.length < 2) {
        this.$message.error('请至少选择 2 个PC！')
        return
      }
      if (this.pcArr.length > 10) {
        this.$message('最多选择10个PC，请修改您的选项！')
        return
      }
      this.axios.get('singel_cell/server/get_pca_score?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&analysisNum='+ this.pcArr.join(',')).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          this.initD3()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initD3() {
      if (this.pcArr.length > 10) {
        this.$message('最多选择10个PC，请修改您的选项！')
        return
      }
      let hassvg = d3.selectAll('.d3pcasvg')
      if (hassvg) {
        d3.selectAll('.d3pcasvg').remove()
      }
      let self = this
      var initWidth = this.pcArr.length > 8 ? this.pcArr.length * 100 : 800
      var initHeight = this.pcArr.length > 8 ? this.pcArr.length * 100 : 800
      // var initWidth = 800 + 40 * this.pcArr.length
      // var initHeight = 800 + 40 * this.pcArr.length

      var padding = {
        left: 80,
        top: 50,
        right: 150,
        bottom: 20
      }
      var width1 = initWidth + padding.right
      var height1 = initHeight + padding.bottom

      var arr = this.pcArr

      var width2 = initWidth - padding.left - padding.bottom
      var height2 = initHeight - padding.top - padding.bottom

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
      var svgG = d3.select("#d3container")
        .append("svg")
        .attr("class", "d3pcasvg")
        .attr("width", width1)
        .attr("height", height1)

      if (this.pcArr.length === 2) {
        var width = width2
        var height = height2
        var svg = svgG.append('g').attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
        //  x轴文字
        svg.append("text")
    					.attr("x", width / 2)
    					.attr("y", -20)
    					.attr("dy", "-0.3em")
    					.text(function(){
    						return self.pcArr[0];
    					});
        // svg.append("text")
    		// 			.attr("x", width / 2)
    		// 			.attr("y", -5)
    		// 			.attr("dy", "-0.3em")
    		// 			.text(function(){
    		// 				return "(" + 30 + "%)";
    		// 			});
        //  y轴文字
        svg.append("text")
    					.attr("x", -60)
    					.attr("y", height / 2)
              .attr("dy", "-0.3em")
              .style('text-anchor', 'start')
    					.text(function(){
                return self.pcArr[1];
    					});
        // svg.append("text")
    		// 			.attr("x", -60)
    		// 			.attr("y", height / 2 + 20)
        //       .attr("dy", "-0.3em")
        //       .style('text-anchor', 'start')
    		// 			.text(function(){
        //         return "(" + 20 + "%)";
    		// 			});
        //x轴比例尺
        var xScale = d3.scaleLinear().range([0, width])
          .domain([d3.min(self.data[self.pcArr[0]]) -2, d3.max(self.data[self.pcArr[0]]) +2]).nice()
        //定义x轴
        var xAxis = d3.axisBottom(xScale).ticks(3)
        //添加x轴
        var xaxisg = svg.append("g")
          .attr("class", "xaxis")
          .attr("transform", "translate(" + "0 ," + height + ")")
          .call(xAxis)
          .style("font-size", "14px")

        //y轴比例尺
        var yScale = d3.scaleLinear().range([height, 0])
          .domain([d3.min(self.data[self.pcArr[1]]) -2, d3.max(self.data[self.pcArr[1]]) +2]).nice()

        //定义y轴
        var yAxis = d3.axisLeft(yScale).ticks(3)
        //添加y轴
        var yaxisg = svg.append("g")
          .attr("class", "yaxis")
          .attr("transform", "translate(" + 0 + "," + 0 + ")")
          .call(yAxis)
          .style("font-size", "14px")
        // d3.selectAll('.domain').remove() // 删除多余的两端刻度线
        //添加网格-----------
        // gridlines in x axis function
        function make_x_gridlines() {
          return d3.axisBottom(xScale)
            .ticks(0)  // 2
        }

        // gridlines in y axis function
        function make_y_gridlines() {
          return d3.axisLeft(yScale)
            .ticks(0)  // 2
        }

        // add the X gridlines
        svg.append("g")
          .attr("class", "grid")
          .attr("transform", "translate(0," + height + ")")
          .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
          )

        // add the Y gridlines
        svg.append("g")
          .attr("class", "grid")
          .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
          )
        //添加circle包裹层，有几种类型添加几个
        var cover = svg.append("g")

        //添加circle
        cover.selectAll("circle")
          .data(self.data[self.pcArr[0]])
          .enter()
          .append("circle")
          .attr("cx", function(d, i) {
            return xScale(d)
          })
          .attr("cy", function(d, i) {
            return yScale(self.data[self.pcArr[1]][i])
          })
          .attr("r", self.radius)
          .attr("fill", "#f98078")
          .style("opacity",self.opacity)
          .on('mouseover', (d, i) => {
            return tooltip.style('visibility', 'visible').text(self.data['cellId'][i])
          })
          .on('mousemove', function (d, i) {
            return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
          })
          .on('mouseout', function (d, i) {
            return tooltip.style('visibility', 'hidden')
          })
      } else {
        var width = width2 / self.pcArr.length
        var height = height2 / self.pcArr.length
        for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < arr.length; j++) {
            let indexI = i
            var svg = svgG.append('g').attr('transform', 'translate(' + (j * (width) + (padding.left)) + ',' + (i * (height) + (padding.top)) + ')')
            // var svg = svgG.append('g').attr('transform','translate('+ (j * (width) + (j* 10))  +','+ (i * (height) + (i* 10)) +')')
            //x轴比例尺
            var xScale = d3.scaleLinear().range([0, width])
              .domain([d3.min(self.data[self.pcArr[j]]) - 2, d3.max(self.data[self.pcArr[j]]) + 2])
            //定义x轴
            var xAxis = d3.axisBottom(xScale).ticks(0)
            //添加x轴
            var xaxisg = svg.append("g")
              .attr("class", "xaxis")
              .attr("transform", "translate(" + "0 ," + height + ")")
              .call(xAxis)
              .style("font-size", "14px")

            //y轴比例尺
            var yScale = d3.scaleLinear().range([height, 0])
              .domain([d3.min(self.data[self.pcArr[i]]) - 2, d3.max(self.data[self.pcArr[i]]) + 2])
            //定义y轴
            var yAxis = d3.axisLeft(yScale).ticks(0)
            //添加y轴
            var yaxisg = svg.append("g")
              .attr("class", "yaxis")
              .attr("transform", "translate(" + 0 + "," + 0 + ")")
              .call(yAxis)
              .style("font-size", "14px")
            //添加网格-----------
            // gridlines in x axis function
            function make_x_gridlines() {
              return d3.axisBottom(xScale)
                .ticks(0)  // 3
            }

            // gridlines in y axis function
            function make_y_gridlines() {
              return d3.axisLeft(yScale)
                .ticks(0)  // 3
            }

            // add the X gridlines
            svg.append("g")
              .attr("class", "grid")
              .attr("transform", "translate(0," + height + ")")
              .call(make_x_gridlines()
                .tickSize(-height)
                .tickFormat("")
              )

            // add the Y gridlines
            svg.append("g")
              .attr("class", "grid")
              .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat("")
              )
            //添加circle包裹层，有几种类型添加几个
            var cover = svg.append("g")

            //添加circle
            cover.selectAll("circle")
              .data(self.data[self.pcArr[j]])
              .enter()
              .append("circle")
              .attr("cx", function(d) {
                return xScale(d)
              })
              .attr("cy", function(d,i) {
                return yScale(self.data[self.pcArr[indexI]][i])
              })
              .attr("r", function(d) {
                return self.radius
              })
              .attr("fill", "#f98078")
              .style("opacity", self.opacity)
              .on('mouseover', (d, i) => {
                return tooltip.style('visibility', 'visible').text(self.data['cellId'][i])
              })
              .on('mousemove', function (d, i) {
                return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
              })
              .on('mouseout', function (d, i) {
                return tooltip.style('visibility', 'hidden')
              })
          }
          //  x轴文字
          svgG.append("text")
      					.attr("x", (width / 2) + (i * width) + padding.left)
      					.attr("y", -15 + padding.top)
      					.attr("dy", "-0.3em")
                .attr("text-anchor", "middle")
      					.text(function(){
      						return self.pcArr[i]
      					});
          // svgG.append("text")
      		// 			.attr("x", (width / 2) + (i * width) + padding.left)
      		// 			.attr("y", -2 + padding.top)
      		// 			.attr("dy", "-0.3em")
          //       .attr("text-anchor", "middle")
      		// 			.text(function(){
      		// 				return "(" + 10 + "%" + ")";
      		// 			});
          //  y轴文字
          svgG.append("text")
      					.attr("x", -60 + padding.left)
      					.attr("y", height / 2 + (i * height) + padding.top)
                .attr("dy", "-0.3em")
                .style('text-anchor', 'start')
      					.text(function(){
                  return self.pcArr[i]
      					});
          // svgG.append("text")
      		// 			.attr("x", -60 + padding.left)
      		// 			.attr("y", height / 2 + 20 + (i * height) + padding.top)
          //       .attr("dy", "-0.3em")
          //       .style('text-anchor', 'start')
      		// 			.text(function(){
          //         return "(" + 30 + "%" + ")";
      		// 			});
        }
      }

      //  去掉多余的 path class='domain'
      d3.selectAll(".xaxis .domain").remove();
      d3.selectAll(".yaxis .domain").remove();

      d3.selectAll('.tick').selectAll("line").style("stroke", "#cccccc4d")
    },
    changeRadius () {
      d3.selectAll("circle").attr("r", this.radius)
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
