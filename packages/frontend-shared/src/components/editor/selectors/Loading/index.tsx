import { useEditorContext } from "../../context";
type Props = {
  message?: string;
};
export function LoadingState({ message }: Props) {
  const { themeSettings } = useEditorContext();
  return (
    <div
      className="w-full max-w-4xl mx-auto p-6"
      style={{
        backgroundColor: themeSettings.colors.background,
        color: themeSettings.colors.text,
        fontFamily: themeSettings.fontFamily,
      }}
    >
      <div className="text-center py-12">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
          style={{ borderColor: themeSettings.colors.primary }}
        ></div>
        <p>{message}</p>
      </div>
    </div>
  );
}
