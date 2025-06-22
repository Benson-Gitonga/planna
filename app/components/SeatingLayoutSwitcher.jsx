'use client';
import { useSeating } from '../context/SeatingContext';
import { ButtonGroup, Button } from 'react-bootstrap';

export default function SeatingLayoutSwitcher() {
  const { layoutType, setLayoutType } = useSeating();

  return (
    <ButtonGroup>
      <Button
        variant={layoutType === 'table' ? 'primary' : 'outline-primary'}
        onClick={() => setLayoutType('table')}
      >
        Table Layout
      </Button>
      <Button
        variant={layoutType === 'row' ? 'primary' : 'outline-primary'}
        onClick={() => setLayoutType('row')}
      >
        Row Layout
      </Button>
    </ButtonGroup>
  );
}
