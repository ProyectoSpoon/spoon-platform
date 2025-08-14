import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PaginationV2 } from './pagination';

const meta: Meta<typeof PaginationV2> = {
  title: 'UI V2/PaginationV2',
  component: PaginationV2
};
export default meta;

type Story = StoryObj<typeof PaginationV2>;

export const Basic: Story = {
  render: () => {
    const [page, setPage] = React.useState(3);
    return (
      <div className="p-8">
        <PaginationV2 page={page} pageCount={12} onPageChange={setPage} />
      </div>
    );
  }
};
