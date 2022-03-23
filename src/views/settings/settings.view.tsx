import { useState, FC } from "react";

import useSettingsStyles from "src/views/settings/settings.styles";
import Typography from "src/views/shared/typography/typography.view";
import Header from "src/views/shared/header/header.view";
import Card from "src/views/shared/card/card.view";
import { ReactComponent as ConversionIcon } from "src/assets/icons/currency-conversion.svg";
import { ReactComponent as CheckedIcon } from "src/assets/icons/checkbox-checked.svg";
import { ReactComponent as UncheckedIcon } from "src/assets/icons/checkbox-unchecked.svg";
import { ReactComponent as LogoutIcon } from "src/assets/icons/logout.svg";
import { ReactComponent as EurIcon } from "src/assets/icons/currencies/eur.svg";
import { ReactComponent as UsdIcon } from "src/assets/icons/currencies/usd.svg";
import { ReactComponent as JpyIcon } from "src/assets/icons/currencies/jpy.svg";
import { ReactComponent as GbpIcon } from "src/assets/icons/currencies/gbp.svg";
import { ReactComponent as CnyIcon } from "src/assets/icons/currencies/cny.svg";
import { useProvidersContext } from "src/contexts/providers.context";
import { Currencies } from "src/domain";
import * as localStorage from "src/adapters/local-storage";

const Settings: FC = () => {
  const classes = useSettingsStyles();
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(localStorage.getCurrency());
  const { disconnectProvider } = useProvidersContext();
  const currencies = [
    { icon: <EurIcon />, name: "EUR", id: Currencies.EUR },
    { icon: <UsdIcon />, name: "USD", id: Currencies.USD },
    { icon: <GbpIcon />, name: "GBP", id: Currencies.GBP },
    { icon: <CnyIcon />, name: "CNY", id: Currencies.CNY },
    { icon: <JpyIcon />, name: "JPY", id: Currencies.JPY },
  ];

  const onDisconnectProvider = () => {
    void disconnectProvider();
  };

  const onCurrencySelected = (currency: Currencies) => {
    setSelectedCurrencyId(currency);
    localStorage.setCurrency(currency);
  };

  return (
    <>
      <Header title="Settings" />
      <Typography type="body2" className={classes.subtitle}>
        Hermez Polygon Bridge v.01
      </Typography>
      <Card className={classes.card}>
        <div className={classes.currenciesRow}>
          <Typography type="body1" className={classes.row}>
            <ConversionIcon className={classes.conversionIcon} />
            Currency conversion
          </Typography>
          <Typography type="body2">Select a currency for conversion display</Typography>
          <div className={classes.currencies}>
            {currencies.map((currency) => (
              <label
                className={`${classes.currencyBox} ${
                  currency.id === selectedCurrencyId ? classes.currencySelected : ""
                }`}
                key={currency.id}
              >
                {currency.id === selectedCurrencyId ? <CheckedIcon /> : <UncheckedIcon />}
                <input
                  type="radio"
                  name="currency"
                  id={currency.id}
                  className={classes.radioInput}
                  onChange={() => onCurrencySelected(currency.id)}
                />
                <span className={classes.currencyText}>{currency.name}</span>
                {currency.icon}
              </label>
            ))}
          </div>
        </div>
        <div className={classes.logout} role="button" onClick={onDisconnectProvider}>
          <Typography type="body1" className={classes.logoutText}>
            <LogoutIcon />
            Log out
          </Typography>
          <Typography type="body2">Disconnect your wallet</Typography>
        </div>
      </Card>
    </>
  );
};

export default Settings;
