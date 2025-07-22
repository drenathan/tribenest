import { useEditor } from "@craftjs/core";
import { Tooltip } from "@mui/material";
import { Square as SquareSvg, Type as TypeSvg, Atom, Columns2, Columns3, Image } from "lucide-react";
import { EmailImage, EmailText } from "../selectors";
import { EmailSection } from "../selectors/section";

const Label = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="text-xs uppercase">{children}</h2>;
};

const Item = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border-border border cursor-move p-4 rounded-md">
      {children}
    </div>
  );
};

export const Toolbox = () => {
  const {
    connectors: { create },
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <div className="toolbox overflow-hidden transition flex flex-col bg-background text-foreground border-r border-border w-[250px]">
      <div className={`cursor-pointer flex items-center px-2 border-b border-border py-4`}>
        <div className="flex-1 flex items-center gap-2">
          <Atom />
          <h2 className="text-xs uppercase">Elements</h2>
        </div>
      </div>
      <div className="p-3 gap-3  overflow-auto grid grid-cols-2 text-center">
        <div
          ref={(ref) => {
            if (ref) {
              create(ref, <EmailSection />);
            }
          }}
        >
          <Tooltip title="Section" placement="right">
            <Item>
              <SquareSvg />
              <Label>Section</Label>
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            if (ref) {
              create(ref, <EmailSection numberOfColumns={2} />);
            }
          }}
        >
          <Tooltip title="Section" placement="right">
            <Item>
              <Columns2 />
              <Label>2 Columns</Label>
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            if (ref) {
              create(ref, <EmailSection numberOfColumns={3} />);
            }
          }}
        >
          <Tooltip title="Section" placement="right">
            <Item>
              <Columns3 />
              <Label>3 Columns</Label>
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            if (ref) {
              create(ref, <EmailText />);
            }
          }}
        >
          <Tooltip title="Text" placement="right">
            <Item>
              <TypeSvg />
              <Label>Text</Label>
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            if (ref) {
              create(ref, <EmailImage />);
            }
          }}
        >
          <Tooltip title="Image" placement="right">
            <Item>
              <Image />
              <Label>Image</Label>
            </Item>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
