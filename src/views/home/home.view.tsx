import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import Typography from "src/views/shared/typography/typography.view";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();

  return (
    <>
      <Header />
      <div className={classes.ethereumAddress}>
        <MetaMaskIcon className={classes.metaMaskIcon} />
        <Typography type="body1">0x2387 ･･･ 5682</Typography>
      </div>
    </>
  );
};

export default Home;
