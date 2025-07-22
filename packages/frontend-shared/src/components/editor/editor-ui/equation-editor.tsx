import type { JSX, Ref, RefObject } from "react";
import { type ChangeEvent, forwardRef } from "react";

type BaseEquationEditorProps = {
  equation: string;
  inline: boolean;
  setEquation: (equation: string) => void;
};

function EquationEditor(
  { equation, setEquation, inline }: BaseEquationEditorProps,
  forwardedRef: Ref<HTMLInputElement | HTMLTextAreaElement>,
): JSX.Element {
  const onChange = (event: ChangeEvent) => {
    setEquation((event.target as HTMLInputElement).value);
  };

  return inline && forwardedRef instanceof HTMLInputElement ? (
    <span className="EquationEditor_inputBackground bg-background">
      <span className="EquationEditor_dollarSign text-muted-foreground text-left">$</span>
      <input
        className="EquationEditor_inlineEditor text-primary m-0 resize-none border-0 bg-inherit p-0 outline-none"
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={forwardedRef as RefObject<HTMLInputElement>}
      />
      <span className="EquationEditor_dollarSign text-muted-foreground text-left">$</span>
    </span>
  ) : (
    <div className="EquationEditor_inputBackground bg-background">
      <span className="EquationEditor_dollarSign text-muted-foreground text-left">{"$$\n"}</span>
      <textarea
        className="EquationEditor_blockEditor text-primary m-0 w-full resize-none border-0 bg-inherit p-0 outline-none"
        value={equation}
        onChange={onChange}
        ref={forwardedRef as RefObject<HTMLTextAreaElement>}
      />
      <span className="EquationEditor_dollarSign text-muted-foreground text-left">{"\n$$"}</span>
    </div>
  );
}

export default forwardRef(EquationEditor);
