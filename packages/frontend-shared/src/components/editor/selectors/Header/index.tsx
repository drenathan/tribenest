"use client";
import { useNode, type UserComponent } from "@craftjs/core";
import { PageHeaderSettings } from "./Settings";
import { useEditorContext } from "../../context";
import { alphaToHexCode } from "../../../../lib/utils";
import PageHeaderContent from "./PageHeaderContent";

type HeaderProps = {
  links?: {
    label: string;
    href: string;
  }[];
  logo?: string;
  background?: string;
  hasBorder?: boolean;
  showCart?: boolean;
};

export const PageHeader: UserComponent<HeaderProps> = ({
  logo,
  background,
  hasBorder = false,
  showCart = true,
}: HeaderProps) => {
  const { themeSettings } = useEditorContext();
  const {
    connectors: { connect },
  } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref);
        }
      }}
      className="w-full @md:px-8 px-4 py-4 relative"
      style={{
        borderBottom: hasBorder ? `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.45)}` : "none",
      }}
    >
      <PageHeaderContent logo={logo} background={background} showCart={showCart} />
    </div>
  );
};

PageHeader.craft = {
  displayName: "Page header",
  rules: {
    canDrag: () => false,
    canDrop: () => false,
    canMoveIn: () => false,
    canMoveOut: () => false,
  },
  custom: {
    preventDelete: true,
  },
  props: {
    links: [],
    logo: "",
    background: "",
  },
  related: {
    toolbar: PageHeaderSettings,
  },
};

export const PageHeaderWithoutEditor = ({ logo, background, hasBorder = false }: HeaderProps) => {
  const { themeSettings } = useEditorContext();
  return (
    <div
      className="w-full @md:px-8 px-4 py-4 relative"
      style={{
        borderBottom: hasBorder ? `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.45)}` : "none",
        color: themeSettings.colors.text,
      }}
    >
      <PageHeaderContent logo={logo} background={background} />
    </div>
  );
};
