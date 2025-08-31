import { useGetWebsiteAnalytics } from "@/hooks/queries/useWebsite";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { sub } from "date-fns";
import { DateRangePicker } from "@tribe-nest/frontend-shared";
import PageHeader from "../../-components/layout/page-header";
import Loading from "@/components/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tribe-nest/frontend-shared";
import { Eye, MousePointer, Users, Globe, MapPin, FileText } from "lucide-react";

export const Route = createFileRoute("/_dashboard/website/analytics/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
    from: sub(new Date(), { days: 1 }),
    to: new Date(),
  });
  const { data: analytics, isLoading } = useGetWebsiteAnalytics(currentProfileAuthorization?.profile.id, selectedDate);

  return (
    <div>
      <PageHeader
        action={
          <DateRangePicker
            date={selectedDate}
            setDate={(date) => {
              if (date) {
                setSelectedDate(date);
              }
            }}
          />
        }
        title={`Website Analytics`}
        description={`Track the website activities`}
      />

      {isLoading && <Loading />}
      {!isLoading && !analytics && (
        <div className="text-center text-muted-foreground py-8">
          No analytics data available for the selected time period.
        </div>
      )}

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <MetricCard
              title="Total Visits"
              value={analytics.analytics.visits.toLocaleString()}
              icon={<Users className="h-5 w-5" />}
              color="bg-blue-500"
              description="Unique sessions"
            />
            <MetricCard
              title="Page Views"
              value={analytics.analytics.pageViews.toLocaleString()}
              icon={<Eye className="h-5 w-5" />}
              color="bg-green-500"
              description="Total page views"
            />
            <MetricCard
              title="Total Clicks"
              value={analytics.analytics.clicks.toLocaleString()}
              icon={<MousePointer className="h-5 w-5" />}
              color="bg-purple-500"
              description="User interactions"
            />
          </div>

          {/* Geographic Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Top Countries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Countries
                </CardTitle>
                <CardDescription>Visits by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.countries.slice(0, 10).map((country, index) => (
                    <CountryRow
                      key={country.country}
                      country={country.country}
                      visits={country.visits}
                      pageViews={country.pageViews}
                      clicks={country.clicks}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Cities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Cities
                </CardTitle>
                <CardDescription>Visits by city</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.cities.slice(0, 10).map((city, index) => (
                    <CityRow
                      key={city.city}
                      city={city.city}
                      visits={city.visits}
                      pageViews={city.pageViews}
                      clicks={city.clicks}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Pages */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Top Pages
              </CardTitle>
              <CardDescription>Most viewed pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.pages.slice(0, 20).map((page, index) => (
                  <PageRow key={page.pathname} pathname={page.pathname} pageViews={page.pageViews} rank={index + 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon,
  color,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-lg ${color} text-white`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Country Row Component
function CountryRow({
  country,
  visits,
  pageViews,
  clicks,
  rank,
}: {
  country: string;
  visits: number;
  pageViews: number;
  clicks: number;
  rank: number;
}) {
  const maxTotal = Math.max(...[visits, pageViews, clicks]);
  const visitPercentage = maxTotal > 0 ? (visits / maxTotal) * 100 : 0;
  const viewPercentage = maxTotal > 0 ? (pageViews / maxTotal) * 100 : 0;
  const clickPercentage = maxTotal > 0 ? (clicks / maxTotal) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground w-6">{rank}</span>
          <span className="font-medium">{country}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">
            {visits.toLocaleString()} visits • {pageViews.toLocaleString()} views • {clicks.toLocaleString()} clicks
          </div>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="flex h-full">
          <div className="bg-blue-500 transition-all duration-300" style={{ width: `${visitPercentage}%` }}></div>
          <div className="bg-green-500 transition-all duration-300" style={{ width: `${viewPercentage}%` }}></div>
          <div className="bg-purple-500 transition-all duration-300" style={{ width: `${clickPercentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}

// City Row Component
function CityRow({
  city,
  visits,
  pageViews,
  clicks,
  rank,
}: {
  city: string;
  visits: number;
  pageViews: number;
  clicks: number;
  rank: number;
}) {
  const maxTotal = Math.max(...[visits, pageViews, clicks]);
  const visitPercentage = maxTotal > 0 ? (visits / maxTotal) * 100 : 0;
  const viewPercentage = maxTotal > 0 ? (pageViews / maxTotal) * 100 : 0;
  const clickPercentage = maxTotal > 0 ? (clicks / maxTotal) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground w-6">{rank}</span>
          <span className="font-medium">{city}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">
            {visits.toLocaleString()} visits • {pageViews.toLocaleString()} views • {clicks.toLocaleString()} clicks
          </div>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="flex h-full">
          <div className="bg-blue-500 transition-all duration-300" style={{ width: `${visitPercentage}%` }}></div>
          <div className="bg-green-500 transition-all duration-300" style={{ width: `${viewPercentage}%` }}></div>
          <div className="bg-purple-500 transition-all duration-300" style={{ width: `${clickPercentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}

// Page Row Component
function PageRow({ pathname, pageViews, rank }: { pathname: string; pageViews: number; rank: number }) {
  const maxViews = Math.max(...[pageViews]);
  const viewPercentage = maxViews > 0 ? (pageViews / maxViews) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground w-6">{rank}</span>
          <span className="font-medium font-mono text-xs">{pathname}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{pageViews.toLocaleString()} views</div>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="bg-green-500 transition-all duration-300" style={{ width: `${viewPercentage}%` }}></div>
      </div>
    </div>
  );
}
