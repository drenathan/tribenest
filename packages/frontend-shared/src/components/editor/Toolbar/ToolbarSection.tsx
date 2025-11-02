"use client";
import { useNode } from "@craftjs/core";
import { Grid } from "@mui/material";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../../ui/accordion";

type ToolbarSectionProps = {
  title?: string;
  props?: string[];
  summary?: (props: any) => React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
};

export const ToolbarSection = ({ title, props, summary, children, defaultExpanded = false }: ToolbarSectionProps) => {
  const { nodeProps } = useNode((node) => ({
    nodeProps:
      props &&
      props.reduce((res: any, key: any) => {
        res[key] = node.data.props[key] || null;
        return res;
      }, {}),
  }));

  return (
    <Accordion collapsible type="single" defaultValue={defaultExpanded ? title : undefined} className="mt-2 ">
      <AccordionItem value={title} className="border-b-0">
        <AccordionTrigger className="hover:no-underline px-4">
          <div className="w-full text-foreground flex justify-between items-center">
            <h5 className="text-sm text-light-gray-1 text-left font-medium text-dark-gray">{title}</h5>
            {summary && props ? (
              <h5 className="text-light-gray-2 text-sm text-right text-dark-blue">
                {summary(
                  props.reduce((acc: any, key: any) => {
                    acc[key] = nodeProps[key];
                    return acc;
                  }, {}),
                )}
              </h5>
            ) : null}
          </div>
        </AccordionTrigger>
        <AccordionContent className="overflow-visible">
          <Grid container spacing={1} className="px-4">
            {children}
          </Grid>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
