function useIntersection({
  observed,
  target,
  className,
}: {
  observed: React.RefObject<HTMLDivElement>;
  target: React.RefObject<HTMLDivElement>;
  className: string;
}): void {
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry && entry.boundingClientRect.y < 0) {
      target.current && target.current.classList.add(className);
    } else {
      target.current && target.current.classList.remove(className);
    }
  });
  if (observed.current) {
    observer.observe(observed.current);
  }
}

export default useIntersection;
