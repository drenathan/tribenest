import { SimpleLogo } from "@/components/simple-logo";
import { CardContent } from "@tribe-nest/frontend-shared";
import { Card } from "@tribe-nest/frontend-shared";

type Props = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: Props) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <SimpleLogo />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Card className="md:w-[400px]">
              <CardContent>{children}</CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://cdn.coumo.com/soundtrap-GxH1DSxzons-unsplash.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
