import React from "react";

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <table className={`w-full ${className}`}>{children}</table>
);

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <thead className={`${className}`}>{children}</thead>
);

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <tbody className={`${className}`}>{children}</tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <tr className={`${className}`}>{children}</tr>
);

export const TableCell: React.FC<{
    children: React.ReactNode;
    className?: string;
    isHeader?: boolean;
    colSpan?: number;
}> = ({ children, className = "", isHeader = false, colSpan }) => {
    if (isHeader) {
        return <th colSpan={colSpan} className={`${className}`}>{children}</th>;
    }
    return <td colSpan={colSpan} className={`${className}`}>{children}</td>;
};
