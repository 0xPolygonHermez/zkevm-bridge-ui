import { FC, useEffect, useState } from "react";
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

const FADE_DURATION_IN_SECONDS = 0.5;

const BridgeConfirmation: FC = () => {
  const callIfMounted = useCallIfMounted();
  const classes = useBridgeConfirmationStyles({
    fadeDurationInSeconds: FADE_DURATION_IN_SECONDS,
  });
  const navigate = useNavigate();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { bridge, estimateBridgeFee } = useBridgeContext();
  const { formData, setFormData } = useFormContext();
  const { openSnackbar } = useUIContext();
  const { account, connectedProvider } = useProvidersContext();
  const { getTokenPrice } = usePriceOracleContext();
  const { approve, isContractAllowedToSpendToken, getErc20TokenBalance, tokens } =
    useTokensContext();
  const [isFadeVisible, setIsFadeVisible] = useState(true);
  const [isBridgeButtonDisabled, setIsBridgeButtonDisabled] = useState(false);
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
  const [estimatedFee, setEstimatedFee] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });
  const currencySymbol = getCurrencySymbol(getCurrency());

  useEffect(() => {
    // Load the balance of the token when it's not available
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
    if (connectedProvider && formData && account.status === "successful") {
      const { from, token, amount } = formData;
      if (token.address === ethersConstants.AddressZero) {
        setIsTxApprovalRequired(false);
      } else {
        isPermitSupported({
          account: account.data,
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
                  owner: account.data,
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
  }, [
    formData,
    account,
    connectedProvider,
    isContractAllowedToSpendToken,
    notifyError,
    callIfMounted,
  ]);

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
    // Get estimated fee
    const estimateFee = () => {
      setEstimatedFee((currentEstimatedFee) =>
        currentEstimatedFee.status === "successful"
          ? { status: "reloading", data: currentEstimatedFee.data }
          : { status: "loading" }
      );
      if (formData && isAsyncTaskDataAvailable(account) && tokenBalance) {
        const { token, amount, from, to } = formData;
        estimateBridgeFee({
          from: from,
          to: to,
          token: token,
          destinationAddress: account.data,
        })
          .then((newFee) => {
            callIfMounted(() => {
              setEstimatedFee((oldFee) => {
                const areFeesEqual = isAsyncTaskDataAvailable(oldFee) && oldFee.data.eq(newFee);
                if (areFeesEqual) {
                  return { status: "successful", data: newFee };
                } else {
                  const isFirstLoad = oldFee.status === "loading";
                  if (!isFirstLoad) {
                    setIsFadeVisible(false);
                  }
                  const isTokenEther = token.address === ethersConstants.AddressZero;
                  const remainder = isTokenEther ? amount.add(newFee).sub(tokenBalance) : undefined;
                  const isRemainderPositive = remainder ? !remainder.isNegative() : undefined;
                  const newMaxPossibleAmountConsideringFee =
                    isTokenEther && remainder && isRemainderPositive
                      ? amount.sub(remainder)
                      : amount;

                  const msTimeout = FADE_DURATION_IN_SECONDS * 1000;
                  const etherToken = isTokenEther ? token : getEtherToken(from);

                  const hasOnScreenFeeChanged =
                    isAsyncTaskDataAvailable(oldFee) &&
                    formatTokenAmount(oldFee.data, etherToken) !==
                      formatTokenAmount(newFee, etherToken);

                  setShouldUpdateOnScreenFee(hasOnScreenFeeChanged);

                  setMaxPossibleAmountConsideringFee((oldMaxPossibleAmountConsideringFee) => {
                    const hasOnScreenAmountChanged =
                      oldMaxPossibleAmountConsideringFee !== undefined &&
                      formatTokenAmount(oldMaxPossibleAmountConsideringFee, token) !==
                        formatTokenAmount(newMaxPossibleAmountConsideringFee, token);

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
                    setEstimatedFee({ status: "successful", data: newFee });
                    setIsFadeVisible(true);
                  }, msTimeout);

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
  }, [
    account,
    formData,
    tokenBalance,
    estimateBridgeFee,
    notifyError,
    callIfMounted,
    setIsFadeVisible,
  ]);

  const onApprove = () => {
    if (connectedProvider && account.status === "successful" && formData) {
      setApprovalTask({ status: "loading" });
      const { token, amount, from } = formData;
      void approve({
        from,
        token,
        owner: account.data,
        spender: from.bridgeContractAddress,
        provider: connectedProvider.provider,
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
    if (formData && isAsyncTaskDataAvailable(account) && maxPossibleAmountConsideringFee) {
      const { token, from, to } = formData;

      setIsBridgeButtonDisabled(true);

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
            text: "Transaction successfully submitted",
          });
          navigate(routes.activity.path);
          setFormData(undefined);
        })
        .catch((error) => {
          setIsBridgeButtonDisabled(false);
          if (isMetaMaskUserRejectedRequestError(error) === false) {
            void parseError(error).then((parsed) => {
              callIfMounted(() => {
                if (parsed === "wrong-network") {
                  setError(`Switch to ${from.name} to continue`);
                } else {
                  notifyError(error);
                }
              });
            });
          }
        });
    }
  };

  if (
    !env ||
    !formData ||
    !tokenBalance ||
    !isAsyncTaskDataAvailable(estimatedFee) ||
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

  const fiatFee =
    env.fiatExchangeRates.areEnabled &&
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
  const fiatAmountString = env.fiatExchangeRates.areEnabled
    ? `${currencySymbol}${fiatAmount ? formatFiatAmount(fiatAmount) : "--"}`
    : undefined;

  const etherFeeString = `${formatTokenAmount(estimatedFee.data, etherToken)} ${etherToken.symbol}`;
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
          isDisabled={isBridgeButtonDisabled}
          token={token}
          isTxApprovalRequired={isTxApprovalRequired}
          approvalTask={approvalTask}
          onApprove={onApprove}
          onBridge={onBridge}
        />
        {isTxApprovalRequired && <ApprovalInfo />}
        {error && <Error error={error} />}
      </div>
    </div>
  );
};

export default BridgeConfirmation;
