import { FC, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BigNumber, constants as ethersConstants } from "ethers";

import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import Header from "src/views/shared/header/header.view";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";
import PageLoader from "src/views/shared/page-loader/page-loader.view";
import Error from "src/views/shared/error/error.view";
import Icon from "src/views/shared/icon/icon.view";
import { getChainName, getCurrencySymbol } from "src/utils/labels";
import { formatTokenAmount, formatFiatAmount, multiplyAmounts } from "src/utils/amounts";
import { selectTokenAddress } from "src/utils/tokens";
import {
  AsyncTask,
  isMetamaskUserRejectedRequestError,
  isAsyncTaskDataAvailable,
  isEthersInsufficientFundsError,
} from "src/utils/types";
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
import {
  ETH_TOKEN_LOGO_URI,
  FIAT_DISPLAY_PRECISION,
  AUTO_REFRESH_RATE,
  getEtherToken,
} from "src/constants";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import BridgeButton from "src/views/bridge-confirmation/components/bridge-button/bridge-button.view";
import useBridgeConfirmationStyles from "src/views/bridge-confirmation/bridge-confirmation.styles";
import ApprovalInfo from "src/views/bridge-confirmation/components/approval-info/approval-info.view";

const USE_FADE_DURATION_IN_SECONDS = 0.5;

const BridgeConfirmation: FC = () => {
  const callIfMounted = useCallIfMounted();
  const classes = useBridgeConfirmationStyles({
    fadeDurationInSeconds: USE_FADE_DURATION_IN_SECONDS,
  });
  const navigate = useNavigate();
  const { state: routerState } = useLocation();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { bridge, estimateBridgeGasPrice } = useBridgeContext();
  const { openSnackbar } = useUIContext();
  const { account, connectedProvider } = useProvidersContext();
  const { getTokenPrice } = usePriceOracleContext();
  const { approve, isContractAllowedToSpendToken, getErc20TokenBalance, tokens } =
    useTokensContext();
  const [isFadeVisible, setIsFadeVisible] = useState(true);
  const [tokenBalance, setTokenBalance] = useState<BigNumber>();
  const [bridgedTokenFiatPrice, setBridgedTokenFiatPrice] = useState<BigNumber>();
  const [etherTokenFiatPrice, setEtherTokenFiatPrice] = useState<BigNumber>();
  const [error, setError] = useState<string>();
  const [hasAllowanceTask, setHasAllowanceTask] = useState<AsyncTask<boolean, string>>({
    status: "pending",
  });
  const [approvalTask, setApprovalTask] = useState<AsyncTask<null, string>>({
    status: "pending",
  });
  const [estimatedFee, setEstimatedFee] = useState<AsyncTask<BigNumber, string>>({
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
    /*
     *  Load the balance of the token when it's not available
     */
    if (formData?.token.balance) {
      setTokenBalance(formData.token.balance);
    } else if (formData && isAsyncTaskDataAvailable(account)) {
      const { from, token } = formData;
      const isTokenEther = token.address === ethersConstants.AddressZero;
      if (isTokenEther) {
        void from.provider
          .getBalance(account.data)
          .then((balance) =>
            callIfMounted(() => {
              setTokenBalance(balance);
            })
          )
          .catch((error) => {
            callIfMounted(() => {
              notifyError(error);
              setTokenBalance(undefined);
            });
          });
      } else {
        getErc20TokenBalance({
          chain: from,
          tokenAddress: selectTokenAddress(token, from),
          accountAddress: account.data,
        })
          .then((balance) =>
            callIfMounted(() => {
              setTokenBalance(balance);
            })
          )
          .catch(() =>
            callIfMounted(() => {
              setTokenBalance(undefined);
            })
          );
      }
    }
  }, [account, formData, getErc20TokenBalance, notifyError, callIfMounted]);

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
        .then((isAllowed) =>
          callIfMounted(() => {
            setHasAllowanceTask({ status: "successful", data: isAllowed });
          })
        )
        .catch((error) => {
          void parseError(error).then((parsed) => {
            callIfMounted(() => {
              setHasAllowanceTask({ status: "failed", error: parsed });
              notifyError(parsed);
            });
          });
        });
    }
  }, [formData, account, isContractAllowedToSpendToken, notifyError, callIfMounted]);

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
      const { token, from } = formData;
      const etherToken = getEtherToken(from);
      const isTokenEther = token.address === ethersConstants.AddressZero;

      // Get the fiat price of Ether
      getTokenPrice({ token: etherToken, chain: from })
        .then((etherPrice) => {
          callIfMounted(() => {
            setEtherTokenFiatPrice(etherPrice);
            if (isTokenEther) {
              setBridgedTokenFiatPrice(etherPrice);
            }
          });
        })
        .catch(() =>
          callIfMounted(() => {
            setEtherTokenFiatPrice(undefined);
            if (isTokenEther) {
              setBridgedTokenFiatPrice(undefined);
            }
          })
        );

      // Get the fiat price of the bridged token when it's not Ether
      if (!isTokenEther) {
        getTokenPrice({ token, chain: from })
          .then((tokenPrice) => {
            callIfMounted(() => {
              setBridgedTokenFiatPrice(tokenPrice);
            });
          })
          .catch(() =>
            callIfMounted(() => {
              setBridgedTokenFiatPrice(undefined);
            })
          );
      }
    }
  }, [formData, tokens, estimatedFee, getTokenPrice, callIfMounted]);

  useEffect(() => {
    /*
     * Get estimated fee
     */
    const estimateFee = () => {
      setEstimatedFee((oldFee) =>
        oldFee.status === "successful"
          ? { status: "reloading", data: oldFee.data }
          : { status: "loading" }
      );
      if (formData && isAsyncTaskDataAvailable(account)) {
        estimateBridgeGasPrice({
          from: formData.from,
          to: formData.to,
          token: formData.token,
          destinationAddress: account.data,
        })
          .then((newFee) => {
            callIfMounted(() => {
              setEstimatedFee((oldFee) => {
                const areFeesEqual = isAsyncTaskDataAvailable(oldFee) && oldFee.data.eq(newFee);
                if (areFeesEqual) {
                  return { status: "successful", data: newFee };
                } else {
                  setIsFadeVisible(false);
                  setTimeout(() => {
                    setEstimatedFee({ status: "successful", data: newFee });
                    setIsFadeVisible(true);
                  }, USE_FADE_DURATION_IN_SECONDS * 1000);
                  return oldFee;
                }
              });
            });
          })
          .catch((error) => {
            if (isEthersInsufficientFundsError(error)) {
              callIfMounted(() => {
                setEstimatedFee({
                  status: "failed",
                  error: "You don't have enough ETH to pay for the fees",
                });
              });
            } else {
              callIfMounted(() => {
                notifyError(error);
              });
            }
          });
      }
    };
    estimateFee();
    const intervalId = setInterval(estimateFee, AUTO_REFRESH_RATE);

    return () => {
      clearInterval(intervalId);
    };
  }, [account, formData, estimateBridgeGasPrice, notifyError, callIfMounted, setIsFadeVisible]);

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
          callIfMounted(() => {
            setApprovalTask({ status: "successful", data: null });
            setHasAllowanceTask({ status: "successful", data: true });
          });
        })
        .catch((error) => {
          callIfMounted(() => {
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
        });
    }
  };

  const onBridge = (maxPossibleAmountConsideringFee: BigNumber) => {
    if (formData && isAsyncTaskDataAvailable(account)) {
      const { token, from, to } = formData;
      bridge({
        from,
        token,
        amount: maxPossibleAmountConsideringFee,
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
              callIfMounted(() => {
                if (parsed === "wrong-network") {
                  setError(`Switch to ${getChainName(from)} to continue`);
                } else {
                  notifyError(error);
                }
              });
            });
          }
        });
    }
  };

  if (!env || !formData || !tokenBalance || !isAsyncTaskDataAvailable(estimatedFee)) {
    return <PageLoader />;
  }

  const { token, amount, from, to } = formData;
  const etherToken = getEtherToken(from);
  const isTokenEther = token.address === ethersConstants.AddressZero;

  const remainder = amount.add(estimatedFee.data).sub(tokenBalance);
  const isRemainderPositive = !remainder.isNegative();

  const maxPossibleAmountConsideringFee =
    isTokenEther && isRemainderPositive ? amount.sub(remainder) : amount;

  const fiatAmount =
    bridgedTokenFiatPrice &&
    multiplyAmounts(
      {
        value: bridgedTokenFiatPrice,
        precision: FIAT_DISPLAY_PRECISION,
      },
      {
        value: maxPossibleAmountConsideringFee,
        precision: token.decimals,
      },
      FIAT_DISPLAY_PRECISION
    );

  const fiatFee =
    etherTokenFiatPrice &&
    multiplyAmounts(
      {
        value: etherTokenFiatPrice,
        precision: FIAT_DISPLAY_PRECISION,
      },
      {
        value: estimatedFee.data,
        precision: etherToken.decimals,
      },
      FIAT_DISPLAY_PRECISION
    );

  const tokenAmountString = `${formatTokenAmount(maxPossibleAmountConsideringFee, token)} ${
    token.symbol
  }`;
  const fiatAmountString = `${currencySymbol}${fiatAmount ? formatFiatAmount(fiatAmount) : "--"}`;
  const feeString = `${formatTokenAmount(estimatedFee.data, etherToken)} ${
    etherToken.symbol
  } ~ ${currencySymbol}${fiatFee ? formatFiatAmount(fiatFee) : "--"}`;

  const fade = isFadeVisible ? classes.fadeIn : classes.fadeOut;

  return (
    <div className={classes.contentWrapper}>
      <Header
        title="Confirm Bridge"
        backTo={{ routeKey: "home", state: serializeFormData(formData) }}
      />
      <Card className={classes.card}>
        <Icon url={token.logoURI} size={46} className={classes.tokenIcon} />
        <Typography className={fade} type="h1">
          {tokenAmountString}
        </Typography>
        <Typography className={`${classes.fiat} ${fade}`} type="body2">
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
            <Icon className={fade} url={ETH_TOKEN_LOGO_URI} size={20} />
            <Typography type="body1" className={fade}>
              {feeString}
            </Typography>
          </div>
        </div>
      </Card>
      <div className={classes.button}>
        <BridgeButton
          token={token}
          hasAllowanceTask={hasAllowanceTask}
          approvalTask={approvalTask}
          onApprove={onApprove}
          onBridge={() => onBridge(maxPossibleAmountConsideringFee)}
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
