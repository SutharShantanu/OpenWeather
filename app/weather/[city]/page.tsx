import { WeatherDashboardClient } from "./weather-dashboard-client";

export default async function CityWeatherPage({ params }: { params: Promise<{ city: string }> }) {
  const resolvedParams = await params;
  const city = decodeURIComponent(resolvedParams.city || "london");

  return <WeatherDashboardClient city={city} />;
}
