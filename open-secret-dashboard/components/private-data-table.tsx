"use client";

import {
  ChevronDownIcon,
  DotsHorizontalIcon,
  ReloadIcon,
  EyeClosedIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { constants } from "@/lib/constants";
import { callViewMethod } from "@/lib/data/near-rpc-functions";
import useOpenSecret from "@/lib/hooks/use-open-secret";

export type PrivateData = {
  id: string;
  public_key: string;
  metadata: {
    uri: string;
    hash256: string;
  };
  nonce: string;
};

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";

const DecryptDialog = ({
  children,
  uri,
  nonce,
}: {
  children: React.ReactNode;
  uri: string;
  nonce: string;
}) => {
  const { decryptDataByUri } = useOpenSecret({
    contractId: constants.tokenContractAddress,
  });
  const [decryptedData, setDecryptedData] = React.useState<string | null>(null);
  return (
    <Dialog>
      <DialogTrigger> {children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex gap-2">
            Decrypt
            {!decryptedData ? (
              <EyeClosedIcon></EyeClosedIcon>
            ) : (
              <EyeOpenIcon></EyeOpenIcon>
            )}
          </DialogTitle>
          <DialogDescription>
            Decrypt the contents of this URI.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 border p-2">
          {decryptedData && <div>{decryptedData}</div>}
          {!decryptedData && (
            <div className="flex gap-2">Decrypt to see the contents.</div>
          )}
        </div>
        <DialogFooter>
          <Button
            disabled={!!decryptedData}
            onClick={async () => {
              const decryptedData = await decryptDataByUri(uri, nonce);
              setDecryptedData(decryptedData! || null);
            }}
          >
            Decrypt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const InsertData = ({ tokenId }: { tokenId: string }) => {
  const [inputData, setInputData] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { addMetadata } = useOpenSecret({
    contractId: constants.tokenContractAddress,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Insert Data</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert Data</DialogTitle>
          <DialogDescription>
            Encrypt and store data in your Data Feed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="name" className="text-left">
              Data
            </Label>
            <Textarea
              placeholder="Type your message here."
              className="col-span-3"
              onChange={(e) => setInputData(e.target.value)}
              value={inputData}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true);
              try {
                addMetadata({ tokenId: tokenId, data: inputData })
                  .then(() => {
                    setInputData("");
                    setIsLoading(false);
                  })
                  .catch((err) => {
                    setIsLoading(false);
                  });
              } catch (err) {
                setIsLoading(false);
              }
            }}
          >
            {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function PrivateDataTable({ tokenId }: { tokenId: string }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [isLoading, setLoading] = React.useState(false);
  const [privateMetadata, setPrivateMetadata] = React.useState([]);

  const { account, giveAccess } = useOpenSecret({
    contractId: constants.tokenContractAddress,
  });

  const columns: ColumnDef<PrivateData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "metadata.uri",
      header: "URI",
      cell: ({ row }) => (
        <DecryptDialog
          uri={row.original.metadata.uri}
          nonce={row.original.nonce}
        >
          <div>{row.original.metadata.uri}</div>
        </DecryptDialog>
      ),
    },
    {
      accessorKey: "zkproofs",
      header: "ZK Proofs",
      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <div className="w-24 h-full">Contains textual data</div>
          {/* <div className="w-24">Personal information</div> */}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const privateMetadata = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={connectedPublicKey !== privateMetadata.public_key}
                onClick={() =>
                  giveAccess(
                    privateMetadata.metadata.uri,
                    process.env.NEXT_PUBLIC_BOT_PUBLIC_KEY!,
                    privateMetadata.nonce
                  )
                }
              >
                Give Access
              </DropdownMenuItem>
              <DropdownMenuItem>
                {connectedPublicKey === privateMetadata.public_key
                  ? "Delete"
                  : "Revoke Access"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(
                    privateMetadata.metadata.hash256
                  )
                }
              >
                Copy SHA-256 hash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const fetchPrivateMetadata = React.useCallback(async () => {
    try {
      setLoading(true);

      const data = await callViewMethod({
        contractId: constants.tokenContractAddress,
        method: "get_private_metadata_paginated",
        args: { token_id: tokenId, from_index: 0, limit: 1000 },
      });
      setPrivateMetadata(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  React.useEffect(() => {
    fetchPrivateMetadata();
  }, []);

  const connectedPublicKey = account.publicKey;

  const table = useReactTable({
    data: privateMetadata,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        {/* <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        /> */}
        <InsertData tokenId={tokenId} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
