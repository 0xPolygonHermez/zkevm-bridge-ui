import { createUseStyles } from "react-jss";

const useTokenIconStyles = createUseStyles(() => ({
  icon: (size: number) => ({
    width: size * 4,
    height: size * 4,
  }),
}));

export default useTokenIconStyles;
