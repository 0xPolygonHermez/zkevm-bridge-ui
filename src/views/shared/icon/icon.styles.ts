import { createUseStyles } from "react-jss";

const useIconStyles = createUseStyles({
  icon: (size: number) => ({
    height: size,
    width: size,
  }),
});

export default useIconStyles;
