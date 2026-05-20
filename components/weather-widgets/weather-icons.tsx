import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const SunnyIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeDasharray="2 2"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const CloudyIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M17.5 19A4.5 4.5 0 0 0 22 14.5c0-2.48-2.02-4.5-4.5-4.5-.42 0-.83.06-1.22.17A7 7 0 0 0 3 13c0 3.3 2.7 6 6 6h8.5z" />
  </svg>
);

export const RainyIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M16 14A4.5 4.5 0 0 0 20.5 9.5c0-2.48-2.02-4.5-4.5-4.5-.42 0-.83.06-1.22.17A7 7 0 0 0 2 8c0 3.3 2.7 6 6 6h8z" />
    <path d="M8 18v2M12 18v3M16 18v2" />
  </svg>
);

export const SnowyIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M16 14A4.5 4.5 0 0 0 20.5 9.5c0-2.48-2.02-4.5-4.5-4.5-.42 0-.83.06-1.22.17A7 7 0 0 0 2 8c0 3.3 2.7 6 6 6h8z" />
    <path d="M8 18h.01M12 19h.01M16 18h.01M10 21h.01M14 21h.01" />
  </svg>
);

export const StormIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M16 14A4.5 4.5 0 0 0 20.5 9.5c0-2.48-2.02-4.5-4.5-4.5-.42 0-.83.06-1.22.17A7 7 0 0 0 2 8c0 3.3 2.7 6 6 6h8z" />
    <path d="M13 16l-3 4h4l-2 3" />
  </svg>
);

export const FogIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M4 6h16M2 10h20M5 14h14M8 18h8" />
  </svg>
);

export const NightIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
    <path d="M19 3v2M18 4h2" strokeWidth="1" />
    <path d="M15 8v2M14 9h2" strokeWidth="1" />
  </svg>
);

// Map Weather Condition Types to Icons
interface WeatherIconProps extends IconProps {
  type: "SUNNY" | "CLOUDY" | "RAIN" | "SNOW" | "STORM" | "FOG" | "NIGHT";
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ type, size = 24, className, ...props }) => {
  switch (type) {
    case "SUNNY":
      return <SunnyIcon size={size} className={className} {...props} />;
    case "CLOUDY":
      return <CloudyIcon size={size} className={className} {...props} />;
    case "RAIN":
      return <RainyIcon size={size} className={className} {...props} />;
    case "SNOW":
      return <SnowyIcon size={size} className={className} {...props} />;
    case "STORM":
      return <StormIcon size={size} className={className} {...props} />;
    case "FOG":
      return <FogIcon size={size} className={className} {...props} />;
    case "NIGHT":
      return <NightIcon size={size} className={className} {...props} />;
    default:
      return <CloudyIcon size={size} className={className} {...props} />;
  }
};
