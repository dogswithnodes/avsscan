'use client';
import { ColumnType } from 'antd/es/table';

import { renderQuorumShares } from './avs-operators.utils';

import { renderAddressLink, renderBigNumber, renderImage } from '@/app/_utils/render.utils';

export type AvsOperatorsRow = {
  id: string;
  key: string;
  logo: string | null;
  name: string;
  tvl: number;
  quorumShares: number;
  quorumTotalShares: number;
};

const titles: Record<Exclude<keyof AvsOperatorsRow, 'key' | 'quorumTotalShares'>, string> = {
  logo: 'Img',
  name: 'Name',
  id: 'Operator',
  tvl: 'TVL',
  quorumShares: 'Quorum shares',
};

export const columnsWidth = {
  '2560': [62, 292, 292, 292, 292],
  '1920': [56, 188, 188, 188, 188],
  '1440': [52, 164, 164, 164, 164],
  '1280': [48, 157, 157, 157, 157],
};

export const columns: Array<ColumnType<AvsOperatorsRow>> = [
  {
    title: titles.logo,
    dataIndex: 'logo',
    key: 'logo',
    align: 'center',
    render: renderImage,
  },
  {
    title: titles.name,
    dataIndex: 'name',
    key: 'name',
    onCell: () => ({ className: 'ant-table-cell_left-aligned' }),
  },
  {
    title: titles.id,
    dataIndex: 'id',
    key: 'id',
    align: 'center',
    render: renderAddressLink('profile', 'operator-details'),
  },
  {
    title: titles.tvl,
    dataIndex: 'tvl',
    key: 'tvl',
    render: renderBigNumber,
  },
  {
    title: titles.quorumShares,
    dataIndex: 'quorumShares',
    key: 'quorumShares',
    render: renderQuorumShares,
  },
];

export const transformToCsvRow = ({ id, logo, name, tvl, quorumShares }: AvsOperatorsRow) => ({
  [titles.id]: id,
  [titles.logo]: logo,
  [titles.name]: name,
  [titles.tvl]: tvl,
  [titles.quorumShares]: quorumShares,
});