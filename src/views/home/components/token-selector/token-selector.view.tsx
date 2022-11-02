import { FC, MouseEvent, useEffect, useState } from "react";

import Card from "src/views/shared/card/card.view";
import Portal from "src/views/shared/portal/portal.view";
import { Token, Chain } from "src/domain";
import TokenAdder from "src/views/home/components/token-adder/token-adder.view";
import useTokenSelectorStyles from "src/views/home/components/token-selector/token-selector.styles";
import TokenList from "src/views/home/components/token-list/token-list.view";
import TokenInfo from "src/views/home/components/token-info/token-info.view";

type Screen =
  | {
      type: "token-list";
    }
  | {
      type: "token-adder";
      token: Token;
    }
  | {
      type: "token-info";
      token: Token;
    };

interface SelectedChains {
  from: Chain;
  to: Chain;
}

interface TokenSelectorProps {
  account: string;
  chains: SelectedChains;
  tokens?: Token[];
  onAddToken: (token: Token) => void;
  onClose: () => void;
  onRemoveToken: (token: Token) => void;
  onSelectToken: (token: Token) => void;
}

const TokenSelector: FC<TokenSelectorProps> = ({
  account,
  chains,
  tokens,
  onAddToken,
  onClose,
  onRemoveToken,
  onSelectToken,
}) => {
  const classes = useTokenSelectorStyles();

  const [screen, setScreen] = useState<Screen>({
    type: "token-list",
  });

  const onOutsideClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const onNavigateToTokenAdder = (token: Token) => {
    setScreen({
      type: "token-adder",
      token,
    });
  };

  const onNavigateToTokenDetails = (token: Token) => {
    setScreen({
      type: "token-info",
      token,
    });
  };

  const onNavigateToTokenList = () => {
    setScreen({
      type: "token-list",
    });
  };

  const onAddTokenToList = (token: Token) => {
    onAddToken(token);
    setScreen({
      type: "token-list",
    });
  };

  const onRemoveTokenFromList = (token: Token) => {
    onRemoveToken(token);
    setScreen({
      type: "token-list",
    });
  };

  useEffect(() => {
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onClose]);

  return (
    <Portal>
      <div className={classes.background} onMouseDown={onOutsideClick}>
        <Card className={classes.card}>
          {(() => {
            switch (screen.type) {
              case "token-list": {
                return (
                  <TokenList
                    account={account}
                    chains={chains}
                    tokens={tokens}
                    onClose={onClose}
                    onNavigateToTokenAdder={onNavigateToTokenAdder}
                    onNavigateToTokenDetails={onNavigateToTokenDetails}
                    onSelectToken={onSelectToken}
                  />
                );
              }
              case "token-adder": {
                return (
                  <TokenAdder
                    token={screen.token}
                    onAddToken={onAddTokenToList}
                    onNavigateToTokenList={onNavigateToTokenList}
                    onClose={onClose}
                  />
                );
              }
              case "token-info": {
                return (
                  <TokenInfo
                    chain={chains.from}
                    token={screen.token}
                    onClose={onClose}
                    onNavigateToTokenList={onNavigateToTokenList}
                    onRemoveToken={onRemoveTokenFromList}
                  />
                );
              }
            }
          })()}
        </Card>
      </div>
    </Portal>
  );
};

export default TokenSelector;
