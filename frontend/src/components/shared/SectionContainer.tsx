import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, LucideIcon } from "lucide-react";

interface SectionContainerProps {
  id?: string;
  badge?: string;
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
  alternate?: boolean;
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  itemCount?: number;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  id,
  badge,
  icon: Icon,
  iconColor = "text-[#F26336]",
  title,
  subtitle,
  viewAllLink,
  viewAllText = "See more",
  alternate = false,
  columns = 4,
  children,
  isLoading = false,
  emptyState,
  itemCount,
}) => {
  // Compute grid columns based on requested column count and actual items
  const getGridColsClass = () => {
    if (columns === 3) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6";
    }
    if (columns === 2) {
      return "grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-4xl";
    }
    // Default 4 columns: if only 1 item, don't stretch artificially
    if (itemCount === 1) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-md sm:max-w-none";
    }
    if (itemCount === 2) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-2xl sm:max-w-none";
    }
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6";
  };

  return (
    <section
      id={id}
      className={`w-full ${
        alternate
          ? "bg-[#F7F8FA] border-y border-[#E6E9EF] py-12 sm:py-16"
          : "py-10 sm:py-14"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div className="space-y-1">
            {badge && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF0E9] text-[#F26336] mb-1">
                {badge}
              </span>
            )}
            <div className="flex items-center gap-2">
              {Icon && <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />}
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#172033] tracking-tight">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#647084] max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#F26336] hover:text-[#DF4E27] shrink-0 group transition-colors self-start sm:self-end"
            >
              <span>{viewAllText}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {/* Content / Grid Area */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-84 rounded-2xl bg-[#F7F8FA] border border-[#E6E9EF] animate-pulse"
              />
            ))}
          </div>
        ) : itemCount === 0 && emptyState ? (
          emptyState
        ) : (
          <div className={getGridColsClass()}>{children}</div>
        )}
      </div>
    </section>
  );
};
