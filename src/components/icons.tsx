import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M9.6,7.2V5.4A3.6,3.6,0,0,1,13.2,1.8h1.8a5.4,5.4,0,0,0,5.4-5.4V-5.4H18.6v1.8a3.6,3.6,0,0,1-3.6,3.6H13.2a1.8,1.8,0,0,0-1.8,1.8v9a1.8,1.8,0,0,0,1.8,1.8h1.8a3.6,3.6,0,0,1,3.6,3.6v1.8h1.8V22.2A5.4,5.4,0,0,0,15,16.8H13.2a3.6,3.6,0,0,1-3.6-3.6V7.2ZM4.2,1.8A5.4,5.4,0,0,0,9.6,7.2V16.8a5.4,5.4,0,0,0,5.4,5.4h1.8V24H15a7.2,7.2,0,0,1-7.2-7.2V7.2A7.2,7.2,0,0,1,15,0h1.8V1.8H15a5.4,5.4,0,0,0-5.4,5.4v9.9a5.4,5.4,0,0,0-5.4-5.4H2.4V1.8Z" transform="translate(-2.4 0)"/>
    </svg>
  );
}
