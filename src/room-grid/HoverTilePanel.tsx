import * as Mui from '@mui/material';
import { initialState, useHoverTile } from '../contexts/HoverTileContext';

const HoverTilePanel = () => {
  const { hover } = useHoverTile();

  if (hover.tile === initialState.tile) {
    return null;
  }

  return (
    <Mui.Chip
      label={
        <>
          X: {hover.x}, Y: {hover.y}
        </>
      }
      size='small'
      sx={{ position: 'absolute', bottom: 0 }}
      variant='outlined'
    />
  );
};

export default HoverTilePanel;
