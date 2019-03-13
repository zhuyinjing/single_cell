<template>
  <el-container style="height:calc(100% - 62px);margin-top:2px">
    <el-aside v-show="$store.state.appmenuShow" style="width:300px;height:100%;border-right:1px solid #e6e6e6">
      <appLeftMenu></appLeftMenu>
    </el-aside>
    <el-main>
      <appImgMenuShowComp></appImgMenuShowComp>

      <div class="">
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <el-tab-pane label="KEGG" name="KEGG">
            <table cellpadding="0" width="100%" cellspacing="0" border="0" class="display" id="example0">
              <thead>
                <tr>
                  <td></td>
                  <td>ID</td>
                  <td>Term</td>
                  <td>GeneRatio</td>
                  <td>BgRatio</td>
                  <td>log2foldE</td>
                  <td>pvalue</td>
                  <td>p.adjust</td>
                  <td>qvalue</td>
                  <td>geneID</td>
                  <td>Count</td>
                </tr>
              </thead>
            </table>
          </el-tab-pane>
          <el-tab-pane :label="$t('enrichment_analysis.trans')" :name="$t('enrichment_analysis.trans')">
            <table cellpadding="0" width="100%" cellspacing="0" border="0" class="display" id="example1">
              <thead>
                <tr>
                  <td></td>
                  <td>ID</td>
                  <td>Biosample_term_name</td>
                  <td>Biosample_type</td>
                  <td>Biosample_life_stage</td>
                  <td>Biosample_sex</td>
                  <td>Biosample_age</td>
                  <td>Experiment_target</td>
                  <td>GeneRatio</td>
                  <td>BgRatio</td>
                  <td>log2foldE</td>
                  <td>pvalue</td>
                  <td>p.adjust</td>
                  <td>qvalue</td>
                  <td>geneID</td>
                  <td>Count</td>
                </tr>
              </thead>
            </table>
          </el-tab-pane>
          <el-tab-pane label="GO（level3）" name="level3.GO">
            <table cellpadding="0" width="100%" cellspacing="0" border="0" class="display" id="example2">
              <thead>
                <tr>
                  <td></td>
                  <td>ID</td>
                  <td>Term</td>
                  <td>Ontology</td>
                  <td>GeneRatio</td>
                  <td>BgRatio</td>
                  <td>log2foldE</td>
                  <td>pvalue</td>
                  <td>p.adjust</td>
                  <td>qvalue</td>
                  <td>geneID</td>
                  <td>Count</td>
                </tr>
              </thead>
            </table>
          </el-tab-pane>
          <el-tab-pane label="GO（level4）" name="level4.GO">
            <table cellpadding="0" width="100%" cellspacing="0" border="0" class="display" id="example3">
              <thead>
                <tr>
                  <td></td>
                  <td>ID</td>
                  <td>Term</td>
                  <td>Ontology</td>
                  <td>GeneRatio</td>
                  <td>BgRatio</td>
                  <td>log2foldE</td>
                  <td>pvalue</td>
                  <td>p.adjust</td>
                  <td>qvalue</td>
                  <td>geneID</td>
                  <td>Count</td>
                </tr>
              </thead>
            </table>
          </el-tab-pane>
          <el-tab-pane label="GO（level5）" name="level5.GO">
            <table cellpadding="0" width="100%" cellspacing="0" border="0" class="display" id="example4">
              <thead>
                <tr>
                  <td></td>
                  <td>ID</td>
                  <td>Term</td>
                  <td>Ontology</td>
                  <td>GeneRatio</td>
                  <td>BgRatio</td>
                  <td>log2foldE</td>
                  <td>pvalue</td>
                  <td>p.adjust</td>
                  <td>qvalue</td>
                  <td>geneID</td>
                  <td>Count</td>
                </tr>
              </thead>
            </table>
          </el-tab-pane>
          <el-tab-pane label="输入基因列表" name="输入基因列表">
            <appTableComp></appTableComp>
          </el-tab-pane>
        </el-tabs>

      </div>

    </el-main>
  </el-container>

</template>

<script>
import appLeftMenu from './app_leftMenu.vue'
import appImgMenuShowComp from './appImgMenuShowComp.vue'
import appTableComp from './app_tableComp.vue'

export default {
  data () {
    return {
      activeName: 'KEGG',
      head0: [],
      tbval0: [],
      tbval1: [],
      tbval2: [],
      tbval3: [],
      tbval4: [],
      TFvalue: null,
    }
  },
  components: {
    appLeftMenu,
    appImgMenuShowComp,
    appTableComp,
  },
  created () {
  },
  mounted () {
    this.handleClick2()
  },
  methods: {
    async getGeneName (list) {
      let geneName = ''
      let formData = new FormData()
      formData.append('geneInfoList', list)
      formData.append('speciesId', this.$store.state.species)
      formData.append('infoType', 1)
      await this.axios.post('/server/transform_gene_id_name', formData).then((res) => {
        geneName = res.data.join(' ')
      })
      return '<div class="detailDiv">' + geneName + '</div>'
    },
    handleClick(tab, event) {
      if (tab.label === '转录因子') {
        if (!this.TFvalue) {
          this.$message({
            message: '由于网络传输速度较慢，数据正在加载，请稍等...',
            type: 'warning',
          });
        }
      }
    },
    handleClick2() {
      let self = this
      this.axios.get('/server/app_enrich?username=' + this.$store.state.username + '&speciesId=' + this.$store.state.species + '&type=' + 'KEGG').then((res) => {
        if (res.data.message_type === 'success') {
          $('#example0').dataTable().fnDestroy()
          var table = $('#example0').DataTable({
            "aoColumnDefs": [{
                "bSortable": false,
                "aTargets": [0]
              },
              {
                "aTargets": [5],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "aTargets": [6],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "aTargets": [7],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "bSortable": false,
                "visible": false,
                "aTargets": [9]
              }
            ],
            "aLengthMenu": [
              [25, 50, 100, -1],
              ['每页25条', '每页50条', '每页100条', "显示所有数据"] // change per page values here
            ],
            'dom': 'Bfrtip',
            'buttons': [{
                extend: 'csv',
                text: '导出 csv',
              },
              {
                extend: 'excel',
                text: '导出 excel',
              }
            ],
            "iDisplayLength": 25,
            "aaData": res.data.message.slice(1),
            "aoColumns": [{
                "mData": null
              },
              {
                "mData": 0
              },
              {
                "mData": 1
              },
              {
                "mData": 2
              },
              {
                "mData": 3
              },
              {
                "mData": 4
              },
              {
                "mData": 5
              },
              {
                "mData": 6
              },
              {
                "mData": 7
              },
              {
                "mData": 8
              },
              {
                "mData": 9
              },
            ],
            "oLanguage": {
              "oAria": {
                "sSortAscending": " - click/return to sort ascending",
                "sSortDescending": " - click/return to sort descending"
              },
              // "sLengthMenu": "每页显示 _MENU_ 条记录",
              "sZeroRecords": "对不起，查询不到任何相关数据",
              "sEmptyTable": "未有相关数据",
              "sLoadingRecords": "正在加载数据-请等待...",
              // "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录。",
              // "sInfoEmpty": "当前显示0到0条，共0条记录",
              // "sInfoFiltered": "（数据库中共为 _MAX_ 条记录）",
              "sProcessing": "<img src='${pageContext.request.contextPath }/image/loading.gif'/> 正在加载数据...",
              // "sSearch": "模糊查询：",
              "sUrl": "", //多语言配置文件，可将oLanguage的设置放在一个txt文件中，例：Javascript/datatable/dtCH.txt
              // "oPaginate": {
              //     "sFirst": "第一页",
              //     "sPrevious": " 上一页 ",
              //     "sNext": " 下一页 ",
              //     "sLast": " 最后一页 "
              // }
            }, //多语言配置
            "fnCreatedRow": function(nRow, aData, iDataIndex) {
              $('td:eq(0)', nRow).addClass('details-control').html(''); //为第一个单元格增加序号
            },
          });
          // 点击 pathway 触发的事件
          $('#example0 tbody').on('click', 'tr td:nth-child(2)', function(e) {
            // var name = $(this).text();
          });
          var detailRows = [];
          $('#example0 tbody').off('click', 'tr td.details-control');
          $('#example0 tbody').on('click', 'tr td.details-control', function() {
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var idx = $.inArray(tr.attr('id'), detailRows);

            if (row.child.isShown()) {
              tr.removeClass('details');
              row.child.hide();
              // Remove from the 'open' array
              detailRows.splice(idx, 1);
            } else {
              tr.addClass('details');
              self.getGeneName(row.data()[8].split('/')).then( res => row.child(res).show() )
              // Add to the 'open' array
              if (idx === -1) {
                detailRows.push(tr.attr('id'));
              }
            }
          })
        }
      })
      this.axios.get('/server/app_enrich?username=' + this.$store.state.username + '&speciesId=' + this.$store.state.species + '&type=' + 'TF').then((res) => {
        if (res.data.message_type === 'success') {
          this.TFvalue = res.data.message
          $('#example1').dataTable().fnDestroy()
          var table = $('#example1').DataTable({
            "aoColumnDefs": [{
                "bSortable": false,
                "aTargets": [0]
              },
              {
                "aTargets": [10],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "aTargets": [11],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "aTargets": [12],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "bSortable": false,
                "visible": false,
                "aTargets": [14]
              }
            ],
            "aLengthMenu": [
              [25, 50, 100, -1],
              ['每页25条', '每页50条', '每页100条', "显示所有数据"] // change per page values here
            ],
            'dom': 'Bfrtip',
            'buttons': [{
                extend: 'csv',
                text: '导出 csv',
              },
              {
                extend: 'excel',
                text: '导出 excel',
              }
            ],
            "iDisplayLength": 25,
            "aaData": res.data.message.slice(1),
            "aoColumns": [{
                "mData": null
              },
              {
                "mData": 0
              },
              {
                "mData": 1
              },
              {
                "mData": 2
              },
              {
                "mData": 3
              },
              {
                "mData": 4
              },
              {
                "mData": 5
              },
              {
                "mData": 6
              },
              {
                "mData": 7
              },
              {
                "mData": 8
              },
              {
                "mData": 9
              },
              {
                "mData": 10
              },
              {
                "mData": 11
              },
              {
                "mData": 12
              },
              {
                "mData": 13
              },
              {
                "mData": 14
              },
            ],
            "oLanguage": {
              "oAria": {
                "sSortAscending": " - click/return to sort ascending",
                "sSortDescending": " - click/return to sort descending"
              },
              "sZeroRecords": "对不起，查询不到任何相关数据",
              "sEmptyTable": "未有相关数据",
              "sLoadingRecords": "正在加载数据-请等待...",
              "sProcessing": "<img src='${pageContext.request.contextPath }/image/loading.gif'/> 正在加载数据...",
              "sUrl": "", //多语言配置文件，可将oLanguage的设置放在一个txt文件中，例：Javascript/datatable/dtCH.txt
            }, //多语言配置
            "fnCreatedRow": function(nRow, aData, iDataIndex) {
              $('td:eq(0)', nRow).addClass('details-control').html(''); //为第一个单元格增加序号
            },
          });

          var detailRows = [];
          $('#example1 tbody').off('click', 'tr td.details-control');
          $('#example1 tbody').on('click', 'tr td.details-control', function() {
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var idx = $.inArray(tr.attr('id'), detailRows);

            if (row.child.isShown()) {
              tr.removeClass('details');
              row.child.hide();
              // Remove from the 'open' array
              detailRows.splice(idx, 1);
            } else {
              tr.addClass('details');
              self.getGeneName(row.data()[13].split('/')).then( res => row.child(res).show() )
              // Add to the 'open' array
              if (idx === -1) {
                detailRows.push(tr.attr('id'));
              }
            }
          })
        }
      })
      this.axios.get('/server/app_enrich?username=' + this.$store.state.username + '&speciesId=' + this.$store.state.species + '&type=' + 'level_3.GO').then((res) => {
        if (res.data.message_type === 'success') {
          $('#example2').dataTable().fnDestroy()
          var table = $('#example2').DataTable({
            "aoColumnDefs": [{
                "bSortable": false,
                "aTargets": [0]
              },
              {
                "aTargets": [6],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "aTargets": [7],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "aTargets": [8],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "bSortable": false,
                "visible": false,
                "aTargets": [10]
              }
            ],
            "aLengthMenu": [
              [25, 50, 100, -1],
              ['每页25条', '每页50条', '每页100条', "显示所有数据"] // change per page values here
            ],
            'dom': 'Bfrtip',
            'buttons': [{
                extend: 'csv',
                text: '导出 csv',
              },
              {
                extend: 'excel',
                text: '导出 excel',
              }
            ],
            "iDisplayLength": 25,
            "aaData": res.data.message.slice(1),
            "aoColumns": [{
                "mData": null
              },
              {
                "mData": 0
              },
              {
                "mData": 1
              },
              {
                "mData": 2
              },
              {
                "mData": 3
              },
              {
                "mData": 4
              },
              {
                "mData": 5
              },
              {
                "mData": 6
              },
              {
                "mData": 7
              },
              {
                "mData": 8
              },
              {
                "mData": 9
              },
              {
                "mData": 10
              },
            ],
            "oLanguage": {
              "oAria": {
                "sSortAscending": " - click/return to sort ascending",
                "sSortDescending": " - click/return to sort descending"
              },
              // "sLengthMenu": "每页显示 _MENU_ 条记录",
              "sZeroRecords": "对不起，查询不到任何相关数据",
              "sEmptyTable": "未有相关数据",
              "sLoadingRecords": "正在加载数据-请等待...",
              "sProcessing": "<img src='${pageContext.request.contextPath }/image/loading.gif'/> 正在加载数据...",
              "sUrl": "", //多语言配置文件，可将oLanguage的设置放在一个txt文件中，例：Javascript/datatable/dtCH.txt
            }, //多语言配置
            "fnCreatedRow": function(nRow, aData, iDataIndex) {
              $('td:eq(0)', nRow).addClass('details-control').html(''); //为第一个单元格增加序号
            },
          });

          var detailRows = [];
          $('#example2 tbody').off('click', 'tr td.details-control');
          $('#example2 tbody').on('click', 'tr td.details-control', function() {
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var idx = $.inArray(tr.attr('id'), detailRows);

            if (row.child.isShown()) {
              tr.removeClass('details');
              row.child.hide();
              // Remove from the 'open' array
              detailRows.splice(idx, 1);
            } else {
              tr.addClass('details');
              self.getGeneName(row.data()[9].split('/')).then( res => row.child(res).show() )
              // Add to the 'open' array
              if (idx === -1) {
                detailRows.push(tr.attr('id'));
              }
            }
          })
        }
      })
      this.axios.get('/server/app_enrich?username=' + this.$store.state.username + '&speciesId=' + this.$store.state.species + '&type=' + 'level_4.GO').then((res) => {
        if (res.data.message_type === 'success') {
          $('#example3').dataTable().fnDestroy()
          var table = $('#example3').DataTable({
            "aoColumnDefs": [{
                "bSortable": false,
                "aTargets": [0]
              },
              {
                "aTargets": [6],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "aTargets": [7],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "aTargets": [8],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "bSortable": false,
                "visible": false,
                "aTargets": [10]
              }
            ],
            "aLengthMenu": [
              [25, 50, 100, -1],
              ['每页25条', '每页50条', '每页100条', "显示所有数据"] // change per page values here
            ],
            'dom': 'Bfrtip',
            'buttons': [{
                extend: 'csv',
                text: '导出 csv',
              },
              {
                extend: 'excel',
                text: '导出 excel',
              }
            ],
            "iDisplayLength": 25,
            "aaData": res.data.message.slice(1),
            "aoColumns": [{
                "mData": null
              },
              {
                "mData": 0
              },
              {
                "mData": 1
              },
              {
                "mData": 2
              },
              {
                "mData": 3
              },
              {
                "mData": 4
              },
              {
                "mData": 5
              },
              {
                "mData": 6
              },
              {
                "mData": 7
              },
              {
                "mData": 8
              },
              {
                "mData": 9
              },
              {
                "mData": 10
              },
            ],
            "oLanguage": {
              "oAria": {
                "sSortAscending": " - click/return to sort ascending",
                "sSortDescending": " - click/return to sort descending"
              },
              "sZeroRecords": "对不起，查询不到任何相关数据",
              "sEmptyTable": "未有相关数据",
              "sLoadingRecords": "正在加载数据-请等待...",
              "sProcessing": "<img src='${pageContext.request.contextPath }/image/loading.gif'/> 正在加载数据...",
              "sUrl": "", //多语言配置文件，可将oLanguage的设置放在一个txt文件中，例：Javascript/datatable/dtCH.txt
            }, //多语言配置
            "fnCreatedRow": function(nRow, aData, iDataIndex) {
              $('td:eq(0)', nRow).addClass('details-control').html(''); //为第一个单元格增加序号
            },
          });

          var detailRows = [];
          $('#example3 tbody').off('click', 'tr td.details-control');
          $('#example3 tbody').on('click', 'tr td.details-control', function() {
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var idx = $.inArray(tr.attr('id'), detailRows);

            if (row.child.isShown()) {
              tr.removeClass('details');
              row.child.hide();
              // Remove from the 'open' array
              detailRows.splice(idx, 1);
            } else {
              tr.addClass('details');
              self.getGeneName(row.data()[9].split('/')).then( res => row.child(res).show() )
              // Add to the 'open' array
              if (idx === -1) {
                detailRows.push(tr.attr('id'));
              }
            }
          })
        }
      })
      this.axios.get('/server/app_enrich?username=' + this.$store.state.username + '&speciesId=' + this.$store.state.species + '&type=' + 'level_5.GO').then((res) => {
        if (res.data.message_type === 'success') {
          $('#example4').dataTable().fnDestroy()
          var table = $('#example4').DataTable({
            "aoColumnDefs": [{
                "bSortable": false,
                "aTargets": [0]
              },
              {
                "aTargets": [6],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "aTargets": [7],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "aTargets": [8],
                "mRender": function(data) {
                  return Number(data).toFixed(3)
                }
              },
              {
                "bSortable": false,
                "visible": false,
                "aTargets": [10]
              }
            ],
            "aLengthMenu": [
              [25, 50, 100, -1],
              ['每页25条', '每页50条', '每页100条', "显示所有数据"] // change per page values here
            ],
            'dom': 'Bfrtip',
            'buttons': [{
                extend: 'csv',
                text: '导出 csv',
              },
              {
                extend: 'excel',
                text: '导出 excel',
              }
            ],
            "iDisplayLength": 25,
            "aaData": res.data.message.slice(1),
            "aoColumns": [{
                "mData": null
              },
              {
                "mData": 0
              },
              {
                "mData": 1
              },
              {
                "mData": 2
              },
              {
                "mData": 3
              },
              {
                "mData": 4
              },
              {
                "mData": 5
              },
              {
                "mData": 6
              },
              {
                "mData": 7
              },
              {
                "mData": 8
              },
              {
                "mData": 9
              },
              {
                "mData": 10
              },
            ],
            "oLanguage": {
              "oAria": {
                "sSortAscending": " - click/return to sort ascending",
                "sSortDescending": " - click/return to sort descending"
              },
              "sZeroRecords": "对不起，查询不到任何相关数据",
              "sEmptyTable": "未有相关数据",
              "sLoadingRecords": "正在加载数据-请等待...",
              "sProcessing": "<img src='${pageContext.request.contextPath }/image/loading.gif'/> 正在加载数据...",
              "sUrl": "", //多语言配置文件，可将oLanguage的设置放在一个txt文件中，例：Javascript/datatable/dtCH.txt
            }, //多语言配置
            "fnCreatedRow": function(nRow, aData, iDataIndex) {
              $('td:eq(0)', nRow).addClass('details-control').html(''); //为第一个单元格增加序号
            },
          });

          var detailRows = [];
          $('#example4 tbody').off('click', 'tr td.details-control');
          $('#example4 tbody').on('click', 'tr td.details-control', function() {
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var idx = $.inArray(tr.attr('id'), detailRows);

            if (row.child.isShown()) {
              tr.removeClass('details');
              row.child.hide();
              // Remove from the 'open' array
              detailRows.splice(idx, 1);
            } else {
              tr.addClass('details');
              self.getGeneName(row.data()[9].split('/')).then( res => row.child(res).show() )
              // Add to the 'open' array
              if (idx === -1) {
                detailRows.push(tr.attr('id'));
              }
            }
          })
        }
      })
    },
  }
}
</script>

<style scoped="true">
.margin-top-200 {
  margin-top: 200px;
}
.labelStyle {
  display:inline-block;
  width:200px;
  text-align:end;
}
.filterbtn {
  margin-left:240px;
  margin-top:-100px;
}
.label-font {
  font-size: 14px;
}
.input-style{
  margin-right: 20px;
  margin-top: 10px;
}
</style>
<style media="screen">
.color_scales {
  z-index: 9 !important;
}
.el-tabs__content {
  overflow: auto;
}

td.details-control {
  background: url('../assets/img/details_open.png') no-repeat center center;
  cursor: pointer;
}

tr.details td.details-control {
  background: url('../assets/img/details_close.png') no-repeat center center;
}

.font-overflow {
  word-break: break-all;
  word-wrap: break-word;
}

#example0_wrapper,
#example4_wrapper,
#example1_wrapper,
#example2_wrapper,
#example3_wrapper,
#example4_wrapper {
  overflow: auto !important;
}
</style>
