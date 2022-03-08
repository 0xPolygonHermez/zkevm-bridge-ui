import { TransactionCardProps } from "src/views/activity/components/transaction-card/transaction-card.view";

export const demoData: TransactionCardProps[] = [
  {
    id: Math.random(),
    type: "l1",
    token: "dai",
    timestamp: Date.now() - Math.floor(Math.random() * 10000),
    status: "hold",
    amount: Math.floor(Math.random() * 100),
  },
  {
    id: Math.random(),
    type: "l2",
    token: "eth",
    timestamp: Date.now() - Math.floor(Math.random() * 10000 * 60 * 2),
    status: "initiate",
    amount: Math.floor(Math.random() * 100),
  },
  {
    id: Math.random(),
    type: "l2",
    token: "dai",
    timestamp: Date.now() - Math.floor(Math.random() * 10000 * 60 * 60),
    status: "process",
    amount: Math.floor(Math.random() * 100),
  },
  {
    id: Math.random(),
    type: "l2",
    token: "eth",
    timestamp: Date.now() - Math.floor(Math.random() * 10000 * 60 * 60 * 2),
    status: "complete",
    amount: Math.floor(Math.random() * 100),
  },
  {
    id: Math.random(),
    type: "l1",
    token: "eth",
    timestamp: Date.now() - Math.floor(Math.random() * 10000 * 60 * 60 * 24),
    status: "complete",
    amount: Math.floor(Math.random() * 100),
  },
  {
    id: Math.random(),
    type: "l1",
    token: "dai",
    timestamp: Date.now() - Math.floor(Math.random() * 10000 * 60 * 60 * 24),
    status: "error",
    amount: Math.floor(Math.random() * 100),
  },
];
