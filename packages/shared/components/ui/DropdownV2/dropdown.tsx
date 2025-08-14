import React from 'react';
import { MenuV2, type MenuItem } from '../MenuV2';

export interface DropdownV2Props {
  label: string;
  items: MenuItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

export const DropdownV2: React.FC<DropdownV2Props> = ({ label, items, placement = 'bottom-start' }) => {
  return <MenuV2 buttonLabel={label} items={items} placement={placement} />;
};

export default DropdownV2;
