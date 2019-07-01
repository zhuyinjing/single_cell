<template>
  <div id="container" v-loading="loading"  element-loading-text="请稍等，数据正在加载中..." element-loading-spinner="el-icon-loading" style="height:100%">
    <h2>典型相关分析散点图</h2>
    <p>如下图所示，横坐标与纵坐标分别表示通过典型相关分析后获得的第一典型相关与第二典型相关，图中每一个点代表一个细胞，不同颜色代表不同的样本组。由下图可知，经过典型相关分析后，来自于不同样本组的细胞在投射空间中出现了一定程度的混合，但是相同样本组之间细胞的分布还是更为接近。这需要通过后续肘形图与热图的分析，选取一定数量具有代表性的典型相关进行相互比对，从而获得使不同样本组之间具有更大相关性的降维结果。</p>
    <el-checkbox-group
      v-model="pcArr">
      <el-checkbox v-for="item in pcList" :label="item" :key="'cc' + item" style="width:20%;">{{item}}</el-checkbox>
    </el-checkbox-group>

    <br>

    <el-button type="primary" size="small" @click="getData()">{{$t('button.confirm')}}</el-button>
    <el-button type="info" size="small" @click="pcArr = []">{{$t('button.clear')}}</el-button>

    &nbsp;&nbsp;&nbsp;
    {{$t('d3.radius')}}：<el-input-number size="mini" v-model="radius" :step="0.5" :min="0" @change="changeRadius()"></el-input-number>
    &nbsp;&nbsp;&nbsp;
    {{$t('d3.width')}}：<el-input-number size="mini" v-model="width" :step="100" :min="0" @change="initD3()"></el-input-number>
    &nbsp;&nbsp;&nbsp;
    {{$t('d3.height')}}：<el-input-number size="mini" v-model="height" :step="100" :min="0" @change="initD3()"></el-input-number>

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
      radius: 1.5,
      opacity: 1,
      loading: false,
      width: 800,
      height: 800,
    }
  },
  components: {
  },
  mounted() {
    //  获取 pc 列表
    this.axios.get('singel_cell/server/get_cca_score?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&analysisNum='+ this.pcArr.join(',')).then((res) => {
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
      if (this.pcArr.length !== 2) {
        this.$message.error('请选择 2 个CC！')
        return
      }
      this.loading = true
      // if (this.pcArr.length < 2) {
      //   this.$message.error('请至少选择 2 个CC！')
      //   return
      // }
      // if (this.pcArr.length > 10) {
      //   this.$message('最多选择10个CC，请修改您的选项！')
      //   return
      // }
      this.axios.get('singel_cell/server/get_cca_score?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&analysisNum='+ this.pcArr.join(',')).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          this.initD3()
        } else {
          this.$message.error(res.data.message)
        }
        this.loading = false
      }).catch(() => {
        this.$message.error('请求出错！')
        this.loading = false
      })
    },
    initD3() {
      let hassvg = d3.selectAll('.d3pcasvg')
      if (hassvg) {
        d3.selectAll('.d3pcasvg').remove()
      }
      let self = this
      var initWidth = this.pcArr.length > 8 ? this.pcArr.length * 100 : this.width
      var initHeight = this.pcArr.length > 8 ? this.pcArr.length * 100 : this.height

      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)

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
        //  y轴文字
        svg.append("text")
    					.attr("x", -60)
    					.attr("y", height / 2)
              .attr("dy", "-0.3em")
              .style('text-anchor', 'start')
    					.text(function(){
                return self.pcArr[1];
    					});
        // legend
        let legendMargin = 20
        let legendGroup = svg.append("g").attr("transform","translate("+ (width1 - padding.right - 50) +","+ (height1 / 3) +")")
        legendGroup.selectAll(".legend")
                  .data(this.data.sampleGroup)
                  .enter()
                  .append("circle")
                  .attr("cx", 5)
                  .attr("cy", (d, i) => i * legendMargin)
                  .attr("r", 5)
                  .attr("fill", (d, i) => colorScale(d.groupName))
          legendGroup.selectAll(".text")
                    .data(this.data.sampleGroup)
                    .enter()
                    .append("text")
                    .attr("transform",(d,i) => "translate(15,"+ (i * legendMargin + 5) +")")
                    .text(d => d.groupName)
        //x轴比例尺
        var xScale = d3.scaleLinear().range([0, width])
          .domain([d3.min(self.data[self.pcArr[0]]) , d3.max(self.data[self.pcArr[0]]) ]).nice()
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
          .domain([d3.min(self.data[self.pcArr[1]]) , d3.max(self.data[self.pcArr[1]]) ]).nice()

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
          .attr("class", "circleScatter")
          .attr("cx", function(d, i) {
            return xScale(d)
          })
          .attr("cy", function(d, i) {
            return yScale(self.data[self.pcArr[1]][i])
          })
          .attr("r", self.radius)
          .attr("fill", (d,i) => colorScale(self.data.groupName[i]))
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
              .domain([d3.min(self.data[self.pcArr[j]]) , d3.max(self.data[self.pcArr[j]]) ])
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
              .domain([d3.min(self.data[self.pcArr[i]]) , d3.max(self.data[self.pcArr[i]]) ])
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
              .attr("class", "circleScatter")
              .attr("cx", function(d) {
                return xScale(d)
              })
              .attr("cy", function(d,i) {
                return yScale(self.data[self.pcArr[indexI]][i])
              })
              .attr("r", function(d) {
                return self.radius
              })
              .attr("fill", (d,i) => colorScale(self.data.groupName[i]))
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
          //  y轴文字
          svgG.append("text")
      					.attr("x", -60 + padding.left)
      					.attr("y", height / 2 + (i * height) + padding.top)
                .attr("dy", "-0.3em")
                .style('text-anchor', 'start')
      					.text(function(){
                  return self.pcArr[i]
      					});
        }
      }

      //  去掉多余的 path class='domain'
      d3.selectAll(".xaxis .domain").remove();
      d3.selectAll(".yaxis .domain").remove();

      d3.selectAll('.tick').selectAll("line").style("stroke", "#cccccc4d")
    },
    changeRadius () {
      d3.selectAll(".circleScatter").attr("r", this.radius)
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
