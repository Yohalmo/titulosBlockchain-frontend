import React from "react";

export default function Icon({ name, size = 20 }) {
    const paths = {
        seal: (
            <>
                <path d="M12 3 4.5 7v5c0 4.6 3.2 7.7 7.5 9 4.3-1.3 7.5-4.4 7.5-9V7L12 3Z" />
                <path d="m9 12 2 2 4-4" />
            </>
        ),
        plus: <path d="M12 5v14M5 12h14" />,
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),
        blocks: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="8.5" y="14" width="7" height="7" rx="1" />
                <path d="M6.5 10v2h11v-2M12 12v2" />
            </>
        ),
        user: (
            <>
                <circle cx="12" cy="8" r="3" />
                <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
            </>
        ),
        school: (
            <>
                <path d="m3 10 9-5 9 5-9 5-9-5Z" />
                <path d="M7 12.5V17c3 2.5 7 2.5 10 0v-4.5M21 10v6" />
            </>
        ),
        calendar: (
            <>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
            </>
        ),
        arrow: <path d="m9 18 6-6-6-6" />,
        check: <path d="m5 12 4 4L19 6" />,
        file: (
            <>
                <path d="M6 2h8l4 4v16H6V2Z" />
                <path d="M14 2v5h5M9 13h6M9 17h6" />
            </>
        ),
        hash: <path d="M10 3 8 21M16 3l-2 18M4 9h16M3 15h16" />,
        server: (
            <>
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
            </>
        ),
        wallet: (
            <>
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M12 12h.01" />
            </>
        )
    };

    return (
        <svg
            className="icon"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
}