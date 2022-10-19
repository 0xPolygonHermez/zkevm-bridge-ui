import { FC, useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BigNumber, constants as ethersConstants } from "ethers";

import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import Header from "src/views/shared/header/header.view";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";
import PageLoader from "src/views/shared/page-loader/page-loader.view";
import Error from "src/views/shared/error/error.view";
import Icon from "src/views/shared/icon/icon.view";
import { getCurrencySymbol } from "src/utils/labels";
import { formatTokenAmount, formatFiatAmount, multiplyAmounts } from "src/utils/amounts";
import { selectTokenAddress } from "src/utils/tokens";
import { calculateFee } from "src/utils/fees";
import {
  AsyncTask,
  isMetaMaskUserRejectedRequestError,
  isAsyncTaskDataAvailable,
  isEthersInsufficientFundsError,
} from "src/utils/types";
import { parseError } from "src/adapters/error";
import { getCurrency } from "src/adapters/storage";
import { isPermitSupported } from "src/adapters/ethereum";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useUIContext } from "src/contexts/ui.context";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { useTokensContext } from "src/contexts/tokens.context";
import {
  AUTO_REFRESH_RATE,
  ETH_TOKEN_LOGO_URI,
  FIAT_DISPLAY_PRECISION,
  getEtherToken,
} from "src/constants";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import BridgeButton from "src/views/bridge-confirmation/components/bridge-button/bridge-button.view";
import useBridgeConfirmationStyles from "src/views/bridge-confirmation/bridge-confirmation.styles";
import ApprovalInfo from "src/views/bridge-confirmation/components/approval-info/approval-info.view";
import { Gas } from "src/domain";

const FADE_DURATION_IN_SECONDS = 0.5;

const BridgeConfirmation: FC = () => {
  const callIfMounted = useCallIfMounted();
  const classes = useBridgeConfirmationStyles({
    fadeDurationInSeconds: FADE_DURATION_IN_SECONDS,
  });
  const navigate = useNavigate();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { bridge, estimateBridgeGas } = useBridgeContext();
  const { formData, setFormData } = useFormContext();
  const { openSnackbar } = useUIContext();
  const { connectedProvider } = useProvidersContext();
  const { getTokenPrice } = usePriceOracleContext();
  const { approve, isContractAllowedToSpendToken, getErc20TokenBalance, tokens } =
    useTokensContext();
  const [isFadeVisible, setIsFadeVisible] = useState(true);
  const [isBridgeInProgress, setIsBridgeInProgress] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<BigNumber>();
  const [maxPossibleAmountConsideringFee, setMaxPossibleAmountConsideringFee] =
    useState<BigNumber>();
  const [shouldUpdateOnScreenAmount, setShouldUpdateOnScreenAmount] = useState(false);
  const [shouldUpdateOnScreenFee, setShouldUpdateOnScreenFee] = useState(false);
  const [bridgedTokenFiatPrice, setBridgedTokenFiatPrice] = useState<BigNumber>();
  const [etherTokenFiatPrice, setEtherTokenFiatPrice] = useState<BigNumber>();
  const [error, setError] = useState<string>();
  const [isTxApprovalRequired, setIsTxApprovalRequired] = useState<boolean>(false);
  const [approvalTask, setApprovalTask] = useState<AsyncTask<null, string>>({
    status: "pending",
  });
  const [estimatedGas, setEstimatedGas] = useState<AsyncTask<Gas, string>>({
    status: "pending",
  });
  const estimateGasPollInterval = useRef<number>();
  const currencySymbol = getCurrencySymbol(getCurrency());

  const startGasPolling = useCallback(() => {
    const estimateGas = () => {
      setEstimatedGas((currentEstimatedGas) =>
        isAsyncTaskDataAvailable(currentEstimatedGas)
          ? { status: "reloading", data: currentEstimatedGas.data }
          : { status: "loading" }
      );
      if (formData && connectedProvider.status === "successful" && tokenBalance) {
        const { token, amount, from, to } = formData;

        estimateBridgeGas({
          from: from,
          to: to,
          token: token,
          destinationAddress: connectedProvider.data.account,
        })
          .then((newGas) => {
            setEstimatedGas((oldGas) => {
              const newFee = calculateFee(newGas);

              if (!newFee) {
                return { status: "failed", error: "Fee data is not available" };
              }

              const oldFee = isAsyncTaskDataAvailable(oldGas)
                ? calculateFee(oldGas.data)
                : undefined;

              const areFeesEqual = oldFee && oldFee.eq(newFee);
              if (areFeesEqual) {
                return oldGas;
              } else {
                const isFirstLoad = oldGas.status === "loading";
                if (!isFirstLoad) {
                  setIsFadeVisible(false);
                }
                const isTokenEther = token.address === ethersConstants.AddressZero;
                const remainder = isTokenEther ? amount.add(newFee).sub(tokenBalance) : undefined;
                const isRemainderPositive = remainder ? !remainder.isNegative() : undefined;
                const newMaxPossibleAmountConsideringFee =
                  isTokenEther && remainder && isRemainderPositive ? amount.sub(remainder) : amount;

                const msTimeout = FADE_DURATION_IN_SECONDS * 1000;
                const etherToken = isTokenEther ? token : getEtherToken(from);

                const hasOnScreenFeeChanged =
                  oldFee !== undefined &&
                  formatTokenAmount(oldFee, etherToken) !== formatTokenAmount(newFee, etherToken);

                setShouldUpdateOnScreenFee(hasOnScreenFeeChanged);

                setMaxPossibleAmountConsideringFee((oldMaxPossibleAmountConsideringFee) => {
                  const formattedOldMaxPossibleAmountConsideringFee =
                    oldMaxPossibleAmountConsideringFee &&
                    (oldMaxPossibleAmountConsideringFee.isNegative()
                      ? "0"
                      : formatTokenAmount(oldMaxPossibleAmountConsideringFee, token));

                  const formattedNewMaxPossibleAmountConsideringFee =
                    newMaxPossibleAmountConsideringFee.isNegative()
                      ? "0"
                      : formatTokenAmount(newMaxPossibleAmountConsideringFee, token);

                  const hasOnScreenAmountChanged =
                    formattedOldMaxPossibleAmountConsideringFee !==
                    formattedNewMaxPossibleAmountConsideringFee;

                  setShouldUpdateOnScreenAmount(hasOnScreenAmountChanged);

                  const areAmountsEqual =
                    oldMaxPossibleAmountConsideringFee !== undefined &&
                    oldMaxPossibleAmountConsideringFee.eq(newMaxPossibleAmountConsideringFee);

                  if (!areAmountsEqual) {
                    setTimeout(() => {
                      setMaxPossibleAmountConsideringFee(newMaxPossibleAmountConsideringFee);
                    }, msTimeout);
                  }
                  return oldMaxPossibleAmountConsideringFee;
                });

                setTimeout(() => {
                  setEstimatedGas({
                    status: "successful",
                    data: newGas,
                  });
                  setIsFadeVisible(true);
                }, msTimeout);

                return oldGas;
              }
            });
          })
          .catch((error) => {
            if (isEthersInsufficientFundsError(error)) {
              callIfMounted(() => {
                setEstimatedGas({
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
    void estimateGas();
    estimateGasPollInterval.current = window.setInterval(estimateGas, AUTO_REFRESH_RATE);
  }, [connectedProvider, formData, tokenBalance, callIfMounted, estimateBridgeGas, notifyError]);

  const stopGasPolling = useCallback(() => {
    clearInterval(estimateGasPollInterval.current);
  }, []);

  useEffect(() => {
    // Start estimating gas
    startGasPolling();
    return stopGasPolling;
  }, [startGasPolling, stopGasPolling]);

  useEffect(() => {
    // Load the balance of the token when it's not available
    if (formData?.token.balance) {
      setTokenBalance(formData.token.balance);
    } else if (formData && connectedProvider.status === "successful") {
      const { from, token } = formData;
      const isTokenEther = token.address === ethersConstants.AddressZero;
      if (isTokenEther) {
        void from.provider
          .getBalance(connectedProvider.data.account)
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
          accountAddress: connectedProvider.data.account,
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
  }, [connectedProvider, formData, getErc20TokenBalance, notifyError, callIfMounted]);

  useEffect(() => {
    if (connectedProvider.status === "successful" && formData) {
      const { from, token, amount } = formData;
      if (token.address === ethersConstants.AddressZero) {
        setIsTxApprovalRequired(false);
      } else {
        isPermitSupported({
          account: connectedProvider.data.account,
          chain: formData.from,
          token,
        })
          .then((canUsePermit) => {
            callIfMounted(() => {
              if (canUsePermit) {
                setIsTxApprovalRequired(false);
              } else {
                void isContractAllowedToSpendToken({
                  provider: from.provider,
                  token: token,
                  amount: amount,
                  owner: connectedProvider.data.account,
                  spender: from.bridgeContractAddress,
                })
                  .then((isAllowed) =>
                    callIfMounted(() => {
                      setIsTxApprovalRequired(!isAllowed);
                    })
                  )
                  .catch(notifyError);
              }
            });
          })
          .catch(notifyError);
      }
    }
  }, [formData, connectedProvider, isContractAllowedToSpendToken, notifyError, callIfMounted]);

  useEffect(() => {
    if (
      connectedProvider.status === "successful" &&
      formData &&
      formData.from.chainId === connectedProvider.data.chainId
    ) {
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
  }, [formData, tokens, estimatedGas, getTokenPrice, callIfMounted]);

  const onApprove = () => {
    if (isAsyncTaskDataAvailable(connectedProvider) && formData) {
      setApprovalTask({ status: "loading" });
      const { token, amount, from } = formData;
      void approve({
        from,
        token,
        owner: connectedProvider.data.account,
        spender: from.bridgeContractAddress,
        provider: connectedProvider.data.provider,
        amount,
      })
        .then(() => {
          callIfMounted(() => {
            setApprovalTask({ status: "successful", data: null });
            setIsTxApprovalRequired(false);
          });
        })
        .catch((error) => {
          callIfMounted(() => {
            if (isMetaMaskUserRejectedRequestError(error)) {
              setApprovalTask({ status: "pending" });
            } else {
              void parseError(error).then((parsed) => {
                if (parsed === "wrong-network") {
                  setError(`Switch to ${from.name} to continue`);
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

  const onBridge = () => {
    if (
      formData &&
      isAsyncTaskDataAvailable(connectedProvider) &&
      isAsyncTaskDataAvailable(estimatedGas) &&
      maxPossibleAmountConsideringFee
    ) {
      stopGasPolling();
      const { token, from, to } = formData;

      setIsBridgeInProgress(true);

      bridge({
        from,
        token,
        amount: maxPossibleAmountConsideringFee,
        to,
        destinationAddress: connectedProvider.data.account,
        gas: estimatedGas.data,
      })
        .then(() => {
          openSnackbar({
            type: "success-msg",
            text: "Transaction successfully submitted",
          });
          navigate(routes.activity.path);
          setFormData(undefined);
        })
        .catch((error) => {
          callIfMounted(() => {
            setIsBridgeInProgress(false);
            startGasPolling();
            if (isMetaMaskUserRejectedRequestError(error) === false) {
              void parseError(error).then((parsed) => {
                if (parsed === "wrong-network") {
                  setError(`Switch to ${from.name} to continue`);
                } else {
                  notifyError(error);
                }
              });
            }
          });
        });
    }
  };

  if (
    !env ||
    !formData ||
    !tokenBalance ||
    !isAsyncTaskDataAvailable(estimatedGas) ||
    !maxPossibleAmountConsideringFee
  ) {
    return <PageLoader />;
  }

  const { token, from, to } = formData;
  const etherToken = getEtherToken(from);

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

  const fee = calculateFee(estimatedGas.data);
  const fiatFee =
    env.fiatExchangeRates.areEnabled &&
    etherTokenFiatPrice &&
    multiplyAmounts(
      {
        value: etherTokenFiatPrice,
        precision: FIAT_DISPLAY_PRECISION,
      },
      {
        value: fee,
        precision: etherToken.decimals,
      },
      FIAT_DISPLAY_PRECISION
    );

  const tokenAmountString = `${
    maxPossibleAmountConsideringFee.gt(0)
      ? formatTokenAmount(maxPossibleAmountConsideringFee, token)
      : "0"
  } ${token.symbol}`;

  const fiatAmountString = env.fiatExchangeRates.areEnabled
    ? `${currencySymbol}${fiatAmount ? formatFiatAmount(fiatAmount) : "--"}`
    : undefined;

  const absMaxPossibleAmountConsideringFee = formatTokenAmount(
    maxPossibleAmountConsideringFee.abs(),
    etherToken
  );

  const feeBaseErrorString = "You don't have enough ETH to cover the transaction fee";
  const feeErrorString = maxPossibleAmountConsideringFee.isNegative()
    ? `${feeBaseErrorString}\nYou need at least ${absMaxPossibleAmountConsideringFee} extra ETH`
    : maxPossibleAmountConsideringFee.eq(0)
    ? `${feeBaseErrorString}\nThe maximum transferable amount is 0 after considering the fee`
    : undefined;

  const etherFeeString = `${formatTokenAmount(fee, etherToken)} ${etherToken.symbol}`;
  const fiatFeeString = fiatFee ? `${currencySymbol}${formatFiatAmount(fiatFee)}` : undefined;
  const feeString = fiatFeeString ? `${etherFeeString} ~ ${fiatFeeString}` : etherFeeString;

  const fadeClass = isFadeVisible ? classes.fadeIn : classes.fadeOut;

  return (
    <div className={classes.contentWrapper}>
      <Header title="Confirm Bridge" backTo={{ routeKey: "home" }} />
      <Card className={classes.card}>
        <Icon url={token.logoURI} size={46} className={classes.tokenIcon} />
        <Typography className={shouldUpdateOnScreenAmount ? fadeClass : ""} type="h1">
          {tokenAmountString}
        </Typography>
        {fiatAmountString && (
          <Typography
            className={shouldUpdateOnScreenAmount ? `${classes.fiat} ${fadeClass}` : classes.fiat}
            type="body2"
          >
            {fiatAmountString}
          </Typography>
        )}
        <div className={classes.chainsRow}>
          <div className={classes.chainBox}>
            <from.Icon />
            <Typography type="body1">{from.name}</Typography>
          </div>
          <ArrowRightIcon className={classes.arrowIcon} />
          <div className={classes.chainBox}>
            <to.Icon />
            <Typography type="body1">{to.name}</Typography>
          </div>
        </div>
        <div className={classes.feeBlock}>
          <Typography type="body2">Estimated gas fee</Typography>
          <div className={classes.fee}>
            <Icon
              className={shouldUpdateOnScreenFee ? fadeClass : ""}
              url={ETH_TOKEN_LOGO_URI}
              size={20}
            />
            <Typography type="body1" className={shouldUpdateOnScreenFee ? fadeClass : ""}>
              {feeString}
            </Typography>
          </div>
        </div>
      </Card>
      <div className={classes.button}>
        <BridgeButton
          isDisabled={maxPossibleAmountConsideringFee.lte(0) || isBridgeInProgress}
          token={token}
          isTxApprovalRequired={isTxApprovalRequired}
          approvalTask={approvalTask}
          onApprove={onApprove}
          onBridge={onBridge}
        />
        {isTxApprovalRequired && <ApprovalInfo />}
        {error && <Error error={error} />}
      </div>
      {feeErrorString && <Error className={classes.error} error={feeErrorString} />}
    </div>
  );
};

export default BridgeConfirmation;
