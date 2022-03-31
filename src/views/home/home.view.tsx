import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { useProvidersContext } from "src/contexts/providers.context";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEffect } from "react";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const { account } = useProvidersContext();
  const { getBridges } = useBridgeContext();

  useEffect(() => {
    getBridges({ ethereumAddress: "0xeB17ce701E9D92724AA2ABAdA7E4B28830597Dd9" })
      .then(console.log)
      .catch(console.error);
  }, [getBridges]);

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
