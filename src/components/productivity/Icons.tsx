import React from 'react';

const iconProps = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round" as "round",
  strokeLinejoin: "round" as "round",
};

export const Play = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
export const Pause = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
export const RotateCcw = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
);
export const BrainCircuit = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M12 5a3 3 0 1 0-5.9-1.4... (path data for brain circuit)"></path></svg>
);
export const ListTodo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><rect x="3" y="5" width="6" height="6" rx="1"></rect><path d="m3 17 2 2 4-4"></path><path d="M13 6h8"></path><path d="M13 12h8"></path><path d="M13 18h8"></path></svg>
);
export const CheckCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
export const Hourglass = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 2v2.34c0 .55-.22 1.07-.62 1.45l-4.13 3.84c-.78.72-.78 1.84 0 2.56l4.13 3.84c.4.38.62.9.62 1.45V22"></path><path d="M7 2v2.34c0 .55.22 1.07.62 1.45l4.13 3.84c.78.72.78 1.84 0 2.56l-4.13 3.84A1.99 1.99 0 0 1 7 17.66V22"></path></svg>
);
export const Plus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
export const X = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
export const Volume2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
);
export const Music = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
);
export const Power = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
);
export const PowerOff = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M18.36 6.64A9 9 0 1 1 5.64 6.64"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
);
export const Settings = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
export const Target = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
);
export const Lightbulb = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.2 18 9 18 8c0-2.2-1.8-4-4-4-1.2 0-2.3.5-3 1.3A4.5 4.5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.8 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
);
export const AlertTriangle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);
