declare module "jsheatmap" {
  export enum Style {
    SIMPLE = 0,
    FANCY = 1,
  }

  export default class Sterno {
    constructor(headings: string[], rows: any[]);
    getData(options?: any): any;
  }
}
