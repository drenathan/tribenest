import { Element } from "@craftjs/core";
import {
  Container,
  EditorButton,
  EditorImage,
  EditorSocialIcons,
  EmailList,
  EditorText,
} from "../../components/editor/selectors";
import { useEditorContext } from "../../components/editor/context";

export default function LinkTreeComponent() {
  const { themeSettings, profile } = useEditorContext();
  return (
    <Element
      canvas
      is={Container}
      height="auto"
      id="page-container"
      width="100%"
      alignItems="center"
      paddingHorizontal="10"
      paddingVertical="10"
      custom={{ displayName: "Page", preventDelete: true }}
      className="min-h-full"
    >
      <Element
        canvas
        is={Container}
        height="100%"
        id="page-container"
        width=""
        paddingHorizontal="10"
        paddingVertical="10"
        custom={{ displayName: "Page", preventDelete: true }}
        className="w-full @md:w-[500px] min-h-screen"
        alignItems="center"
      >
        <EditorImage
          src="https://cdn.coumo.com/geo-chierchia-o-9-fSSiCT0-unsplash.jpg"
          cornerRadius="100"
          height="150"
          width="150"
          style={{
            marginBottom: "10px",
          }}
        />
        <EditorText
          text={profile?.name || "My Name"}
          fontSize="24"
          fontWeight="bold"
          color={themeSettings.colors.primary}
        />
        <EditorSocialIcons />
        <Container height="30px" />

        <EditorButton text="🥁 Check out my new music" fullWidth marginVertical="10" />
        <EditorButton text="📇 My New Book is out!" fullWidth marginVertical="10" />
        <EditorButton text="🎥 My New Video is out!" fullWidth marginVertical="10" />
        <Container height="20px" />
        <EmailList />
      </Element>
    </Element>
  );
}
