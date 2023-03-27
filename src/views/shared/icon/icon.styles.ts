import { createUseStyles } from "react-jss";

export const useIconStyles = createUseStyles({
  icon: (size: number) => ({
    height: size,
    width: size,
  }),
  roundedWrapper: {
    alignItems: "center",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    overflow: "hidden",
  },
});
