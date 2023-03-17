import { utils as ethersUtils } from "ethers";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { DEPOSIT_LIMITS } from "src/constants";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { FormData, ModalState } from "src/domain";
import { routes } from "src/routes";
import { getPartiallyHiddenEthereumAddress } from "src/utils/addresses";
import { BridgeForm } from "src/views/home/components/bridge-form/bridge-form.view";
import {
  DepositLimitModal,
  DepositLimitModalData,
} from "src/views/home/components/deposit-limit-modal/deposit-limit-modal.view";
import { Header } from "src/views/home/components/header/header.view";
import { useHomeStyles } from "src/views/home/home.styles";
import { NetworkBox } from "src/views/shared/network-box/network-box.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const { formData, setFormData } = useFormContext();
  const { connectedProvider } = useProvidersContext();
  const [depositLimitModal, setDepositLimitModal] = useState<ModalState<DepositLimitModalData>>({
    status: "closed",
  });

  const onSubmitForm = (formData: FormData) => {
    setFormData(formData);
    navigate(routes.bridgeConfirmation.path);
  };

  const onCheckDepositLimitAndSubmitForm = (formData: FormData) => {
    if (formData.from.key === "ethereum") {
      const { from, token } = formData;
      const depositLimits = DEPOSIT_LIMITS[from.chainId][token.address];

      if (depositLimits === undefined) {
        setDepositLimitModal({
          data: { formData, type: "unknown-limit" },
          status: "open",
        });
      } else {
        const softLimit = ethersUtils.parseUnits(depositLimits.soft.toString(), token.decimals);
        const hardLimit = ethersUtils.parseUnits(depositLimits.hard.toString(), token.decimals);

        if (formData.amount.gte(hardLimit)) {
          setDepositLimitModal({
            data: { formData, hardLimit: depositLimits.hard, type: "forbidden" },
            status: "open",
          });
        } else if (formData.amount.gte(softLimit)) {
          setDepositLimitModal({ data: { formData, type: "warning" }, status: "open" });
        } else {
          onSubmitForm(formData);
        }
      }
    } else {
      onSubmitForm(formData);
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
            onSubmit={onCheckDepositLimitAndSubmitForm}
          />
          {depositLimitModal.status === "open" && (
            <DepositLimitModal
              data={depositLimitModal.data}
              onAccept={onSubmitForm}
              onCancel={() => setDepositLimitModal({ status: "closed" })}
            />
          )}
        </>
      )}
    </div>
  );
};
