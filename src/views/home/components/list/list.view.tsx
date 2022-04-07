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

  const filterChain = (chain: Chain, value: string) =>
    chain.name.toUpperCase().includes(value.toUpperCase());
  const filterToken = (token: Token, value: string) =>
    token.name.toUpperCase().includes(value.toUpperCase()) ||
    token.symbol.toUpperCase().includes(value.toUpperCase());
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const filtered: ListProps["list"] =
      list.type === "chain"
        ? { ...list, type: "chain", items: list.items.filter((chain) => filterChain(chain, value)) }
        : {
            ...list,
            type: "token",
            items: list.items.filter((token) => filterToken(token, value)),
          };

    setValues(filtered);
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
                  onClick={() => values.onClick(element)}
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
                  onClick={() => values.onClick(element)}
                >
                  {element.symbol && <TokenIcon token={element.symbol} size={24} />}
                  <Typography type="body1">{element.name}</Typography>
                </button>
              );
            })}
      </div>
    </Card>
  );
};

export default List;
