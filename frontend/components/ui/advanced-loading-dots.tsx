import React from "react";

interface AdvancedLoadingDotsProps {
  variant?: "pulse" | "bounce" | "wave";
  size?: "small" | "default" | "large";
  color?: "gray" | "blue" | "green" | "purple";
}

export function AdvancedLoadingDots({
  variant = "pulse",
  size = "default",
  color = "gray",
}: AdvancedLoadingDotsProps) {
  const sizeClasses = {
    small: "w-1.5 h-1.5",
    default: "w-2 h-2",
    large: "w-3 h-3",
  };

  const colorClasses = {
    gray: "bg-gray-400",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  const spacingClasses = {
    small: "space-x-1",
    default: "space-x-1.5",
    large: "space-x-2",
  };

  const getAnimationClass = (index: number) => {
    switch (variant) {
      case "bounce":
        return "animate-bounce";
      case "wave":
        return "animate-bounce-dot";
      case "pulse":
      default:
        return "animate-pulse";
    }
  };

  const getAnimationDelay = (index: number) => {
    if (variant === "bounce" || variant === "wave") {
      return `${index * 200}ms`;
    }
    return `${index * 300}ms`;
  };

  const baseDotClass = `${sizeClasses[size]} ${colorClasses[color]} rounded-full`;

  return (
    <div className={`flex items-center ${spacingClasses[size]}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${baseDotClass} ${getAnimationClass(index)}`}
          style={{
            animationDelay: getAnimationDelay(index),
            animationDuration: variant === "pulse" ? "1.5s" : "1.4s",
          }}
        />
      ))}
    </div>
  );
}
