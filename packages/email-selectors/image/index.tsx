import { type UserComponent, useNode } from "@craftjs/core";

export type ImageProps = {
  src?: string;
  height?: string;
  width?: string;
};

export const EmailImage: UserComponent<ImageProps> = ({ src, height, width }: ImageProps) => {
  const {
    connectors: { connect },
  } = useNode();

  return (
    <div
      ref={(dom) => {
        if (!dom) return;

        connect(dom);
      }}
      style={{
        width: width || "100%",
        height: height || "200px",
        overflow: "hidden",
      }}
    >
      {src && (
        <img
          src={src || undefined}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {!src && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-sm ">Click here and select image on the right panel</p>
        </div>
      )}
    </div>
  );
};
