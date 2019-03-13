<template>
  <el-container style="height:calc(100% - 62px);margin-top:2px">
    <el-aside v-show="$store.state.appmenuShow" style="width:300px;height:100%;border-right:1px solid #e6e6e6">
      <appLeftMenu></appLeftMenu>
    </el-aside>
    <el-main>
      <appImgMenuShowComp></appImgMenuShowComp>

      <div>
        <div class="margin-top-10">
          <div class="labelStyle">
            <label for="maxpval" class="label-font">{{$t('input.gene_id_list')}}</label>
            <!-- <i class="el-icon-question label-font cursor-pointer"></i> -->
          </div>
          <div class="inline-block">
            <el-radio v-model="radioName" label="geneId">{{$t('input.gene_id')}}</el-radio>
            <el-radio v-model="radioName" label="geneName">{{$t('input.gene_name')}}</el-radio>
          </div>
        </div>
        <div class="margin-top-10" v-show="radioName === 'geneName'">
          <div class="labelStyle"></div>
          <div class="inline-block" style="width:800px;">
            <el-input
              type="textarea"
              :rows="30"
              :placeholder="$t('input.split_method')"
              v-model="textareaGeneName">
            </el-input>
          </div>
        </div>
        <div class="margin-top-10" v-show="radioName === 'geneId'">
          <div class="labelStyle"></div>
          <div class="inline-block" style="width:800px;">
            <el-input
              type="textarea"
              :rows="30"
              :placeholder="$t('input.split_method')"
              v-model="textareaGeneId">
            </el-input>
          </div>
          <!-- <el-button type="text">(example)</el-button> -->
        </div>
        <div class="margin-top-10">
          <div class="labelStyle">
            <label class="label-font">{{$t('app.choose_sample')}}</label>
          </div>
          <div class="inline-block" style="width:300px;">
            <el-select class="input-style" v-model="specie" placeholder="请选择">
              <el-option :value="key" v-for="(item, key) in speciesArr" :key="key">{{key}}</el-option>
            </el-select>
          </div>
        </div>
        <div class="margin-top-10">
          <div class="labelStyle"></div>
          <div class="inline-block" style="width:300px;">
            <el-button type="primary" @click="submit()">{{$t('button.submit')}}</el-button>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import appLeftMenu from './app_leftMenu.vue'
import appImgMenuShowComp from './appImgMenuShowComp.vue'

export default {
  data () {
    return {
      textareaGeneName: '',
      textareaGeneId: '',
      radioName: 'geneId',
      loading: null,
      specie: 'Human (Homo sapiens)',
      speciesArr:{
        'Human (Homo sapiens)': 9606,
        'Soybean (Clycine max)': 3847,
      },
      timer: null,
    }
  },
  components: {
    appLeftMenu,
    appImgMenuShowComp
  },
  mounted () {
  },
  destroyed () {
    window.clearInterval(this.timer)
  },
  methods: {
    submit () {
      let geneList, infoType
      // 判断 基因ID列表 是否为空
      if (this.radioName === 'geneId') {
        if (!this.textareaGeneId.trim()) {
          this.$message.error('请输入基因 ID 列表!');
          return
        }
        geneList = this.textareaGeneId
        infoType = 1
      } else {
        if (!this.textareaGeneName.trim()) {
          this.$message.error('请输入基因 Name 列表!');
          return
        }
        geneList = this.textareaGeneName
        infoType = 2
      }
      sessionStorage.setItem('geneInfo', geneList)
      sessionStorage.setItem('infoType', infoType)
      // 正则 替换 逗号 空格 为 换行
      this.textareaGeneId = this.textareaGeneId.replace(/(\,|\s)+/g, '\n')
      this.loading = this.$loading({
        lock: true,
        text: '列表正在处理中...请稍等...可能需要等待1～2分钟左右的时间...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      let formData = new FormData()
      formData.append('username', this.$store.state.username)
      formData.append('geneList', geneList)
      formData.append('speciesId', this.speciesArr[this.specie])
      formData.append('infoType', infoType)
      this.$store.commit('setspecies', this.speciesArr[this.specie])
      this.axios.post('/server/enrich_do', formData).then((res) => {
        if (res.data.message_type === 'success') {
          this.getStatus()
        } else {
          this.$message.error(res.data.message)
          this.loading.close()
        }
      })
    },
    getStatus () {
      this.timer = setInterval(() => {
        this.axios.get('/server/enrich_do_status?username=' + this.$store.state.username).then((res) => {
          if (res.data.message_type === 'success') {
            this.loading.close()
            this.$message.success('富集分析已完成!')
            window.clearInterval(this.timer)
            this.$router.push('app_enrichment')
          }
        })
      }, 2000)
    },
  }
}
</script>

<style scoped="true">
.cursor-pointer {
  cursor: pointer;
}
.labelStyle {
  display:inline-block;
  width:150px;
  text-align:end;
}
.label-font {
  font-size: 16px;
}
.margin-top-10 {
  margin-top: 10px;
}
.inline-block {
  display: inline-block;
}
.vertical-align-top {
  vertical-align: top;
}
.span-font {
  font-size: 12px;
  color: #54a0ff;
}
</style>
<style media="screen">
.color_scales {
  z-index: 9 !important;
}
</style>
