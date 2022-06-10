import useSpinnerStyles from "src/views/shared/spinner/spinner.styles";

const SIZE = 44;
const THICKNESS = 3;

interface SpinnerProps {
  size?: number;
}

function Spinner({ size }: SpinnerProps): JSX.Element {
  const classes = useSpinnerStyles({ size: size !== undefined ? size : 48 });

  return (
    <div className={classes.root}>
      <svg className={classes.svg} viewBox={`${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`}>
        <circle
          className={classes.bottomCircle}
          cx={SIZE}
          cy={SIZE}
          r={(SIZE - THICKNESS) / 2}
          fill="none"
          strokeWidth={THICKNESS}
        />
        <circle
          className={classes.topCircle}
          cx={SIZE}
          cy={SIZE}
          r={(SIZE - THICKNESS) / 2}
          fill="none"
          strokeWidth={THICKNESS}
        />
      </svg>
    </div>
  );
}

export default Spinner;
