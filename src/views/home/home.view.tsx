import useHomeStyles from "src/views/home/home.styles";
import Container from "src/views/shared/container/container.view";
import { ReactComponent as EthIcon } from "src/assets/icons/eth-icon.svg";
import Header from "src/views/home/components/header/header.view";
import TransactionActions from "src/views/home/components/transaction-actions/transaction-actions.view";

const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  return (
    <Container>
      <Header />
      <div className={classes.chainRow}>
        <div className={classes.chain}>
          <EthIcon />
          Ethereum chain
        </div>
      </div>
      <TransactionActions />
    </Container>
  );
};

export default Home;
