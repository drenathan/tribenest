import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import { useAuth } from "@/hooks/useAuth";
import { Controller, useForm } from "react-hook-form";
import { editProductResolver, type EditProductInput } from "../-components/schema";
import { Button, Editor, FormError, FormInput, Label, type ApiError } from "@tribe-nest/frontend-shared";
import { useState, useEffect } from "react";
import { useUpdateProduct } from "@/hooks/mutations/useProduct";
import { useGetProduct } from "@/hooks/queries/useProduct";

export const Route = createFileRoute("/_dashboard/store/products/$productId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { productId } = Route.useParams();
  const { currentProfileAuthorization } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const { mutateAsync: updateProduct, isPending } = useUpdateProduct();
  const { data: product, isLoading: isLoadingProduct } = useGetProduct(
    productId,
    currentProfileAuthorization?.profileId,
  );
  const navigate = useNavigate();
  const router = useRouter();

  const methods = useForm<EditProductInput>({
    resolver: editProductResolver,
  });

  // Populate form with existing product data
  useEffect(() => {
    if (product) {
      methods.reset({
        title: product.title,
        description: product.description || "",
        profileId: product.profileId,
      });
    }
  }, [product, methods]);

  const onSubmit = async (data: EditProductInput) => {
    setErrorMessage("");
    try {
      await updateProduct({ productId, data });
      if (router.history.canGoBack()) {
        router.history.back();
      } else {
        navigate({ to: "/store/products" });
      }
    } catch (e: unknown) {
      const error = e as ApiError;
      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Failed to update product");
      }
      console.error(e);
    }
  };

  // Scroll to top when form submission starts
  useEffect(() => {
    if (isPending) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isPending]);

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Product not found</h2>
          <p className="mt-2 text-muted-foreground">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate({ to: "/store/products" })} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-[200px]">
      <PageHeader title={`Edit Product`} />
      {/* All the editor buttons trigger a form submission, so we need to prevent it */}
      <form onSubmit={(e) => e.preventDefault()} className="max-w-2xl flex flex-col gap-6 mt-2">
        {errorMessage && <FormError message={errorMessage} />}

        <FormInput<EditProductInput>
          name="title"
          label={`Product Title`}
          control={methods.control}
          placeholder={`Enter the product title`}
        />

        <Controller
          control={methods.control}
          name="description"
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-4">
              <Label>Description</Label>
              {fieldState.error && <FormError message={fieldState.error.message as string} />}
              <Editor
                initHtml={field.value || ""}
                onHtmlChange={(html) => {
                  field.onChange(html);
                }}
              />
            </div>
          )}
        />

        <Button onClick={methods.handleSubmit(onSubmit)} className="w-fit self-end" type="submit" disabled={isPending}>
          Update Product
        </Button>
      </form>
    </div>
  );
}
