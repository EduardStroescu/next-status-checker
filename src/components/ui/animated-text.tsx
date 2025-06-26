import { cn } from "@/lib/utils";

export default function AnimatedText({
  children,
  as,
  className,
  duration = 750,
  delay = 50,
}: {
  children: string;
  as: React.ElementType;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const Element = as;
  const letters = children.split("");

  return (
    <Element
      className={cn("animate-in slide-in-from-right-8 duration-750", className)}
    >
      {letters.map((char, idx) => (
        <span
          key={char + "-" + idx}
          style={{
            transitionDelay: `${idx * delay}ms`,
            transitionDuration: `${duration}ms`,
          }}
          className="inline-block starting:opacity-0 opacity-100 transition-opacity"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
      <span className="sr-only">{children}</span>
    </Element>
  );
}
