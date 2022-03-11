import { useState } from "react";

import useSettingsStyles from "src/views/settings/settings.styles";
import Typography from "src/views/shared/typography/typography.view";
import Header from "src/views/shared/header/header.view";
import Card from "src/views/shared/card/card.view";
import { ReactComponent as ConversionIcon } from "src/assets/icons/currency-conversion.svg";
import { ReactComponent as CheckedIcon } from "src/assets/icons/checkbox-checked.svg";
import { ReactComponent as UncheckedIcon } from "src/assets/icons/checkbox-unchecked.svg";
import { ReactComponent as LogoutIcon } from "src/assets/icons/logout.svg";
import { ReactComponent as EurIcon } from "src/assets/currencies/eur.svg";
import { ReactComponent as UsdIcon } from "src/assets/currencies/usd.svg";
import { ReactComponent as JpyIcon } from "src/assets/currencies/jpy.svg";
import { ReactComponent as GbpIcon } from "src/assets/currencies/gbp.svg";
import { ReactComponent as CnyIcon } from "src/assets/currencies/cny.svg";

const Settings = () => {
  const classes = useSettingsStyles();
  const [currencySelected, setCurrencySelected] = useState("eur");
  const currencies = [
    { icon: <EurIcon />, name: "EUR", id: "eur" },
    { icon: <UsdIcon />, name: "USD", id: "usd" },
    { icon: <GbpIcon />, name: "GBP", id: "gbp" },
    { icon: <CnyIcon />, name: "CNY", id: "cny" },
    { icon: <JpyIcon />, name: "JPY", id: "jpy" },
  ];

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
              <div
                className={`${classes.currencyBox} ${
                  currency.id === currencySelected ? classes.currencySelected : ""
                }`}
                onClick={() => setCurrencySelected(currency.id)}
                key={currency.id}
              >
                {currency.id === currencySelected ? <CheckedIcon /> : <UncheckedIcon />}
                <span className={classes.currencyText}>{currency.name}</span> {currency.icon}
              </div>
            ))}
          </div>
        </div>
        <div className={classes.logout}>
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
