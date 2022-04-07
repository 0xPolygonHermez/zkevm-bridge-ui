import { createUseStyles } from "react-jss";

const useTokenIconStyles = createUseStyles(() => ({
  icon: (size: number) => ({
    width: size,
    height: size,
  }),
}));

export default useTokenIconStyles;
