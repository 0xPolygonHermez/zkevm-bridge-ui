import { createUseStyles } from "react-jss";

const useIconStyles = createUseStyles({
  icon: (size: number) => ({
    width: size,
    height: size,
  }),
});

export default useIconStyles;
