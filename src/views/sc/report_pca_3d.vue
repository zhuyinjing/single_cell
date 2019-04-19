<template>
  <div id="container">
    <h2>PCA 散点图</h2>
    <p>如下图所示，不同细胞中所有基因表达值降维分析的前三个主成分被展示出来，每一个点代表一个细胞。</p>

    <el-checkbox-group
      v-model="pcArr">
      <el-checkbox v-for="item in pcList" :label="item" :key="item" style="width:20%;">{{item}}</el-checkbox>
    </el-checkbox-group>

    <br>

    <el-button type="primary" size="small" @click="getData()">{{$t('button.confirm')}}</el-button>
    <el-button type="info" size="small" @click="pcArr = []">{{$t('button.clear')}}</el-button>

    &nbsp;&nbsp;&nbsp;
    {{$t('d3.radius')}}：<el-input-number size="mini" v-model="radius" :step="0.5" :min="0" @change="changeRadius()"></el-input-number>

    &nbsp;&nbsp;&nbsp;
    比例尺：<el-input-number size="mini" v-model="scale" :step="0.5" :min="0" @change="initD3()"></el-input-number>



    <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['PCA-3d', 'scatterContainer'])">{{$t('button.svg')}}</el-button>
    <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

    <br><br>

    <div id="scatterContainer"></div>

  </div>
</template>

<script>
import * as d3 from 'd3'
import { _3d } from 'd3-3d'
export default {
  data() {
    return {
      pcList: [],
      pcArr: [],
      data: null,
      radius: 3,
      scale: 4,
    }
  },
  components: {
  },
  mounted() {
    //  获取 pc 列表
    this.axios.get('singel_cell/server/get_pca_score?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&analysisNum='+ this.pcArr.join(',')).then((res) => {
      if (res.data.message_type === 'success') {
        this.pcList = res.data.analysisNumList.analysisNum
        this.pcArr = [this.pcList[0], this.pcList[1], this.pcList[2]]
        this.getData()
      } else {
        this.$message.error(res.data.message)
      }
    })
  },
  methods: {
    getData () {
      if (this.pcArr.length !== 3) {
        this.$message.error('请选择 3 个PC！')
        return
      }
      this.axios.get('singel_cell/server/get_pca_score?p='+ this.$store.state.projectId +'&username='+ this.$store.state.username +'&analysisNum='+ this.pcArr.join(',')).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          // 为了拼接 [[x,y,z],...] 数组
          this.data.points = []
          this.data[this.pcArr[0]].map((item, i) => {
            this.data.points.push([item, this.data[this.pcArr[1]][i], this.data[this.pcArr[2]][i], this.data["cellId"][i]])
          })
          this.initD3()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    initD3 () {
      let self = this
      let hassvg = d3.selectAll('#scatterSvg')
      if (hassvg) {
        d3.selectAll('#scatterSvg').remove()
        d3.selectAll('#tooltipId').remove()
      }
      let tooltip = d3.select('#container')
      	.append('div')
      	.style('position', 'absolute')
        .style('z-index', '10')
      	.style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '18px')
      	.style('font-weight', 'bold')
        .style('background', '#fff')
        .attr('id','tooltipId')
      	.text('')
      let width = 240 * this.scale, height = 200 * this.scale
      d3.select("#scatterContainer").append("svg").attr("width",width).attr("height",height).attr("id","scatterSvg")
      d3._3d = _3d

      var origin = [width/2, height/2-100], j = 10, scale = this.scale, scatter = [], xLine = [], yLine = [],zLine = [], xGrid = [], beta = 0, alpha = 0, key = function(d){ return d.id; }, startAngle = Math.PI/4;
      var svg    = d3.select('#scatterSvg').call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
      var color  = d3.scaleOrdinal(d3.schemeCategory20);
      var mx, my, mouseX, mouseY;
      var xAxisText = d3.select("#scatterSvg").append("text").text(this.pcArr[0])
      var yAxisText = d3.select("#scatterSvg").append("text").text(this.pcArr[1])
      var zxisText = d3.select("#scatterSvg").append("text").text(this.pcArr[2])
      var textX,textY

      var grid3d = d3._3d()
          .shape('GRID', 2) // 每行 x 点的
          .origin(origin)
          .rotateY( startAngle)
          .rotateX(-startAngle)
          .scale(scale);

      var point3d = d3._3d()
          .x(function(d,i){ return d[0] })
          .y(function(d){ return d[1] })
          .z(function(d){ return d[2] })
          .origin(origin)
          .rotateY( startAngle)
          .rotateX(-startAngle)
          .scale(scale);

      var axisScale3d = d3._3d()
          .shape('LINE_STRIP')
          .origin(origin)
          .rotateY( startAngle)
          .rotateX(-startAngle)
          .scale(scale);

      function processData(data, tt){

          /* ----------- GRID ----------- */

          var xGrid = svg.selectAll('path.grid').data(data[0], key);

          xGrid
              .enter()
              .append('path')
              .attr('class', '_3d grid')
              .merge(xGrid)
              .attr('stroke', 'black')
              .attr('stroke-width', 0.3)
              .attr('fill', function(d){ return d.ccw ? 'lightgrey' : '#717171'; })
              .attr('fill-opacity', 0.9)
              .attr('d', grid3d.draw);

          xGrid.exit().remove();

          /* ----------- POINTS ----------- */
          var points = svg.selectAll('circle').data(data[1]);

          points
              .enter()
              .append('circle')
              .attr('class', '_3d')
              .attr('opacity', 0)
              .attr('cx', (d,i) => d.projected.x)
              .attr('cy', (d) => d.projected.y)
              .on('mouseover', function (d, i) {
                return tooltip.style('visibility', 'visible').text(d[3]).style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
              })
              .on('mousemove', function (d, i) {
                return tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px')
              })
              .on('mouseout', function (d, i) {
                return tooltip.style('visibility', 'hidden')
              })
              .merge(points)
              .transition().duration(tt)
              .attr('r', self.radius)
              .attr('fill', '#f98078')
              .attr('opacity', 1)
              .attr('cx', (d) => d.projected.x)
              .attr('cy', (d) => d.projected.y)

          points.exit().remove();

          /* ----------- y-Scale ----------- */

          var yScale = svg.selectAll('path.yScale').data(data[2]);

          yScale
              .enter()
              .append('path')
              .attr('class', '_3d yScale')
              .merge(yScale)
              .attr('stroke', 'black')
              .attr('stroke-width', .5)
              .attr('d', axisScale3d.draw);

          yScale.exit().remove();

          var xScale = svg.selectAll('path.xScale').data(data[3]);

          xScale
              .enter()
              .append('path')
              .attr('class', '_3d xScale')
              .merge(xScale)
              .attr('stroke', 'black')
              .attr('stroke-width', .5)
              .attr('d', axisScale3d.draw);

          xScale.exit().remove();

          var zScale = svg.selectAll('path.zScale').data(data[4]);

          zScale
              .enter()
              .append('path')
              .attr('class', '_3d zScale')
              .merge(zScale)
              .attr('stroke', 'black')
              .attr('stroke-width', .5)
              .attr('d', axisScale3d.draw);

          zScale.exit().remove();

           /* ----------- y-Scale Text ----------- */

          var yText = svg.selectAll('text.yText').data(data[2][0]);


          let a,b
          yText
              .enter()
              .append('text')
              .attr('class', '_3d yText')
              .attr('dx', '.3em')
              .merge(yText)
              .each(function(d){
                  d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
              })
              .attr('x', function(d,i){
                if(i === data[2][0].length - 1) {
                  textX = d.projected.x
                }
                return d.projected.x;
              })
              .attr('y', function(d,i){
                if(i === data[2][0].length - 1) {
                  textY = d.projected.y
                }
                return d.projected.y;
              })
              .text(function(d,i){ return i === 0 ? '' : d[1] });

          yAxisText.attr("transform","translate("+ (textX-30) + "," + textY +")")

          yText.exit().remove();

          var xText = svg.selectAll('text.xText').data(data[3][0]);

          xText
              .enter()
              .append('text')
              .attr('class', '_3d xText')
              // .attr('dx', '.3em')
              .attr('dy', '.5em')
              .merge(xText)
              .each(function(d){
                  d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
              })
              .attr('x', function(d,i){
                if(i === data[3][0].length - 1) {
                  textX = d.projected.x
                }
                return d.projected.x;
              })
              .attr('y', function(d,i){
                if(i === data[3][0].length - 1) {
                  textY = d.projected.y
                }
                return d.projected.y;
              })
              .text(function(d,i){ return i === 0 ? '' : d[0] });

          xAxisText.attr("transform","translate("+ (textX - 30) + "," + textY +")")

          xText.exit().remove();

          var zText = svg.selectAll('text.zText').data(data[4][0]);

          zText
              .enter()
              .append('text')
              .attr('class', '_3d zText')
              // .attr('dx', '.3em')
              .attr('dy', '.5em')
              .merge(zText)
              .each(function(d){
                  d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
              })
              .attr('x', function(d,i){
                if(i === data[4][0].length - 1) {
                  textX = d.projected.x
                }
                return d.projected.x;
              })
              .attr('y', function(d,i){
                if(i === data[4][0].length - 1) {
                  textY = d.projected.y
                }
                return d.projected.y;
              })
              .text(function(d,i){ return i === 0 ? '' : d[2] });

          zxisText.attr("transform","translate("+ textX + "," + (textY + 30) +")")

          zText.exit().remove();

          d3.selectAll('._3d').sort(d3._3d().sort);
    }
    	function init(){
        xGrid = [], scatter = [], xLine = [],yLine = [],zLine = []

        let xmin = Math.floor(d3.min(self.data[self.pcArr[0]]))
        let xmax = Math.ceil(d3.max(self.data[self.pcArr[0]]))
        let ymin = Math.floor(d3.min(self.data[self.pcArr[1]]))
        let ymax = Math.ceil(d3.max(self.data[self.pcArr[1]]))
        let zmin = Math.floor(d3.min(self.data[self.pcArr[2]]))
        let zmax = Math.ceil(d3.max(self.data[self.pcArr[2]]))

        // for(var z = zmin; z < zmax; z++){ // j:10
        //     for(var x = xmin; x < xmax; x++){
        //         xGrid.push([xmin, ymax, z]);
        //         xGrid.push([xmax, ymax, z]);
        //   }
        // }

        // xLine = [[xmin,ymax,zmin],[xmax,ymax,zmin]]
        // yLine = [[xmin,ymax,zmin],[xmin,ymin,zmin]]
        // zLine = [[xmin,ymax,zmin],[xmin,ymax,zmax]]

        xLine = [[-50,50,-50],[50,50,-50]]
        yLine = [[-50,50,-50],[-50,-50,-50]]
        zLine = [[-50,50,-50],[-50,50,50]]


        var data = [
            grid3d(xGrid),
            point3d(self.data.points),
            axisScale3d([yLine]),
            axisScale3d([xLine]),
            axisScale3d([zLine])
        ];
        processData(data, 200);
    }

      function dragStart(){
          mx = d3.event.x;
          my = d3.event.y;
      }

      function dragged(){
          mouseX = mouseX || 0;
          mouseY = mouseY || 0;
          beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
          alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);
          var data = [
              grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid),
              point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(self.data.points),
              axisScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
              axisScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([xLine]),
              axisScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([zLine]),
          ];
          processData(data, 0);
      }

      function dragEnd(){
          mouseX = d3.event.x - mx + mouseX;
          mouseY = d3.event.y - my + mouseY;
      }

      init();

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
