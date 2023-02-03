import { createUseStyles } from "react-jss";

export const useIconStyles = createUseStyles({
  icon: (size: number) => ({
    height: size,
    width: size,
  }),
});
