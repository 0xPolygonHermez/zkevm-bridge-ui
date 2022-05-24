import * as errorAdapter from "src/adapters/error";

interface PendingAsyncTask {
  status: "pending";
}

interface LoadingAsyncTask {
  status: "loading";
}

interface FailedAsyncTask<E> {
  status: "failed";
  error: E;
}

interface SuccessfulAsyncTask<D> {
  status: "successful";
  data: D;
}

interface ReloadingAsyncTask<D> {
  status: "reloading";
  data: D;
}

export type AsyncTask<D, E> =
  | PendingAsyncTask
  | LoadingAsyncTask
  | SuccessfulAsyncTask<D>
  | ReloadingAsyncTask<D>
  | FailedAsyncTask<E>;

export function isAsyncTaskDataAvailable<D, E>(
  task: AsyncTask<D, E>
): task is SuccessfulAsyncTask<D> | ReloadingAsyncTask<D> {
  return task.status === "successful" || task.status === "reloading";
}

export type Exact<T, U> = [T, U] extends [U, T] ? true : false;

export function isMetamaskInsufficientAllowanceError(
  error: unknown
): error is errorAdapter.MetamaskInsufficientAllowanceError {
  return errorAdapter.metamaskInsufficientAllowanceError.safeParse(error).success;
}

export function isMetamaskUserRejectedRequestError(
  error: unknown
): error is errorAdapter.MetamaskUserRejectedRequestError {
  return errorAdapter.metamaskUserRejectedRequestError.safeParse(error).success;
}

export function isMetamaskRequestAccountsError(
  error: unknown
): error is errorAdapter.MetamaskRequestAccountsError {
  return errorAdapter.metamaskRequestAccountsError.safeParse(error).success;
}

export function isEthersInsufficientFundsError(
  error: unknown
): error is errorAdapter.EthersInsufficientFundsError {
  return errorAdapter.ethersInsufficientFundsError.safeParse(error).success;
}

export function isMetamaskUnknownChainError(
  error: unknown
): error is errorAdapter.MetamaskUnknownChainError {
  return errorAdapter.metamaskUnknownChainError.safeParse(error).success;
}
