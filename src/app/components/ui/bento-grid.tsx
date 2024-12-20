// bento-grid.tsx
import { cn } from "@/lib/utils";
import React from "react";

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoGridItemProps {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  category?: string;
}

export const BentoGridItem: React.FC<BentoGridItemProps> = ({
  className,
  title = "Untitled",
  description = "No description provided",
  header,
  icon,
  category,
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input p-4 bg-white border justify-between flex flex-col space-y-4",
        className
      )}
      aria-label={typeof title === "string" ? title : "Bento Grid Item"}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon && <div className="mb-2">{icon}</div>}
        {category && (
          <div className="inline-block mb-2">
            <span className="inline-block border border-gray-300 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
              {category}
            </span>
          </div>
        )}
        <div className="font-sans font-bold text-neutral-600 mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-neutral-600 text-xs">
          {description}
        </div>
      </div>
    </div>
  );
};
