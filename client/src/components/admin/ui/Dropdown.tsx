import type React from "react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

interface DropdownProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
    isOpen,
    onClose,
    children,
    className = "",
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !(event.target as HTMLElement).closest(".dropdown-toggle")
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className={`absolute z-40 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`}
        >
            {children}
        </div>
    );
};

interface DropdownItemProps {
    tag?: "a" | "button";
    to?: string;
    onClick?: () => void;
    onItemClick?: () => void;
    baseClassName?: string;
    className?: string;
    children: React.ReactNode;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
    tag = "button",
    to,
    onClick,
    onItemClick,
    baseClassName = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900",
    className = "",
    children,
}) => {
    const combinedClasses = `${baseClassName} ${className}`.trim();

    const handleClick = (event: React.MouseEvent) => {
        if (tag === "button") {
            event.preventDefault();
        }
        if (onClick) onClick();
        if (onItemClick) onItemClick();
    };

    if (tag === "a" && to) {
        return (
            <Link to={to} className={combinedClasses} onClick={handleClick}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={handleClick} className={combinedClasses}>
            {children}
        </button>
    );
};
