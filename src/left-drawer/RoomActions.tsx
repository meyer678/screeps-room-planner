import * as Mui from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useState } from 'react';

import StyledDialog from '../common/StyledDialog';
import { useRoomTerrain } from '../contexts/RoomTerrainContext';
import { useRoomGrid } from '../contexts/RoomGridContext';
import { useRoomStructures } from '../contexts/RoomStructuresContext';
import ExampleBunker from './ExampleBunker';
import LoadTerrain from './LoadTerrain';

function DialogTitle(props: Mui.DialogTitleProps & { onClose?: () => void }) {
  const { children, onClose, ...other } = props;

  return (
    <Mui.DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <Mui.IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Icons.Close />
        </Mui.IconButton>
      ) : null}
    </Mui.DialogTitle>
  );
}

export default function RoomActions() {
  const { updateRoomGrid } = useRoomGrid();
  const { updateRoomStructures } = useRoomStructures();
  const { updateRoomTerrain } = useRoomTerrain();

  const [modalOpen, setModalOpen] = useState(false);

  const toggleModalOpen = () => setModalOpen(!modalOpen);

  return (
    <>
      <Mui.Button onMouseDown={toggleModalOpen} variant='outlined' endIcon={<Icons.Widgets />}>
        Room Actions
      </Mui.Button>
      <StyledDialog open={modalOpen} onClose={toggleModalOpen}>
        <DialogTitle onClose={toggleModalOpen}>Room Actions</DialogTitle>
        <Mui.DialogContent dividers>
          <Mui.Stack direction='column' spacing={1}>
            <LoadTerrain toggleModalOpen={toggleModalOpen} />

            <ExampleBunker toggleModalOpen={toggleModalOpen} />

            <Mui.Button
              onMouseDown={() => {
                updateRoomGrid({ type: 'reset' });
                updateRoomStructures({ type: 'reset' });
                toggleModalOpen();
              }}
              variant='outlined'
              endIcon={<Icons.FormatColorReset />}
            >
              Wipe Structures
            </Mui.Button>

            <Mui.Button
              onMouseDown={() => {
                updateRoomTerrain({ type: 'reset' });
                toggleModalOpen();
              }}
              variant='outlined'
              endIcon={<Icons.LayersClear />}
            >
              Wipe Terrain
            </Mui.Button>
          </Mui.Stack>
        </Mui.DialogContent>
      </StyledDialog>
    </>
  );
}
