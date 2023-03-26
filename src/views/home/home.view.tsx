import { parseUnits } from "@ethersproject/units";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIsDepositWarningHidden, setIsDepositWarningHidden } from "src/adapters/storage";

import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { DEPOSIT_LIMIT } from "src/constants";
import { useEnvContext } from "src/contexts/env.context";
import { useFormContext } from "src/contexts/form.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { FormData, ModalState } from "src/domain";
import { routes } from "src/routes";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { multiplyAmounts } from "src/utils/amounts";
import { BridgeForm } from "src/views/home/components/bridge-form/bridge-form.view";
import {
  DepositWarningModal,
  DepositWarningModalType,
} from "src/views/home/components/deposit-warning-modal/deposit-warning-modal.view";
import { Header } from "src/views/home/components/header/header.view";
import { useHomeStyles } from "src/views/home/home.styles";
import { NetworkBox } from "src/views/shared/network-box/network-box.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const env = useEnvContext();
  const { formData, setFormData } = useFormContext();
  const { connectedProvider } = useProvidersContext();
  const { getTokenPriceInUSDC } = usePriceOracleContext();
  const [depositWarningModal, setDepositWarningModal] = useState<
    ModalState<{ formData: FormData; type: DepositWarningModalType }>
  >({
    status: "closed",
  });

  const onSubmitForm = (formData: FormData, hideDepositWarning?: boolean) => {
    if (hideDepositWarning) {
      setIsDepositWarningHidden(hideDepositWarning);
    }
    setFormData(formData);
    navigate(routes.bridgeConfirmation.path);
  };

  const onCheckShowDepositWarningAndSubmitForm = async (formData: FormData) => {
    if (env) {
      if (!env.isDepositWarningEnabled || formData.from.key !== "ethereum") {
        onSubmitForm(formData);
      } else {
        try {
          const isDepositWarningHidden = getIsDepositWarningHidden();
          const tokenPrice = await getTokenPriceInUSDC({ token: formData.token });
          const amountInUSDC = multiplyAmounts(
            { precision: env?.usdcToken.decimals, value: tokenPrice },
            {
              precision: formData.token.decimals,
              value: formData.amount,
            },
            env.usdcToken.decimals
          );

          const doesAmountExceedDepositLimit = amountInUSDC.gte(
            parseUnits(DEPOSIT_LIMIT.toString(), env.usdcToken.decimals)
          );

          if (doesAmountExceedDepositLimit) {
            setDepositWarningModal({
              data: {
                formData,
                type: "above-deposit-limit",
              },
              status: "open",
            });
          } else if (!isDepositWarningHidden) {
            setDepositWarningModal({
              data: {
                formData,
                type: "confirmation",
              },
              status: "open",
            });
          } else {
            onSubmitForm(formData);
          }
        } catch (err) {
          onSubmitForm(formData);
        }
      }
    }
  };

  const onResetForm = () => {
    setFormData(undefined);
  };

  return (
    <div className={classes.contentWrapper}>
      <Header />
      {connectedProvider.status === "successful" && (
        <>
          <div className={classes.ethereumAddress}>
            <MetaMaskIcon className={classes.metaMaskIcon} />
            <Typography type="body1">
              {getPartiallyHiddenEthereumAddress(connectedProvider.data.account)}
            </Typography>
          </div>
          <div className={classes.networkBoxWrapper}>
            <NetworkBox />
          </div>
          <BridgeForm
            account={connectedProvider.data.account}
            formData={formData}
            onResetForm={onResetForm}
            onSubmit={(formData) => void onCheckShowDepositWarningAndSubmitForm(formData)}
          />
          {depositWarningModal.status === "open" && (
            <DepositWarningModal
              formData={depositWarningModal.data.formData}
              onAccept={onSubmitForm}
              onCancel={() => setDepositWarningModal({ status: "closed" })}
              type={depositWarningModal.data.type}
            />
          )}
        </>
      )}
    </div>
  );
};
