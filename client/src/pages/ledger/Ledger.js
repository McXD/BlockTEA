import { Button, Table } from "antd";

const App = () => {
  const expandedRowRender = (record) => {
    const columns = [
      { title: "Event ID", dataIndex: "eventId", key: "eventId" },
      { title: "Event Name", dataIndex: "eventName", key: "eventName" },
      {
        title: "Smart Contract Name",
        dataIndex: "smartContractName",
        key: "smartContractName",
      },
      {
        title: "Transaction Hash",
        dataIndex: "transactionHash",
        key: "transactionHash",
      },
      { title: "Amount", dataIndex: "amount", key: "amount" },
      { title: "Entry Type", dataIndex: "entryType", key: "entryType" },
      { title: "Notes", dataIndex: "notes", key: "notes" },
    ];

    return (
      <Table
        columns={columns}
        dataSource={record.entries}
        pagination={false}
        size="small"
      />
    );
  };

  const columns = [
    { title: "Account ID", dataIndex: "accountId", key: "accountId" },
    { title: "Account Name", dataIndex: "accountName", key: "accountName" },
    { title: "Account Type", dataIndex: "accountType", key: "accountType" },
    { title: "Balance", dataIndex: "balance", key: "balance" },
  ];

  const data = [
    {
      key: "1",
      accountId: "1001",
      accountName: "Accounts Receivable",
      accountType: "Asset",
      balance: 2000,
      entries: [
        {
          key: "1-1",
          eventId: "EVT-001",
          eventName: "InvoiceCreated",
          smartContractName: "InvoiceContract",
          transactionHash: "0x123abc456def...",
          amount: 1000,
          entryType: "Debit",
          notes: "Invoice 1001",
        },
        {
          key: "1-2",
          eventId: "EVT-002",
          eventName: "InvoiceCreated",
          smartContractName: "InvoiceContract",
          transactionHash: "0x789ghi012jkl...",
          amount: 1000,
          entryType: "Debit",
          notes: "Invoice 1002",
        },
      ],
    },
    {
      key: "2",
      accountId: "2001",
      accountName: "Revenue",
      accountType: "Income",
      balance: -2000,
      entries: [
        {
          key: "2-1",
          eventId: "EVT-001",
          eventName: "InvoiceCreated",
          smartContractName: "InvoiceContract",
          transactionHash: "0x123abc456def...",
          amount: 1000,
          entryType: "Credit",
          notes: "Invoice 1001",
        },
        {
          key: "2-2",
          eventId: "EVT-002",
          eventName: "InvoiceCreated",
          smartContractName: "InvoiceContract",
          transactionHash: "0x789ghi012jkl...",
          amount: 1000,
          entryType: "Credit",
          notes: "Invoice 1002",
        },
      ],
    },
    {
      key: "3",
      accountId: "3001",
      accountName: "Cash",
      accountType: "Asset",
      balance: 800,
      entries: [
        {
          key: "3-1",
          eventId: "EVT-003",
          eventName: "InvoicePaid",
          smartContractName: "InvoiceContract",
          transactionHash: "0xabc123def456...",
          amount: 800,
          entryType: "Debit",
          notes: "Payment for Invoice 1001",
        },
      ],
    },
    {
      key: "4",
      accountId: "4001",
      accountName: "Accounts Payable",
      accountType: "Liability",
      balance: -800,
      entries: [
        {
          key: "4-1",
          eventId: "EVT-003",
          eventName: "InvoicePaid",
          smartContractName: "InvoiceContract",
          transactionHash: "0xabc123def456...",
          amount: 800,
          entryType: "Credit",
          notes: "Payment for Invoice 1001",
        },
      ],
    },
  ];

  const handleAddAccount = () => {
    console.log("Add Account");
    // Implement account creation functionality here
  };

  return (
    <>
      <h1>Ledger</h1>
      <Table
        columns={columns}
        dataSource={data}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record.entries.length > 0,
        }}
        size="small"
      />
      <Button
        type="primary"
        onClick={handleAddAccount}
        style={{ marginTop: 16 }}
      >
        Add Account
      </Button>
    </>
  );
};

export default App;
