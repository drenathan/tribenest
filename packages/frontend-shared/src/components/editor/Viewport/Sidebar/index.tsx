"use client";
import { useState } from "react";
import { SidebarItem } from "./SidebarItem";
import { Settings, Layers as LayersIcon } from "lucide-react";
import { Toolbar } from "../../Toolbar";
import { DefaultLayerHeader, Layers } from "@craftjs/layers";
import { css } from "@emotion/css";

// export const SidebarDiv = styled.div<{ $enabled: boolean }>`
//   width: 280px;
//   opacity: ${(props) => (props.$enabled ? 1 : 0)};
//   margin-right: ${(props) => (props.$enabled ? 0 : -280)}px;
// `;

const layerStyle = css`
  div {
    background-color: transparent !important;
  }
  .craft-layer-node {
    background-color: transparent !important;
  }
`;

export const Sidebar = () => {
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [layersVisible, setLayerVisible] = useState(true);

  // const { enabled } = useEditor((state) => ({
  //   enabled: state.options.enabled,
  // }));

  return (
    <div className="sidebar transition text-foreground bg-background w-[350px] border-l border-border">
      <div className="flex flex-col h-full">
        <SidebarItem
          icon={<Settings />}
          title="Customize"
          height={!layersVisible ? "full" : "55%"}
          visible={toolbarVisible}
          onChange={(val) => setToolbarVisible(val)}
          className="overflow-auto"
        >
          <Toolbar />
        </SidebarItem>
        <SidebarItem
          icon={<LayersIcon />}
          title="Layers"
          height={!toolbarVisible ? "full" : "45%"}
          visible={layersVisible}
          onChange={(val) => setLayerVisible(val)}
          className="overflow-auto"
        >
          <div className={layerStyle}>
            <Layers expandRootOnLoad={true} />
          </div>
        </SidebarItem>
      </div>
    </div>
  );
};

const Layer = () => {
  return (
    <div>
      <DefaultLayerHeader />
    </div>
  );
};
