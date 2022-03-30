import { FC } from "react";

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
import { Currency } from "src/domain";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";

const Settings: FC = () => {
  const classes = useSettingsStyles();
  const { disconnectProvider } = useProvidersContext();
  const { preferredCurrency, changePreferredCurrency } = usePriceOracleContext();
  const currencies = [
    { id: Currency.EUR, icon: <EurIcon /> },
    { id: Currency.USD, icon: <UsdIcon /> },
    { id: Currency.GBP, icon: <GbpIcon /> },
    { id: Currency.CNY, icon: <CnyIcon /> },
    { id: Currency.JPY, icon: <JpyIcon /> },
  ];

  const onDisconnectProvider = () => {
    void disconnectProvider();
  };

  const onChangePreferredCurrency = changePreferredCurrency;

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
                  currency.id === preferredCurrency ? classes.currencySelected : ""
                }`}
                key={currency.id}
              >
                {currency.id === preferredCurrency ? <CheckedIcon /> : <UncheckedIcon />}
                <input
                  type="radio"
                  name="currency"
                  id={currency.id}
                  className={classes.radioInput}
                  onChange={() => onChangePreferredCurrency(currency.id)}
                />
                <span className={classes.currencyText}>{currency.id}</span>
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
