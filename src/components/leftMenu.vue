<template>
  <div>
    <el-menu v-show="isCollapse" style="padding: 0 10px;" :default-active="$store.state.leftMenuIndex" class="el-menu-vertical-demo">
        <el-menu-item index="0-0" @click="report">{{$t('leftMenu.report_home')}}</el-menu-item>
        <el-menu-item-group>
          <span slot="" class="title-style">{{$t('leftMenu.qc')}}</span>
          <el-menu-item index="1-0" @click="report_fastqc">{{$t('leftMenu.fastqc')}}</el-menu-item>
          <el-menu-item index="1-1" @click="report_mappingqc">{{$t('leftMenu.mappingqc')}}</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group>
          <span class="title-style">{{$t('leftMenu.trans')}}</span>
          <el-menu-item index="2-0" @click="report_new_trans">{{$t('leftMenu.new_trans')}}</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group>
          <span class="title-style">{{$t('leftMenu.gene_matrix')}}</span>
          <el-menu-item index="3-0" @click="report_expr_matrix">{{$t('leftMenu.expr_matrix')}}（TPM）</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group>
          <span class="title-style">{{$t('leftMenu.cluster_all')}}</span>
          <el-menu-item index="4-0" @click="plotCluster">{{$t('leftMenu.cluster')}}</el-menu-item>
          <el-menu-item index="4-1" @click="plotPCA">{{$t('leftMenu.pca')}}</el-menu-item>
          <!-- <a :href="'/projects/'+ $store.state.projectId +'/results/050.DESeq2/plotMA_deseq.pdf'" target="_blank"><el-menu-item index="4-2" >MA 图</el-menu-item></a> -->
          <a :href="'/projects/'+ this.$store.state.projectId +'/results/050.DESeq2/ALL.pairs.pdf'" target="_blank"><el-menu-item index="4-3">{{$t('leftMenu.paris')}}</el-menu-item></a>
        </el-menu-item-group>
        <el-menu-item-group>
          <span class="title-style">{{$t('leftMenu.deg')}}</span>
          <el-menu-item :index="'5-' + index + '-1'" @click="report_deg(item['_case'], item['_control'], index)" v-for="(item, index) in $store.state.info.experimentDesign.experiments" :key="index">{{item['_case']}} vs {{item['_control']}}</el-menu-item>
          <!-- <el-menu-item-group v-for="(item, index) in $store.state.info.experimentDesign.experiments" :key="index"> -->
            <!-- <span slot="" style="font-size:14px">比较：{{item['_case']}} vs {{item['_control']}}</span> -->
            <!-- <el-menu-item :index="'5-' + index + '-1'" @click="report_deg(item['_case'], item['_control'], index)">差异表达基因</el-menu-item>
            <el-menu-item :index="'5-' + index" @click="report_volcano_plot(item['_case'], item['_control'], index)">火山图</el-menu-item>
            <el-menu-item :index="'5-' + index + '-2'" @click="heatmap(item['_case'], item['_control'], index)">Heat Map</el-menu-item>
            <el-menu-item :index="'5-' + index + '-3'" @click="ppi(item['_case'], item['_control'], index)">蛋白相互作用图</el-menu-item>
            <el-menu-item :index="'5-' + index + '-4'" @click="enrichment_analysis(item['_case'], item['_control'], index)">富集分析</el-menu-item> -->
          <!-- </el-menu-item-group> -->
        </el-menu-item-group>
        <el-menu-item-group>
          <span class="title-style">{{$t('leftMenu.deg_chart')}}</span>
          <el-menu-item index="5-1" @click="keggbubble">{{$t('leftMenu.kegg')}}</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group>
          <span class="title-style">{{$t('leftMenu.asprofile')}}</span>
          <el-menu-item index="6-1" @click="ASprofile">{{$t('leftMenu.asprofile_number')}}</el-menu-item>
          <el-menu-item index="6-2" @click="ASprofilePercent">{{$t('leftMenu.asprofile_percent')}}</el-menu-item>
        </el-menu-item-group>
    </el-menu>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isCollapse: true,
    }
  },
  components: {
  },
  mounted () {
    switch (this.$route.path) {
      case '/report':
        this.$store.commit('setleftMenuIndex', '0-0')
        break;
    }
  },
  methods: {
    report () {
      this.$store.commit('setleftMenuIndex', '0-0')
      this.$router.push({'name': 'report'})
    },
    report_deg (_case, _control, index) {
      this.$store.commit('set_case', _case)
      this.$store.commit('set_control', _control)
      this.$store.commit('setleftMenuIndex', '5-' + index + '-1')
      this.$router.push({'name': 'report_deg', query: {'_case': _case, '_control': _control}})
    },
    report_fastqc () {
      this.$store.commit('setleftMenuIndex', '1-0')
      this.$router.push({'name': 'report_fastqc'})
    },
    report_mappingqc () {
      this.$store.commit('setleftMenuIndex', '1-1')
      this.$router.push({'name': 'report_mappingqc'})
    },
    report_new_trans () {
      this.$store.commit('setleftMenuIndex', '2-0')
      this.$router.push({'name': 'report_new_trans'})
    },
    report_expr_matrix () {
      this.$store.commit('setleftMenuIndex', '3-0')
      this.$router.push({'name': 'report_expr_matrix'})
    },
    report_volcano_plot (_case, _control, index) {
      this.$store.commit('setleftMenuIndex', '5-' + index)
      this.$store.commit('set_case', _case)
      this.$store.commit('set_control', _control)
      this.$router.push({'name': 'report_volcano_plot', query: {'_case': _case, '_control': _control}})
    },
    plotCluster () {
      this.$store.commit('setleftMenuIndex', '4-0')
      this.$router.push({'name': 'plotCluster'})
    },
    plot_cluster () {
      this.$store.commit('setleftMenuIndex', '4-0')
    },
    plotPCA () {
      this.$store.commit('setleftMenuIndex', '4-1')
      this.$router.push({'name': 'plotPCA'})
    },
    plot_ma () {
      this.$store.commit('setleftMenuIndex', '4-2')
    },
    plot_correlation () {
      this.$store.commit('setleftMenuIndex', '4-3')
    },
    keggbubble () {
      this.$store.commit('setleftMenuIndex', '5-1')
      this.$router.push({'name': 'keggbubble'})
    },
    ASprofile () {
      this.$store.commit('setleftMenuIndex', '6-1')
      this.$router.push({'name': 'ASprofile'})
    },
    ASprofilePercent () {
      this.$store.commit('setleftMenuIndex', '6-2')
      this.$router.push({'name': 'ASprofilePercent'})
    },
    heatmap (_case, _control, index) {
      this.$store.commit('setleftMenuIndex', '5-' + index + '-2')
      this.$store.commit('set_case', _case)
      this.$store.commit('set_control', _control)
      let formData = new FormData()
      formData.append('username', this.$store.state.username)
      formData.append('p', this.$store.state.projectId)
      formData.append('caseSample', _case)
      formData.append('controlSample', _control)
      this.axios.post('/server/heatmap.app.for_report', formData).then((res) => {
        this.$store.commit('setheatmapJson', res.data.message)
        this.$router.push({'name': 'heatmap', query: {'_case': _case, '_control': _control}})
      })
    },
    ppi (_case, _control, index) {
      this.$store.commit('setleftMenuIndex', '5-' + index + '-3')
      this.$store.commit('set_case', _case)
      this.$store.commit('set_control', _control)
      let formData = new FormData()
      formData.append('username', this.$store.state.username)
      formData.append('p', this.$store.state.projectId)
      formData.append('caseSample', _case)
      formData.append('controlSample', _control)
      this.axios.post('/server/ppi_chord_plot.app.for_report', formData).then((res) => {
        if (res.data.message_type === 'warn') {
          this.$message.error(res.data.message)
        } else {
          this.$store.commit('setppiJson', res.data.message)
          this.$router.push({'name': 'ppi_chord_plot', query: {'_case': _case, '_control': _control}})
        }
      })
    },
    enrichment_analysis (_case, _control, index) {
      this.$store.commit('setleftMenuIndex', '5-' + index + '-4')
      this.$store.commit('set_case', _case)
      this.$store.commit('set_control', _control)
      this.$router.push({'name': 'enrichment_analysis', query: {'_case': _case, '_control': _control}})
    },
  }
}
</script>

<style scoped="true">
.cursor-pointer {
  cursor: pointer;
}
li {
  list-style: none;
}
a:hover, a:visited, a:link, a:active {
  text-decoration: none;
  out-line: none;
}
.title-style {
  font-size: 16px;
  font-weight: bold;
}
.el-menu-item, .el-submenu__title {
  height: 40px !important;
  line-height: 40px !important;
}
.el-menu {
  border: none !important;
}
</style>
