import classNames from "classnames";
import React from "react";
import { styled } from "styled-components";

const SidebarItemDiv = styled.div<{ $visible?: boolean; $height?: string }>`
  height: ${(props) => (props.$visible && props.$height && props.$height !== "full" ? `${props.$height}` : "auto")};
  flex: ${(props) => (props.$visible && props.$height && props.$height === "full" ? `1` : "unset")};
  border-bottom: 1px solid transparent;
  border-color: ${(props) => (props.$visible ? "#eee" : "transparent")};
  transition: height 1s ease-in-out;
`;

export type SidebarItemProps = {
  title: string;
  height?: string;
  icon: React.ReactNode;
  visible?: boolean;
  onChange?: (bool: boolean) => void;
  children?: React.ReactNode;
  className?: string;
};

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  title,
  children,
  height,
  className,
  onChange,
  visible,
}) => {
  return (
    <SidebarItemDiv $visible={visible} $height={height} className={classNames("flex flex-col", className)}>
      <div className="w-full overflow-auto">
        <div className={`cursor-pointer flex items-center px-2 border-b border-t border-border py-4`}>
          <div
            onClick={() => {
              if (onChange) onChange(!visible);
            }}
            className="flex-1 flex items-center gap-2"
          >
            {icon}
            <h2 className="text-xs uppercase">{title}</h2>
          </div>
        </div>
        {children}
      </div>
    </SidebarItemDiv>
  );
};
