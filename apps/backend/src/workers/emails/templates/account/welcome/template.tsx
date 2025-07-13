import * as React from "react";
import { Html, Button, Text } from "@react-email/components";

import type { IVariables } from "./index";

export function Template(props: IVariables) {
  const { name, link } = props;

  return (
    <Html lang="en">
      <Button href={link}>Click me</Button>
      <Text>Hi {name},</Text>
    </Html>
  );
}
