import React, { FC, useEffect, useRef, useState } from "react";

import useListStyles from "src/views/home/components/list/list.styles";
import Card from "src/views/shared/card/card.view";
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

const List: FC<ListProps> = ({ list, onClose }) => {
  const classes = useListStyles();
  const [values] = useState(list);
  const inputRef = useRef<HTMLInputElement>(null);

  const onOutsideClick = (event: React.MouseEvent) => {
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Portal>
      <div className={classes.background} onClick={onOutsideClick}>
        <Card className={classes.card}>
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
                      <Typography type="body1">{element.label}</Typography>
                    </button>
                  );
                })
              : values.items.slice(0, 20).map((element) => {
                  return (
                    <button
                      className={classes.button}
                      key={element.address}
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
