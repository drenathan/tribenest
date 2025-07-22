import { HexColorPicker } from "react-colorful";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

type Props = {
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
  title?: string;
  stopCloseOnClickSelf?: boolean;
  color: string;
  onChange?: (color: string, skipHistoryStack: boolean) => void;
};

export default function ColorPicker({
  disabled = false,
  stopCloseOnClickSelf = true,
  color,
  onChange,
  icon,
  label,
  ...rest
}: Props) {
  return (
    <Popover modal={true}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button size={"icon"} className="!h-8 !w-8" variant={"outline"} {...rest}>
          <span className="size-4 rounded-full">{icon}</span>
          {/* <ChevronDownIcon className='size-4'/> */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <HexColorPicker color={color} onChange={(color) => onChange?.(color, false)} />
        <Input
          maxLength={7}
          onChange={(e) => {
            e.stopPropagation();
            onChange?.(e?.currentTarget?.value, false);
          }}
          value={color}
        />
      </PopoverContent>
    </Popover>
  );
}
