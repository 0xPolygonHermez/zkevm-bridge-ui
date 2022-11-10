import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BigNumber, constants as ethersConstants } from "ethers";

import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import Header from "src/views/shared/header/header.view";
import Card from "src/views/shared/card/card.view";
import Typography from "src/views/shared/typography/typography.view";
import routes from "src/routes";
import PageLoader from "src/views/shared/page-loader/page-loader.view";
import ErrorMessage from "src/views/shared/error-message/error-message.view";
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
import { getPermit, isContractAllowedToSpendToken } from "src/adapters/ethereum";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useUIContext } from "src/contexts/ui.context";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { ETH_TOKEN_LOGO_URI, FIAT_DISPLAY_PRECISION, getEtherToken } from "src/constants";
import useCallIfMounted from "src/hooks/use-call-if-mounted";
import BridgeButton from "src/views/bridge-confirmation/components/bridge-button/bridge-button.view";
import useBridgeConfirmationStyles from "src/views/bridge-confirmation/bridge-confirmation.styles";
import ApprovalInfo from "src/views/bridge-confirmation/components/approval-info/approval-info.view";
import { Gas, TokenSpendPermission, Permit } from "src/domain";

const BridgeConfirmation: FC = () => {
  const callIfMounted = useCallIfMounted();
  const classes = useBridgeConfirmationStyles();
  const navigate = useNavigate();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { bridge, estimateBridgeGas } = useBridgeContext();
  const { formData, setFormData } = useFormContext();
  const { openSnackbar } = useUIContext();
  const { connectedProvider } = useProvidersContext();
  const { getTokenPrice } = usePriceOracleContext();
  const { approve, getErc20TokenBalance, tokens } = useTokensContext();
  const [isBridgeInProgress, setIsBridgeInProgress] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<BigNumber>();
  const [maxAmountConsideringFee, setMaxAmountConsideringFee] = useState<BigNumber>();
  const [bridgedTokenFiatPrice, setBridgedTokenFiatPrice] = useState<BigNumber>();
  const [etherTokenFiatPrice, setEtherTokenFiatPrice] = useState<BigNumber>();
  const [error, setError] = useState<string>();
  const [tokenSpendPermission, setTokenSpendPermission] = useState<TokenSpendPermission>();
  const [approvalTask, setApprovalTask] = useState<AsyncTask<null, string>>({
    status: "pending",
  });
  const [estimatedGas, setEstimatedGas] = useState<AsyncTask<Gas, string>>({
    status: "pending",
  });
  const currencySymbol = getCurrencySymbol(getCurrency());

  useEffect(() => {
    if (
      connectedProvider.status === "successful" &&
      estimatedGas.status === "pending" &&
      formData &&
      tokenBalance &&
      tokenSpendPermission
    ) {
      const { from, to, token, amount } = formData;
      const destinationAddress = connectedProvider.data.account;

      setEstimatedGas({ status: "loading" });

      void estimateBridgeGas({
        from,
        to,
        token,
        destinationAddress,
        tokenSpendPermission,
      })
        .then((gas: Gas) => {
          const newFee = calculateFee(gas);

          if (!newFee) {
            setEstimatedGas({ status: "failed", error: "Gas data is not available" });
          }

          const isTokenEther = token.address === ethersConstants.AddressZero;
          const newMaxAmountConsideringFee = (() => {
            if (isTokenEther) {
              const amountConsideringFee = amount.add(newFee);
              const tokenBalanceRemainder = amountConsideringFee.sub(tokenBalance);
              const doesAmountExceedsTokenBalance = tokenBalanceRemainder.isNegative();
              const newMaxAmountConsideringFee = !doesAmountExceedsTokenBalance
                ? amount.sub(tokenBalanceRemainder)
                : amount;

              return newMaxAmountConsideringFee;
            } else {
              return amount;
            }
          })();

          setMaxAmountConsideringFee(newMaxAmountConsideringFee);
          setEstimatedGas({ status: "successful", data: gas });
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
  }, [
    callIfMounted,
    connectedProvider,
    estimateBridgeGas,
    estimatedGas,
    formData,
    notifyError,
    tokenBalance,
    tokenSpendPermission,
  ]);

  useEffect(() => {
    // Load the balance of the token when it's not available
    if (formData?.token.balance && isAsyncTaskDataAvailable(formData.token.balance)) {
      setTokenBalance(formData.token.balance.data);
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
      const isTokenEther = token.address === ethersConstants.AddressZero;

      if (isTokenEther) {
        setTokenSpendPermission({ type: "none" });
      } else {
        isContractAllowedToSpendToken({
          provider: from.provider,
          token: token,
          amount: amount,
          owner: connectedProvider.data.account,
          spender: from.bridgeContractAddress,
        })
          .then((isAllowed) => {
            callIfMounted(() => {
              if (isAllowed) {
                setTokenSpendPermission({ type: "none" });
              } else {
                getPermit({
                  chain: from,
                  token,
                })
                  .then((permit) => {
                    callIfMounted(() => {
                      // ToDo: DAI permit is not supported by the contract until this PR is merged and deployed:
                      // https://github.com/0xPolygonHermez/zkevm-contracts/pull/68
                      if (permit === Permit.DAI) {
                        setTokenSpendPermission({ type: "approval" });
                      } else {
                        setTokenSpendPermission({ type: "permit", permit });
                      }
                    });
                  })
                  .catch(() => {
                    setTokenSpendPermission({ type: "approval" });
                  });
              }
            });
          })
          .catch(notifyError);
      }
    }
  }, [formData, connectedProvider, notifyError, callIfMounted]);

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
            setTokenSpendPermission({ type: "none" });
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
      maxAmountConsideringFee &&
      tokenSpendPermission
    ) {
      const { token, from, to } = formData;

      setIsBridgeInProgress(true);

      bridge({
        from,
        token,
        amount: maxAmountConsideringFee,
        to,
        destinationAddress: connectedProvider.data.account,
        tokenSpendPermission,
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
    !maxAmountConsideringFee ||
    !tokenSpendPermission
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
        value: maxAmountConsideringFee,
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
    maxAmountConsideringFee.gt(0) ? formatTokenAmount(maxAmountConsideringFee, token) : "0"
  } ${token.symbol}`;

  const fiatAmountString = env.fiatExchangeRates.areEnabled
    ? `${currencySymbol}${fiatAmount ? formatFiatAmount(fiatAmount) : "--"}`
    : undefined;

  const absMaxPossibleAmountConsideringFee = formatTokenAmount(
    maxAmountConsideringFee.abs(),
    etherToken
  );

  const feeBaseErrorString = "You don't have enough ETH to cover the transaction fee";
  const feeErrorString = maxAmountConsideringFee.isNegative()
    ? `${feeBaseErrorString}\nYou need at least ${absMaxPossibleAmountConsideringFee} extra ETH`
    : maxAmountConsideringFee.eq(0)
    ? `${feeBaseErrorString}\nThe maximum transferable amount is 0 after considering the fee`
    : undefined;

  const etherFeeString = `${formatTokenAmount(fee, etherToken)} ${etherToken.symbol}`;
  const fiatFeeString = fiatFee ? `${currencySymbol}${formatFiatAmount(fiatFee)}` : undefined;
  const feeString = fiatFeeString ? `${etherFeeString} ~ ${fiatFeeString}` : etherFeeString;

  return (
    <div className={classes.contentWrapper}>
      <Header title="Confirm Bridge" backTo={{ routeKey: "home" }} />
      <Card className={classes.card}>
        <Icon url={token.logoURI} size={46} className={classes.tokenIcon} />
        <Typography type="h1">{tokenAmountString}</Typography>
        {fiatAmountString && (
          <Typography className={classes.fiat} type="body2">
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
            <Icon url={ETH_TOKEN_LOGO_URI} size={20} />
            <Typography type="body1">{feeString}</Typography>
          </div>
        </div>
      </Card>
      <div className={classes.button}>
        <BridgeButton
          isDisabled={maxAmountConsideringFee.lte(0) || isBridgeInProgress}
          token={token}
          isTxApprovalRequired={tokenSpendPermission.type === "approval"}
          approvalTask={approvalTask}
          onApprove={onApprove}
          onBridge={onBridge}
        />
        {tokenSpendPermission.type === "approval" && <ApprovalInfo />}
        {error && <ErrorMessage error={error} />}
      </div>
      {feeErrorString && <ErrorMessage className={classes.error} error={feeErrorString} />}
    </div>
  );
};

export default BridgeConfirmation;
