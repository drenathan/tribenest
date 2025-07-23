import React from "react";
import { Editor, Frame } from "@craftjs/core";
import { Body, Head, Html, render } from "@react-email/components";
import selectors, { SelectorProvider } from "@tribe-nest/email-selectors";

export const EmailRenderer = ({ json, subject }: { json: string; subject: string }) => {
  return (
    <Html lang="en">
      <Head>
        <title>{subject}</title>
      </Head>
      <Body style={{ backgroundColor: "#f9fafc", width: "100%", height: "100%" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "white", padding: "20px" }}>
          <SelectorProvider isRenderMode={true}>
            <Editor enabled={false} resolver={selectors}>
              <Frame data={json}></Frame>
            </Editor>
          </SelectorProvider>
        </div>
      </Body>
    </Html>
  );
};

export const renderHtml = (json: string, subject: string) => {
  return render(<EmailRenderer json={json} subject={subject} />);
};
