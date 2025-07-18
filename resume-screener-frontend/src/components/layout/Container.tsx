// src/components/layout/Container.tsx
type Props = {
    children: React.ReactNode;
    className?: string;
};

export const Container = ({ children, className = "" }: Props) => {
    return (
        <div className={`max-w-7xl mx-auto px-6 ${className}`}>{children}</div>
    );
};
