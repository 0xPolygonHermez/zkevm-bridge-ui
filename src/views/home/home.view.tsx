import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIsDepositWarningDismissed, setIsDepositWarningDismissed } from "src/adapters/storage";

import { useEnvContext } from "src/contexts/env.context";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { FormData, ModalState } from "src/domain";
import { routes } from "src/routes";
import { BridgeForm } from "src/views/home/components/bridge-form/bridge-form.view";
import { DepositWarningModal } from "src/views/home/components/deposit-warning-modal/deposit-warning-modal.view";
import { Header } from "src/views/home/components/header/header.view";
import { useHomeStyles } from "src/views/home/home.styles";

export const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const env = useEnvContext();
  const { formData, setFormData } = useFormContext();
  const { connectedProvider } = useProvidersContext();
  const [depositWarningModal, setDepositWarningModal] = useState<ModalState<FormData>>({
    status: "closed",
  });

  const onSubmitForm = (formData: FormData, hideDepositWarning?: boolean) => {
    if (hideDepositWarning) {
      setIsDepositWarningDismissed(hideDepositWarning);
    }
    setFormData(formData);
    navigate(routes.bridgeConfirmation.path);
  };

  const onCheckShowDepositWarningAndSubmitForm = (formData: FormData) => {
    const isDepositWarningDismissed = getIsDepositWarningDismissed();

    if (
      env &&
      env.isDepositWarningEnabled &&
      !isDepositWarningDismissed &&
      formData.from.key === "ethereum"
    ) {
      setDepositWarningModal({
        data: formData,
        status: "open",
      });
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
          <BridgeForm
            account={connectedProvider.data.account}
            formData={formData}
            onResetForm={onResetForm}
            onSubmit={onCheckShowDepositWarningAndSubmitForm}
          />
          {depositWarningModal.status === "open" && (
            <DepositWarningModal
              formData={depositWarningModal.data}
              onAccept={onSubmitForm}
              onCancel={() => setDepositWarningModal({ status: "closed" })}
            />
          )}
        </>
      )}
    </div>
  );
};
