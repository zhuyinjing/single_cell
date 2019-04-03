import 'es6-promise/auto'
import Vuex from 'vuex'
import Vue from 'vue'
// import * as html2canvas from 'html2canvas'
// import * as jsPDF from 'jspdf'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    username: 'test',
    role: 'admin',
    projectId: '',
    projectName: '',
    geneList: [],
    heatmapJson: null,
    ppiJson: null,
    leftMenuIndex: '0-0',
    info: {
      rnaSeqReportSummary: {
        geneNum: null,
        transcriptNum: null
      },
      experimentDesign: {
        experiments: []
      }
    },
    _case: '',
    _control: '',
    species: '', // 物种信息 id
    checked: [],
    degGeneSum: null,
    degFilterArgs: {
      pvalue: 0.05,
      FDR: 0.05,
      log2FoldChange: 1
    },
    menuShow: true,
    appmenuShow: true,
    speciesArr: {
      'Human (Homo sapiens)': 9606,
      'Mouse (Mus musculus)': 10090,
      'Soybean (Clycine max)': 3847,
      'Zebrafish (Danio rerio)': 7955,
      'Thale cress (Arabidopsis thaliana)': 3702
    },
    svgDescribeShow: false,
    projectType: null,
    commonInfo: null, // tSNE 骨架信息

  },
  mutations: {
    setusername: (state, data) => {
      localStorage.setItem('username', data)
      state.username = data
    },
    setprojectId: (state, data) => {
      localStorage.setItem('projectId', data)
      state.projectId = data
    },
    setprojectName: (state, data) => {
      localStorage.setItem('projectName', data)
      state.projectName = data
    },
    setgeneList: (state, data) => {
      localStorage.setItem('geneList', JSON.stringify(data))
      state.geneList = data
    },
    setheatmapJson: (state, data) => {
      localStorage.setItem('heatmapJson', JSON.stringify(data))
      state.heatmapJson = data
    },
    setppiJson: (state, data) => {
      localStorage.setItem('ppiJson', JSON.stringify(data))
      state.ppiJson = data
    },
    setleftMenuIndex: (state, data) => {
      localStorage.setItem('leftMenuIndex', data)
      state.leftMenuIndex = data
    },
    setinfo: (state, data) => {
      localStorage.setItem('info', JSON.stringify(data))
      state.info = data
    },
    set_case: (state, data) => {
      localStorage.setItem('_case', data)
      state._case = data
    },
    set_control: (state, data) => {
      localStorage.setItem('_control', data)
      state._control = data
    },
    setspecies: (state, data) => {
      localStorage.setItem('species', data)
      state.species = data
    },
    setchecked: (state, data) => {
      state.checked = data
    },
    setdegGeneSum: (state, data) => {
      localStorage.setItem('degGeneSum', data)
      state.degGeneSum = data
    },
    setdegFilterArgs: (state, data) => {
      localStorage.setItem('degFilterArgs', JSON.stringify(data))
      state.degFilterArgs = data
    },
    setmenuShow: (state, data) => {
      localStorage.setItem('menuShow', data)
      state.menuShow = data
    },
    setappmenuShow: (state, data) => {
      localStorage.setItem('appmenuShow', data)
      state.appmenuShow = data
    },
    setprojectType: (state, data) => {
      localStorage.setItem('projectType', data)
      state.projectType = data
    },
    setcommonInfo: (state, data) => {
      state.commonInfo = data
    },
    // d3savePDF: (state, data) => {
    //   let that = this
    //   html2canvas(document.getElementById("d3container")).then(canvas => {
    //     var contentWidth = canvas.width;
    //     var contentHeight = canvas.height;
    //     console.log(contentWidth);
    //     console.log(contentHeight);
    //     //一页pdf显示html页面生成的canvas高度;
    //     var pageHeight = contentWidth / 592.28 * 841.89;
    //     //未生成pdf的html页面高度
    //     var leftHeight = contentHeight;
    //     //页面偏移
    //     var position = 10;
    //     //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
    //     var imgWidth = 595.28;
    //     var imgHeight = 592.28 / contentWidth * contentHeight;
    //
    //     var pageData = canvas.toDataURL('image/jpeg', 1.0);
    //     var pdf = new jsPDF('', 'pt', 'a4');
    //
    //     //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
    //     //当内容未超过pdf一页显示的范围，无需分页
    //     if (leftHeight < pageHeight) {
    //       pdf.addImage(pageData, 'JPEG', 0, 10, imgWidth, imgHeight);
    //     } else {
    //       while (leftHeight > 0) {
    //         pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
    //         leftHeight -= pageHeight;
    //         position -= 841.89;
    //         //避免添加空白页
    //         if (leftHeight > 0) {
    //           pdf.addPage();
    //         }
    //       }
    //     }
    //     pdf.save(data + '.pdf');
    //   });
    // },
    d3saveSVG: (state, data) => {
      let id = data[1] ? data[1] : 'd3container'
      var svg = document.getElementById(id);
      var svgElement = svg.getElementsByTagName("svg")[0]
      svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      var svgData = svgElement.outerHTML;
      var preface = '<?xml version="1.0" standalone="no"?>\r\n';
      var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
      var svgUrl = URL.createObjectURL(svgBlob);
      var downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = data[0] + '.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    },
  }
})
