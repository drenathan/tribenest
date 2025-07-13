import { cn, FormError, FormInput, type ApiError } from "@tribe-nest/frontend-shared";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import GoogleButton from "./-components/google-button";
import { Button } from "@tribe-nest/frontend-shared";
import {
  createAccountResolver,
  type CreateAccountInput,
} from "./-components/schema";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { z } from "zod";
import { parseRedirectUrl } from "./-components/utils";

export const Route = createFileRoute("/_auth/signup")({
  component: RouteComponent,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
});

function RouteComponent() {
  const { register } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = Route.useNavigate();
  const search = useSearch({ from: "/_auth/signup" });
  const methods = useForm<CreateAccountInput>({
    resolver: createAccountResolver,
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await register(data);
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
        <h1 className="text-2xl font-bold text-foreground">
          Create your account
        </h1>
        {errorMessage && <FormError message={errorMessage} />}
      </div>
      <div className="grid gap-6">
        <FormInput<CreateAccountInput>
          name="email"
          control={methods.control}
          label="Email"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <FormInput<CreateAccountInput>
              name="firstName"
              control={methods.control}
              label="First Name"
            />
          </div>
          <div className="space-y-2">
            <FormInput<CreateAccountInput>
              name="lastName"
              control={methods.control}
              label="Last Name"
            />
          </div>
        </div>
        <FormInput<CreateAccountInput>
          name="password"
          control={methods.control}
          label="Password"
          type="password"
        />

        <Button type="submit" className="w-full">
          Sign up
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <GoogleButton onClick={() => {}} />
      </div>
      <div className="text-center text-sm text-muted-foreground">
        Have an account?{" "}
        <Link
          to="/login"
          search={{ redirect: search.redirect }}
          className="underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
