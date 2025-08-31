import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import { useGetSmartLink, useGetSmartLinkAnalytics } from "@/hooks/queries/useSmartLinks";
import { useAuth } from "@/hooks/useAuth";
import { Eye, MousePointer, TrendingUp, MapPin, Globe } from "lucide-react";
import Loading from "@/components/loading";
import { DateRangePicker } from "@tribe-nest/frontend-shared";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { sub } from "date-fns";

export const Route = createFileRoute("/_dashboard/smart-links/links/$smartLinkId/analytics")({
  component: RouteComponent,
});

function RouteComponent() {
  const { smartLinkId } = Route.useParams();

  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
    from: sub(new Date(), { days: 1 }),
    to: new Date(),
  });

  const { currentProfileAuthorization } = useAuth();
  const { data: smartLink } = useGetSmartLink(smartLinkId, currentProfileAuthorization?.profile.id);
  const { data: analytics, isLoading } = useGetSmartLinkAnalytics(
    smartLinkId,
    currentProfileAuthorization?.profile.id,
    selectedDate,
  );

  const { views, clicks } = analytics?.analytics || { views: 0, clicks: 0 };
  const totalInteractions = views + clicks;
  const clickThroughRate = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
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
        title={`${smartLink?.title} Analytics`}
        description={`View the analytics for ${smartLink?.title}`}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <MetricCard
              title="Total Views"
              value={views.toLocaleString()}
              icon={<Eye className="h-5 w-5" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Total Clicks"
              value={clicks.toLocaleString()}
              icon={<MousePointer className="h-5 w-5" />}
              color="bg-green-500"
            />
            <MetricCard
              title="Click-through Rate"
              value={`${clickThroughRate}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="bg-purple-500"
            />
          </div>

          {/* Performance Chart */}
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Views vs Clicks</span>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    Views ({views.toLocaleString()})
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    Clicks ({clicks.toLocaleString()})
                  </span>
                </div>
              </div>
              <div className="h-8 bg-muted rounded-full overflow-hidden">
                {totalInteractions > 0 && (
                  <>
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${(views / totalInteractions) * 100}%` }}
                    ></div>
                    <div
                      className="h-full bg-green-500 -mt-8 transition-all duration-500"
                      style={{
                        width: `${(clicks / totalInteractions) * 100}%`,
                        marginLeft: `${(views / totalInteractions) * 100}%`,
                      }}
                    ></div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Geographic Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Countries */}
            <div className="bg-card rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Top Countries</h3>
              </div>
              {analytics.countries.length > 0 ? (
                <div className="space-y-3">
                  {analytics.countries.slice(0, 5).map((country, index) => (
                    <CountryRow
                      key={country.country}
                      country={country.country}
                      views={country.views}
                      clicks={country.clicks}
                      rank={index + 1}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No country data available</p>
              )}
            </div>

            {/* Cities */}
            <div className="bg-card rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Top Cities</h3>
              </div>
              {analytics.cities.length > 0 ? (
                <div className="space-y-3">
                  {analytics.cities.slice(0, 5).map((city, index) => (
                    <CityRow
                      key={city.city}
                      city={city.city}
                      views={city.views}
                      clicks={city.clicks}
                      rank={index + 1}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No city data available</p>
              )}
            </div>
          </div>
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
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>{icon}</div>
      </div>
    </div>
  );
}

// Country Row Component
function CountryRow({
  country,
  views,
  clicks,
  rank,
}: {
  country: string;
  views: number;
  clicks: number;
  rank: number;
}) {
  const maxTotal = Math.max(views, clicks);
  const viewPercentage = maxTotal > 0 ? (views / maxTotal) * 100 : 0;
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
            {views.toLocaleString()} views • {clicks.toLocaleString()} clicks
          </div>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="flex h-full">
          <div className="bg-blue-500 transition-all duration-300" style={{ width: `${viewPercentage}%` }}></div>
          <div className="bg-green-500 transition-all duration-300" style={{ width: `${clickPercentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}

// City Row Component
function CityRow({ city, views, clicks, rank }: { city: string; views: number; clicks: number; rank: number }) {
  const maxTotal = Math.max(views, clicks);
  const viewPercentage = maxTotal > 0 ? (views / maxTotal) * 100 : 0;
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
            {views.toLocaleString()} views • {clicks.toLocaleString()} clicks
          </div>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="flex h-full">
          <div className="bg-blue-500 transition-all duration-300" style={{ width: `${viewPercentage}%` }}></div>
          <div className="bg-green-500 transition-all duration-300" style={{ width: `${clickPercentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}
