import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CodeBlock } from '@/components/docs/shared';
export function TableDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Table</h2><p className="text-sm text-muted-foreground">Semantic table with header, rows, caption.</p>
      <div className="rounded-xl border bg-card p-2">
        <Table><TableCaption>Invoices</TableCaption><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>INV001</TableCell><TableCell>Paid</TableCell><TableCell className="text-right">$250</TableCell></TableRow><TableRow><TableCell>INV002</TableCell><TableCell>Pending</TableCell><TableCell className="text-right">$150</TableCell></TableRow></TableBody></Table>
      </div>
      <CodeBlock code={`import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow><TableHead>Invoice</TableHead><TableHead>Amount</TableHead></TableRow>
  </TableHeader>
  <TableBody>
    <TableRow><TableCell>INV001</TableCell><TableCell>$250</TableCell></TableRow>
  </TableBody>
</Table>`} />
    </div>
  );
}
