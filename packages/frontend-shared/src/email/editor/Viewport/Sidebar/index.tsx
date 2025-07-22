"use client";
import { useState } from "react";
import { SidebarItem } from "./SidebarItem";
import { Settings } from "lucide-react";
import { Toolbar } from "../../../../components/editor";

// export const SidebarDiv = styled.div<{ $enabled: boolean }>`
//   width: 280px;
//   opacity: ${(props) => (props.$enabled ? 1 : 0)};
//   margin-right: ${(props) => (props.$enabled ? 0 : -280)}px;
// `;

export const Sidebar = () => {
  const [toolbarVisible, setToolbarVisible] = useState(true);
  // const { enabled } = useEditor((state) => ({
  //   enabled: state.options.enabled,
  // }));

  return (
    <div className="sidebar transition text-foreground bg-background w-[400px] border-l border-border">
      <div className="flex flex-col h-full">
        <SidebarItem
          icon={<Settings />}
          title="Customize"
          height={"full"}
          visible={toolbarVisible}
          onChange={(val) => setToolbarVisible(val)}
          className="overflow-auto"
        >
          <Toolbar />
        </SidebarItem>
      </div>
    </div>
  );
};
