let router = [
  {
    path: '/sc',
    component: resolve => require(['@/views/sc/index'], resolve),
    children: [
      // PCA
      {
        path: '',
        name: 'sc_report',
        component: resolve => require(['@/views/sc/report'], resolve)
      },
      {
        path: 'report_umi_count',
        name: 'report_umi_count',
        component: resolve => require(['@/views/sc/report_umi_count'], resolve)
      },
      {
        path: 'report_heterogeneous_gene', // 表达异质化基因筛选
        name: 'report_heterogeneous_gene',
        component: resolve => require(['@/views/sc/report_heterogeneous_gene'], resolve)
      },
      {
        path: 'report_pca_3d', // pca 3D
        name: 'report_pca_3d',
        component: resolve => require(['@/views/sc/report_pca_3d'], resolve)
      },
      {
        path: 'report_pca', // pca
        name: 'report_pca',
        component: resolve => require(['@/views/sc/report_pca'], resolve)
      },
      {
        path: 'report_pca_elbow', // 肘图
        name: 'report_pca_elbow',
        component: resolve => require(['@/views/sc/report_pca_elbow'], resolve)
      },
      {
        path: 'report_tSNE', // tSNE
        name: 'report_tSNE',
        component: resolve => require(['@/views/sc/report_tSNE'], resolve)
      },
      {
        path: 'report_viz_PCA', // viz pca
        name: 'report_viz_PCA',
        component: resolve => require(['@/views/sc/report_viz_PCA'], resolve)
      },
      {
        path: 'report_pca_heatmap', // pca heatmap
        name: 'report_pca_heatmap',
        component: resolve => require(['@/views/sc/report_pca_heatmap'], resolve)
      },
      {
        path: 'report_group_violin', // 分组小提琴图
        name: 'report_group_violin',
        component: resolve => require(['@/views/sc/report_group_violin'], resolve)
      },
      {
        path: 'report_JackStrawPlot', // JackStrawPlot 斜率为 1
        name: 'report_JackStrawPlot',
        component: resolve => require(['@/views/sc/report_JackStrawPlot'], resolve)
      },
      {
        path: 'report_box_plot', // 箱线图
        name: 'report_box_plot',
        component: resolve => require(['@/views/sc/report_box_plot'], resolve)
      },
      {
        path: 'report_sequence_amount', // 条形图
        name: 'report_sequence_amount',
        component: resolve => require(['@/views/sc/report_sequence_amount'], resolve)
      },
      {
        path: 'report_gene_UMIcounts', // number of genes UMIs
        name: 'report_gene_UMIcounts',
        component: resolve => require(['@/views/sc/report_gene_UMIcounts'], resolve)
      },
      {
        path: 'report_nGene_nUMI', // nGene nUMI scatter
        name: 'report_nGene_nUMI',
        component: resolve => require(['@/views/sc/report_nGene_nUMI'], resolve)
      },
      {
        path: 'report_tSNE_transition', // tSNE 动效图
        name: 'report_tSNE_transition',
        component: resolve => require(['@/views/sc/report_tSNE_transition'], resolve)
      },
      // CCA
      {
        path: 'CCA_UMI_count',
        name: 'CCA_UMI_count',
        component: resolve => require(['@/views/sc/CCA/CCA_UMI_count'], resolve)
      },
      {
        path: 'CCA_nGene_nUMI',
        name: 'CCA_nGene_nUMI',
        component: resolve => require(['@/views/sc/CCA/CCA_nGene_nUMI'], resolve)
      },
      {
        path: 'CCA_heterogeneous_gene',
        name: 'CCA_heterogeneous_gene',
        component: resolve => require(['@/views/sc/CCA/CCA_heterogeneous_gene'], resolve)
      },
      {
        path: 'CCA_scatter',
        name: 'CCA_scatter',
        component: resolve => require(['@/views/sc/CCA/CCA_scatter'], resolve)
      },
      {
        path: 'CCA_elbow',
        name: 'CCA_elbow',
        component: resolve => require(['@/views/sc/CCA/CCA_elbow'], resolve)
      },
      {
        path: 'CCA_heatmap',
        name: 'CCA_heatmap',
        component: resolve => require(['@/views/sc/CCA/CCA_heatmap'], resolve)
      },
      {
        path: 'CCA_tSNE',
        name: 'CCA_tSNE',
        component: resolve => require(['@/views/sc/CCA/CCA_tSNE'], resolve)
      },
      {
        path: 'CCA_group_violin',
        name: 'CCA_group_violin',
        component: resolve => require(['@/views/sc/CCA/CCA_group_violin'], resolve)
      },
      {
        path: 'CCA_inner_list',
        name: 'CCA_inner_list',
        component: resolve => require(['@/views/sc/CCA/CCA_inner_list'], resolve)
      },{
        path: 'CCA_tSNE_transition',
        name: 'CCA_tSNE_transition',
        component: resolve => require(['@/views/sc/CCA/CCA_tSNE_transition'], resolve)
      },
    ]
  }
]

export default router
