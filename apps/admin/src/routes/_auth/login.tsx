import { Button, cn, FormError, FormInput, type ApiError } from "@tribe-nest/frontend-shared";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import GoogleButton from "./-components/google-button";
import { loginResolver, type LoginInput } from "./-components/schema";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { z } from "zod";
import { parseRedirectUrl } from "./-components/utils";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
});

function RouteComponent() {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = Route.useNavigate();
  const search = useSearch({ from: "/_auth/login" });
  const methods = useForm<LoginInput>({
    resolver: loginResolver,
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await login(data);
      navigate(parseRedirectUrl(search.redirect));
    } catch (e: unknown) {
      const error = e as ApiError;
      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-6")}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-foreground">Login to your account</h1>
        {errorMessage && <FormError message={errorMessage} />}
      </div>
      <div className="grid gap-6">
        <FormInput<LoginInput> name="email" control={methods.control} label="Email" />
        <div className="grid gap-2">
          <FormInput<LoginInput> name="password" control={methods.control} label="Password" type="password" />
          <Link
            to="/forgot-password"
            className="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground"
          >
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
        <GoogleButton onClick={() => {}} />
      </div>
      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/signup" search={{ redirect: search.redirect }} className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  );
}
