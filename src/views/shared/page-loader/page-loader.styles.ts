import { createUseStyles } from "react-jss";

const usePageLoaderStyles = createUseStyles(() => ({
  root: {
    height: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default usePageLoaderStyles;
