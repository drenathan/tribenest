import React from "react";
import { Editor, Frame } from "@craftjs/core";
import { Body, Head, Html, render } from "@react-email/components";
import { nodes } from "./contants";
import selectors from "@tribe-nest/email-selectors";

export const EmailRenderer = ({ json }: { json: string }) => {
  return (
    <Html lang="en" className="dark">
      <Head>
        <title>Your Music is Ready!</title>
      </Head>
      <Body>
        <Editor enabled={true} resolver={selectors}>
          <Frame data={JSON.parse(json)}></Frame>
        </Editor>
      </Body>
    </Html>
  );
};

export const renderHtml = () => {
  return render(<EmailRenderer json={JSON.stringify(nodes)} />);
};
