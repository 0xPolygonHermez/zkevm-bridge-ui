import * as errorAdapter from "src/adapters/error";
import {
  AsyncTask,
  EthersInsufficientFundsError,
  LoadingMoreItemsAsyncTask,
  MetaMaskResourceUnavailableError,
  MetaMaskUnknownChainError,
  MetaMaskUserRejectedRequestError,
  ReloadingAsyncTask,
  SuccessfulAsyncTask,
} from "src/domain";

export function isAsyncTaskDataAvailable<D, E, P = false>(
  task: AsyncTask<D, E, P>
): task is P extends true
  ? SuccessfulAsyncTask<D> | ReloadingAsyncTask<D> | LoadingMoreItemsAsyncTask<D>
  : SuccessfulAsyncTask<D> | ReloadingAsyncTask<D> {
  return (
    task.status === "successful" ||
    task.status === "reloading" ||
    task.status === "loading-more-items"
  );
}

export function isMetaMaskUserRejectedRequestError(
  error: unknown
): error is MetaMaskUserRejectedRequestError {
  return errorAdapter.metaMaskUserRejectedRequestError.safeParse(error).success;
}

export function isMetaMaskResourceUnavailableError(
  error: unknown
): error is MetaMaskResourceUnavailableError {
  return errorAdapter.metaMaskResourceUnavailableError.safeParse(error).success;
}

export function isMetaMaskUnknownChainError(error: unknown): error is MetaMaskUnknownChainError {
  return errorAdapter.metaMaskUnknownChainError.safeParse(error).success;
}

export function isEthersInsufficientFundsError(
  error: unknown
): error is EthersInsufficientFundsError {
  return errorAdapter.ethersInsufficientFundsError.safeParse(error).success;
}
