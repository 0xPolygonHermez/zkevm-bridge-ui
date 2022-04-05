import { FC, useState } from "react";

import useListStyles from "src/views/home/components/list/list.styles";
import Card from "src/views/shared/card/card.view";
import { ReactComponent as SearchIcon } from "src/assets/icons/search.svg";
import Typography from "src/views/shared/typography/typography.view";
import TokenIcon from "src/views/shared/token-icon/token-icon.view";
import { Chain, Token } from "src/domain";

interface ListProps {
  placeholder: string;
  list:
    | { type: "chain"; items: Chain[]; onClick: (chain: Chain) => void }
    | { type: "token"; items: Token[]; onClick: (token: Token) => void };
}

const List: FC<ListProps> = ({ placeholder, list }) => {
  const classes = useListStyles();
  const [values, setValues] = useState(list);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filterChain = (chain: Chain) =>
      chain.name.toUpperCase().includes(event.target.value.toUpperCase());
    const filterToken = (token: Token) =>
      token.name.toUpperCase().includes(event.target.value.toUpperCase()) ||
      token.symbol.toUpperCase().includes(event.target.value.toUpperCase());
    const filtered: ListProps["list"] =
      list.type === "chain"
        ? { ...list, type: "chain", items: list.items.filter(filterChain) }
        : { ...list, type: "token", items: list.items.filter(filterToken) };

    setValues(filtered);
  };

  const onClickChain = (element: Chain) => {
    if (list.type === "chain") {
      list.onClick(element);
    }
  };

  const onClickToken = (element: Token) => {
    if (list.type === "token") {
      list.onClick(element);
    }
  };

  return (
    <Card className={classes.card}>
      <div className={classes.search}>
        <SearchIcon />
        <input className={classes.input} placeholder={placeholder} onChange={onChange} />
      </div>
      <div className={classes.list}>
        {values.type === "chain"
          ? values.items.slice(0, 20).map((element) => {
              const Icon = element.icon;

              return (
                <button
                  className={classes.button}
                  key={`${element.name}${element.chainId}`}
                  onClick={() => onClickChain(element)}
                >
                  {Icon && <Icon className={classes.icon} />}
                  <Typography type="body1">{element.name}</Typography>
                </button>
              );
            })
          : values.items.slice(0, 20).map((element) => {
              return (
                <button
                  className={classes.button}
                  key={`${element.name}${element.address}`}
                  onClick={() => onClickToken(element)}
                >
                  {element.symbol && <TokenIcon token={element.symbol} size={6} />}
                  <Typography type="body1">{element.name}</Typography>
                </button>
              );
            })}
      </div>
    </Card>
  );
};

export default List;
