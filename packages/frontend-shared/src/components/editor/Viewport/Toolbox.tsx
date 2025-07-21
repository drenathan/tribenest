import { Element, useEditor } from "@craftjs/core";
import { Tooltip } from "@mui/material";
import { Square as SquareSvg, Type as TypeSvg, Circle as ButtonSvg, Atom, Users, Contact, Mail } from "lucide-react";
import { EditorButton } from "../selectors/Button";
import { Container } from "../selectors/Container";
import { MembershipSection } from "../selectors/MembershipSection";
import { EditorText } from "../selectors/Text";
import { EditorSocialIcons } from "../selectors/SocialIcons";
import { EmailList } from "../selectors";

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
              create(ref, <Element canvas is={Container} height="300px" width="100%"></Element>);
            }
          }}
        >
          <Tooltip title="Container" placement="right">
            <Item>
              <SquareSvg />
              <Label>Container</Label>
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            if (ref) {
              create(ref, <EditorText fontSize="16" textAlign="left" text="Hi there" />);
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
              create(ref, <EditorButton />);
            }
          }}
        >
          <Tooltip title="Button" placement="right">
            <Item>
              <ButtonSvg />
              <Label>Button</Label>
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            if (ref) {
              create(ref, <MembershipSection title="Membership Section" />);
            }
          }}
        >
          <Tooltip title="Membership Section" placement="right">
            <Item>
              <Users />
              <Label>Membership Section</Label>
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            if (ref) {
              create(ref, <EmailList />);
            }
          }}
        >
          <Tooltip title="Email List Subscription" placement="right">
            <Item>
              <Mail />
              <Label>Email List</Label>
            </Item>
          </Tooltip>
        </div>
        <div
          ref={(ref) => {
            if (ref) {
              create(ref, <EditorSocialIcons />);
            }
          }}
        >
          <Tooltip title="Social Icons" placement="right">
            <Item>
              <Contact />
              <Label>Social Icons</Label>
            </Item>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
