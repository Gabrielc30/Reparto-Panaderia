import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps, children: ReactNode) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconBox(props: IconProps) {
  return base(
    props,
    <>
      <path d="M12 3 L21 7.5 L21 16.5 L12 21 L3 16.5 L3 7.5 Z" />
      <path d="M3 7.5 L12 12 L21 7.5" />
      <path d="M12 12 L12 21" />
    </>,
  )
}

export function IconDocument(props: IconProps) {
  return base(
    props,
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </>,
  )
}

export function IconCalendar(props: IconProps) {
  return base(
    props,
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>,
  )
}

export function IconFactory(props: IconProps) {
  return base(
    props,
    <>
      <path d="M3 21 V11 L9 15 V11 L15 15 V8 L21 12 V21 Z" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </>,
  )
}

export function IconClock(props: IconProps) {
  return base(
    props,
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5 V12 L15 14" />
    </>,
  )
}

export function IconBars(props: IconProps) {
  return base(
    props,
    <>
      <rect x="4" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="7" width="4" height="13" rx="1" />
      <rect x="16" y="3" width="4" height="17" rx="1" />
    </>,
  )
}

export function IconUsers(props: IconProps) {
  return base(
    props,
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20 C3.5 16 6 14 9 14 C12 14 14.5 16 14.5 20" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15 14.2 C17.5 14 20.5 15.5 20.5 20" />
    </>,
  )
}

export function IconAlertTriangle(props: IconProps) {
  return base(
    props,
    <>
      <path d="M12 4 L21 20 H3 Z" />
      <line x1="12" y1="10" x2="12" y2="15" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </>,
  )
}

export function IconTrendingUp(props: IconProps) {
  return base(
    props,
    <>
      <path d="M4 16 L9 10 L13 13 L20 5" />
      <path d="M15 5 H20 V10" />
    </>,
  )
}

export function IconTruck(props: IconProps) {
  return base(
    props,
    <>
      <rect x="2" y="8" width="11" height="8" rx="1" />
      <path d="M13 11 H17 L20 14 V16 H13 Z" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </>,
  )
}

export function IconBread(props: IconProps) {
  return base(
    props,
    <>
      <path d="M4 13 C4 8 7.5 5 12 5 C16.5 5 20 8 20 13 V17 C20 18.5 18.5 19.5 17 19.5 H7 C5.5 19.5 4 18.5 4 17 Z" />
      <path d="M9 10.5 C9.5 9.5 10.5 9 12 9 C13.5 9 14.5 9.5 15 10.5" />
    </>,
  )
}

export function IconSettings(props: IconProps) {
  return base(
    props,
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3 V5.5 M12 18.5 V21 M21 12 H18.5 M5.5 12 H3 M18.4 5.6 L16.6 7.4 M7.4 16.6 L5.6 18.4 M18.4 18.4 L16.6 16.6 M7.4 7.4 L5.6 5.6" />
    </>,
  )
}
