"use client";
import {
  alphaToHexCode,
  EditorButtonWithoutEditor,
  EditorInputWithoutEditor,
  useEditorContext,
} from "@tribe-nest/frontend-shared";

export function ResetPasswordContent() {
  const { themeSettings } = useEditorContext();

  return (
    <div className="w-full h-full flex justify-center items-start px-4 md:px-8 ">
      <div
        className="w-full max-w-md mt-20 p-4 h-auto"
        style={{
          border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.45)}`,
        }}
      >
        <h1 className="text-2xl font-bold mb-8">Reset Password</h1>

        <div className="w-full flex flex-col gap-6">
          <div className="w-full flex flex-col gap-2">
            <p className="text-sm">Password</p>
            <EditorInputWithoutEditor placeholder="Password" width="100%" />
          </div>
          <div className="w-full flex flex-col gap-2">
            <p className="text-sm"> Confirm Password</p>
            <EditorInputWithoutEditor placeholder="Password" width="100%" />
          </div>
          <EditorButtonWithoutEditor text="Reset Password" />
        </div>
      </div>
    </div>
  );
}
