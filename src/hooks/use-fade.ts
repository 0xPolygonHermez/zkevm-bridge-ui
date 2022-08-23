import { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";

interface StylesProps {
  fadeDurationInSeconds: number;
}

const useFadeStyles = createUseStyles(() => ({
  fadeIn: {
    transition: ({ fadeDurationInSeconds }: StylesProps) =>
      `opacity ${fadeDurationInSeconds}s ease-in-out`,
  },
  fadeOut: {
    opacity: 0,
    transition: ({ fadeDurationInSeconds }: StylesProps) =>
      `opacity ${fadeDurationInSeconds}s ease-in-out`,
  },
}));

const useFade = ({
  fadeDurationInSeconds,
}: {
  fadeDurationInSeconds: number;
}) => {
  const styles = useFadeStyles({ fadeDurationInSeconds });
  const [show] = useState(true);
  const [isVisible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
    }
  }, [show]);

  const getClasses = (className = "") => {
    const fadeInClasses = `${styles.fadeIn} ${className}`;
    const fadeOutClasses = `${styles.fadeOut} ${className}`;
    const visibleProps = {
      className: show ? fadeInClasses : fadeOutClasses,
    };

    const invisibleProps = {
      className: show ? fadeOutClasses : fadeInClasses,
    };
    return { visibleProps, invisibleProps };
  };

  return { isVisible, setVisible, getClasses };
};

export default useFade;
