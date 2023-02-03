import { FC, useState } from "react";

import { getCurrency, setCurrency } from "src/adapters/storage";
import { ReactComponent as CheckedIcon } from "src/assets/icons/checkbox-checked.svg";
import { ReactComponent as UncheckedIcon } from "src/assets/icons/checkbox-unchecked.svg";
import { ReactComponent as CnyIcon } from "src/assets/icons/currencies/cny.svg";
import { ReactComponent as EurIcon } from "src/assets/icons/currencies/eur.svg";
import { ReactComponent as GbpIcon } from "src/assets/icons/currencies/gbp.svg";
import { ReactComponent as JpyIcon } from "src/assets/icons/currencies/jpy.svg";
import { ReactComponent as UsdIcon } from "src/assets/icons/currencies/usd.svg";
import { ReactComponent as ConversionIcon } from "src/assets/icons/currency-conversion.svg";
import { useEnvContext } from "src/contexts/env.context";
import { Currency } from "src/domain";
import { useSettingsStyles } from "src/views/settings/settings.styles";
import { Card } from "src/views/shared/card/card.view";
import { Header } from "src/views/shared/header/header.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const Settings: FC = () => {
  const classes = useSettingsStyles();
  const env = useEnvContext();
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>(getCurrency());
  const currencies = [
    { icon: <EurIcon />, id: Currency.EUR },
    { icon: <UsdIcon />, id: Currency.USD },
    { icon: <GbpIcon />, id: Currency.GBP },
    { icon: <CnyIcon />, id: Currency.CNY },
    { icon: <JpyIcon />, id: Currency.JPY },
  ];

  const onChangePreferredCurrency = (currency: Currency) => {
    setPreferredCurrency(currency);
    setCurrency(currency);
  };

  if (!env) {
    return null;
  }

  return (
    <div className={classes.contentWrapper}>
      <Header
        backTo={{ routeKey: "home" }}
        Subtitle={<Typography type="body2">Polygon zkEVM Bridge v{bridgeVersion}</Typography>}
        title="Settings"
      />
      <Card className={classes.card}>
        {env.fiatExchangeRates.areEnabled && (
          <div className={classes.currenciesRow}>
            <Typography className={classes.row} type="body1">
              <ConversionIcon className={classes.conversionIcon} />
              Currency conversion
            </Typography>
            <Typography type="body2">Select a currency for conversion display</Typography>
            <div className={classes.currencies}>
              {currencies.map((currency) => (
                <label
                  className={`${classes.currencyBox} ${
                    currency.id === preferredCurrency ? classes.currencySelected : ""
                  }`}
                  key={currency.id}
                >
                  {currency.id === preferredCurrency ? <CheckedIcon /> : <UncheckedIcon />}
                  <input
                    className={classes.radioInput}
                    id={currency.id}
                    name="currency"
                    onChange={() => onChangePreferredCurrency(currency.id)}
                    type="radio"
                  />
                  <span className={classes.currencyText}>{currency.id}</span>
                  {currency.icon}
                </label>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
