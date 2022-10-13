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

interface LoadingMoreItemsAsyncTask<D> {
  status: "loading-more-items";
  data: D;
}

export type AsyncTask<D, E, P = false> = P extends true
  ?
      | PendingAsyncTask
      | LoadingAsyncTask
      | SuccessfulAsyncTask<D>
      | ReloadingAsyncTask<D>
      | LoadingMoreItemsAsyncTask<D>
      | FailedAsyncTask<E>
  :
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

export function isMetaMaskUserRejectedRequestError(
  error: unknown
): error is errorAdapter.MetaMaskUserRejectedRequestError {
  return errorAdapter.metaMaskUserRejectedRequestError.safeParse(error).success;
}

export function isMetaMaskResourceUnavailableError(
  error: unknown
): error is errorAdapter.MetaMaskResourceUnavailableError {
  return errorAdapter.metaMaskResourceUnavailableError.safeParse(error).success;
}

export function isMetaMaskUnknownChainError(
  error: unknown
): error is errorAdapter.MetaMaskUnknownChainError {
  return errorAdapter.metaMaskUnknownChainError.safeParse(error).success;
}

export function isEthersInsufficientFundsError(
  error: unknown
): error is errorAdapter.EthersInsufficientFundsError {
  return errorAdapter.ethersInsufficientFundsError.safeParse(error).success;
}
