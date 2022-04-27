import React, { FC, useState } from "react";

import useListStyles from "src/views/home/components/list/list.styles";
import Card from "src/views/shared/card/card.view";
import { ReactComponent as SearchIcon } from "src/assets/icons/search.svg";
import Typography from "src/views/shared/typography/typography.view";
import Icon from "src/views/shared/icon/icon.view";
import { Chain, Token } from "src/domain";
import Portal from "src/views/shared/portal/portal.view";

interface ChainList {
  type: "chain";
  items: Chain[];
  onClick: (chain: Chain) => void;
}

interface TokenList {
  type: "token";
  items: Token[];
  onClick: (token: Token) => void;
}

type List = ChainList | TokenList;

interface ListProps {
  placeholder: string;
  list: List;
  onClose: () => void;
}

const filterChainList = (chainList: ChainList, value: string): ChainList => ({
  ...chainList,
  items: chainList.items.filter((chain) => chain.name.toUpperCase().includes(value.toUpperCase())),
});

const filterTokenList = (tokenList: TokenList, value: string): TokenList => ({
  ...tokenList,
  items: tokenList.items.filter(
    (token) =>
      token.name.toUpperCase().includes(value.toUpperCase()) ||
      token.symbol.toUpperCase().includes(value.toUpperCase())
  ),
});

const List: FC<ListProps> = ({ placeholder, list, onClose }) => {
  const classes = useListStyles();
  const [values, setValues] = useState(list);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    const filtered: List =
      list.type === "chain" ? filterChainList(list, value) : filterTokenList(list, value);

    setValues(filtered);
  };

  const onOutsideClick = (event: React.MouseEvent) => {
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  return (
    <Portal>
      <div className={classes.background} onClick={onOutsideClick}>
        <Card className={classes.card}>
          <div className={classes.search}>
            <SearchIcon />
            <input className={classes.input} placeholder={placeholder} onChange={onChange} />
          </div>
          <div className={classes.list}>
            {values.type === "chain"
              ? values.items.slice(0, 20).map((element) => {
                  return (
                    <button
                      className={classes.button}
                      key={element.name}
                      onClick={() => values.onClick(element)}
                    >
                      <element.Icon className={classes.icon} />
                      <Typography type="body1">{element.name}</Typography>
                    </button>
                  );
                })
              : values.items.slice(0, 20).map((element) => {
                  return (
                    <button
                      className={classes.button}
                      key={`${element.name}${element.address}`}
                      onClick={() => values.onClick(element)}
                    >
                      <Icon url={element.logoURI} size={24} />
                      <Typography type="body1">{element.name}</Typography>
                    </button>
                  );
                })}
          </div>
        </Card>
      </div>
    </Portal>
  );
};

export default List;
