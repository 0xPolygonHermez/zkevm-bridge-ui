import { FC, MouseEvent, useEffect, useState } from "react";

import { Chain, Token } from "src/domain";
import { TokenAdder } from "src/views/home/components/token-adder/token-adder.view";
import { TokenInfo } from "src/views/home/components/token-info/token-info.view";
import { TokenList } from "src/views/home/components/token-list/token-list.view";
import { useTokenSelectorStyles } from "src/views/home/components/token-selector/token-selector.styles";
import { Card } from "src/views/shared/card/card.view";
import { Portal } from "src/views/shared/portal/portal.view";

type Screen =
  | {
      type: "token-list";
    }
  | {
      token: Token;
      type: "token-adder";
    }
  | {
      token: Token;
      type: "token-info";
    };

interface SelectedChains {
  from: Chain;
  to: Chain;
}

interface TokenSelectorProps {
  account: string;
  chains: SelectedChains;
  onAddToken: (token: Token) => void;
  onClose: () => void;
  onRemoveToken: (token: Token) => void;
  onSelectToken: (token: Token) => void;
  tokens: Token[];
}

export const TokenSelector: FC<TokenSelectorProps> = ({
  account,
  chains,
  onAddToken,
  onClose,
  onRemoveToken,
  onSelectToken,
  tokens,
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
      token,
      type: "token-adder",
    });
  };

  const onNavigateToTokenInfo = (token: Token) => {
    setScreen({
      token,
      type: "token-info",
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
                    onClose={onClose}
                    onNavigateToTokenAdder={onNavigateToTokenAdder}
                    onNavigateToTokenInfo={onNavigateToTokenInfo}
                    onSelectToken={onSelectToken}
                    tokens={tokens}
                  />
                );
              }
              case "token-adder": {
                return (
                  <TokenAdder
                    onAddToken={onAddTokenToList}
                    onClose={onClose}
                    onNavigateToTokenList={onNavigateToTokenList}
                    token={screen.token}
                  />
                );
              }
              case "token-info": {
                return (
                  <TokenInfo
                    chain={chains.from}
                    onClose={onClose}
                    onNavigateToTokenList={onNavigateToTokenList}
                    onRemoveToken={onRemoveTokenFromList}
                    token={screen.token}
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
