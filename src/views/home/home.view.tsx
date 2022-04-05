import useHomeStyles from "src/views/home/home.styles";
import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import Header from "src/views/home/components/header/header.view";
import Cards from "src/views/home/components/cards/cards.view";
import Typography from "src/views/shared/typography/typography.view";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { useProvidersContext } from "src/contexts/providers.context";
import Button from "src/views/shared/button/button.view";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const { account } = useProvidersContext();

  return (
    <>
      <Header />
      {account.status === "successful" && (
        <div className={classes.ethereumAddress}>
          <MetaMaskIcon className={classes.metaMaskIcon} />
          <Typography type="body1">{getPartiallyHiddenEthereumAddress(account.data)}</Typography>
        </div>
      )}
      <div className={classes.cards}>
        <Cards />
      </div>
      <div className={classes.button}>
        <Button onClick={() => null}>Continue</Button>
      </div>
    </>
  );
};

export default Home;
