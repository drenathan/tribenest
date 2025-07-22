export const nodes = {
  ROOT: {
    type: {
      resolvedName: "EmailContainer",
    },
    isCanvas: true,
    props: {
      width: "100%",
    },
    displayName: "Container",
    custom: {
      preventDelete: true,
    },
    hidden: false,
    nodes: ["i3lLRBVHnJ", "RAs8L3V0w0", "ZPPUnj8Lta"],
    linkedNodes: {},
  },
  i3lLRBVHnJ: {
    type: {
      resolvedName: "EmailSection",
    },
    isCanvas: false,
    props: {
      height: "100px",
      numberOfColumns: 2,
    },
    displayName: "Section",
    custom: {},
    parent: "ROOT",
    hidden: false,
    nodes: [],
    linkedNodes: {
      Section_Parent: "4guFXW6U86",
    },
  },
  "4guFXW6U86": {
    type: {
      resolvedName: "SingleSection",
    },
    isCanvas: true,
    props: {
      height: "100px",
    },
    displayName: "SingleSection",
    custom: {},
    parent: "i3lLRBVHnJ",
    hidden: false,
    nodes: ["TuWmRZHnb-", "lGHP0JlKzz"],
    linkedNodes: {},
  },
  "TuWmRZHnb-": {
    type: {
      resolvedName: "EmailColumn",
    },
    isCanvas: true,
    props: {
      id: "column-0",
      width: 50,
    },
    displayName: "Column",
    custom: {},
    parent: "4guFXW6U86",
    hidden: false,
    nodes: ["tebW3d6xZH"],
    linkedNodes: {},
  },
  lGHP0JlKzz: {
    type: {
      resolvedName: "EmailColumn",
    },
    isCanvas: true,
    props: {
      id: "column-1",
      width: 50,
    },
    displayName: "Column",
    custom: {},
    parent: "4guFXW6U86",
    hidden: false,
    nodes: ["FaoWmSS15D"],
    linkedNodes: {},
  },
  tebW3d6xZH: {
    type: {
      resolvedName: "EmailText",
    },
    isCanvas: false,
    props: {
      text: "Hello world",
    },
    displayName: "Text",
    custom: {},
    parent: "TuWmRZHnb-",
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
  RAs8L3V0w0: {
    type: {
      resolvedName: "EmailSection",
    },
    isCanvas: false,
    props: {
      height: "100px",
      numberOfColumns: 2,
    },
    displayName: "Section",
    custom: {},
    parent: "ROOT",
    hidden: false,
    nodes: [],
    linkedNodes: {
      Section_Parent: "fTwAVxBWda",
    },
  },
  fTwAVxBWda: {
    type: {
      resolvedName: "SingleSection",
    },
    isCanvas: true,
    props: {
      height: "100px",
    },
    displayName: "SingleSection",
    custom: {},
    parent: "RAs8L3V0w0",
    hidden: false,
    nodes: ["mRa9X7Ynx3", "GHHEJbOnr3"],
    linkedNodes: {},
  },
  mRa9X7Ynx3: {
    type: {
      resolvedName: "EmailColumn",
    },
    isCanvas: true,
    props: {
      id: "column-0",
      width: 50,
    },
    displayName: "Column",
    custom: {},
    parent: "fTwAVxBWda",
    hidden: false,
    nodes: ["YgxaEu43LG"],
    linkedNodes: {},
  },
  GHHEJbOnr3: {
    type: {
      resolvedName: "EmailColumn",
    },
    isCanvas: true,
    props: {
      id: "column-1",
      width: 50,
    },
    displayName: "Column",
    custom: {},
    parent: "fTwAVxBWda",
    hidden: false,
    nodes: ["O4OlYePAR7"],
    linkedNodes: {},
  },
  ZPPUnj8Lta: {
    type: {
      resolvedName: "EmailSection",
    },
    isCanvas: false,
    props: {
      height: "100px",
      numberOfColumns: 3,
    },
    displayName: "Section",
    custom: {},
    parent: "ROOT",
    hidden: false,
    nodes: [],
    linkedNodes: {
      Section_Parent: "VthvuSGMrJ",
    },
  },
  VthvuSGMrJ: {
    type: {
      resolvedName: "SingleSection",
    },
    isCanvas: true,
    props: {
      height: "100px",
    },
    displayName: "SingleSection",
    custom: {},
    parent: "ZPPUnj8Lta",
    hidden: false,
    nodes: ["iAndtDR5-3", "pRyRQlWhRW", "YzbxT6E10N"],
    linkedNodes: {},
  },
  "iAndtDR5-3": {
    type: {
      resolvedName: "EmailColumn",
    },
    isCanvas: true,
    props: {
      id: "column-0",
      width: 33.333333333333336,
    },
    displayName: "Column",
    custom: {},
    parent: "VthvuSGMrJ",
    hidden: false,
    nodes: ["VXMOCkES1g"],
    linkedNodes: {},
  },
  pRyRQlWhRW: {
    type: {
      resolvedName: "EmailColumn",
    },
    isCanvas: true,
    props: {
      id: "column-1",
      width: 33.333333333333336,
    },
    displayName: "Column",
    custom: {},
    parent: "VthvuSGMrJ",
    hidden: false,
    nodes: ["OQ2DtWXAfi"],
    linkedNodes: {},
  },
  YzbxT6E10N: {
    type: {
      resolvedName: "EmailColumn",
    },
    isCanvas: true,
    props: {
      id: "column-2",
      width: 33.333333333333336,
    },
    displayName: "Column",
    custom: {},
    parent: "VthvuSGMrJ",
    hidden: false,
    nodes: ["BgtxBpVo_x"],
    linkedNodes: {},
  },
  FaoWmSS15D: {
    type: {
      resolvedName: "EmailText",
    },
    isCanvas: false,
    props: {
      text: "Hello world",
    },
    displayName: "Text",
    custom: {},
    parent: "lGHP0JlKzz",
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
  YgxaEu43LG: {
    type: {
      resolvedName: "EmailText",
    },
    isCanvas: false,
    props: {
      text: "Hello world",
    },
    displayName: "Text",
    custom: {},
    parent: "mRa9X7Ynx3",
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
  O4OlYePAR7: {
    type: {
      resolvedName: "EmailText",
    },
    isCanvas: false,
    props: {
      text: "Hello world",
    },
    displayName: "Text",
    custom: {},
    parent: "GHHEJbOnr3",
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
  VXMOCkES1g: {
    type: {
      resolvedName: "EmailText",
    },
    isCanvas: false,
    props: {
      text: "Hello world",
    },
    displayName: "Text",
    custom: {},
    parent: "iAndtDR5-3",
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
  OQ2DtWXAfi: {
    type: {
      resolvedName: "EmailText",
    },
    isCanvas: false,
    props: {
      text: "Hello world",
    },
    displayName: "Text",
    custom: {},
    parent: "pRyRQlWhRW",
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
  BgtxBpVo_x: {
    type: {
      resolvedName: "EmailText",
    },
    isCanvas: false,
    props: {
      text: "Hello world",
    },
    displayName: "Text",
    custom: {},
    parent: "YzbxT6E10N",
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
};
