import { type UserComponent, useNode } from "@craftjs/core";

export type ImageProps = {
  src?: string;
};

export const EmailImage: UserComponent<ImageProps> = ({ src }: ImageProps) => {
  const {
    connectors: { connect },
  } = useNode();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <img
        ref={(dom) => {
          if (!dom) return;

          connect(dom);
        }}
        src={src || undefined}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};
