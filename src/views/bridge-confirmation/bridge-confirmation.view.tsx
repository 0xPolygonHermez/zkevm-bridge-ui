import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BigNumber } from "ethers";

import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import useBridgeConfirmationStyles from "src/views/bridge-confirmation/bridge-confirmation.styles";
import Header from "src/views/shared/header/header.view";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";
import Error from "src/views/shared/error/error.view";
import Icon from "src/views/shared/icon/icon.view";
import { getChainName, getCurrencySymbol } from "src/utils/labels";
import { formatTokenAmount, formatFiatAmount, multiplyAmounts } from "src/utils/amounts";
import { isMetamaskUserRejectedRequestError } from "src/utils/types";
import { parseError } from "src/adapters/error";
import { getCurrency } from "src/adapters/storage";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useUIContext } from "src/contexts/ui.context";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { ETH_TOKEN_LOGO_URI, FIAT_DISPLAY_PRECISION } from "src/constants";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import BridgeButton from "src/views/bridge-confirmation/components/bridge-button.view";

const BridgeConfirmation: FC = () => {
  const callIfMounted = useCallIfMounted();
  const classes = useBridgeConfirmationStyles();
  const navigate = useNavigate();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { bridge, tokens } = useBridgeContext();
  const { formData, setFormData } = useFormContext();
  const { openSnackbar } = useUIContext();
  const { account, connectedProvider } = useProvidersContext();
  const { getTokenPrice } = usePriceOracleContext();
  const [fiatAmount, setFiatAmount] = useState<BigNumber>();
  const [fiatFee, setFiatFee] = useState<BigNumber>();
  const [error, setError] = useState<string>();
  const currencySymbol = getCurrencySymbol(getCurrency());

  const onBridge = () => {
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
          openSnackbar({
            type: "success-msg",
            text: "Transaction successfully submitted.\nThe list will be updated once it is processed.",
          });
          navigate(routes.activity.path);
          setFormData(undefined);
        })
        .catch((error) => {
          if (isMetamaskUserRejectedRequestError(error) === false) {
            void parseError(error).then((parsed) => {
              if (parsed === "wrong-network") {
                callIfMounted(() => {
                  setError(`Switch to ${getChainName(from)} to continue`);
                });
              } else {
                callIfMounted(() => {
                  notifyError(error);
                });
              }
            });
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
    if (env !== undefined && formData) {
      const { token, amount, from, estimatedFee } = formData;
      // fiat amount
      getTokenPrice({ token, chain: from })
        .then((tokenPrice) => {
          callIfMounted(() => {
            setFiatAmount(
              multiplyAmounts(
                {
                  value: tokenPrice,
                  precision: FIAT_DISPLAY_PRECISION,
                },
                {
                  value: amount,
                  precision: token.decimals,
                },
                FIAT_DISPLAY_PRECISION
              )
            );
          });
        })
        .catch(() =>
          callIfMounted(() => {
            setFiatAmount(undefined);
          })
        );
      // fiat fee
      const weth = tokens?.find((t) => t.symbol === "WETH");
      if (weth) {
        getTokenPrice({ token: weth, chain: from })
          .then((tokenPrice) => {
            callIfMounted(() => {
              setFiatFee(
                multiplyAmounts(
                  {
                    value: tokenPrice,
                    precision: FIAT_DISPLAY_PRECISION,
                  },
                  {
                    value: estimatedFee,
                    precision: weth.decimals,
                  },
                  FIAT_DISPLAY_PRECISION
                )
              );
            });
          })
          .catch(() =>
            callIfMounted(() => {
              setFiatFee(undefined);
            })
          );
      }
    }
  }, [env, formData, getTokenPrice, callIfMounted, tokens]);

  if (!formData || !env) {
    return null;
  }

  const { token, amount, from, to, estimatedFee } = formData;
  const tokenAmountString = `${formatTokenAmount(amount, token)} ${token.symbol}`;
  const fiatAmountString = `${currencySymbol}${fiatAmount ? formatFiatAmount(fiatAmount) : "--"}`;
  const feeString = `${formatTokenAmount(estimatedFee, token)} ETH ~ ${currencySymbol}${
    fiatFee ? formatFiatAmount(fiatFee) : "--"
  }`;

  return (
    <div className={classes.contentWrapper}>
      <Header title="Confirm Bridge" backTo="home" />
      <Card className={classes.card}>
        <Icon url={token.logoURI} size={46} className={classes.tokenIcon} />
        <Typography type="h1">{tokenAmountString}</Typography>
        <Typography type="body2" className={classes.fiat}>
          {fiatAmountString}
        </Typography>
        <div className={classes.chainsRow}>
          <div className={classes.chainBox}>
            <formData.from.Icon />
            <Typography type="body1">{getChainName(from)}</Typography>
          </div>
          <ArrowRightIcon className={classes.arrowIcon} />
          <div className={classes.chainBox}>
            <formData.to.Icon />
            <Typography type="body1">{getChainName(to)}</Typography>
          </div>
        </div>
        <div className={classes.feeBlock}>
          <Typography type="body2">Estimated gas fee</Typography>
          <div className={classes.fee}>
            <Icon url={ETH_TOKEN_LOGO_URI} size={20} />
            <Typography type="body1">{feeString}</Typography>
          </div>
        </div>
      </Card>
      <div className={classes.button}>
        {account.status === "successful" && (
          <BridgeButton
            from={formData.from}
            token={formData.token}
            account={account.data}
            onBridge={onBridge}
          />
        )}
        {error && <Error error={error} />}
      </div>
    </div>
  );
};

export default BridgeConfirmation;
