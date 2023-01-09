import * as Mui from '@mui/material';
import { PropsWithChildren } from 'react';

import { getRoomPosition } from '../utils/helpers';
import { HoverTileProvider, initialState, useHoverTile } from '../contexts/HoverTileContext';

const StyledTooltip = Mui.styled(({ className, ...props }: Mui.TooltipProps) => (
  <Mui.Tooltip {...props} classes={{ popper: className }} />
))(({ theme, title }) => ({
  [`& .${Mui.tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    fontSize: theme.typography.pxToRem(12),
  },
}));

const TooltipContent = () => {
  const { hoverTile } = useHoverTile();
  const { x, y } = getRoomPosition(hoverTile);
  return hoverTile === initialState ? null : (
    <Mui.Typography component='div' variant='body2'>
      X: {x}, Y: {y}
    </Mui.Typography>
  );
};

export default function HoverTooltip({ children }: PropsWithChildren) {
  return (
    <HoverTileProvider>
      <StyledTooltip title={<TooltipContent />} placement='top'>
        <Mui.Box>{children}</Mui.Box>
      </StyledTooltip>
    </HoverTileProvider>
  );
}
