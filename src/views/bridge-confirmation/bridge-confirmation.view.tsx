import { FC, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BigNumber, constants as ethersConstants } from "ethers";

import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import Header from "src/views/shared/header/header.view";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";
import Error from "src/views/shared/error/error.view";
import Icon from "src/views/shared/icon/icon.view";
import { getChainName, getCurrencySymbol } from "src/utils/labels";
import { formatTokenAmount, formatFiatAmount, multiplyAmounts } from "src/utils/amounts";
import { AsyncTask, isMetamaskUserRejectedRequestError } from "src/utils/types";
import { parseError } from "src/adapters/error";
import { getCurrency } from "src/adapters/storage";
import { formDataRouterStateParser, serializeFormData } from "src/adapters/browser";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useUIContext } from "src/contexts/ui.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { ETH_TOKEN_LOGO_URI, FIAT_DISPLAY_PRECISION, getEtherToken } from "src/constants";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import BridgeButton from "src/views/bridge-confirmation/components/bridge-button/bridge-button.view";
import useBridgeConfirmationStyles from "src/views/bridge-confirmation/bridge-confirmation.styles";
import ApprovalInfo from "src/views/bridge-confirmation/components/approval-info/approval-info.view";

const BridgeConfirmation: FC = () => {
  const callIfMounted = useCallIfMounted();
  const classes = useBridgeConfirmationStyles();
  const navigate = useNavigate();
  const { state: routerState } = useLocation();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { bridge } = useBridgeContext();
  const { tokens } = useTokensContext();
  const { openSnackbar } = useUIContext();
  const { account, connectedProvider } = useProvidersContext();
  const { getTokenPrice } = usePriceOracleContext();
  const { approve, isContractAllowedToSpendToken } = useTokensContext();
  const [fiatAmount, setFiatAmount] = useState<BigNumber>();
  const [fiatFee, setFiatFee] = useState<BigNumber>();
  const [error, setError] = useState<string>();
  const [hasAllowanceTask, setHasAllowanceTask] = useState<AsyncTask<boolean, string>>({
    status: "pending",
  });
  const [approvalTask, setApprovalTask] = useState<AsyncTask<null, string>>({
    status: "pending",
  });
  const currencySymbol = getCurrencySymbol(getCurrency());

  const parsedFormData = useMemo(
    () => (env ? formDataRouterStateParser(env).safeParse(routerState) : undefined),
    [env, routerState]
  );
  if (parsedFormData?.success === false) {
    notifyError(parsedFormData.error);
  }
  const formData =
    parsedFormData?.success && parsedFormData.data !== null ? parsedFormData.data : undefined;

  useEffect(() => {
    if (
      formData &&
      account.status === "successful" &&
      formData.token.address !== ethersConstants.AddressZero
    ) {
      const { from, token, amount } = formData;

      setHasAllowanceTask({ status: "loading" });
      void isContractAllowedToSpendToken({
        provider: from.provider,
        token: token,
        amount: amount,
        owner: account.data,
        spender: from.contractAddress,
      })
        .then((isAllowed) => setHasAllowanceTask({ status: "successful", data: isAllowed }))
        .catch((error) => {
          void parseError(error).then((parsed) => {
            setHasAllowanceTask({ status: "failed", error: parsed });
            notifyError(parsed);
          });
        });
    }
  }, [formData, account, isContractAllowedToSpendToken, notifyError]);

  useEffect(() => {
    if (formData && formData.from.chainId === connectedProvider?.chainId) {
      setError(undefined);
    }
  }, [connectedProvider, formData]);

  useEffect(() => {
    if (!formData) {
      navigate(routes.home.path);
    }
  }, [navigate, formData]);

  useEffect(() => {
    if (formData) {
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
  }, [formData, getTokenPrice, callIfMounted, tokens]);

  const onApprove = () => {
    if (connectedProvider && account.status === "successful" && formData) {
      setApprovalTask({ status: "loading" });
      const { token, amount, from } = formData;
      void approve({
        from,
        token,
        owner: account.data,
        spender: from.contractAddress,
        provider: connectedProvider.provider,
        amount,
      })
        .then(() => {
          setApprovalTask({ status: "successful", data: null });
          setHasAllowanceTask({ status: "successful", data: true });
        })
        .catch((error) => {
          if (isMetamaskUserRejectedRequestError(error)) {
            setApprovalTask({ status: "pending" });
          } else {
            void parseError(error).then((parsed) => {
              if (parsed === "wrong-network") {
                setError(`Switch to ${getChainName(from)} to continue`);
                setApprovalTask({ status: "pending" });
              } else {
                setApprovalTask({ status: "failed", error: parsed });
                notifyError(parsed);
              }
            });
          }
        });
    }
  };

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

  if (!formData || !env) {
    return null;
  }

  const { token, amount, from, to, estimatedFee } = formData;
  const tokenAmountString = `${formatTokenAmount(amount, token)} ${token.symbol}`;
  const fiatAmountString = `${currencySymbol}${fiatAmount ? formatFiatAmount(fiatAmount) : "--"}`;
  const eth = getEtherToken(from);
  const feeString = `${formatTokenAmount(estimatedFee, eth)} ${eth.symbol} ~ ${currencySymbol}${
    fiatFee ? formatFiatAmount(fiatFee) : "--"
  }`;

  return (
    <div className={classes.contentWrapper}>
      <Header
        title="Confirm Bridge"
        backTo={{ routeKey: "home", state: serializeFormData(formData) }}
      />
      <Card className={classes.card}>
        <Icon url={token.logoURI} size={46} className={classes.tokenIcon} />
        <Typography type="h1">{tokenAmountString}</Typography>
        <Typography type="body2" className={classes.fiat}>
          {fiatAmountString}
        </Typography>
        <div className={classes.chainsRow}>
          <div className={classes.chainBox}>
            <from.Icon />
            <Typography type="body1">{getChainName(from)}</Typography>
          </div>
          <ArrowRightIcon className={classes.arrowIcon} />
          <div className={classes.chainBox}>
            <to.Icon />
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
        <BridgeButton
          token={token}
          hasAllowanceTask={hasAllowanceTask}
          approvalTask={approvalTask}
          onApprove={onApprove}
          onBridge={onBridge}
        />
        {token.address !== ethersConstants.AddressZero &&
          hasAllowanceTask.status === "successful" &&
          !hasAllowanceTask.data && <ApprovalInfo />}
        {error && <Error error={error} />}
      </div>
    </div>
  );
};

export default BridgeConfirmation;
