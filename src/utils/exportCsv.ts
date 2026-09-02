import { InventoryItem, Transaction } from '../types';

export const exportInventoryAndTransactionsCSV = (
  inventory: InventoryItem[],
  transactions: Transaction[]
) => {
  const download = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Inventory CSV
  const invHeaders = 'Nama,Kategori,Status,Set/Ekspansi,Rarity,Sumber/Marketplace,Modal (Rp),Harga Pasar (Rp),Profit (Rp)\n';
  const invRows = inventory
    .map(i => {
      const profit = (i.market || 0) - (i.buy || 0);
      return `"${(i.name || '').replace(/"/g, '""')}","${i.category}","${i.status}","${(i.set || '').replace(/"/g, '""')}","${i.rarity || ''}","${(i.source || '').replace(/"/g, '""')}","${i.buy || 0}","${i.market || 0}","${profit}"`;
    })
    .join('\n');
  download('Pokemon_Inventory.csv', invHeaders + invRows);

  // Transactions CSV
  const trxHeaders = 'Tanggal,Tipe,Keterangan,Pemberi Pinjaman,Nominal (Rp)\n';
  const trxRows = transactions
    .map(t => {
      return `"${t.date}","${t.type}","${(t.name || '').replace(/"/g, '""')}","${(t.person || '').replace(/"/g, '""')}","${t.amount || 0}"`;
    })
    .join('\n');
  download('Pokemon_Transactions.csv', trxHeaders + trxRows);
};
