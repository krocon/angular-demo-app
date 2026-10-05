import { HttpContextToken } from '@angular/common/http';

/** Do not attach the bearer token to this request. */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
/** Do not count this request for the global progress bar. */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);
/** The caller renders errors itself – skip the global snackbar handling. */
export const SKIP_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);
