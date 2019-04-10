<template>
  <div id="container" v-loading="loading"  element-loading-text="请稍等，数据正在加载中..." element-loading-spinner="el-icon-loading" style="height:100%">
    <div class="svgbox">
      <h2>表达基因与UMI数目的对应分布</h2>
      <p>如果一个细胞中发生表达的基因数目较多，那么该细胞的UMI数目也会较大。因此，一般情况下，细胞内发生表达的基因数目与UMI数目呈正相关关系；如果呈负相关关系，提示单细胞转录组测序结果存在问题。另外，基于单细胞表达基因数目与UMI数目的对应分布，也便于对门（Gate）进行设定，过滤掉表达基因数目或UMI数目出现极端值的细胞。</p>
      <p>下两图分别展示了在<span v-for="item in sample">{{item.groupName}}&nbsp;</span>{{sample.length}}个样本组中，所有细胞基因与UMI数量的相关关系。其中，不同颜色的点分别表示样本组中的不同样本，图上方的数字表示基因与UMI数量之间的相关系数。</p>

      <div style="white-space: nowrap;">
        <div id="umiPre" style="display:inline-block">
          <el-select v-model="umiPreValue" @change="(() => {selectChange('umiPreCarousel', 'umiPreValue')})">
            <el-option
              v-for="(item, index) in sample"
              :key="item.groupName"
              :label="item.groupName"
              :value="index">
            </el-option>
          </el-select>
          <el-carousel ref="umiPreCarousel" style="width:800px" height="650px" arrow="always" indicator-position="outside" trigger="click" :autoplay="false" @change="((current, pre) => {change(current, pre, 'umiPre', 'nUMI')})">
            <el-carousel-item v-for="(item, index) in sample" :key="index + 'umiPre'">
              <div :id="item.groupName + 'umiPre'"></div>
            </el-carousel-item>
          </el-carousel>
        </div>
        <div id="umiNext" style="display:inline-block">
          <el-select v-model="umiNextValue" @change="(() => {selectChange('umiNextCarousel', 'umiNextValue')})">
            <el-option
              v-for="(item, index) in sample"
              :key="item.groupName"
              :label="item.groupName"
              :value="index">
            </el-option>
          </el-select>
          <el-carousel :initial-index="1"	ref="umiNextCarousel" style="width:800px" height="650px" arrow="always" indicator-position="outside" trigger="click" :autoplay="false" @change="((current, pre) => {change(current, pre, 'umiNext', 'nUMI')})">
            <el-carousel-item v-for="(item, index) in sample" :key="index + 'umiNext'">
              <div :id="item.groupName + 'umiNext'"></div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>

      <!-- <div class="svgContainer" v-for="item in sample">

        <h3>{{item.groupName}}样本组基因与UMI数量相关关系</h3>

        <el-button type="primary" size="small" icon="el-icon-picture" @click="$store.commit('d3saveSVG', ['nGene&nUMI', item.groupName + 'scatterContainer'])">{{$t('button.svg')}}</el-button>
        <i class="el-icon-question cursor-pointer" style="font-size:16px" @click="$store.state.svgDescribeShow = true"></i>

        <div :id="item.groupName + 'scatterContainer'"></div>

      </div> -->
    </div>

    <div class="clear"></div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  data() {
    return {
      sample: [],
      data: [],
      umiPreValue: '',
      umiNextValue: '',
      loading: false
    }
  },
  components: {
  },
  mounted() {
    document.body.style.overflow = 'hidden'
    this.initData()
  },
  destroyed() {
    document.body.style['overflow-y']= 'scroll'
  },
  methods: {
    initData () {
      this.loading = true
      this.axios.get('/singel_cell/server/get_umi_meta_data?p='+ this.$store.state.projectId +'&username=' + this.$store.state.username  + '&groupName=').then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          this.sample = res.data.groupName
        } else {
          this.$message.error(res.data.message)
        }
        this.loading = false
      }).catch(() => {
        this.$message.error('请求出错！')
        this.loading = false
      })
    },
    selectChange (carousel, option) {
      this.$refs[carousel].setActiveItem(this[option])
    },
    change (current, pre, boxID, svgType) {
      this[boxID + 'Value'] = current // select option 当前的值
      let currentSample = this.sample[current]
      this.$nextTick(() => {  //  DOM 都加载后 调用画图
        let hassvg = d3.selectAll('#'+ currentSample.groupName + boxID + svgType + 'svg')._groups[0].length
        if (hassvg) { // 如果该图之前存在就不再重新渲染了
          return
        }
        if (!this.data[currentSample.groupName]){ // 如果 this.data 不存在这个样本的数据就发送请求
          this.getNewData(currentSample.groupName,currentSample.sampleList, boxID, svgType)
        } else {
          this.initScatterPlot(currentSample.groupName,currentSample.sampleList, boxID, svgType)
        }
      })
    },
    getNewData (sampleName, sampleList, boxID, svgType) {
      // this.loading = true
      this.axios.get('/singel_cell/server/get_umi_meta_data?p='+ this.$store.state.projectId +'&username=' + this.$store.state.username + '&groupName=' + sampleName).then((res) => {
        if (res.data.message_type === 'success') {
          this.data = res.data
          this.sample = res.data.groupName
          this.initScatterPlot(sampleName, sampleList, boxID, svgType)
        } else {
          this.$message.error(res.data.message)
        }
        // this.loading = false
      }).catch(() => {
        this.$message.error('请求出错！')
        // this.loading = false
      })
    },
    initScatterPlot (sampleName, sampleList, boxID, svgType) {
      let self = this
      var width = 800, height = 500;
      let scattersvg = d3.select("#" + sampleName + boxID).append("svg").attr("width", width).attr("height", height).attr("id", sampleName + boxID + svgType + 'svg')
      var data = this.data[sampleName]
      var padding = {top: 20, right: 80, bottom: 50, left: 55}
      var xScale = d3.scaleLinear().domain([d3.min(data.map(item => item.nUMI))/1.2, d3.max(data.map(item => item.nUMI))*1.2]).range([0,width - padding.left - padding.right]).nice()
      var yScale = d3.scaleLinear().domain([d3.min(data.map(item => item.nGene))/1.2, d3.max(data.map(item => item.nGene))*1.2]).range([height - padding.top - padding.bottom,0]).nice()
      var xAxis = d3.axisBottom().scale(xScale)
      var yAxis = d3.axisLeft().scale(yScale)
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      let tooltipX = d3.select('#container')
      	.append('div')
        .attr("id", sampleName + "tooltipX")
      	.style('position', 'absolute')
        .style("background","black")
        .style('z-index', '10')
      	.style('color', '#fff')
        .style('visibility', 'hidden')
        .style('font-size', '12px')
      	.style('font-weight', 'bold')
      	.text('')
      let tooltipY = d3.select('#container')
      	.append('div')
        .attr("id",sampleName + "tooltipY")
      	.style('position', 'absolute')
        .style("background","black")
        .style('z-index', '10')
      	.style('color', '#fff')
        .style('visibility', 'hidden')
        .style('font-size', '12px')
      	.style('font-weight', 'bold')
      	.text('')
      let tooltipCircle = d3.select('#container')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('color', '#3497db')
        .style('visibility', 'hidden')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text('')
      let xLine = scattersvg
      	.append('line')
        .style('z-index', '10')
      	.style('color', '#3497db')
        .style('visibility', 'hidden')
        .attr("stroke","#999")
        .style("stroke-dasharray", "5")
      let yLine = scattersvg
      	.append('line')
        .style('z-index', '10')
      	.style('color', '#3497db')
        .style('visibility', 'hidden')
        .attr("stroke","#999")
        .style("stroke-dasharray", "5")

      var x = scattersvg.append("g").call(xAxis).attr("transform","translate("+ padding.left +"," + (height - padding.bottom) +")")
              .selectAll("text")
              .style("text-anchor", "start")
              .attr("transform", "rotate(45 -10 10)")
      var y = scattersvg.append("g").call(yAxis).attr("transform","translate("+ padding.left +"," + padding.top +")")

      // svg 被 rect 围住
      var rect = scattersvg.append("rect")
                    .attr("x",padding.left)
                    .attr("y",padding.top)
                    .attr("width", width - padding.left - padding.right)
                    .attr("height", height - padding.top - padding.bottom)
                    .attr("stroke", "black")
                    .attr("fill", 'none')

      var circle = scattersvg.selectAll("circle")
                      .data(data)
                      .enter()
                      .append("circle")
                      .attr("cx", (d) => padding.left + xScale(d["nUMI"]))
                      .attr("cy", (d) => padding.top + yScale(d["nGene"]))
                      .attr("r", 2.5)
                      .attr("fill", (d) => colorScale(d.sampleName))
                      .on('mouseover', function (d, i) {
                         tooltipCircle.style('visibility', 'visible').text(d['cellId'] +' ('+ d['nUMI'] + ', ' + d['nGene'] + ')').attr("transform", "translate("+ (padding.left + xScale(d[0]) + 10) +", " + (padding.top + yScale(d[1]) - 5) + ")")
                       })
                       .on('mousemove', function (d, i) {
                           //  兼容火狐
                          xLine.style("visibility", "visible")
                          yLine.style("visibility", "visible")
                          tooltipX.style("visibility", "visible")
                          tooltipY.style("visibility", "visible")

                          tooltipCircle.style('top', (d3.event.pageY-20)+'px').style('left',(d3.event.pageX+10)+'px')
                       })
                       .on('mouseout', function (d, i) {
                         return tooltipCircle.style('visibility', 'hidden')
                       })
      // 鼠标移动 x y 坐标轴对照线
      scattersvg.on('mousemove', function (d, i) {
                  let x = d3.mouse(this)[0]
                  let y = d3.mouse(this)[1]
                  // 鼠标仅在在图形区域移动触发事件 不含 padding
                  if (x > padding.left && x < width - padding.right && y > padding.top && y < height - padding.bottom) {
                     tooltipX.style('visibility', 'visible').text((xScale.invert(x - padding.left).toFixed(1)))
                     tooltipX.style('top', ((height - padding.bottom - y) + d3.event.pageY)+'px').style('left',(d3.event.pageX - (document.getElementById(sampleName + "tooltipX").clientWidth) / 2)+'px')

                     tooltipY.style('visibility', 'visible').text((yScale.invert(y - padding.top).toFixed(1)))
                     tooltipY.style('top', (d3.event.pageY - (document.getElementById(sampleName + "tooltipX").clientHeight) / 2)  +'px').style('left', (d3.event.pageX - x + padding.left - (document.getElementById(sampleName + "tooltipY").clientWidth))+'px')

                     xLine.style("visibility", "visible")
                     .attr('x1',padding.left)
                     .attr('y1',y)
                     .attr('x2',width - padding.right)
                     .attr('y2',y)

                     yLine.style("visibility", "visible")
                     .attr('x1',x)
                     .attr('y1',padding.top)
                     .attr('x2',x)
                     .attr('y2',height - padding.bottom)
                 } else {
                   // 当鼠标落在 padding 区域，则 x y 指示线隐藏
                   tooltipX.style('visibility', 'hidden')
                   tooltipY.style('visibility', 'hidden')

                   xLine.style('visibility', 'hidden')
                   yLine.style('visibility', 'hidden')
                 }
               })
               .on('mouseleave', function (d, i) {
                 tooltipX.style('visibility', 'hidden')
                 tooltipY.style('visibility', 'hidden')

                 xLine.style('visibility', 'hidden')
                 yLine.style('visibility', 'hidden')
               })
      // x 轴文字
      scattersvg.append("text")
        .attr("transform", "translate("+ width / 2 +", " + 15 + ")")
        .text("nUMI")
        .attr("font-size", "16px")

      // y 轴文字
      scattersvg.append("text")
        .text("nGene")
        .attr("transform", "translate("+ 15 +", " + (height / 2) + ") rotate(-90)")

      //  x y 坐标轴导致线条加粗
      scattersvg.selectAll(".domain")
          .style("display", "none");

      // legend
      let legendMargin = 20
      let legendGroup = scattersvg.append("g").attr("transform","translate("+ (width - padding.right + 10) +","+ (height / 3) +")")
      legendGroup.selectAll(".legend")
                .data(sampleList)
                .enter()
                .append("circle")
                .attr("cx", 5)
                .attr("cy", (d, i) => i * legendMargin)
                .attr("r", 5)
                .attr("fill", (d, i) => colorScale(d))
        legendGroup.selectAll(".text")
                  .data(sampleList)
                  .enter()
                  .append("text")
                  .attr("transform",(d,i) => "translate(15,"+ (i * legendMargin + 5) +")")
                  .text(d => d)
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
<style media="screen">
.el-carousel__arrow {
  top: 80% !important;
}
.el-carousel__arrow--right {
  right: 40% !important;
  /* background: #409eff !important; */
}
.el-carousel__arrow--left {
  left: 40% !important;
  /* background: #409eff !important; */
}
.el-carousel__indicators--outside button {
  display: none !important;
}
</style>
