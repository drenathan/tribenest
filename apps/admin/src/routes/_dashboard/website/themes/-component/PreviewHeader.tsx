import {
  Button,
  ProductCategory,
  useEditorContext,
  type ThemeConfig,
  type ThemePage,
} from "@tribe-nest/frontend-shared";
import { Tooltip2 } from "@tribe-nest/frontend-shared";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, ChevronDown, Monitor, Smartphone, Rocket } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@tribe-nest/frontend-shared";
import { cn } from "@tribe-nest/frontend-shared";
import { useEditor } from "@craftjs/core";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useActivateTheme } from "@/hooks/mutations/useWebsite";
import { toast } from "sonner";
import { SelectEditorProduct } from "../../-components/SelectEditorProduct";

let currentRenderingIndex = 0;
let isRendering = false;
const pages = [] as { pathname: string; json: string; title: string; description?: string }[];

export const PreviewHeader = ({
  currentPage,
  setCurrentPage,
  theme,
  isMobile,
  setIsMobile,
}: {
  currentPage?: ThemePage;
  setCurrentPage: (page: ThemePage) => void;
  theme: ThemeConfig;
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { query } = useEditor();
  const { currentProfileAuthorization } = useAuth();
  const { mutateAsync: activateTheme, isPending } = useActivateTheme();
  const { profile, setCurrentProductId } = useEditorContext();
  const [isRenderMode, setIsRenderMode] = useState(false);
  const [isSelectProductModalOpen, setIsSelectProductModalOpen] = useState(false);
  const [intendedPage, setIntendedPage] = useState<ThemePage | null>(null);
  const availablePages = theme.pages.filter((page) => !page.deprecated);

  useEffect(() => {
    // The idea.
    // 1. Craft js does not have a great way to imperatively render a page so we have to simulate opening all the pages one by one
    // 2. when user clicks on active we toggle the isRenderMode which is triggers this effect
    if (!currentProfileAuthorization) {
      return;
    }
    // is render mode is local so on true once, that is why we need to track with an external variable
    if ((isRenderMode && currentPage) || (isRendering && currentPage)) {
      // the possibility that this page is already rendered (i.e it's already in the pages array)
      const isRendered = pages.find((page) => page.pathname === currentPage.pathname);
      if (isRendered) {
        return;
      }

      pages.push({
        pathname: currentPage.pathname,
        json: JSON.stringify(query.getSerializedNodes()),
        title: currentPage.title,
        description: currentPage.description,
      });

      currentRenderingIndex++;
      isRendering = true;

      if (currentRenderingIndex < availablePages.length) {
        const nextPage = availablePages[currentRenderingIndex];
        setCurrentPage(nextPage);
      } else {
        setIsRenderMode(false);
        isRendering = false;
        currentRenderingIndex = 0;
        activateTheme({
          theme: {
            pages,
            themeSettings: theme.themeSettings,
            slug: theme.slug,
            version: theme.version,
            thumbnail: theme.thumbnail,
          },
          profileId: currentProfileAuthorization.profile.id,
        })
          .then(() => {
            navigate({ to: "/website/home" });
          })
          .catch((error) => {
            toast.error("Failed to activate theme");
            console.error(error);
          });
      }
    }
  }, [
    isRenderMode,
    currentPage,
    currentProfileAuthorization,
    theme,
    setCurrentPage,
    activateTheme,
    navigate,
    query,
    availablePages,
  ]);

  if (!currentProfileAuthorization || !profile) {
    return null;
  }

  const handlePageChange = (page: ThemePage) => {
    if (page.pathname === "/products/:id") {
      setIntendedPage(page);
      setIsSelectProductModalOpen(true);
      return;
    }
    setCurrentPage(page);
  };

  const handleActivateTheme = () => {
    setCurrentPage(availablePages[0]);
    setIsRenderMode(true);
  };

  const getSelectProductDetails = () => {
    if (intendedPage?.pathname === "/products/:id") {
      return {
        title: "Select Music",
        description: "This music will be used to render the page",
      };
    }
    return {
      title: "Select item",
      description: "Choose an item to feature",
    };
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 z-[100000] bg-background">
      <div className="flex items-center gap-2">
        <Tooltip2 text="Back">
          <Button variant="outline" size="icon" onClick={() => navigate({ to: "/website/themes" })}>
            <ArrowLeftIcon className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>
      </div>
      {currentPage && (
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 text-foreground cursor-pointer">
                {currentPage.title} <ChevronDown className="w-4 h-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56 rounded-lg space-y-1 py-2"
              side={"bottom"}
              align="center"
              sideOffset={4}
            >
              {availablePages.map((page) => {
                return (
                  <DropdownMenuItem
                    onClick={() => handlePageChange(page)}
                    className={cn({ "bg-primary": page.pathname === currentPage.pathname })}
                    key={page.pathname}
                  >
                    {page.title}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2">
            <Tooltip2 text="Desktop">
              <Button size="icon" variant={isMobile ? "link" : "outline"} onClick={() => setIsMobile(false)}>
                <Monitor className="w-4 h-4 text-foreground" />
              </Button>
            </Tooltip2>
            <Tooltip2 text="Mobile">
              <Button size="icon" variant={isMobile ? "outline" : "link"} onClick={() => setIsMobile(true)}>
                <Smartphone className="w-4 h-4 text-foreground" />
              </Button>
            </Tooltip2>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Tooltip2 text="This will create a new website version, you can publish it later">
          <Button onClick={handleActivateTheme} disabled={isPending || isRenderMode || isRendering}>
            <Rocket /> Activate
          </Button>
        </Tooltip2>
      </div>

      <SelectEditorProduct
        category={ProductCategory.Music}
        onProductSelect={(product) => {
          if (!intendedPage) {
            return;
          }
          setCurrentProductId!(product.id);
          setCurrentPage(intendedPage);
          setIntendedPage(null);
          setTimeout(() => (document.body.style.pointerEvents = ""), 100);
        }}
        title={getSelectProductDetails().title}
        description={getSelectProductDetails().description}
        isOpen={isSelectProductModalOpen}
        setIsOpen={setIsSelectProductModalOpen}
      />
    </header>
  );
};
