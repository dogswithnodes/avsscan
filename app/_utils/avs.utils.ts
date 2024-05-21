import { EIGEN_STRATEGY } from '@/app/_constants/addresses.constants';
import { BN_ZERO } from '@/app/_constants/big-number.constants';
import { AVSOperatorBase, QuorumBase } from '@/app/_models/avs.model';
import { StrategyToEthBalance } from '@/app/_models/strategies.model';
import { calculateTotalAssets, toEth } from '@/app/_utils/big-number.utils';

export const calculateAVSTVLs = (
  quorums: Array<QuorumBase>,
  registrations: Array<AVSOperatorBase>,
  strategyToEthBalance: StrategyToEthBalance,
) => {
  const { ethTvl, eigenTvl } = {
    ethTvl: BN_ZERO,
    eigenTvl: BN_ZERO,
  };

  if (quorums.length > 0 && quorums.some(({ operatorsCount }) => operatorsCount > 0)) {
    quorums.forEach(({ multipliers, operators }) => {
      const ethStrategies = multipliers.flatMap(({ strategy }) =>
        strategy.id !== EIGEN_STRATEGY ? strategy.id : [],
      );
      const eigenStrategies = multipliers.flatMap(({ strategy }) =>
        strategy.id === EIGEN_STRATEGY ? strategy.id : [],
      );

      operators.forEach((operator) => {
        operator.operator.strategies.forEach(({ totalShares, strategy }) => {
          if (ethStrategies.some((id) => id === strategy.id)) {
            ethTvl.plus(
              calculateTotalAssets(totalShares, strategyToEthBalance[strategy.id], strategy.totalShares),
            );
          } else if (eigenStrategies.some((id) => id === strategy.id)) {
            eigenTvl.plus(operator.operator.totalEigenShares);
          }
        });
      });
    });
  } else {
    registrations.forEach(({ operator }) => {
      operator.strategies.forEach(({ totalShares, strategy }) => {
        if (strategy.id !== EIGEN_STRATEGY) {
          ethTvl.plus(
            calculateTotalAssets(totalShares, strategyToEthBalance[strategy.id], strategy.totalShares),
          );
        } else {
          eigenTvl.plus(operator.totalEigenShares);
        }
      });
    });
  }

  return {
    ethTvl: toEth(ethTvl),
    eigenTvl: toEth(eigenTvl),
  };
};
