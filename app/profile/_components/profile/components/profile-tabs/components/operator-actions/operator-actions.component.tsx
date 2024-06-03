'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

import { OperatorActionsRow, transformToCsvRow } from './operator-actions.model';
import { useOperatorActions } from './operator-actions.service';
import { expandedRowRender } from './operator-actions.utils';

import { ActionsTable } from '@/app/_components/actions-table/actions-table.component';
import { Empty } from '@/app/_components/empty/empty.component';
import { TablePreloader } from '@/app/_components/table-preloader/table-preloader.component';
import { downloadTableData } from '@/app/_utils/table-data.utils';
import { useTable } from '@/app/_utils/table.utils';

type Props = {
  id: string;
};

export const OperatorActions: React.FC<Props> = ({ id }) => {
  const {
    currentPage,
    perPage,
    perPageOptions,
    sortParams,
    total,
    storageManager,
    setCurrentPage,
    setPerPage,
    setSortParams,
    setTotal,
  } = useTable<OperatorActionsRow>({
    tableName: 'operator-actions',
    sortParams: {
      orderBy: 'blockNumber',
      orderDirection: 'desc',
    },
  });

  const [rows, setRows] = useState<Array<OperatorActionsRow>>([]);

  const [isLoading, setIsLoading] = useState(false);

  const { data, isPending, error } = useOperatorActions(id);

  useEffect(() => {
    if (data) {
      setTotal(data.length);
    }
  }, [data, setTotal]);

  const workerRef = useRef<Worker>();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker(
        new URL('../../../../../../../_workers/actions.worker.ts', import.meta.url),
      );
      workerRef.current.onerror = (event) => {
        // eslint-disable-next-line no-console
        console.log(`Worker error event: ${event}`);
      };
      workerRef.current.onmessage = (event: MessageEvent<Array<OperatorActionsRow>>) => {
        setIsLoading(false);
        setRows(event.data);
      };
    }
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (data) {
      setIsLoading(true);
      workerRef.current?.postMessage({ rows: data, perPage, currentPage, sortParams });
    }
  }, [currentPage, data, perPage, sortParams]);

  const handleCsvDownload = useCallback(() => {
    downloadTableData({
      data: data || [],
      sortParams,
      fileName: 'operator-actions',
      transformToCsvRow,
    });
  }, [data, sortParams]);

  if (isPending || (rows.length === 0 && isLoading)) {
    return <TablePreloader />;
  }

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    storageManager.setStoragePerPage(null);
    storageManager.setStorageSortParams(null);
    return <Empty />;
  }

  return (
    <ActionsTable<OperatorActionsRow>
      rows={rows}
      expandedRowRender={expandedRowRender}
      isUpdating={rows.length > 0 && isLoading}
      paginationOptions={{
        currentPage,
        perPage,
        perPageOptions,
        total,
        setCurrentPage,
        setPerPage,
      }}
      sortingOptions={{
        sortParams,
        setSortParams,
      }}
      downloadCsvOptions={{
        onDownload: handleCsvDownload,
      }}
    />
  );
};
