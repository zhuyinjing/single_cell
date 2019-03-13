<template>
<el-container style="height:calc(100% - 62px);margin-top:2px">
  <el-aside v-show="$store.state.menuShow" width="350px;" style="width:300px;height:100%;border-right:1px solid #e6e6e6">
    <leftMenu style="margin-top:5px"></leftMenu>
  </el-aside>
  <el-main>
    <imgMenuShowComp></imgMenuShowComp>

    <degComp></degComp>

    <div class="">
      <h4>Choose Databases:</h4>
      <el-row>
        <el-col :span="8">
          <el-checkbox-group v-model="selected" @change="search()">
            <el-row>
              <el-col :span="24">
                <h4>Pathway</h4>
              </el-col>
              <el-col :span="24">
                <el-checkbox label="KEGG PATHWAY"></el-checkbox>
              </el-col>
              <el-col :span="24">
                <el-checkbox label="Reactome"></el-checkbox>
              </el-col>
              <el-col :span="24">
                <el-checkbox label="BioCyc"></el-checkbox>
              </el-col>
              <el-col :span="24">
                <el-checkbox label="PANTHER"></el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-col>
        <el-col :span="8">
          <el-col :span="24">
            <h4>Disease</h4>
          </el-col>
          <el-checkbox-group v-model="selected" @change="search()">
            <el-row>
              <el-col :span="24">
                <el-checkbox label="OMIM"></el-checkbox>
              </el-col>
              <el-col :span="24">
                <el-checkbox label="KEGG DISEASE"></el-checkbox>
              </el-col>
              <el-col :span="24">
                <el-checkbox label="NHGRI GWAS Catalog"></el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-col>
        <el-col :span="8">
          <el-checkbox-group v-model="selected" @change="search()">
            <el-row>
              <el-col :span="24">
                <h4>GO</h4>
              </el-col>
              <el-col :span="24">
                <el-checkbox label="Gene Ontology"></el-checkbox>
              </el-col>
              <el-col :span="24">
                <el-checkbox label="Gene Ontology Slim"></el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-col>
      </el-row>
      <br>

      <table id="patients" cellspacing="0" width="100%" class="display table table-striped table-bordered">
          <thead>
            <tr>
              <th></th>
              <th>term</th>
              <th>database</th>
              <th>entryId</th>
              <th>inputNumber</th>
              <th>backgroundNumber</th>
              <th>pValue</th>
              <th>correctedPValue</th>
              <th>inputGenes</th>
            </tr>
          </thead>
      </table>
    </div>

  </el-main>
</el-container>
</template>

<script>
import leftMenu from './leftMenu.vue'
import degComp from './degComp.vue'
import imgMenuShowComp from './imgMenuShowComp.vue'

export default {
  data() {
    return {
      table: null,
      deg: null,
      selected: ["KEGG PATHWAY", "Reactome", "BioCyc", "PANTHER", "OMIM", "KEGG DISEASE", "NHGRI GWAS Catalog", "Gene Ontology", "Gene Ontology Slim"],
    }
  },
  components: {
    leftMenu,
    degComp,
    imgMenuShowComp
  },
  created() {
    // 从 indexeddb 获取 deg 列表 点击 + 号可以查看 name
    this.getdegList()
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    search () {
      this.getTableData()
      setTimeout(() => {
        this.table.ajax.reload()  // 重新 load table
      }, 0)
    },
    getTableData () {
      let self = this
      $(document).ready(function() {
          var table = $('#patients').DataTable({
              "pageLength": 25,
              "bPaginate" : true,//分页工具条显示
              //"sPaginationType" : "full_numbers",//分页工具条样式
              "bStateSave" : true, //是否打开客户端状态记录功能,此功能在ajax刷新纪录的时候不会将个性化设定回复为初始化状态
              "bScrollCollapse" : true, //当显示的数据不足以支撑表格的默认的高度
              "bLengthChange" : true, //每页显示的记录数
              "bFilter" : false, //搜索栏
              "bSort" : false, //是否支持排序功能
              "bInfo" : true, //显示表格信息
              "bAutoWidth" : true, //自适应宽度
              "bJQueryUI" : false,//是否开启主题
              "bDestroy" : true,
              "bProcessing" : true, //开启读取服务器数据时显示正在加载中……特别是大数据量的时候，开启此功能比较好
              "bServerSide" : true,//服务器处理分页，默认是false，需要服务器处理，必须true
              "sAjaxDataProp" : "aData",
              //通过ajax实现分页的url路径
              "sAjaxSource" : "/server/kobas2_entry?username="+ self.$store.state.username +"&p="+ self.$store.state.projectId +"&caseSample="+ self.$store.state._case +"&controlSample="+ self.$store.state._control +"&dbList=" + self.selected.join(','),
              "aoColumns" : [ {
                  "class": "details-control",
                  "orderable": false,
                  "mDataProp": 1,
                  "defaultContent": ""
              }, {
                  "mDataProp" : "term"
              }, {
                  "mDataProp" : "database"
              }, {
                  "mDataProp" : "entryId",
                  "mRender" : function(data, type, full) {
                      return "<a href='" + full.hyperlink + "' target='_blank'>"+ data +"</a>"
                  },
              }, {
                  "mDataProp" : "inputNumber",
              }, {
                  "mDataProp" : "backgroundNumber"
              }, {
                  "mDataProp" : "pValue"
              }, {
                  "mDataProp" : "correctedPValue"
              }, {
                  "mDataProp" : "inputGenes",
                  "mRender" : function(data, type, full) {
                      return data.replace(/\|/g, ' ')
                  },
              }],
          });

          function format ( d ) {
            let str = ""
            let idArr = d["inputGenes"].split('|')
            for (let j = 0; j < idArr.length; j++) {
              for (let i = 0; i < self.deg.length; i++) {
                if (self.deg[i]['target_id'] === idArr[j]) {
                  if (self.deg[i]['log2FoldChange'] > 0) {
                    str = str.concat(' ' + '<span class="red">' + self.deg[i]['name'] + '</span>' + ' ')
                  } else {
                    str = str.concat(' ' + '<span class="green">' + self.deg[i]['name'] + '</span>' + ' ')
                  }
                  break
                }
              }
            }
            return '<div class="detailDiv">' + str + '</div>'
          }

          var detailRows = [];
          // 防止报 _detailsShow undefined 错误
          $('#patients tbody').off('click', 'tr td.details-control');
          $('#patients tbody').on( 'click', 'tr td.details-control', function () {
              var tr = $(this).closest('tr');
              var row = table.row( tr );
              var idx = $.inArray( tr.attr('id'), detailRows );

              if ( row.child.isShown() ) {
                  tr.removeClass( 'details' );
                  row.child.hide();

                  // Remove from the 'open' array
                  detailRows.splice( idx, 1 );
              }
              else {
                  tr.addClass( 'details' );
                  row.child( format( row.data() ) ).show();

                  // Add to the 'open' array
                  if ( idx === -1 ) {
                      detailRows.push( tr.attr('id') );
                  }
              }
          });
          table.on( 'draw', function () {
              $.each( detailRows, function ( i, id ) {
                  $('#'+id+' td.details-control').trigger( 'click' );
              } );
          });
          self.table = table
        })
    },
    getdegList() {
      let _case = sessionStorage.getItem('_case')
      let _control = sessionStorage.getItem('_control')
      let dbName = "deg"
      var request = indexedDB.open(dbName)
      request.onerror = (e) => {}
      request.onupgradeneeded = (e) => {
        this.db = e.target.result
        var objectStore = this.db.createObjectStore("degTable", {
          keyPath: 'name',
          autoIncrement: true
        })
      }
      request.onsuccess = (e) => {
        console.log("success!");
        this.db = e.target.result
        this.setDeg(_case, _control)
      }
      request.onerror = (e) => {
        console.log("error!");
      }
    },
    setDeg(_case, _control) {
      var tx = this.db.transaction(['degTable'], 'readwrite')
      var store = tx.objectStore('degTable')
      var req = store.get('deg' + _case + _control)
      req.onsuccess = (e) => {
        this.deg = e.target.result.value
      }
    },
  }
}
</script>

<style scoped="true">
.content {
  float: left;
  /* width: 60%; */
  width: calc(100% - 350px);
  padding: 0 20px;
  margin: 19px auto;
}

.cursor-pointer {
  cursor: pointer;
}

h4 {
  margin: 0;
}
</style>
<style media="screen">
td.details-control {
    background: url('../assets/img/details_open.png') no-repeat center center;
    cursor: pointer;
}
tr.details td.details-control {
    background: url('../assets/img/details_close.png') no-repeat center center;
}
.detailDiv {
  padding: 5px 35px;
}
.font-overflow {
  word-break: break-all;
  word-wrap: break-word;
}

.red {
  color: red;
}

.green {
  color: green;
}
</style>
