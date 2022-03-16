import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { useEthereumProviderContext } from "src/contexts/ethereum-provider.context";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const { account } = useEthereumProviderContext();

  return (
    <>
      <Header />
      {account.status === "successful" && (
        <div className={classes.ethereumAddress}>
          <MetaMaskIcon className={classes.metaMaskIcon} />
          <Typography type="body1">{getPartiallyHiddenEthereumAddress(account.data)}</Typography>
        </div>
      )}
    </>
  );
};

export default Home;
