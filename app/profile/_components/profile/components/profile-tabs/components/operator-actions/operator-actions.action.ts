'use server';
import { gql } from 'graphql-request';

import { OperatorAction, OperatorActionsFetchParams, transformToRow } from './operator-actions.model';

import { REQUEST_LIMIT, request } from '@/app/_services/graphql.service';
import { fetchAllActions, paginateRows } from '@/app/_utils/actions.utils';
import { getCache } from '@/app/_utils/cache';

type OperatorActionsResponse = {
  operatorActions: Array<OperatorAction>;
};

const fetchOperatorActions = async (requestOptions: string): Promise<Array<OperatorAction>> => {
  const { operatorActions } = await request<OperatorActionsResponse>(gql`
    query {
      operatorActions(
        ${requestOptions}
      ) {
        id
        blockNumber
        blockTimestamp
        transactionHash
        type
        avs {
          id
        }
        delegationApprover
        earningsReceiver
        delegator {
          id
        }
        metadataURI
        stakerOptOutWindowBlocks
        status
        quorum {
          quorum {
            quorum
          }
        }
      }
    }
  `);

  return operatorActions;
};

const cache = getCache(
  process.env.METADATA_CACHE as unknown as CloudflareEnv['METADATA_CACHE'],
  'operators-actions',
);

export const fetchAllOperatorActions = async (
  cacheKey: string,
  { id, currentPage, perPage, sortParams }: OperatorActionsFetchParams,
) => {
  const rows = await fetchAllActions({
    cache,
    cacheKey,
    fetcher: (skip) =>
      fetchOperatorActions(`
        first: ${REQUEST_LIMIT}
        skip:${skip}
        where: {operator: ${JSON.stringify(id)}}
      `),
    transformer: transformToRow,
  });

  return {
    rows: paginateRows({ currentPage, perPage, sortParams })(rows),
    total: rows.length,
  };
};

export const fetchOperatorActionsCsv = async (cacheKey: string) => {
  const data = await cache.get(cacheKey);

  if (data) {
    return JSON.parse(data);
  }

  return [];
};
