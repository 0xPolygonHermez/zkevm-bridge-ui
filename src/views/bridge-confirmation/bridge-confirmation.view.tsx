import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import useBridgeConfirmationStyles from "src/views/bridge-confirmation/bridge-confirmation.styles";
import Header from "src/views/shared/header/header.view";
import { useFormContext } from "src/contexts/form.context";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";
import Button from "src/views/shared/button/button.view";
import Error from "src/views/shared/error/error.view";
import { useProvidersContext } from "src/contexts/providers.context";
import Icon from "src/views/shared/icon/icon.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { getChainName } from "src/utils/labels";
import { formatTokenAmount } from "src/utils/amounts";
import { isMetamaskUserRejectedRequestError } from "src/utils/types";
import { parseError } from "src/adapters/error";
import { useErrorContext } from "src/contexts/error.context";

const BridgeConfirmation: FC = () => {
  const classes = useBridgeConfirmationStyles();
  const navigate = useNavigate();
  const { notifyError } = useErrorContext();
  const { bridge } = useBridgeContext();
  const { formData, setFormData } = useFormContext();
  const { account, connectedProvider } = useProvidersContext();
  const [incorrectNetworkMessage, setIncorrectNetworkMessage] = useState<string>();

  const onClick = () => {
    if (formData && account.status === "successful") {
      const { token, amount, from, to } = formData;
      bridge({
        from,
        token,
        amount,
        to,
        destinationAddress: account.data,
      })
        .then(() => {
          navigate(routes.activity.path);
          setFormData(undefined);
        })
        .catch((error) => {
          if (isMetamaskUserRejectedRequestError(error) === false) {
            void parseError(error).then((parsed) => {
              if (parsed === "wrong-network") {
                setIncorrectNetworkMessage(`Switch to ${getChainName(from)} to continue`);
              } else {
                notifyError(error);
              }
            });
          }
        });
    }
  };

  useEffect(() => {
    if (formData) {
      if (formData.from.chainId === connectedProvider?.chainId) {
        setIncorrectNetworkMessage(undefined);
      }
    }
  }, [connectedProvider, formData]);

  useEffect(() => {
    if (!formData) {
      navigate(routes.home.path);
    }
  }, [navigate, formData]);

  if (!formData) {
    return null;
  }

  return (
    <>
      <Header title="Confirm Bridge" backTo="home" />
      <Card className={classes.card}>
        <Icon url={formData.token.logoURI} size={46} className={classes.icon} />
        <Typography type="h1">
          {`${formatTokenAmount(formData.amount, formData.token)} ${
            formData.token.symbol
          }`}
        </Typography>
        <div className={classes.chainsRow}>
          <div className={classes.chainBox}>
            <formData.from.Icon /> {getChainName(formData.from)}
          </div>
          <ArrowRightIcon className={classes.arrow} />
          <div className={classes.chainBox}>
            <formData.to.Icon /> {getChainName(formData.to)}
          </div>
        </div>
        <div className={classes.fees}>
          <Typography type="body2" className={classes.betweenFees}>
            Estimated gas fee
          </Typography>
          <Typography type="body1" className={classes.fee}>
            <Icon url={formData.token.logoURI} size={20} />
            {`~ ${formatTokenAmount(formData.estimatedFee, formData.token)} ${
              formData.token.symbol
            }`}
          </Typography>
        </div>
      </Card>
      <div className={classes.button}>
        <Button onClick={onClick}>Bridge</Button>
        {incorrectNetworkMessage && <Error error={incorrectNetworkMessage} />}
      </div>
    </>
  );
};

export default BridgeConfirmation;
