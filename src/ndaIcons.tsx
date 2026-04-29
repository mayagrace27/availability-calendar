import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function MobileMenuIcon({ className, ...p }: IconProps) {
  return (
    <svg
      className={className}
      width={19}
      height={12}
      viewBox="0 0 19 12"
      fill="none"
      aria-hidden
      {...p}
    >
      <path
        d="M0.5 1.6h18M0.5 6.4h18M0.5 11.2h11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CarouselNavArrow({ className, left, ...p }: IconProps & { left: boolean }) {
  return (
    <svg
      className={className}
      width={27}
      height={27}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...p}
    >
      {left ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}

export function HeaderPhoneIcon({ className, ...p }: IconProps) {
  return (
    <svg
      className={className}
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...p}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.68A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.86.35 1.7.7 2.5a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.8.35 1.64.6 2.5.7A2 2 0 0 1 22 16.9z" />
    </svg>
  );
}
