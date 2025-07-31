import "./chunk-7D4SUZUM.js";

// node_modules/jsheatmap/lib/fancy.js
var ColorPoint = class {
  constructor(red, green, blue, value) {
    this.r = red;
    this.g = green;
    this.b = blue;
    this.val = value;
  }
};
var ColorGradient = class {
  constructor() {
    this.color = [];
    this.createDefaultHeatMapGradient();
  }
  addColorPoint(red, green, blue, value) {
    for (let i = 0; i < this.color.length; i++) {
      if (value < this.color[i].val) {
        this.color.splice(i, 0, new ColorPoint(red, green, blue, value));
        return;
      }
    }
    this.color.push(new ColorPoint(red, green, blue, value));
  }
  createDefaultHeatMapGradient() {
    this.color = [];
    this.color.push(new ColorPoint(0, 0, 1, 0));
    this.color.push(new ColorPoint(0, 1, 1, 0.34));
    this.color.push(new ColorPoint(0, 1, 0, 0.5));
    this.color.push(new ColorPoint(1, 1, 0, 0.66));
    this.color.push(new ColorPoint(1, 0, 0, 1));
  }
  //-- Inputs a (value) between 0 and 1 and outputs the (red), (green) and (blue)
  //-- values representing that position in the gradient.
  getColorAtValue(value) {
    let red, green, blue;
    red = green = blue = 0;
    if (this.color.length === 0)
      return { red, green, blue };
    for (let i = 0; i < this.color.length; i++) {
      let currC = this.color[i];
      if (value < currC.val) {
        let prevC = this.color[Math.max(0, i - 1)];
        let valueDiff = prevC.val - currC.val;
        let fractBetween = valueDiff == 0 ? 0 : (value - currC.val) / valueDiff;
        red = (prevC.r - currC.r) * fractBetween + currC.r;
        green = (prevC.g - currC.g) * fractBetween + currC.g;
        blue = (prevC.b - currC.b) * fractBetween + currC.b;
        return { red, green, blue };
      }
    }
    red = this.color.slice(-1)[0].r;
    green = this.color.slice(-1)[0].g;
    blue = this.color.slice(-1)[0].b;
    return { red, green, blue };
  }
};
var fancy_default = ColorGradient;

// node_modules/jsheatmap/lib/simple.js
function getHeatMapColor(value) {
  const NUM_COLORS = 4;
  const color = [[0, 0, 1], [0, 1, 0], [1, 1, 0], [1, 0, 0]];
  let idx1 = 0, idx2 = 0;
  let fractBetween = 0;
  if (value <= 0) {
    idx1 = idx2 = 0;
  } else if (value >= 1) {
    idx1 = idx2 = NUM_COLORS - 1;
  } else {
    const v = value * (NUM_COLORS - 1);
    idx1 = Math.floor(v);
    idx2 = idx1 + 1;
    fractBetween = v - idx1;
  }
  const rgb = {
    red: (color[idx2][0] - color[idx1][0]) * fractBetween + color[idx1][0],
    green: (color[idx2][1] - color[idx1][1]) * fractBetween + color[idx1][1],
    blue: (color[idx2][2] - color[idx1][2]) * fractBetween + color[idx1][2]
  };
  return rgb;
}
var simple_default = getHeatMapColor;

// node_modules/jsheatmap/lib/index.js
var Style;
(function(Style2) {
  Style2[Style2["SIMPLE"] = 0] = "SIMPLE";
  Style2[Style2["FANCY"] = 1] = "FANCY";
})(Style || (Style = {}));
var Sterno = class {
  constructor(headings, rows) {
    this.headings = headings;
    this.rows = rows;
  }
  getData(options) {
    const { headings } = this;
    let high = 0;
    let low = Number.MAX_SAFE_INTEGER;
    const rows = this.rows.map((r) => {
      const [label, values, extra] = r;
      high = Math.max(...values, high);
      low = Math.min(...values, low);
      if (low < 0)
        throw Error("negative input encountered");
      return { label, cells: { values, colors: [], scales: [], extra } };
    });
    const heatMapGradient = new fancy_default();
    heatMapGradient.createDefaultHeatMapGradient();
    const adjust = (v) => {
      if (options && options.logn) {
        return Math.log(v);
      }
      return v;
    };
    rows.forEach((row) => {
      row.cells.values.forEach((value, i) => {
        let scale = adjust(value - low) / adjust(high - low);
        if (options && options.style === Style.SIMPLE) {
          var color = simple_default(scale);
        } else {
          var color = heatMapGradient.getColorAtValue(scale);
        }
        row.cells.colors[i] = color;
        row.cells.scales[i] = scale;
      });
    });
    return { headings, high, low, rows };
  }
};
export {
  Style,
  Sterno as default
};
//# sourceMappingURL=jsheatmap.js.map
