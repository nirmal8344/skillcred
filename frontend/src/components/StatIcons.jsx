import React from 'react';

/**
 * 2D Solid Filled Statistic Card Icons matching the reference image exactly:
 * - Enrolled Courses: Vibrant blue briefcase with top handle and two white stripes
 * - In Progress: Solid indigo circle with white clock hands (12:00 and ~4:30)
 * - Completed: Solid vibrant green circle with crisp bold white checkmark
 * - Certificates: Solid warm amber notched ribbon banner with white checkmark
 */

export const EnrolledIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 38 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* Top handle with transparent cutout */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.5 11V6C12.5 3.79086 14.2909 2 16.5 2H21.5C23.7091 2 25.5 3.79086 25.5 6V11H12.5ZM15.5 8.5V6C15.5 5.44772 15.9477 5 16.5 5H21.5C22.0523 5 22.5 5.44772 22.5 6V8.5H15.5Z"
      fill="#0B6BFB"
    />
    {/* Main briefcase body */}
    <rect x="3" y="9" width="32" height="26" rx="7" fill="#0B6BFB" />
    {/* Inner white horizontal accent bars */}
    <rect x="9.5" y="17.5" width="19" height="2.5" rx="1.25" fill="#FFFFFF" />
    <rect x="9.5" y="24" width="13" height="2.5" rx="1.25" fill="#FFFFFF" />
  </svg>
);

export const InProgressIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 38 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* Solid indigo circle */}
    <circle cx="19" cy="19" r="17" fill="#2F50CF" />
    {/* White clock hands: 12:00 and 4:30 */}
    <path
      d="M19 10V19.5L25.5 24"
      stroke="#FFFFFF"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CompletedIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 38 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* Solid green circle */}
    <circle cx="19" cy="19" r="17" fill="#0ABF89" />
    {/* Crisp bold white checkmark */}
    <path
      d="M11.5 19.5L16.5 24.5L26.5 14.5"
      stroke="#FFFFFF"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CertificatesIcon = () => (
  <svg
    width="26"
    height="30"
    viewBox="0 0 34 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* Solid amber ribbon with notched bottom */}
    <path
      d="M3.5 4C3.5 1.79086 5.29086 0 7.5 0H26.5C28.7091 0 30.5 1.79086 30.5 4V35.5C30.5 36.3 29.5 36.8 28.8 36.3L17 28L5.2 36.3C4.5 36.8 3.5 36.3 3.5 35.5V4Z"
      fill="#D48905"
    />
    {/* Crisp bold white checkmark */}
    <path
      d="M10.5 17.5L15 22L23.5 13.5"
      stroke="#FFFFFF"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
