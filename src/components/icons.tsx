import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM19.5 8.5L12 12.5L4.5 8.5L12 4.5L19.5 8.5Z" />
    </svg>
  );
}
