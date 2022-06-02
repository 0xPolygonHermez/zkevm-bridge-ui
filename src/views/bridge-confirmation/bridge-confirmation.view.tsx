import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import useBridgeConfirmationStyles from "src/views/bridge-confirmation/bridge-confirmation.styles";
import Header from "src/views/shared/header/header.view";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";
import Button from "src/views/shared/button/button.view";
import Error from "src/views/shared/error/error.view";
import Icon from "src/views/shared/icon/icon.view";
import { getChainName, getCurrencySymbol } from "src/utils/labels";
import { formatTokenAmount } from "src/utils/amounts";
import {
  isMetamaskUserRejectedRequestError,
  isMetamaskInsufficientAllowanceError,
} from "src/utils/types";
import { parseError } from "src/adapters/error";
import { getCurrency } from "src/adapters/storage";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { ETH_TOKEN_LOGO_URI, getChainTokens } from "src/constants";
import { roundFiat } from "src/utils/amounts";

const BridgeConfirmation: FC = () => {
  const classes = useBridgeConfirmationStyles();
  const navigate = useNavigate();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { bridge } = useBridgeContext();
  const { formData, setFormData } = useFormContext();
  const { account, connectedProvider } = useProvidersContext();
  const { getTokenPrice } = usePriceOracleContext();
  const [fiatAmount, setFiatAmount] = useState<number>();
  const [fiatFee, setFiatFee] = useState<number>();
  const [error, setError] = useState<string>();
  const currencySymbol = getCurrencySymbol(getCurrency());

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
            if (isMetamaskInsufficientAllowanceError(error)) {
              const network = getChainName(from);
              setError(
                `You do not have enough Ether in ${network} to pay the "Allowance" transaction fee. Please send some Ether to ${network} and try again`
              );
            } else {
              void parseError(error).then((parsed) => {
                if (parsed === "wrong-network") {
                  setError(`Switch to ${getChainName(from)} to continue`);
                } else {
                  notifyError(error);
                }
              });
            }
          }
        });
    }
  };

  useEffect(() => {
    if (formData) {
      if (formData.from.chainId === connectedProvider?.chainId) {
        setError(undefined);
      }
    }
  }, [connectedProvider, formData]);

  useEffect(() => {
    if (!formData) {
      navigate(routes.home.path);
    }
  }, [navigate, formData]);

  useEffect(() => {
    if (formData) {
      // fiat amount
      getTokenPrice({ token: formData.token, chain: formData.from })
        .then((tokenFiatPrice) => {
          const tokenAmount = Number(formatTokenAmount(formData.amount, formData.token));
          setFiatAmount(tokenFiatPrice * tokenAmount);
        })
        .catch(() => setFiatAmount(undefined));
      // fiat fee
      const weth = getChainTokens(formData.from).find((t) => t.symbol === "WETH");
      if (weth) {
        getTokenPrice({ token: weth, chain: formData.from })
          .then((tokenFiatPrice) => {
            const feeAmount = Number(formatTokenAmount(formData.estimatedFee, weth));
            setFiatFee(tokenFiatPrice * feeAmount);
          })
          .catch(() => setFiatFee(undefined));
      }
    }
  }, [formData, getTokenPrice]);

  if (!formData || !env) {
    return null;
  }

  return (
    <>
      <Header title="Confirm Bridge" backTo="home" />
      <Card className={classes.card}>
        <Icon url={formData.token.logoURI} size={46} className={classes.icon} />
        <Typography type="h1">
          {`${formatTokenAmount(formData.amount, formData.token)} ${formData.token.symbol}`}
        </Typography>
        <Typography type="h2" className={classes.fiat}>{`${currencySymbol}${
          fiatAmount ? roundFiat(fiatAmount) : "--"
        }`}</Typography>
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
            <Icon url={ETH_TOKEN_LOGO_URI} size={20} />
            {`${formatTokenAmount(formData.estimatedFee, formData.token)} ETH ~ ${currencySymbol}${
              fiatFee ? roundFiat(fiatFee) : "--"
            }`}
          </Typography>
        </div>
      </Card>
      <div className={classes.button}>
        <Button onClick={onClick}>Bridge</Button>
        {error && <Error error={error} />}
      </div>
    </>
  );
};

export default BridgeConfirmation;
