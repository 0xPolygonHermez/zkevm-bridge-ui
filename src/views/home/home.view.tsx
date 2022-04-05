import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { useProvidersContext } from "src/contexts/providers.context";
import { useEffect } from "react";
import { useBridgeContext } from "src/contexts/bridge.context";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const { getClaims, getMerkleProof } = useBridgeContext();
  const { account } = useProvidersContext();

  useEffect(() => {
    void getClaims({ ethereumAddress: "0xabCcEd19d7f290B84608feC510bEe872CC8F5112" }).then(
      console.log
    );
    void getMerkleProof({ originNetwork: 0, depositCount: 2 }).then(console.log);
  });

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
