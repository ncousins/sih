interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-lg border border-border shadow-sm p-6",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
