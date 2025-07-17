"use client";
import { useNode, type UserComponent } from "@craftjs/core";
import { cn } from "../../../../lib/utils";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { useEditorContext } from "../../context";

type IconProps = {
  icon: IconName;
  containerClassName?: string;
  iconClassName?: string;
  shouldConnect?: boolean;
  color?: string;
  size?: number;
  fill?: string;
};

export const EditorIcon: UserComponent<IconProps> = ({
  icon,
  containerClassName,
  iconClassName,
  shouldConnect = true,
  color,
  size,
  fill,
}) => {
  const {
    connectors: { connect },
  } = useNode();

  const { themeSettings } = useEditorContext();

  return (
    <div
      ref={(ref) => {
        if (ref && shouldConnect) {
          connect(ref);
        }
      }}
      className={cn("", containerClassName)}
    >
      <DynamicIcon
        color={color || themeSettings.colors.text}
        name={icon}
        className={iconClassName}
        size={size}
        fill={fill}
      />
    </div>
  );
};

EditorIcon.craft = {
  displayName: "Icon",
};
