import {
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumb,
  BreadcrumbItem,
} from "@tribe-nest/frontend-shared";
import { Link, useRouter } from "@tanstack/react-router";

type BreadcrumbProps = {
  links?: {
    label: string;
    href?: string;
    goBack?: boolean;
  }[];
  currentPage: string;
};

function Breadcrumbs({ links, currentPage }: BreadcrumbProps) {
  const router = useRouter();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {links?.map((link) => (
          <div key={link.label} className="flex items-center gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  onClick={(e) => {
                    if (link.goBack) {
                      e.preventDefault();
                      router.history.back();
                    }
                  }}
                  to={link.href}
                >
                  {link.label}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </div>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default Breadcrumbs;
