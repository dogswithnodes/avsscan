import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

import { AVSAction, AVSOperator, Quorum } from './avs.model';

import { REQUEST_LIMIT, request } from '@/app/_services/graphql.service';
import { fetchProtocolEntitiesMetadata } from '@/app/_services/protocol-entity-metadata';

type AVSResponse = {
  avs: {
    id: string;
    metadataURI: string | null;
    created: string;
    registrationsCount: number;
    actions: Array<AVSAction>;
    quorums: Array<Quorum>;
    registrations: Array<AVSOperator>;
    stakeRegistry: { id: string } | null;
    blsApkRegistry: { id: string } | null;
  };
};

export const useAVS = (id: string) => {
  return useQuery({
    queryKey: ['avs', id],
    queryFn: async () => {
      const { avs } = await request<AVSResponse>(gql`
        query {
          avs(id: ${JSON.stringify(id)}) {
            id
            metadataURI
            created
            registrationsCount
            actions(
              first: ${REQUEST_LIMIT}
            ) {
              blockNumber
              blockTimestamp
              transactionHash
              type
              quorumNumber
            }
            quorums(
              first: ${REQUEST_LIMIT}
              where: {multipliersCount_gt: 0}
            ) {
              minimalStake
              multipliers(
                first: ${REQUEST_LIMIT},
              ) {
                multiply
                strategy {
                  id
                }
              }
              operators(
                first: ${REQUEST_LIMIT}
              ) {
                totalWeight
                operator {
                  id
                  metadataURI
                  totalEigenShares
                  strategies(
                    first: ${REQUEST_LIMIT}
                    where: {strategy_not: null, totalShares_gt: "0"}
                  ) {
                    totalShares
                    strategy {
                      id
                      totalShares
                    }
                  }
                }
              }
              operatorsCount
              quorum
            }
            registrations(
              first: ${REQUEST_LIMIT},
              where: {status: 1}
            ) {
              operator {
                id
                metadataURI
                totalEigenShares
                strategies(
                  first: ${REQUEST_LIMIT}
                  where: {strategy_not: null, totalShares_gt: "0"}
                ) {
                totalShares
                
                strategy {
                  id
                  totalShares
                }
              }
              }
            }
            blsApkRegistry {
              id
            }
            stakeRegistry {
              id
            }
          }
        }
      `);

      if (!avs) return null;

      const metadata = await fetchProtocolEntitiesMetadata([avs.metadataURI]);

      return {
        ...avs,
        ...metadata[0],
      };
    },
  });
};
