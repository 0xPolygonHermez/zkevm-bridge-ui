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
