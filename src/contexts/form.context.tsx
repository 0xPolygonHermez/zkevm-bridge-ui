import { FC, PropsWithChildren, createContext, useContext, useMemo, useState } from "react";

import { FormData } from "src/domain";

interface FormContext {
  formData?: FormData;
  setFormData: (formData?: FormData) => void;
}

const formContextDefaultValue: FormContext = {
  setFormData: () => {
    console.error("The form context is not yet ready");
  },
};

const formContext = createContext<FormContext>(formContextDefaultValue);

const FormProvider: FC<PropsWithChildren> = (props) => {
  const [formData, setFormData] = useState<FormData>();

  const value = useMemo(() => {
    return { formData, setFormData };
  }, [formData]);

  return <formContext.Provider value={value} {...props} />;
};

const useFormContext = (): FormContext => {
  return useContext(formContext);
};

export { FormProvider, useFormContext };
