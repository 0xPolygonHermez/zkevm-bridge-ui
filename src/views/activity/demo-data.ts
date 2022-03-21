import { TransactionCardProps } from "src/views/activity/components/transaction-card/transaction-card.view";

export const demoData: TransactionCardProps[] = [
  {
    id: Math.random(),
    target: "l1",
    token: "dai",
    timestamp: Date.now() - Math.floor(Math.random() * 10000),
    status: "on-hold",
    amount: Math.floor(Math.random() * 100),
  },
  {
    id: Math.random(),
    target: "l2",
    token: "eth",
    timestamp: Date.now() - Math.floor(Math.random() * 10000 * 60 * 2),
    status: "initiated",
    amount: Math.floor(Math.random() * 100),
  },
  {
    id: Math.random(),
    target: "l2",
    token: "dai",
    timestamp: Date.now() - Math.floor(Math.random() * 10000 * 60 * 60),
    status: "processing",
    amount: Math.floor(Math.random() * 100),
  },
  {
    id: Math.random(),
    target: "l2",
    token: "eth",
    timestamp: Date.now() - Math.floor(Math.random() * 10000 * 60 * 60 * 2),
    status: "completed",
    amount: Math.floor(Math.random() * 100),
  },
  {
    id: Math.random(),
    target: "l1",
    token: "eth",
    timestamp: Date.now() - Math.floor(Math.random() * 10000 * 60 * 60 * 24),
    status: "completed",
    amount: Math.floor(Math.random() * 100),
  },
  {
    id: Math.random(),
    target: "l1",
    token: "dai",
    timestamp: Date.now() - Math.floor(Math.random() * 10000 * 60 * 60 * 24),
    status: "failed",
    amount: Math.floor(Math.random() * 100),
  },
];
