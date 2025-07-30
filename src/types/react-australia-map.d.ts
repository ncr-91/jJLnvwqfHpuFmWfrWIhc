declare module "react-australia-map" {
  import { ComponentType } from "react";

  interface AustraliaMapProps {
    [key: string]: any;
  }

  const AustraliaMap: ComponentType<AustraliaMapProps>;
  export default AustraliaMap;
}
