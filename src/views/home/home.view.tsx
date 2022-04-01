import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { useProvidersContext } from "src/contexts/providers.context";
import { useBridgeContext } from "src/contexts/bridge.context";
import { BigNumber } from "ethers";
import { ethers } from "ethers";
const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const { account } = useProvidersContext();

  const { bridge, claim } = useBridgeContext();

  const amount = BigNumber.from("1");
  const destinationNetwork = 1;
  const destinationAddress = "0x730F01feBde4caBcBa8240020854610BAC89BAb2";
  void bridge(ethers.constants.AddressZero, amount, destinationNetwork, destinationAddress, {
    value: amount,
  })
    .then((bridgeTx) => {
      console.log(bridgeTx);
      // void claim()
      // .then((claimTx) => {
      //   console.log(claimTx);
      // })
      // .catch(console.error);
    })
    .catch(console.error);

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
