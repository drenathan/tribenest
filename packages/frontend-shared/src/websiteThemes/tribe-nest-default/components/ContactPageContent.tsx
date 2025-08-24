"use client";
import { FormError } from "../../../components/ui/form-error";
import { EditorButton, EditorInput, EditorText } from "../../../components/editor/selectors";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditorContext } from "../../../components/editor/context";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

export function ContactPageContent() {
  const { profile, httpClient } = useEditorContext();
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: contact, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      return httpClient!.post("/public/websites/contact", {
        profileId: profile?.id,
        ...data,
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: FormData) => {
    contact(data);
  };

  return (
    <div className="w-full h-full flex flex-col items-center px-2 @md:px-8 py-10">
      <EditorText text="Contact Me" fontSize="24" />

      {isSuccess && <EditorText text="Message sent successfully" fontSize="16" fontWeight="bold" />}
      {!isSuccess && (
        <div className="w-full max-w-xl flex flex-col gap-6">
          <Controller
            control={methods.control}
            name="name"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <EditorText text="Name" fontSize="16" fontWeight="bold" />
                <FormError message={methods.formState.errors.name?.message as string} />
                <EditorInput placeholder="Enter your name" width="100%" value={field.value} onChange={field.onChange} />
              </div>
            )}
          />
          <Controller
            control={methods.control}
            name="email"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <EditorText text="Email" fontSize="16" fontWeight="bold" />
                <FormError message={methods.formState.errors.email?.message as string} />
                <EditorInput
                  placeholder="Enter your email"
                  width="100%"
                  value={field.value}
                  onChange={field.onChange}
                />
              </div>
            )}
          />
          <Controller
            control={methods.control}
            name="message"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <EditorText text="Message" fontSize="16" fontWeight="bold" />
                <FormError message={methods.formState.errors.message?.message as string} />
                <EditorInput
                  placeholder="Enter your message"
                  width="100%"
                  isTextArea
                  value={field.value}
                  onChange={field.onChange}
                />
              </div>
            )}
          />
          <EditorButton text="Send Message" onClick={methods.handleSubmit(onSubmit)} disabled={isPending} />
        </div>
      )}
    </div>
  );
}
